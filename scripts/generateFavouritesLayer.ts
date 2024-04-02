import Script from "./Script"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import { existsSync, readFileSync, writeFileSync } from "fs"
import { AllSharedLayers } from "../src/Customizations/AllSharedLayers"
import { AllKnownLayoutsLazy } from "../src/Customizations/AllKnownLayouts"
import { Utils } from "../src/Utils"
import { AddEditingElements } from "../src/Models/ThemeConfig/Conversion/PrepareLayer"
import {
    MappingConfigJson,
    QuestionableTagRenderingConfigJson,
} from "../src/Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import { TagConfigJson } from "../src/Models/ThemeConfig/Json/TagConfigJson"
import { TagUtils } from "../src/Logic/Tags/TagUtils"
import { TagRenderingConfigJson } from "../src/Models/ThemeConfig/Json/TagRenderingConfigJson"
import { Translatable } from "../src/Models/ThemeConfig/Json/Translatable"

export class GenerateFavouritesLayer extends Script {
    private readonly layers: LayerConfigJson[] = []

    constructor() {
        super("Prepares the 'favourites'-layer")
        const allThemes = new AllKnownLayoutsLazy(false).values()
        for (const theme of allThemes) {
            if (theme.hideFromOverview) {
                continue
            }
            for (const layer of theme.layers) {
                if (!layer.source) {
                    continue
                }
                if (layer.source.geojsonSource) {
                    continue
                }
                const layerConfig = AllSharedLayers.getSharedLayersConfigs().get(layer.id)
                if (!layerConfig) {
                    continue
                }
                this.layers.push(layerConfig)
            }
        }
    }

    async main(args: string[]): Promise<void> {
        console.log("Generating the favourite layer: stealing _all_ tagRenderings")
        const proto = this.readLayer("favourite/favourite.proto.json")
        this.addTagRenderings(proto)
        this.addTitle(proto)
        proto.titleIcons = this.generateTitleIcons()
        const targetContent = JSON.stringify(proto, null, "  ")
        const path = "./assets/layers/favourite/favourite.json"
        if (existsSync(path)) {
            if (readFileSync(path, "utf8") === targetContent) {
                console.log(
                    "Already existing favourite layer is identical to the generated one, not writing"
                )
                return
            }
        }
        console.log("Written favourite layer to", path)
        writeFileSync(path, targetContent)
    }

    private sortMappings(mappings: MappingConfigJson[]): MappingConfigJson[] {
        const sortedMappings: MappingConfigJson[] = [...mappings]
        sortedMappings.sort((a, b) => {
            const aTag = TagUtils.Tag(a.if)
            const bTag = TagUtils.Tag(b.if)
            const aPop = TagUtils.GetPopularity(aTag)
            const bPop = TagUtils.GetPopularity(bTag)
            return aPop - bPop
        })

        return sortedMappings
    }

    private addTagRenderings(proto: LayerConfigJson) {
        const blacklistedIds = new Set([
            "images",
            "questions",
            "mapillary",
            "leftover-questions",
            "last_edit",
            "minimap",
            "move-button",
            "delete-button",
            "all-tags",
            "all_tags",
            ...AddEditingElements.addedElements,
        ])

        const generatedTagRenderings: (string | QuestionableTagRenderingConfigJson)[] = []
        const trPerId = new Map<
            string,
            { conditions: TagConfigJson[]; tr: QuestionableTagRenderingConfigJson }
        >()
        for (const layerConfig of this.layers) {
            if (!layerConfig.tagRenderings) {
                continue
            }
            for (const tagRendering of layerConfig.tagRenderings) {
                if (typeof tagRendering === "string") {
                    if (blacklistedIds.has(tagRendering)) {
                        continue
                    }
                    generatedTagRenderings.push(tagRendering)
                    blacklistedIds.add(tagRendering)
                    continue
                }
                if (tagRendering["builtin"]) {
                    continue
                }
                const id = tagRendering.id
                if (blacklistedIds.has(id)) {
                    continue
                }
                if (trPerId.has(id)) {
                    const old = trPerId.get(id).tr

                    // We need to figure out if this was a 'recycled' tag rendering or just happens to have the same id
                    function isSame(fieldName: string) {
                        return old[fieldName]?.["en"] === tagRendering[fieldName]?.["en"]
                    }

                    const sameQuestion = isSame("question") && isSame("render")
                    if (!sameQuestion) {
                        const newTr = <QuestionableTagRenderingConfigJson>Utils.Clone(tagRendering)
                        newTr.id = layerConfig.id + "_" + newTr.id
                        if (blacklistedIds.has(newTr.id)) {
                            continue
                        }
                        newTr.condition = {
                            and: Utils.NoNull([newTr.condition, layerConfig.source["osmTags"]]),
                        }
                        generatedTagRenderings.push(newTr)
                        blacklistedIds.add(newTr.id)
                        continue
                    }
                }
                if (!trPerId.has(id)) {
                    const newTr = <QuestionableTagRenderingConfigJson>Utils.Clone(tagRendering)
                    generatedTagRenderings.push(newTr)
                    trPerId.set(newTr.id, { tr: newTr, conditions: [] })
                }
                const conditions = trPerId.get(id).conditions
                if (tagRendering["condition"]) {
                    conditions.push({
                        and: [tagRendering["condition"], layerConfig.source["osmTags"]],
                    })
                } else {
                    conditions.push(layerConfig.source["osmTags"])
                }
            }
        }

        for (const { tr, conditions } of Array.from(trPerId.values())) {
            const optimized = TagUtils.optimzeJson({ or: conditions })
            if (optimized === true) {
                continue
            }
            if (optimized === false) {
                throw "Optimized into 'false', this is weird..."
            }
            tr.condition = optimized
        }

        const allTags: QuestionableTagRenderingConfigJson = {
            id: "all-tags",
            render: { "*": "{all_tags()}" },

            metacondition: {
                or: [
                    "__featureSwitchIsDebugging=true",
                    "mapcomplete-show_tags=full",
                    "mapcomplete-show_debug=yes",
                ],
            },
        }
        proto.tagRenderings = [
            "images",
            ...generatedTagRenderings,
            ...proto.tagRenderings,
            "questions",
            allTags,
        ]
    }

    /**
     * const titleIcons = new GenerateFavouritesLayer().generateTitleIcons()
     * JSON.stringify(titleIcons).indexOf("icons.defaults") // => -1
     * */
    private generateTitleIcons(): TagRenderingConfigJson[] {
        let iconsLibrary: Map<string, TagRenderingConfigJson[]> = new Map<
            string,
            TagRenderingConfigJson[]
        >()
        const path = "./src/assets/generated/layers/icons.json"
        if (existsSync(path)) {
            const config = <LayerConfigJson>JSON.parse(readFileSync(path, "utf8"))
            for (const tagRendering of config.tagRenderings) {
                const qtr = <QuestionableTagRenderingConfigJson>tagRendering
                const id = qtr.id
                if (id) {
                    iconsLibrary.set(id, [qtr])
                }
                for (const label of tagRendering["labels"] ?? []) {
                    if (!iconsLibrary.has(label)) {
                        iconsLibrary.set(label, [])
                    }
                    iconsLibrary.get(label).push(qtr)
                }
            }
        }
        let titleIcons: TagRenderingConfigJson[] = []
        const seenTitleIcons = new Set<string>()
        for (const layer of this.layers) {
            for (const titleIcon of layer.titleIcons) {
                if (typeof titleIcon === "string") {
                    continue
                }
                if (titleIcon["labels"]?.indexOf("defaults") >= 0) {
                    continue
                }
                if (titleIcon.id === "iconsdefaults") {
                    continue
                }

                if (titleIcon.id === "rating") {
                    if (!seenTitleIcons.has("rating")) {
                        titleIcons.unshift(...iconsLibrary.get("rating"))
                        seenTitleIcons.add("rating")
                    }
                    continue
                }
                if (seenTitleIcons.has(titleIcon.id)) {
                    continue
                }
                seenTitleIcons.add(titleIcon.id)
                console.log("Adding ", titleIcon.id)
                titleIcons.push(titleIcon)
            }
        }
        titleIcons.push(...(iconsLibrary.get("defaults") ?? []))
        return titleIcons
    }

    private addTitle(proto: LayerConfigJson) {
        let mappings: MappingConfigJson[] = []
        for (const layer of this.layers) {
            const t = layer.title
            const tags: TagConfigJson = layer.source["osmTags"]
            if (!t) {
                continue
            }
            if (typeof t === "string") {
                mappings.push({ if: tags, then: t })
            } else if (t["render"] !== undefined || t["mappings"] !== undefined) {
                const tr = <TagRenderingConfigJson>t
                for (let i = 0; i < (tr.mappings ?? []).length; i++) {
                    const mapping = tr.mappings[i]
                    const optimized = TagUtils.optimzeJson({
                        and: [mapping.if, tags],
                    })
                    if (optimized === false) {
                        console.warn(
                            "The following tags yielded 'false':",
                            JSON.stringify(mapping.if),
                            JSON.stringify(tags)
                        )
                        continue
                    }
                    if (optimized === true) {
                        console.error(
                            "The following tags yielded 'false':",
                            JSON.stringify(mapping.if),
                            JSON.stringify(tags)
                        )
                        throw "Tags for title optimized to true"
                    }

                    if (!mapping.then) {
                        throw (
                            "The title has a missing 'then' for mapping " +
                            i +
                            " in layer " +
                            layer.id
                        )
                    }
                    mappings.push({
                        if: optimized,
                        then: mapping.then,
                    })
                }
                if (tr.render) {
                    mappings.push({
                        if: tags,
                        then: <Translatable>tr.render,
                    })
                }
            } else {
                mappings.push({ if: tags, then: <Record<string, string>>t })
            }
        }

        mappings = this.sortMappings(mappings)

        if (proto.title["mappings"]) {
            mappings.unshift(...proto.title["mappings"])
        }
        if (proto.title["render"]) {
            mappings.push({
                if: "id~*",
                then: proto.title["render"],
            })
        }

        for (const mapping of mappings) {
            const opt = TagUtils.optimzeJson(mapping.if)
            if (typeof opt === "boolean") {
                continue
            }
            mapping.if = opt
        }

        proto.title = {
            mappings,
        }
    }

    private readLayer(path: string): LayerConfigJson {
        try {
            return JSON.parse(readFileSync("./assets/layers/" + path, "utf8"))
        } catch (e) {
            console.error("Could not read ./assets/layers/" + path)
            throw e
        }
    }
}

new GenerateFavouritesLayer().run()
