/**
 * Generates a collection of geojson files based on an overpass query for a given theme
 */
import {Utils} from "../Utils";
import {Overpass} from "../Logic/Osm/Overpass";
import {existsSync, readFileSync, writeFileSync} from "fs";
import {TagsFilter} from "../Logic/Tags/TagsFilter";
import {Or} from "../Logic/Tags/Or";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import RelationsTracker from "../Logic/Osm/RelationsTracker";
import * as OsmToGeoJson from "osmtogeojson";
import MetaTagging from "../Logic/MetaTagging";
import {UIEventSource} from "../Logic/UIEventSource";
import {TileRange, Tiles} from "../Models/TileRange";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import ScriptUtils from "./ScriptUtils";
import PerLayerFeatureSourceSplitter from "../Logic/FeatureSource/PerLayerFeatureSourceSplitter";
import FilteredLayer from "../Models/FilteredLayer";
import FeatureSource, {FeatureSourceForLayer} from "../Logic/FeatureSource/FeatureSource";
import StaticFeatureSource from "../Logic/FeatureSource/Sources/StaticFeatureSource";
import TiledFeatureSource from "../Logic/FeatureSource/TiledFeatureSource/TiledFeatureSource";
import Constants from "../Models/Constants";
import {GeoOperations} from "../Logic/GeoOperations";


ScriptUtils.fixUtils()


function createOverpassObject(theme: LayoutConfig, relationTracker: RelationsTracker, backend: string) {
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
            if (layer.source.isOsmCacheLayer !== true) {
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
    return new Overpass(new Or(filters), extraScripts, backend,
        new UIEventSource<number>(60), relationTracker);
}

function rawJsonName(targetDir: string, x: number, y: number, z: number): string {
    return targetDir + "_" + z + "_" + x + "_" + y + ".json"
}

function geoJsonName(targetDir: string, x: number, y: number, z: number): string {
    return targetDir + "_" + z + "_" + x + "_" + y + ".geojson"
}

/// Downloads the given feature and saves them to disk
async function downloadRaw(targetdir: string, r: TileRange, theme: LayoutConfig, relationTracker: RelationsTracker)/* : {failed: number, skipped :number} */ {
    let downloaded = 0
    let failed = 0
    let skipped = 0
    const startTime = new Date().getTime()
    for (let x = r.xstart; x <= r.xend; x++) {
        for (let y = r.ystart; y <= r.yend; y++) {
            downloaded++;
            const filename = rawJsonName(targetdir, x, y, r.zoomlevel)
            if (existsSync(filename)) {
                console.log("Already exists (not downloading again): ", filename)
                skipped++
                continue;
            }
            const runningSeconds = (new Date().getTime() - startTime) / 1000
            const resting = failed + (r.total - downloaded)
            const perTile=   (runningSeconds / (downloaded - skipped))
            const estimated =Math.floor(resting * perTile)
            console.log("total: ", downloaded, "/", r.total, "failed: ", failed, "skipped: ", skipped, "running time: ",Utils.toHumanTime(runningSeconds)+"s", "estimated left: ", Utils.toHumanTime(estimated), "("+Math.floor(perTile)+"s/tile)")

            const boundsArr = Tiles.tile_bounds(r.zoomlevel, x, y)
            const bounds = {
                north: Math.max(boundsArr[0][0], boundsArr[1][0]),
                south: Math.min(boundsArr[0][0], boundsArr[1][0]),
                east: Math.max(boundsArr[0][1], boundsArr[1][1]),
                west: Math.min(boundsArr[0][1], boundsArr[1][1])
            }
            const overpass = createOverpassObject(theme, relationTracker, Constants.defaultOverpassUrls[(failed) % Constants.defaultOverpassUrls.length])
            const url = overpass.buildQuery("[bbox:" + bounds.south + "," + bounds.west + "," + bounds.north + "," + bounds.east + "]")

            try {

                const json = await ScriptUtils.DownloadJSON(url)
                if ((<string>json.remark ?? "").startsWith("runtime error")) {
                    console.error("Got a runtime error: ", json.remark)
                    failed++;
                }else if (json.elements.length === 0) {
                    console.log("Got an empty response! Writing anyway")
                }
                   

                    console.log("Got the response - writing to ", filename)
                    writeFileSync(filename, JSON.stringify(json, null, "  "));
            } catch (err) {
                console.log(url)
                console.log("Could not download - probably hit the rate limit; waiting a bit. (" + err + ")")
                failed++;
                await ScriptUtils.sleep(1000)
            }
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
        if (layer.source.isOsmCacheLayer !== undefined && layer.source.isOsmCacheLayer !== false) {
            // Cached layers are not considered here
            continue;
        }
        console.log("Downloading extra data: ", source)
        await ScriptUtils.DownloadJSON(source).then(json => allFeatures.push(...json.features))
    }
    return allFeatures;
}


function loadAllTiles(targetdir: string, r: TileRange, theme: LayoutConfig, extraFeatures: any[]): FeatureSource {

    let allFeatures = [...extraFeatures]
    let processed = 0;
    for (let x = r.xstart; x <= r.xend; x++) {
        for (let y = r.ystart; y <= r.yend; y++) {
            processed++;
            const filename = rawJsonName(targetdir, x, y, r.zoomlevel)
            console.log(" Loading and processing", processed, "/", r.total, filename)
            if (!existsSync(filename)) {
                console.error("Not found - and not downloaded. Run this script again!: " + filename)
                continue;
            }

            // We read the raw OSM-file and convert it to a geojson
            const rawOsm = JSON.parse(readFileSync(filename, "UTF8"))

            // Create and save the geojson file - which is the main chunk of the data
            const geojson = OsmToGeoJson.default(rawOsm);

            allFeatures.push(...geojson.features)
        }
    }
    return new StaticFeatureSource(allFeatures, false)
}

/**
 * Load all the tiles into memory from disk
 */
function sliceToTiles(allFeatures: FeatureSource, theme: LayoutConfig, relationsTracker: RelationsTracker, targetdir: string, pointsOnlyLayers: string[]) {
    function handleLayer(source: FeatureSourceForLayer) {
        const layer = source.layer.layerDef;
        const targetZoomLevel = layer.source.geojsonZoomLevel ?? 0
        
        const layerId = layer.id
        if (layer.source.isOsmCacheLayer !== true) {
            return;
        }
        console.log("Handling layer ", layerId, "which has", source.features.data.length, "features")
        if (source.features.data.length === 0) {
            return;
        }
        MetaTagging.addMetatags(source.features.data,
            {
                memberships: relationsTracker,
                getFeaturesWithin: _ => {
                    return [allFeatures.features.data.map(f => f.feature)]
                }
            },
            layer,
            {
                includeDates: false,
                includeNonDates: true
            });

        const createdTiles = []
        // At this point, we have all the features of the entire area.
        // However, we want to export them per tile of a fixed size, so we use a dynamicTileSOurce to split it up
        TiledFeatureSource.createHierarchy(source, {
            minZoomLevel: targetZoomLevel,
            maxZoomLevel: targetZoomLevel,
            maxFeatureCount: undefined,
            registerTile: tile => {
                if (tile.features.data.length === 0) {
                    return
                }
                for (const feature of tile.features.data) {
                    // Some cleanup
                    delete feature.feature["bbox"]
                }
                // Lets save this tile!
                const [z, x, y] = Tiles.tile_from_index(tile.tileIndex)
                // console.log("Writing tile ", z, x, y, layerId)
                const targetPath = geoJsonName(targetdir + "_" + layerId, x, y, z)
                createdTiles.push(tile.tileIndex)
                // This is the geojson file containing all features for this tile
                writeFileSync(targetPath, JSON.stringify({
                    type: "FeatureCollection",
                    features: tile.features.data.map(f => f.feature)
                }, null, " "))
            }
        })

        // All the tiles are written at this point
        // Only thing left to do is to create the index
        const path = targetdir + "_" + layerId + "_" + targetZoomLevel + "_overview.json"
        const perX = {}
        createdTiles.map(i => Tiles.tile_from_index(i)).forEach(([z, x, y]) => {
            const key = "" + x
            if (perX[key] === undefined) {
                perX[key] = []
            }
            perX[key].push(y)
        })
        console.log("Written overview: ", path, "with ", createdTiles.length, "tiles")
        writeFileSync(path, JSON.stringify(perX))

        // And, if needed, to create a points-only layer
        if(pointsOnlyLayers.indexOf(layer.id) >= 0){
            const features = source.features.data.map(f => f.feature)
            const points = features.map(feature => GeoOperations.centerpoint(feature))
            console.log("Writing points overview for ", layerId)
            const targetPath = targetdir+"_"+layerId+"_points.geojson"
            // This is the geojson file containing all features for this tile
            writeFileSync(targetPath, JSON.stringify({
                type: "FeatureCollection",
                features: points
            }, null, " "))
        }
    }

    new PerLayerFeatureSourceSplitter(
        new UIEventSource<FilteredLayer[]>(theme.layers.map(l => ({
            layerDef: l,
            isDisplayed: new UIEventSource<boolean>(true),
            appliedFilters: new UIEventSource(undefined)
        }))),
        handleLayer,
        allFeatures
    )
}



async function main(args: string[]) {

    if (args.length == 0) {
        console.error("Expected arguments are: theme zoomlevel targetdirectory lat0 lon0 lat1 lon1 [--generate-point-overview layer-name,layer-name,...]")
        return;
    }
    const themeName = args[0]
    const zoomlevel = Number(args[1])
    const targetdir = args[2] + "/" + themeName
    const lat0 = Number(args[3])
    const lon0 = Number(args[4])
    const lat1 = Number(args[5])
    const lon1 = Number(args[6])
    
    let generatePointLayersFor = []
    if(args[7] == "--generate-point-overview"){
        generatePointLayersFor = args[8].split(",")
    }
    

    const tileRange = Tiles.TileRangeBetween(zoomlevel, lat0, lon0, lat1, lon1)

    const theme = AllKnownLayouts.allKnownLayouts.get(themeName)
    if (theme === undefined) {
        const keys = []
        AllKnownLayouts.allKnownLayouts.forEach((_, key) => {
            keys.push(key)
        })
        console.error("The theme " + theme + " was not found; try one of ", keys);
        return
    }
    const relationTracker = new RelationsTracker()

    let failed = 0;
    do {
        const cachingResult = await downloadRaw(targetdir, tileRange, theme, relationTracker)
        failed = cachingResult.failed
        if (failed > 0) {
            await ScriptUtils.sleep(30000)
        }
    } while (failed > 0)

    const extraFeatures = await downloadExtraData(theme);
    const allFeaturesSource = loadAllTiles(targetdir, tileRange, theme, extraFeatures)
    sliceToTiles(allFeaturesSource, theme, relationTracker, targetdir, generatePointLayersFor)

}


let args = [...process.argv]
args.splice(0, 2)
main(args);
console.log("All done!")