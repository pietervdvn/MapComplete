import { SpecialVisualizationState } from "../../SpecialVisualization"
import { Utils } from "../../../Utils"
import { ImmutableStore, Store, UIEventSource } from "../../../Logic/UIEventSource"
import { Tag } from "../../../Logic/Tags/Tag"
import TagApplyButton from "../TagApplyButton"
import { PointImportFlowArguments } from "./PointImportFlowState"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"
import FilteredLayer from "../../../Models/FilteredLayer"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import { LayerConfigJson } from "../../../Models/ThemeConfig/Json/LayerConfigJson"
import conflation_json from "../../../../assets/layers/conflation/conflation.json"

export interface ImportFlowArguments {
    readonly text: string
    readonly tags: string
    readonly targetLayer: string
    readonly icon?: string
}

export class ImportFlowUtils {
    public static importedIds = new Set<string>()

    public static readonly conflationLayer = new LayerConfig(
        <LayerConfigJson>conflation_json,
        "all_known_layers",
        true
    )

    public static readonly documentationGeneral = `\n\n\nNote that the contributor must zoom to at least zoomlevel 18 to be able to use this functionality.
    It is only functional in official themes, but can be tested in unoffical themes.

#### Specifying which tags to copy or add

    The argument \`tags\` of the import button takes a \`;\`-seperated list of tags to add (or the name of a property which contains a JSON-list of properties).

${Utils.Special_visualizations_tagsToApplyHelpText}
${Utils.special_visualizations_importRequirementDocs}
`

    public static generalArguments = [
        {
            name: "targetLayer",
            doc: "The id of the layer where this point should end up. This is not very strict, it will simply result in checking that this layer is shown preventing possible duplicate elements",
            required: true,
        },
        {
            name: "tags",
            doc: "The tags to add onto the new object - see specification above. If this is a key (a single word occuring in the properties of the object), the corresponding value is taken and expanded instead",
            required: true,
        },
        {
            name: "text",
            doc: "The text to show on the button",
            defaultValue: "Import this data into OpenStreetMap",
        },
        {
            name: "icon",
            doc: "A nice icon to show in the button",
            defaultValue: "./assets/svg/addSmall.svg",
        },
    ]

    /**
     * Given the tagsstore of the point which represents the challenge, creates a new store with tags that should be applied onto the newly created point,
     */
    public static getTagsToApply(
        originalFeatureTags: UIEventSource<any>,
        args: { tags: string }
    ): Store<Tag[]> {
        if (originalFeatureTags === undefined) {
            return undefined
        }
        let newTags: Store<Tag[]>
        const tags = args.tags
        if (
            tags.indexOf(" ") < 0 &&
            tags.indexOf(";") < 0 &&
            originalFeatureTags.data[tags] !== undefined
        ) {
            // This is a property to expand...
            const items: string = originalFeatureTags.data[tags]
            console.debug(
                "The import button is using tags from properties[" +
                    tags +
                    "] of this object, namely ",
                items
            )

            if (items.startsWith("{")) {
                // This is probably a JSON
                const properties: Record<string, string> = JSON.parse(items)
                const keys = Object.keys(properties)
                const tags = keys.map((k) => new Tag(k, properties[k]))
                return new ImmutableStore(tags)
            }

            newTags = TagApplyButton.generateTagsToApply(items, originalFeatureTags)
        } else {
            newTags = TagApplyButton.generateTagsToApply(tags, originalFeatureTags)
        }
        return newTags
    }

    /**
     * Lists:
     * - targetLayer
     *
     * Others (e.g.: snapOnto-layers) are not to be handled here
     */
    public static getLayerDependencies(argsRaw: string[], argSpec?): string[] {
        const args: ImportFlowArguments = <any>(
            Utils.ParseVisArgs(argSpec ?? ImportFlowUtils.generalArguments, argsRaw)
        )
        return args.targetLayer.split(" ")
    }

    public static getLayerDependenciesWithSnapOnto(
        argSpec: {
            name: string
            defaultValue?: string
        }[],
        argsRaw: string[]
    ): string[] {
        const deps = ImportFlowUtils.getLayerDependencies(argsRaw, argSpec)
        const argsParsed: PointImportFlowArguments = <any>Utils.ParseVisArgs(argSpec, argsRaw)
        const snapOntoLayers = argsParsed.snap_onto_layers?.split(";")?.map((l) => l.trim()) ?? []
        deps.push(...snapOntoLayers)
        return deps
    }
}

/**
 * The ImportFlow dictates some aspects of the import flow, e.g. what type of map should be shown and, in the case of a preview map, what layers that should be added.
 *
 * This class works together closely with ImportFlow.svelte
 */
export default abstract class ImportFlow<ArgT extends ImportFlowArguments> {
    public readonly state: SpecialVisualizationState
    public readonly args: ArgT
    public readonly targetLayer: FilteredLayer[]
    public readonly tagsToApply: Store<Tag[]>
    protected readonly _originalFeatureTags: UIEventSource<Record<string, string>>

    constructor(
        state: SpecialVisualizationState,
        args: ArgT,
        tagsToApply: Store<Tag[]>,
        originalTags: UIEventSource<Record<string, string>>
    ) {
        this.state = state
        this.args = args
        this.tagsToApply = tagsToApply
        this._originalFeatureTags = originalTags
        this.targetLayer = args.targetLayer.split(" ").map((tl) => {
            let found = state.layerState.filteredLayers.get(tl)
            if (!found) {
                throw "Layer " + tl + " not found"
            }
            return found
        })
    }

    /**
     * Constructs a store that contains either 'true' or gives a translation with the reason why it cannot be imported
     */
    public canBeImported(): Store<true | { error: Translation; extraHelp?: Translation }> {
        const state = this.state
        return state.featureSwitchIsTesting.map(
            (isTesting) => {
                const t = Translations.t.general.add.import

                if (this._originalFeatureTags.data["_imported"] === "yes") {
                    return { error: t.hasBeenImported }
                }

                if (!state.layout.official && !isTesting) {
                    // Unofficial theme - imports not allowed
                    return {
                        error: t.officialThemesOnly,
                        extraHelp: t.howToTest,
                    }
                }

                if (this.targetLayer === undefined) {
                    const e = `Target layer not defined: error in import button for theme: ${this.state.layout.id}: layer ${this.args.targetLayer} not found`
                    console.error(e)
                    return { error: new Translation({ "*": e }) }
                }

                if (state.mapProperties.zoom.data < 16) {
                    return { error: t.zoomInMore }
                }

                if (state.dataIsLoading.data) {
                    return { error: Translations.t.general.add.stillLoading }
                }

                return undefined
            },
            [state.mapProperties.zoom, state.dataIsLoading, this._originalFeatureTags]
        )
    }
}
