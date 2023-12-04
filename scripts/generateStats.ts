import known_layers from "../src/assets/generated/known_layers.json"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import { TagUtils } from "../src/Logic/Tags/TagUtils"
import { Utils } from "../src/Utils"
import { writeFileSync } from "fs"
import ScriptUtils from "./ScriptUtils"
import TagRenderingConfig from "../src/Models/ThemeConfig/TagRenderingConfig"
import { And } from "../src/Logic/Tags/And"

/* Downloads stats on osmSource-tags and keys from tagInfo */

async function main(includeTags = true) {
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
                tags: Utils.MapToObj(tagTotal, (v) => Utils.MapToObj(v, (t) => t)),
            },
            null,
            "  "
        )
    )
}

main().then(() => console.log("All done"))
