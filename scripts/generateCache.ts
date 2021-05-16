/**
 * Generates a collection of geojson files based on an overpass query for a given theme
 */
import {TileRange, Utils} from "../Utils";

Utils.runningFromConsole = true
import {Overpass} from "../Logic/Osm/Overpass";
import {existsSync, readFileSync, writeFileSync} from "fs";
import {TagsFilter} from "../Logic/Tags/TagsFilter";
import {Or} from "../Logic/Tags/Or";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import ScriptUtils from "./ScriptUtils";
import ExtractRelations from "../Logic/Osm/ExtractRelations";
import * as OsmToGeoJson from "osmtogeojson";
import MetaTagging from "../Logic/MetaTagging";
import LayerConfig from "../Customizations/JSON/LayerConfig";
import {GeoOperations} from "../Logic/GeoOperations";
import {fail} from "assert";
import {UIEventSource} from "../Logic/UIEventSource";
import DummyFeatureSource from "../Logic/FeatureSource/DummyFeatureSource";


function createOverpassObject(theme: LayoutConfig) {
    let filters: TagsFilter[] = [];
    let extraScripts: string[] = [];
    for (const layer of theme.layers) {
        if (typeof (layer) === "string") {
            throw "A layer was not expanded!"
        }
        if (layer.doNotDownload) {
            continue;
        }
        if (layer.source.geojsonSource !== undefined) {
            // This layer defines a geoJson-source
            // SHould it be cached?
            if (!layer.source.isOsmCacheLayer) {
                continue;
            }
        }


        // Check if data for this layer has already been loaded
        if (layer.source.overpassScript !== undefined) {
            extraScripts.push(layer.source.overpassScript)
        } else {
            filters.push(layer.source.osmTags);
        }
    }
    filters = Utils.NoNull(filters)
    extraScripts = Utils.NoNull(extraScripts)
    if (filters.length + extraScripts.length === 0) {
        throw "Nothing to download! The theme doesn't declare anything to download"
    }
    return new Overpass(new Or(filters), extraScripts);
}

function rawJsonName(targetDir: string, x: number, y: number, z: number): string {
    return targetDir + "_" + z + "_" + x + "_" + y + ".json"
}

function geoJsonName(targetDir: string, x: number, y: number, z: number): string {
    return targetDir + "_" + z + "_" + x + "_" + y + ".geojson"
}

/// Downloads the given feature and saves them to disk
async function downloadRaw(targetdir: string, r: TileRange, overpass: Overpass)/* : {failed: number, skipped :number} */ {
    let downloaded = 0
    let failed = 0
    let skipped = 0
    for (let x = r.xstart; x <= r.xend; x++) {
        for (let y = r.ystart; y <= r.yend; y++) {
            downloaded++;
            const filename = rawJsonName(targetdir, x, y, r.zoomlevel)
            if (existsSync(filename)) {
                console.log("Already exists: ", filename)
                skipped++
                continue;
            }
            console.log("x:", (x - r.xstart), "/", (r.xend - r.xstart), "; y:", (y - r.ystart), "/", (r.yend - r.ystart), "; total: ", downloaded, "/", r.total, "failed: ", failed, "skipped: ", skipped)

            const boundsArr = Utils.tile_bounds(r.zoomlevel, x, y)
            const bounds = {
                north: Math.max(boundsArr[0][0], boundsArr[1][0]),
                south: Math.min(boundsArr[0][0], boundsArr[1][0]),
                east: Math.max(boundsArr[0][1], boundsArr[1][1]),
                west: Math.min(boundsArr[0][1], boundsArr[1][1])
            }
            const url = overpass.buildQuery("[bbox:" + bounds.south + "," + bounds.west + "," + bounds.north + "," + bounds.east + "]")

            await ScriptUtils.DownloadJSON(url)
                .then(json => {
                        console.log("Got the response - writing to ", filename)
                        writeFileSync(filename, JSON.stringify(json, null, "  "));
                    }
                )
                .catch(err => {
                    console.log("Could not download - probably hit the rate limit; waiting a bit")
                    failed++;
                    return ScriptUtils.sleep(60000).then(() => console.log("Waiting is done"))
                })
            // Cooldown
            console.debug("Cooling down 10s")
            await ScriptUtils.sleep(10000)
        }
    }

    return {failed: failed, skipped: skipped}
}

/* 
 * Downloads extra geojson sources and returns the features.
 * Extra geojson layers should not be tiled
 */
async function downloadExtraData(theme: LayoutConfig)/* : any[] */ {
    const allFeatures: any[] = []
    for (const layer of theme.layers) {
        const source = layer.source.geojsonSource;
        if (source === undefined) {
            continue;
        }
        if (layer.source.isOsmCacheLayer) {
            // Cached layers are not considered here
            continue;
        }
        console.log("Downloading extra data: ", source)
        await ScriptUtils.DownloadJSON(source).then(json => allFeatures.push(...json.features))
    }
    return allFeatures;
}

async function postProcess(targetdir: string, r: TileRange, theme: LayoutConfig, extraFeatures: any[]) {
    let processed = 0;
    const layerIndex = theme.LayerIndex();
    for (let x = r.xstart; x <= r.xend; x++) {
        for (let y = r.ystart; y <= r.yend; y++) {
            processed++;
            const filename = rawJsonName(targetdir, x, y, r.zoomlevel)
            console.log(" Post processing", processed, "/", r.total, filename)
            if (!existsSync(filename)) {
                console.error("Not found - and not downloaded. Run this script again!: " + filename)
                continue;
            }

            // We read the raw OSM-file and convert it to a geojson
            const rawOsm = JSON.parse(readFileSync(filename, "UTF8"))
 
            // Create and save the geojson file - which is the main chunk of the data
            const geojson = OsmToGeoJson.default(rawOsm);
            const osmTime = new Date(rawOsm.osm3s.timestamp_osm_base);
            // And merge in the extra features - needed for the metatagging
            geojson.features.push(...extraFeatures);

            for (const feature of geojson.features) {

                for (const layer of theme.layers) {
                    if (layer.source.osmTags.matchesProperties(feature.properties)) {
                        feature["_matching_layer_id"] = layer.id;
                        break;
                    }
                }
            }
            const featuresFreshness = geojson.features.map(feature => {
                return ({
                    freshness: osmTime,
                    feature: feature
                });
            });
            // Extract the relationship information
            const relations = ExtractRelations.BuildMembershipTable(ExtractRelations.GetRelationElements(rawOsm))

            MetaTagging.addMetatags(featuresFreshness, new DummyFeatureSource(new UIEventSource<{feature: any; freshness: Date}[]>(featuresFreshness)) , relations, theme.layers, false);


            for (const feature of geojson.features) {
                const layer = layerIndex.get(feature["_matching_layer_id"])
                if (layer === undefined) {
                    // Probably some extra, unneeded data, e.g. a point of a way
                    continue
                }

                if (layer.wayHandling == LayerConfig.WAYHANDLING_CENTER_ONLY) {

                    const centerpoint = GeoOperations.centerpointCoordinates(feature)

                    feature.geometry.type = "Point"
                    feature.geometry["coordinates"] = centerpoint;

                }
            }
            for (const feature of geojson.features) {
                // Some cleanup
                delete feature["bbox"]
            }

            const targetPath = geoJsonName(targetdir+".unfiltered", x, y, r.zoomlevel)
            // This is the geojson file containing all features
            writeFileSync(targetPath, JSON.stringify(geojson, null, " "))

        }
    }
}

async function splitPerLayer(targetdir: string, r: TileRange, theme: LayoutConfig) {
    const z = r.zoomlevel;
    for (let x = r.xstart; x <= r.xend; x++) {
        for (let y = r.ystart; y <= r.yend; y++) {
            const file = readFileSync(geoJsonName(targetdir+".unfiltered", x, y, z), "UTF8")

            for (const layer of theme.layers) {
                if (!layer.source.isOsmCacheLayer) {
                    continue;
                }
                const geojson = JSON.parse(file)
                const oldLength = geojson.features.length;
                geojson.features = geojson.features
                    .filter(f => f._matching_layer_id === layer.id)
                    .filter(f => {
                        const isShown = layer.isShown.GetRenderValue(f.properties).txt
                        if (isShown === "no") {
                            return false;
                        }
                        return true;
                    })
                const new_path = geoJsonName(targetdir + "_" + layer.id, x, y, z);
                console.log(new_path, " has ", geojson.features.length, " features after filtering (dropped ", oldLength - geojson.features.length,")" )
                if (geojson.features.length == 0) {
                    console.log("Not writing geojson file as it is empty", new_path)
                    continue;
                }
                writeFileSync(new_path, JSON.stringify(geojson, null, " "))
            }


        }
    }
}


async function main(args: string[]) {

    if (args.length == 0) {
        console.error("Expected arguments are: theme zoomlevel targetdirectory lat0 lon0 lat1 lon1")
        return;
    }
    const themeName = args[0]
    const zoomlevel = Number(args[1])
    const targetdir = args[2] + "/" + themeName
    const lat0 = Number(args[3])
    const lon0 = Number(args[4])
    const lat1 = Number(args[5])
    const lon1 = Number(args[6])

    const tileRange = Utils.TileRangeBetween(zoomlevel, lat0, lon0, lat1, lon1)

    const theme = AllKnownLayouts.allKnownLayouts.get(themeName)
    if (theme === undefined) {
        const keys = []
        AllKnownLayouts.allKnownLayouts.forEach((_, key) => {
            keys.push(key)
        })
        console.error("The theme " + theme + " was not found; try one of ", keys);
        return
    }

    const overpass = createOverpassObject(theme)

    let failed = 0;
    do {
        const cachingResult = await downloadRaw(targetdir, tileRange, overpass)
        failed = cachingResult.failed
        if (failed > 0) {
            await ScriptUtils.sleep(30000)
        }
    } while (failed > 0)

    const extraFeatures = await downloadExtraData(theme);
    await postProcess(targetdir, tileRange, theme, extraFeatures)
    await splitPerLayer(targetdir, tileRange, theme)
}


let args = [...process.argv]
args.splice(0, 2)
main(args);