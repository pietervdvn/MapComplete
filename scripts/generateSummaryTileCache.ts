import Script from "./Script"
import Constants from "../src/Models/Constants"
import { Utils } from "../src/Utils"
import ScriptUtils from "./ScriptUtils"
import { SummaryTileSource } from "../src/Logic/FeatureSource/TiledFeatureSource/SummaryTileSource"
import { Tiles } from "../src/Models/TileRange"
import { Feature, Point } from "geojson"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"

class GenerateSummaryTileCache extends Script {
    private readonly url: string
    private readonly cacheDir = "./data/summary_cache/"

    constructor() {
        super("Generates all summary tiles up to z=12")
        this.url = Constants.SummaryServer
        if (!existsSync(this.cacheDir)) {
            mkdirSync(this.cacheDir)
        }
    }

    async fetchTile(z: number, x: number, y: number, layersSummed: string): Promise<Feature<Point>> {
        const index = Tiles.tile_index(z, x, y)
        let feature: Feature<Point> | any = (await SummaryTileSource.downloadTile(index, this.url, layersSummed).AsPromise())[0]
        if (!feature) {
            feature = { properties: { total: 0 } }
        }
        delete feature.properties.layers
        delete feature.properties.id
        delete feature.properties.total_metric
        delete feature.properties.summary // is simply "yes" for rendering
        delete feature.properties.lon
        delete feature.properties.lat
        return feature
    }

    async fetchTileRecursive(z: number, x: number, y: number, layersSummed: string, sleepMs = 0): Promise<Feature<Point>> {
        const index = Tiles.tile_index(z, x, y)
        const path = this.cacheDir + "tile_" + z + "_" + x + "_" + y + ".json"
        if (existsSync(path)) {
            return JSON.parse(readFileSync(path, "utf8"))
        }
        if (sleepMs > 0) {
            await ScriptUtils.sleep(sleepMs)
        }
        let feature: Feature<Point>
        if (z >= 14) {
            feature = await this.fetchTile(z, x, y, layersSummed)
        } else {
            const parts = [
               await this.fetchTileRecursive(z + 1, x * 2, y * 2, layersSummed),
               await this.fetchTileRecursive(z + 1, x * 2 + 1, y * 2, layersSummed),
               await this.fetchTileRecursive(z + 1, x * 2, y * 2 + 1, layersSummed),
               await this.fetchTileRecursive(z + 1, x * 2 + 1, y * 2 + 1, layersSummed)]
            const sum = this.sumTotals(parts.map(f => f.properties))
            feature = <Feature<Point>>{
                type: "Feature",
                properties: sum,
                geometry: {
                    type: "Point",
                    coordinates: Tiles.centerPointOf(z, x, y),
                },
            }
        }

        writeFileSync(path, JSON.stringify(feature))
        return feature
    }

    sumTotals(properties: Record<string, number>[]): Record<string, number> {
        const sum: Record<string, number> = {}
        for (const property of properties) {
            for (const k in property) {
                sum[k] = (sum[k] ?? 0) + property[k]
            }
        }
        return sum
    }


    async main(args: string[]): Promise<void> {

        const layers = await Utils.downloadJson<{ layers: string[], meta: object }>(this.url + "/status.json")
        const layersSummed = layers.layers.map(l => encodeURIComponent(l)).join("+")
        const r = await this.fetchTileRecursive(0, 0, 0, layersSummed)
        console.log(r)

    }
}

new GenerateSummaryTileCache().run()
