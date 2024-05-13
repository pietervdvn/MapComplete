import known_layers from "../src/assets/generated/known_layers.json"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import { TagUtils } from "../src/Logic/Tags/TagUtils"
import { Utils } from "../src/Utils"
import { existsSync, readFileSync, writeFileSync } from "fs"
import ScriptUtils from "./ScriptUtils"
import TagRenderingConfig from "../src/Models/ThemeConfig/TagRenderingConfig"
import { And } from "../src/Logic/Tags/And"
import Script from "./Script"
import NameSuggestionIndex, { NSIItem } from "../src/Logic/Web/NameSuggestionIndex"
import TagInfo, { TagInfoStats } from "../src/Logic/Web/TagInfo"

class Utilities {
    static mapValues<X extends string | number, T, TOut>(record: Record<X, T>, f: ((t: T) => TOut)): Record<X, TOut> {
        const newR = <Record<X, TOut>>{}
        for (const x in record) {
            newR[x] = f(record[x])
        }
        return newR
    }
}
class GenerateStats extends Script {

    async createOptimizationFile(includeTags = true) {
        ScriptUtils.fixUtils()
        const layers = <LayerConfigJson[]>known_layers.layers

        const keysAndTags = new Map<string, Set<string>>()

        for (const layer of layers) {
            if (layer.source["geoJson"] !== undefined && !layer.source["isOsmCache"]) {
                continue
            }
            if (layer.source == null || typeof layer.source === "string") {
                continue
            }

            const sourcesList = [TagUtils.Tag(layer.source["osmTags"])]
            if (layer?.title) {
                sourcesList.push(...new TagRenderingConfig(layer.title).usedTags())
            }

            const sources = new And(sourcesList)
            const allKeys = sources.usedKeys()
            for (const key of allKeys) {
                if (!keysAndTags.has(key)) {
                    keysAndTags.set(key, new Set<string>())
                }
            }
            const allTags = includeTags ? sources.usedTags() : []
            for (const tag of allTags) {
                if (!keysAndTags.has(tag.key)) {
                    keysAndTags.set(tag.key, new Set<string>())
                }
                keysAndTags.get(tag.key).add(tag.value)
            }
        }

        const keyTotal = new Map<string, number>()
        const tagTotal = new Map<string, Map<string, number>>()
        await Promise.all(
            Array.from(keysAndTags.keys()).map(async (key) => {
                const values = keysAndTags.get(key)
                const data = await Utils.downloadJson(
                    `https://taginfo.openstreetmap.org/api/4/key/stats?key=${key}`
                )
                const count = data.data.find((item) => item.type === "all").count
                keyTotal.set(key, count)
                console.log(key, "-->", count)

                if (values.size > 0) {
                    tagTotal.set(key, new Map<string, number>())
                    await Promise.all(
                        Array.from(values).map(async (value) => {
                            const tagData = await Utils.downloadJson(
                                `https://taginfo.openstreetmap.org/api/4/tag/stats?key=${key}&value=${value}`
                            )
                            const count = tagData.data.find((item) => item.type === "all").count
                            tagTotal.get(key).set(value, count)
                            console.log(key + "=" + value, "-->", count)
                        })
                    )
                }
            })
        )
        writeFileSync(
            "./src/assets/key_totals.json",
            JSON.stringify(
                {
                    "#": "Generated with generateStats.ts",
                    date: new Date().toISOString(),
                    keys: Utils.MapToObj(keyTotal, (t) => t),
                    tags: Utils.MapToObj(tagTotal, (v) => Utils.MapToObj(v, (t) => t))
                },
                null,
                "  "
            )
        )
    }

    async createNameSuggestionIndexFile() {
        const type = "brand"
        let allBrands = <Record<string, Record<string, number>>>{}
        const path = "./src/assets/generated/nsi_stats/" + type + ".json"
        if (existsSync(path)) {
            allBrands = JSON.parse(readFileSync(path, "utf8"))
            console.log("Loaded",Object.keys(allBrands).length," previously loaded brands")
        }
        let lastWrite = new Date()
        const allBrandNames: string[] = NameSuggestionIndex.allPossible(type)
        for (const brand of allBrandNames) {
            if(allBrands[brand] !== undefined){
                console.log("Skipping", brand,", already loaded")
                continue
            }
            const distribution: Record<string, number> = Utilities.mapValues(await TagInfo.getGlobalDistributionsFor(type, brand), s => s.data.find(t => t.type === "all").count)
            allBrands[brand] = distribution
            if ((new Date().getTime() - lastWrite.getTime()) / 1000 >= 5) {
                writeFileSync(path, JSON.stringify(allBrands), "utf8")
                console.log("Checkpointed", path)
            }
        }
        writeFileSync(path, JSON.stringify(allBrands), "utf8")
    }

    constructor() {
        super("Downloads stats on osmSource-tags and keys from tagInfo. There are two usecases with separate outputs:\n 1. To optimize the query before sending it to overpass (generates ./src/assets/key_totals.json) \n 2. To amend the Name Suggestion Index ")
    }

    async main(_: string[]) {
        //  this.createOptimizationFile()
        await this.createNameSuggestionIndexFile()

    }

}


new GenerateStats().run()
