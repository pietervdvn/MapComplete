import known_layers from "../src/assets/generated/known_layers.json"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import { TagUtils } from "../src/Logic/Tags/TagUtils"
import { Utils } from "../src/Utils"
import { existsSync, readFileSync, writeFileSync } from "fs"
import ScriptUtils from "./ScriptUtils"
import TagRenderingConfig from "../src/Models/ThemeConfig/TagRenderingConfig"
import { And } from "../src/Logic/Tags/And"
import Script from "./Script"
import NameSuggestionIndex from "../src/Logic/Web/NameSuggestionIndex"
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
                const data = await TagInfo.global.getStats(key)
                const count = data.data.find((item) => item.type === "all").count
                keyTotal.set(key, count)
                console.log(key, "-->", count)

                if (values.size > 0) {
                    tagTotal.set(key, new Map<string, number>())
                    await Promise.all(
                        Array.from(values).map(async (value) => {
                                const tagData = await TagInfo.global.getStats(key, value)
                                const count = tagData.data.find((item) => item.type === "all").count
                                tagTotal.get(key).set(value, count)
                                console.log(key + "=" + value, "-->", count)
                            }
                        )
                    )
                }
            }))
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

    private summarizeNSI(sourcefile: string, pathNoExtension: string): void {
        const data = <Record<string, Record<string, number>>>JSON.parse(readFileSync(sourcefile, "utf8"))

        const allCountries: Set<string> = new Set()
        for (const brand in data) {
            const perCountry = data[brand]
            for (const country in perCountry) {
                allCountries.add(country)
                const count = perCountry[country]
                if (count === 0) {
                    delete perCountry[country]
                }
            }
        }

        const pathOut = pathNoExtension + ".summarized.json"
        writeFileSync(pathOut, JSON.stringify(
            data, null, "  "), "utf8")
        console.log("Written", pathOut)

        const allBrands = Object.keys(data)
        allBrands.sort()
        for (const country of allCountries) {
            const summary = <Record<string, number>>{}
            for (const brand of allBrands) {
                const count = data[brand][country]
                if (count > 2) { // Eéntje is geentje
                    // We ignore count == 1 as they are rather exceptional
                    summary[brand] = data[brand][country]
                }
            }

            const countryPath = pathNoExtension + "." + country + ".json"
            writeFileSync(countryPath, JSON.stringify(summary), "utf8")
            console.log("Written", countryPath)
        }
    }


    async createNameSuggestionIndexFile(basepath: string, type: "brand" | "operator" | string) {
        const path = basepath + type + ".json"
        let allBrands = <Record<string, Record<string, number>>>{}
        if (existsSync(path)) {
            allBrands = JSON.parse(readFileSync(path, "utf8"))
            console.log("Loaded", Object.keys(allBrands).length, " previously loaded " + type,"from",path)
        }
        let skipped = 0
        const allBrandNames: string[] = Utils.Dedup(NameSuggestionIndex.allPossible(type).map(item => item.tags[type]))
        const missingBrandNames : string[] = []
        for (let i = 0; i < allBrandNames.length; i++) {
            const brand = allBrandNames[i]
            if (!!allBrands[brand] && Object.keys(allBrands[brand]).length == 0) {
                delete allBrands[brand]
                console.log("Deleted", brand, "as no entries at all")
            }
            if (allBrands[brand] !== undefined) {
                const max = Math.max(...Object.values(allBrands[brand]))
                skipped++
                if (skipped % 100 == 0) {
                    console.warn("Busy; ", i + "/" + allBrandNames.length, "; skipped", skipped)
                }
                if (max < 0) {
                    console.log("HMMMM:", allBrands[brand])
                    delete allBrands[brand]
                } else {
                    continue
                }
            }
            missingBrandNames.push(brand)

        }
        const batchSize = 101
        for (let i = 0; i < missingBrandNames.length; i += batchSize) {

            console.warn("Downloading",batchSize,"items: ", i + "/" + (missingBrandNames.length), "; skipped", skipped, "total:",allBrandNames.length)

            const distributions = await Promise.all(Utils.TimesT(batchSize, async j => {
                await ScriptUtils.sleep(j * 250)
                return TagInfo.getGlobalDistributionsFor(type, missingBrandNames[i + j])
            }))
            for (let j = 0; j < distributions.length; j++) {
                const brand = missingBrandNames[i + j]
                const distribution: Record<string, number> = Utilities.mapValues(distributions[j], s => s.data.find(t => t.type === "all").count)
                allBrands[brand] = distribution
            }
            writeFileSync(path, JSON.stringify(allBrands), "utf8")
            console.log("Checkpointed", path)
        }
        writeFileSync(path, JSON.stringify(allBrands), "utf8")
    }

    constructor() {
        super("Downloads stats on osmSource-tags and keys from tagInfo. There are two usecases with separate outputs:\n 1. To optimize the query before sending it to overpass (generates ./src/assets/key_totals.json) \n 2. To amend the Name Suggestion Index ")
    }

    async main(_: string[]) {
        const basepath = "./src/assets/generated/stats/"
        await this.createOptimizationFile()

        for (const type of ["operator", "brand"]) {
            await this.createNameSuggestionIndexFile(basepath, type)
            this.summarizeNSI(basepath + type + ".json", "./public/assets/data/nsi/stats/" + type)
        }


    }

}


new GenerateStats().run()
