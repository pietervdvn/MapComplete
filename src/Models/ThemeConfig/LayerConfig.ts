import { Translation } from "../../UI/i18n/Translation"
import SourceConfig from "./SourceConfig"
import TagRenderingConfig from "./TagRenderingConfig"
import PresetConfig, { PreciseInput } from "./PresetConfig"
import { LayerConfigJson } from "./Json/LayerConfigJson"
import Translations from "../../UI/i18n/Translations"
import { TagUtils } from "../../Logic/Tags/TagUtils"
import FilterConfig from "./FilterConfig"
import { Unit } from "../Unit"
import DeleteConfig from "./DeleteConfig"
import MoveConfig from "./MoveConfig"
import PointRenderingConfig from "./PointRenderingConfig"
import WithContextLoader from "./WithContextLoader"
import LineRenderingConfig from "./LineRenderingConfig"
import { TagRenderingConfigJson } from "./Json/TagRenderingConfigJson"
import BaseUIElement from "../../UI/BaseUIElement"
import Combine from "../../UI/Base/Combine"
import Title from "../../UI/Base/Title"
import List from "../../UI/Base/List"
import Link from "../../UI/Base/Link"
import { Utils } from "../../Utils"
import { TagsFilter } from "../../Logic/Tags/TagsFilter"
import Table from "../../UI/Base/Table"
import FilterConfigJson from "./Json/FilterConfigJson"
import { Overpass } from "../../Logic/Osm/Overpass"
import { FixedUiElement } from "../../UI/Base/FixedUiElement"
import { ImmutableStore } from "../../Logic/UIEventSource"
import { OsmTags } from "../OsmFeature"
import Constants from "../Constants"
import { QuestionableTagRenderingConfigJson } from "./Json/QuestionableTagRenderingConfigJson"

export default class LayerConfig extends WithContextLoader {
    public static readonly syncSelectionAllowed = ["no", "local", "theme-only", "global"] as const
    public readonly id: string
    public readonly name: Translation
    public readonly description: Translation
    /**
     * Only 'null' for special, privileged layers
     */
    public readonly source: SourceConfig | null
    public readonly calculatedTags: [string, string, boolean][]
    public readonly doNotDownload: boolean
    public readonly passAllFeatures: boolean
    public readonly isShown: TagsFilter
    public minzoom: number
    public minzoomVisible: number
    public readonly title?: TagRenderingConfig
    public readonly titleIcons: TagRenderingConfig[]
    public readonly mapRendering: PointRenderingConfig[]
    public readonly lineRendering: LineRenderingConfig[]
    public readonly units: Unit[]
    public readonly deletion: DeleteConfig | null
    public readonly allowMove: MoveConfig | null
    public readonly allowSplit: boolean
    public readonly shownByDefault: boolean
    public readonly doCount: boolean
    /**
     * In seconds
     */
    public readonly maxAgeOfCache: number
    public readonly presets: PresetConfig[]
    public readonly tagRenderings: TagRenderingConfig[]
    public readonly filters: FilterConfig[]
    public readonly filterIsSameAs: string
    public readonly forceLoad: boolean
    public readonly syncSelection: (typeof LayerConfig.syncSelectionAllowed)[number] // this is a trick to conver a constant array of strings into a type union of these values

    public readonly _needsFullNodeDatabase: boolean
    public readonly popupInFloatover: boolean | string
    public readonly enableMorePrivacy: boolean

    constructor(json: LayerConfigJson, context?: string, official: boolean = true) {
        context = context + "." + json.id
        const translationContext = "layers:" + json.id
        super(json, context)
        this.id = json.id

        if (json.source === "special" || json.source === "special:library") {
            this.source = null
        }

        this.syncSelection = json.syncSelection ?? "no"
        if (typeof json.source !== "string") {
            this.maxAgeOfCache = json.source["maxCacheAge"] ?? 24 * 60 * 60 * 30
            this.source = new SourceConfig(
                {
                    osmTags: TagUtils.Tag(json.source["osmTags"], context + "source.osmTags"),
                    geojsonSource: json.source["geoJson"],
                    geojsonSourceLevel: json.source["geoJsonZoomLevel"],
                    overpassScript: json.source["overpassScript"],
                    isOsmCache: json.source["isOsmCache"],
                    mercatorCrs: json.source["mercatorCrs"],
                    idKey: json.source["idKey"],
                },
                json.id
            )
        }

        this.allowSplit = json.allowSplit ?? false
        this.name = Translations.T(json.name, translationContext + ".name")

        if (json.description !== undefined) {
            if (Object.keys(json.description).length === 0) {
                json.description = undefined
            }
        }

        this.description = Translations.T(json.description, translationContext + ".description")

        this.calculatedTags = undefined
        if (json.calculatedTags !== undefined) {
            if (!official) {
                console.warn(
                    `Unofficial theme ${this.id} with custom javascript! This is a security risk`
                )
            }
            this.calculatedTags = []
            for (const kv of json.calculatedTags) {
                const index = kv.indexOf("=")
                let key = kv.substring(0, index).trim()
                const r = "[a-z_][a-z0-9:]*"
                if (key.match(r) === null) {
                    throw (
                        "At " +
                        context +
                        " invalid key for calculated tag: " +
                        key +
                        "; it should match " +
                        r
                    )
                }
                const isStrict = key.endsWith(":")
                if (isStrict) {
                    key = key.substr(0, key.length - 1)
                }
                const code = kv.substring(index + 1)

                this.calculatedTags.push([key, code, isStrict])
            }
        }

        this.doNotDownload = json.doNotDownload ?? false
        this.passAllFeatures = json.passAllFeatures ?? false
        this.minzoom = json.minzoom ?? 0
        this._needsFullNodeDatabase = json.fullNodeDatabase ?? false
        if (json["minZoom"] !== undefined) {
            throw "At " + context + ": minzoom is written all lowercase"
        }
        this.minzoomVisible = json.minzoomVisible ?? this.minzoom
        this.shownByDefault = json.shownByDefault ?? true
        this.doCount = json.isCounted ?? this.shownByDefault ?? true
        this.forceLoad = json.forceLoad ?? false
        this.enableMorePrivacy = json.enableMorePrivacy ?? false
        if (json.presets === null) json.presets = undefined
        if (json.presets !== undefined && json.presets?.map === undefined) {
            throw "Presets should be a list of items (at " + context + ")"
        }
        this.presets = (json.presets ?? []).map((pr, i) => {
            let preciseInput: PreciseInput = {
                preferredBackground: ["photo"],
                snapToLayers: undefined,
                maxSnapDistance: undefined,
            }
            if (pr["preciseInput"] !== undefined) {
                throw (
                    "Layer " +
                    this.id +
                    " still uses the old 'preciseInput'-field. For snapping to layers, use 'snapToLayer' instead"
                )
            }
            if (pr.snapToLayer !== undefined) {
                let snapToLayers = pr.snapToLayer
                preciseInput = {
                    snapToLayers,
                    maxSnapDistance: pr.maxSnapDistance ?? 10,
                }
            }

            const config: PresetConfig = {
                title: Translations.T(pr.title, `${translationContext}.presets.${i}.title`),
                tags: pr.tags.map((t) => TagUtils.SimpleTag(t)),
                description: Translations.T(
                    pr.description,
                    `${translationContext}.presets.${i}.description`
                ),
                preciseInput: preciseInput,
                exampleImages: pr.exampleImages,
            }
            return config
        })

        if (json.pointRendering === undefined && json.lineRendering === undefined) {
            throw "Both pointRendering and lineRendering are undefined in " + context
        }

        if (json.lineRendering) {
            this.lineRendering = Utils.NoNull(json.lineRendering).map(
                (r, i) => new LineRenderingConfig(r, `${context}[${i}]`)
            )
        } else {
            this.lineRendering = []
        }

        if (json.pointRendering) {
            this.mapRendering = Utils.NoNull(json.pointRendering).map(
                (r, i) => new PointRenderingConfig(r, `${context}[${i}](${this.id})`)
            )
        } else {
            this.mapRendering = []
        }

        {
            const hasCenterRendering = this.mapRendering.some(
                (r) =>
                    r.location.has("centroid") ||
                    r.location.has("projected_centerpoint") ||
                    r.location.has("start") ||
                    r.location.has("end")
            )

            if (
                json.pointRendering !== null &&
                json.lineRendering !== null &&
                this.lineRendering.length === 0 &&
                this.mapRendering.length === 0
            ) {
                throw (
                    "The layer " +
                    this.id +
                    ` does not have any maprenderings defined and will thus not show up on the map at all:
\t ${this.lineRendering?.length} linerenderings and ${this.mapRendering?.length} pointRenderings.
\t If this is intentional, set \`pointRendering\` and \`lineRendering\` to 'null' instead of '[]'`
                )
            } else if (
                !hasCenterRendering &&
                this.lineRendering.length === 0 &&
                Constants.priviliged_layers.indexOf(<any>this.id) < 0 &&
                this.source !== null /*library layer*/ &&
                !this.source?.geojsonSource?.startsWith(
                    "https://api.openstreetmap.org/api/0.6/notes.json"
                )
            ) {
                throw (
                    "The layer " +
                    this.id +
                    " might not render ways. This might result in dropped information (at " +
                    context +
                    ")"
                )
            }
        }

        const missingIds =
            Utils.NoNull(json.tagRenderings)?.filter(
                (tr) =>
                    typeof tr !== "string" &&
                    tr["builtin"] === undefined &&
                    tr["id"] === undefined &&
                    tr["rewrite"] === undefined
            ) ?? []
        if (missingIds?.length > 0 && official) {
            console.error("Some tagRenderings of", this.id, "are missing an id:", missingIds)
            throw "Missing ids in tagrenderings"
        }

        this.tagRenderings = (Utils.NoNull(json.tagRenderings) ?? []).map(
            (tr, i) =>
                new TagRenderingConfig(
                    <QuestionableTagRenderingConfigJson>tr,
                    this.id + ".tagRenderings[" + i + "]"
                )
        )
        if (json.units !== undefined && !Array.isArray(json.units)) {
            throw (
                "At " +
                context +
                ".units: the 'units'-section should be a list; you probably have an object there"
            )
        }
        this.units = [].concat(
            ...(json.units ?? []).map((unitJson, i) =>
                Unit.fromJson(unitJson, this.tagRenderings,`${context}.unit[${i}]`)
            )
        )

        if (
            json.filter !== undefined &&
            json.filter !== null &&
            json.filter["sameAs"] !== undefined
        ) {
            this.filterIsSameAs = json.filter["sameAs"]
            this.filters = []
        } else {
            this.filters = (<FilterConfigJson[]>json.filter ?? []).map((option, i) => {
                return new FilterConfig(option, `layers:${this.id}.filter.${i}`)
            })
        }

        {
            const duplicateIds = Utils.Duplicates(this.filters.map((f) => f.id))
            if (duplicateIds.length > 0) {
                throw `Some filters have a duplicate id: ${duplicateIds} (at ${context}.filters)`
            }
        }

        if (json["filters"] !== undefined) {
            throw "Error in " + context + ": use 'filter' instead of 'filters'"
        }

        this.titleIcons = this.ParseTagRenderings(<TagRenderingConfigJson[]>json.titleIcons ?? [], {
            readOnlyMode: true,
        })

        this.title = this.tr("title", undefined, translationContext)
        this.isShown = TagUtils.TagD(json.isShown, context + ".isShown")

        this.deletion = null
        if (json.deletion === true) {
            json.deletion = {}
        }
        if (json.deletion !== undefined && json.deletion !== false) {
            this.deletion = new DeleteConfig(json.deletion, `${context}.deletion`)
        }

        this.allowMove = null
        if (json.allowMove === false) {
            this.allowMove = null
        } else if (json.allowMove === true) {
            this.allowMove = new MoveConfig({}, context + ".allowMove")
        } else if (json.allowMove !== undefined) {
            this.allowMove = new MoveConfig(json.allowMove, context + ".allowMove")
        }

        if (json["showIf"] !== undefined) {
            throw (
                "Invalid key on layerconfig " +
                this.id +
                ": showIf. Did you mean 'isShown' instead?"
            )
        }
        this.popupInFloatover = json.popupInFloatover ?? false
    }

    public defaultIcon(): BaseUIElement | undefined {
        if (this.mapRendering === undefined || this.mapRendering === null) {
            return undefined
        }
        const mapRendering = this.mapRendering.filter((r) => r.location.has("point"))[0]
        if (mapRendering === undefined) {
            return undefined
        }
        return mapRendering.GetBaseIcon(this.GetBaseTags())
    }

    public GetBaseTags(): Record<string, string> {
        return TagUtils.changeAsProperties(
            this.source?.osmTags?.asChange({ id: "node/-1" }) ?? [{ k: "id", v: "node/-1" }]
        )
    }

    public GenerateDocumentation(
        usedInThemes: string[],
        layerIsNeededBy?: Map<string, string[]>,
        dependencies: {
            context?: string
            reason: string
            neededLayer: string
        }[] = [],
        addedByDefault = false,
        canBeIncluded = true
    ): BaseUIElement {
        const extraProps: (string | BaseUIElement)[] = []
        extraProps.push("This layer is shown at zoomlevel **" + this.minzoom + "** and higher")

        if (canBeIncluded) {
            if (addedByDefault) {
                extraProps.push(
                    "**This layer is included automatically in every theme. This layer might contain no points**"
                )
            }
            if (this.shownByDefault === false) {
                extraProps.push(
                    "This layer is not visible by default and must be enabled in the filter by the user. "
                )
            }
            if (this.title === undefined) {
                extraProps.push(
                    "Elements don't have a title set and cannot be toggled nor will they show up in the dashboard. If you import this layer in your theme, override `title` to make this toggleable."
                )
            }
            if (this.name === undefined && this.shownByDefault === false) {
                extraProps.push(
                    "This layer is not visible by default and the visibility cannot be toggled, effectively resulting in a fully hidden layer. This can be useful, e.g. to calculate some metatags. If you want to render this layer (e.g. for debugging), enable it by setting the URL-parameter layer-<id>=true"
                )
            }
            if (this.name === undefined) {
                extraProps.push(
                    "Not visible in the layer selection by default. If you want to make this layer toggable, override `name`"
                )
            }
            if (this.mapRendering.length === 0) {
                extraProps.push(
                    "Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`"
                )
            }

            if (this.source?.geojsonSource !== undefined) {
                extraProps.push(
                    new Combine([
                        Utils.runningFromConsole
                            ? "<img src='../warning.svg' height='1rem'/>"
                            : undefined,
                        "This layer is loaded from an external source, namely ",
                        new FixedUiElement(this.source.geojsonSource).SetClass("code"),
                    ])
                )
            }
        } else {
            extraProps.push(
                "This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data."
            )
        }

        let usingLayer: BaseUIElement[] = []
        if (!addedByDefault) {
            if (usedInThemes?.length > 0) {
                usingLayer = [
                    new Title("Themes using this layer", 2),
                    new List(
                        (usedInThemes ?? []).map(
                            (id) => new Link(id, "https://mapcomplete.org/" + id)
                        )
                    ),
                ]
            } else if (this.source !== null) {
                usingLayer = [new FixedUiElement("No themes use this layer")]
            }
        }

        for (const dep of dependencies) {
            extraProps.push(
                new Combine([
                    "This layer will automatically load ",
                    new Link(dep.neededLayer, "./" + dep.neededLayer + ".md"),
                    " into the layout as it depends on it: ",
                    dep.reason,
                    "(" + dep.context + ")",
                ])
            )
        }

        for (const revDep of Utils.Dedup(layerIsNeededBy?.get(this.id) ?? [])) {
            extraProps.push(
                new Combine([
                    "This layer is needed as dependency for layer",
                    new Link(revDep, "#" + revDep),
                ])
            )
        }

        const tableRows = Utils.NoNull(
            this.tagRenderings
                .map((tr) => tr.FreeformValues())
                .map((values) => {
                    if (values == undefined) {
                        return undefined
                    }
                    const embedded: (Link | string)[] = values.values?.map((v) =>
                        Link.OsmWiki(values.key, v, true).SetClass("mr-2")
                    ) ?? ["_no preset options defined, or no values in them_"]
                    return [
                        new Combine([
                            new Link(
                                "<img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'>",
                                "https://taginfo.openstreetmap.org/keys/" + values.key + "#values",
                                true
                            ),
                            Link.OsmWiki(values.key),
                        ]).SetClass("flex"),
                        values.type === undefined
                            ? "Multiple choice"
                            : new Link(values.type, "../SpecialInputElements.md#" + values.type),
                        new Combine(embedded).SetClass("flex"),
                    ]
                })
        )

        let quickOverview: BaseUIElement = undefined
        if (tableRows.length > 0) {
            quickOverview = new Combine([
                new FixedUiElement("Warning: ").SetClass("bold"),
                "this quick overview is incomplete",
                new Table(
                    ["attribute", "type", "values which are supported by this layer"],
                    tableRows
                ).SetClass("zebra-table"),
            ]).SetClass("flex-col flex")
        }

        let iconImg: BaseUIElement = new FixedUiElement("")

        if (!Utils.runningFromConsole) {
            iconImg = this.mapRendering
                .filter((mr) => mr.location.has("point"))
                .map(
                    (mr) =>
                        mr.RenderIcon(new ImmutableStore<OsmTags>({ id: "node/-1" }), {
                            includeBadges: false,
                        }).html
                )
                .find((i) => i !== undefined)
        }

        let overpassLink: BaseUIElement = undefined
        if (this.source !== undefined) {
            try {
                overpassLink = new Link(
                    "Execute on overpass",
                    Overpass.AsOverpassTurboLink(<TagsFilter>this.source.osmTags.optimize())
                        .replaceAll("(", "%28")
                        .replaceAll(")", "%29")
                )
            } catch (e) {
                console.error("Could not generate overpasslink for " + this.id)
            }
        }

        const filterDocs: (string | BaseUIElement)[] = []
        if (this.filters.length > 0) {
            filterDocs.push(new Title("Filters", 4))
            filterDocs.push(...this.filters.map((filter) => filter.GenerateDocs()))
        }

        const tagsDescription = []
        if (this.source !== null) {
            tagsDescription.push(new Title("Basic tags for this layer", 2))

            const neededTags = <TagsFilter>this.source.osmTags.optimize()
            if (neededTags["and"]) {
                const parts = neededTags["and"]
                tagsDescription.push(
                    "Elements must match **all** of the following expressions:",
                    parts.map((p, i) => i + ". " + p.asHumanString(true, false, {})).join("\n")
                )
            } else if (neededTags["or"]) {
                const parts = neededTags["or"]
                tagsDescription.push(
                    "Elements must match **any** of the following expressions:",
                    parts.map((p) => " - " + p.asHumanString(true, false, {})).join("\n")
                )
            } else {
                tagsDescription.push(
                    "Elements must match the expression **" +
                        neededTags.asHumanString(true, false, {}) +
                        "**"
                )
            }

            tagsDescription.push(overpassLink)
        } else {
            tagsDescription.push("This is a special layer - data is not sourced from OpenStreetMap")
        }

        return new Combine([
            new Combine([new Title(this.id, 1), iconImg, this.description, "\n"]).SetClass(
                "flex flex-col"
            ),
            new List(extraProps),
            ...usingLayer,
            ...tagsDescription,
            new Title("Supported attributes", 2),
            quickOverview,
            ...this.tagRenderings.map((tr) => tr.GenerateDocumentation()),
            ...filterDocs,
        ])
            .SetClass("flex-col")
            .SetClass("link-underline")
    }

    public CustomCodeSnippets(): string[] {
        if (this.calculatedTags === undefined) {
            return []
        }
        return this.calculatedTags.map((code) => code[1])
    }

    AllTagRenderings(): TagRenderingConfig[] {
        return Utils.NoNull([...this.tagRenderings, ...this.titleIcons, this.title])
    }

    public isLeftRightSensitive(): boolean {
        return this.lineRendering.some((lr) => lr.leftRightSensitive)
    }
}
