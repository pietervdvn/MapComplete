import * as known_layers from "../assets/generated/known_layers.json"
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import {TagUtils} from "../Logic/Tags/TagUtils";
import {Utils} from "../Utils";
import {writeFileSync} from "fs";
import ScriptUtils from "./ScriptUtils";
import Constants from "../Models/Constants";

/* Downloads stats on osmSource-tags and keys from tagInfo */

async function main(includeTags = true) {
    ScriptUtils.fixUtils()
    const layers: LayerConfigJson[] = (known_layers["default"] ?? known_layers).layers

    const keysAndTags = new Map<string, Set<string>>()

    for (const layer of layers) {

        if (layer.source["geoJson"] !== undefined && !layer.source["isOsmCache"]) {
            continue
        }
        if (Constants.priviliged_layers.indexOf(layer.id) >= 0) {
            continue
        }

        const sources = TagUtils.Tag(layer.source.osmTags)
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
    await Promise.all(Array.from(keysAndTags.keys()).map(async key => {
        const values = keysAndTags.get(key)
        const data = await Utils.downloadJson(`https://taginfo.openstreetmap.org/api/4/key/stats?key=${key}`)
        const count = data.data.find(item => item.type === "all").count
        keyTotal.set(key, count)
        console.log(key, "-->", count)


        if (values.size > 0) {

            tagTotal.set(key, new Map<string, number>())
            await Promise.all(
                Array.from(values).map(async value => {
                    const tagData = await Utils.downloadJson(`https://taginfo.openstreetmap.org/api/4/tag/stats?key=${key}&value=${value}`)
                    const count = tagData.data.find(item => item.type === "all").count
                    tagTotal.get(key).set(value, count)
                    console.log(key + "=" + value, "-->", count)
                })
            )

        }
    }))
    writeFileSync("./assets/key_totals.json",
        JSON.stringify(
            {
                keys: Utils.MapToObj(keyTotal),
                tags: Utils.MapToObj(tagTotal, v => Utils.MapToObj(v))
            },
            null, "  "
        )
    )
}

main().then(() => console.log("All done"))