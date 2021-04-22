/**
 * Generates a collection of geojson files based on an overpass query for a given theme
 */
import {TileRange, Utils} from "../Utils";

Utils.runningFromConsole = true
import {Overpass} from "../Logic/Osm/Overpass";
import {writeFileSync, existsSync, readFileSync} from "fs";
import {TagsFilter} from "../Logic/Tags/TagsFilter";
import {Or} from "../Logic/Tags/Or";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import ScriptUtils from "./ScriptUtils";
import ExtractRelations from "../Logic/Osm/ExtractRelations";
import * as OsmToGeoJson from "osmtogeojson";
import {Script} from "vm";

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
            // Not our responsibility to download this layer!
            continue;
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

function saveResponse(chunks: string[], targetDir: string) {
    const contents = chunks.join("")
    if (contents.startsWith("<?xml")) {
        // THis is an error message
        console.error("Failed to create ", targetDir, "probably over quota")
        return;
    }
    writeFileSync(targetDir, contents)
}

function rawJsonName(targetDir: string, x: number, y: number, z: number): string {
    return targetDir + "_" + z + "_" + x + "_" + y + ".json"
}

function geoJsonName(targetDir: string, x: number, y: number, z: number): string {
    return targetDir + "_" + z + "_" + x + "_" + y + ".geojson"
}

function metaJsonName(targetDir: string, x: number, y: number, z: number): string {
    return targetDir + "_" + z + "_" + x + "_" + y + ".meta.json"
}

async function downloadRaw(targetdir: string,  r: TileRange, overpass: Overpass) {
    let downloaded = 0
    for (let x = r.xstart; x <= r.xend; x++) {
        for (let y = r.ystart; y <= r.yend; y++) {
            console.log("x:", (x - r.xstart), "/", (r.xend - r.xstart), "; y:", (y - r.ystart), "/", (r.yend - r.ystart), "; total: ", downloaded, "/", r.total)
            downloaded++;
            const filename = rawJsonName(targetdir, x, y, r.zoomlevel)
            if (existsSync(filename)) {
                console.log("Already exists: ", filename)
                continue;
            }

            const boundsArr = Utils.tile_bounds(r.zoomlevel, x, y)
            const bounds = {
                north: Math.max(boundsArr[0][0], boundsArr[1][0]),
                south: Math.min(boundsArr[0][0], boundsArr[1][0]),
                east: Math.max(boundsArr[0][1], boundsArr[1][1]),
                west: Math.min(boundsArr[0][1], boundsArr[1][1])
            }
            console.log("Downloading tile", r.zoomlevel, x, y, "with bounds", bounds)
            const url = overpass.buildQuery("[bbox:" + bounds.south + "," + bounds.west + "," + bounds.north + "," + bounds.east + "]")

            ScriptUtils.DownloadJSON(url,
                chunks => {
                    saveResponse(chunks, filename)
                })

            await ScriptUtils.sleep(10000)
            console.debug("Waking up")

        }
    }
}

async function postProcess(targetdir: string, r: TileRange) {
    let processed = 0;
    for (let x = r.xstart; x <= r.xend; x++) {
        for (let y = r.ystart; y <= r.yend; y++) {
            processed++;
            const filename = rawJsonName(targetdir, x, y, r.zoomlevel)
            console.log(" Post processing", processed, "/",r. total, filename)
            if (!existsSync(filename)) {
                throw "Not found - and not downloaded. Run this script again!: " + filename
            }

            // We read the raw OSM-file and convert it to a geojson
            const rawOsm = JSON.parse(readFileSync(filename, "UTF8"))

            // Create and save the geojson file - which is the main chunk of the data
            const geojson = OsmToGeoJson.default(rawOsm);
            writeFileSync(geoJsonName(targetdir, x, y, r.zoomlevel), JSON.stringify(geojson))

            // Extract the relationship information
            const relations = ExtractRelations.GetRelationElements(rawOsm)
            const osmTime = new Date(rawOsm.osm3s.timestamp_osm_base);

            const meta = {
                freshness: osmTime,
                relations: relations
            }

            writeFileSync(
                metaJsonName(targetdir, x, y, r.zoomlevel),
                JSON.stringify(meta)
            )
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
    const targetdir = args[2]
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


    await downloadRaw(targetdir, tileRange, overpass)
    await postProcess(targetdir, tileRange)
}


let args = [...process.argv]
args.splice(0, 2)
main(args);