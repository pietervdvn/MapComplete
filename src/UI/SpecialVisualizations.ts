import Combine from "./Base/Combine"
import { FixedUiElement } from "./Base/FixedUiElement"
import BaseUIElement from "./BaseUIElement"
import { default as FeatureTitle } from "./Popup/Title.svelte"
import { RenderingSpecification, SpecialVisualization, SpecialVisualizationState } from "./SpecialVisualization"
import { HistogramViz } from "./Popup/HistogramViz"
import { UploadToOsmViz } from "./Popup/UploadToOsmViz"
import { MultiApplyViz } from "./Popup/MultiApplyViz"
import { UIEventSource } from "../Logic/UIEventSource"
import AllTagsPanel from "./Popup/AllTagsPanel.svelte"
import { VariableUiElement } from "./Base/VariableUIElement"
import { Translation } from "./i18n/Translation"
import Translations from "./i18n/Translations"
import OpeningHoursVisualization from "./OpeningHours/OpeningHoursVisualization"
import { SubtleButton } from "./Base/SubtleButton"
import StatisticsPanel from "./BigComponents/StatisticsPanel"
import AutoApplyButton from "./Popup/AutoApplyButton"
import { LanguageElement } from "./Popup/LanguageElement/LanguageElement"
import SvelteUIElement from "./Base/SvelteUIElement"
import { BBoxFeatureSourceForLayer } from "../Logic/FeatureSource/Sources/TouchesBboxFeatureSource"
import { Feature, LineString } from "geojson"
import { GeoOperations } from "../Logic/GeoOperations"
import LayerConfig from "../Models/ThemeConfig/LayerConfig"
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig"
import ExportFeatureButton from "./Popup/ExportFeatureButton.svelte"
import TagRenderingEditable from "./Popup/TagRendering/TagRenderingEditable.svelte"
import Constants from "../Models/Constants"
import { TagUtils } from "../Logic/Tags/TagUtils"
import NextChangeViz from "./OpeningHours/NextChangeViz.svelte"
import { Unit } from "../Models/Unit"
import DirectionIndicator from "./Base/DirectionIndicator.svelte"
import SpecialVisualisationUtils from "./SpecialVisualisationUtils"
import MarkdownUtils from "../Utils/MarkdownUtils"
import Trash from "@babeard/svelte-heroicons/mini/Trash"
import { And } from "../Logic/Tags/And"
import { QuestionableTagRenderingConfigJson } from "../Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import { ImageVisualisations } from "./SpecialVisualisations/ImageVisualisations"
import { NoteVisualisations } from "./SpecialVisualisations/NoteVisualisations"
import { FavouriteVisualisations } from "./SpecialVisualisations/FavouriteVisualisations"
import { UISpecialVisualisations } from "./SpecialVisualisations/UISpecialVisualisations"
import { SettingsVisualisations } from "./SpecialVisualisations/SettingsVisualisations"
import { ReviewSpecialVisualisations } from "./SpecialVisualisations/ReviewSpecialVisualisations"
import { DataImportSpecialVisualisations } from "./SpecialVisualisations/DataImportSpecialVisualisations"
import TagrenderingManipulationSpecialVisualisations
    from "./SpecialVisualisations/TagrenderingManipulationSpecialVisualisations"
import {
    WebAndCommunicationSpecialVisualisations
} from "./SpecialVisualisations/WebAndCommunicationSpecialVisualisations"


export default class SpecialVisualizations {
    public static specialVisualizations: SpecialVisualization[] = SpecialVisualizations.initList()
    public static specialVisualisationsDict: Map<string, SpecialVisualization> = new Map<
        string,
        SpecialVisualization
    >()

    static {
        for (const specialVisualization of SpecialVisualizations.specialVisualizations) {
            SpecialVisualizations.specialVisualisationsDict.set(
                specialVisualization.funcName,
                specialVisualization
            )
        }
    }

    public static DocumentationFor(viz: string | SpecialVisualization): string {
        if (typeof viz === "string") {
            viz = SpecialVisualizations.specialVisualizations.find((sv) => sv.funcName === viz)
        }
        if (viz === undefined) {
            return ""
        }
        const example =
            viz.example ??
            "`{" + viz.funcName + "(" + viz.args.map((arg) => arg.defaultValue).join(",") + ")}`"
        return [
            "### " + viz.funcName,
            viz.docs,
            viz.args.length > 0
                ? MarkdownUtils.table(
                    ["name", "default", "description"],
                    viz.args.map((arg) => {
                        let defaultArg = arg.defaultValue ?? "_undefined_"
                        if (defaultArg == "") {
                            defaultArg = "_empty string_"
                        }
                        return [arg.name, defaultArg, arg.doc]
                    })
                )
                : undefined,
            "#### Example usage of " + viz.funcName,
            example
        ].join("\n\n")
    }

    public static constructSpecification(
        template: string,
        extraMappings: SpecialVisualization[] = []
    ): RenderingSpecification[] {
        return SpecialVisualisationUtils.constructSpecification(
            template,
            SpecialVisualizations.specialVisualisationsDict,
            extraMappings
        )
    }

    public static HelpMessage(): string {

        const vis = [...SpecialVisualizations.specialVisualizations]
        vis.sort((a, b) => {
            return a.funcName < b.funcName ? -1 : 1
        })
        vis.sort((a, b) => {
            if (a.group === b.group) {
                return 0
            }
            return (a.group ?? "xxx") < (b.group ?? "xxx") ? -1 : 1
        })

        const groupExplanations: Record<string, string> = {
            "default": "These special visualisations are (mostly) interactive components that most elements get by default. You'll normally won't need them in custom layers. There are also a few miscellaneous elements supporting the map UI.",
            "favourites": "Elements relating to marking an object as favourite (giving it a heart). Default element",
            "settings": "Elements part of the usersettings-ui",
            "images": "Elements related to adding or manipulating images. Normally also added by default, but in some cases a tweaked version is needed",
            "notes": "Elements relating to OpenStreetMap-notes, e.g. the component to close and/or add a comment",
            "reviews": "Elements relating to seeing and adding ratings and reviews with Mangrove.reviews",
            "data_import": "Elements to help with importing data to OSM. For example: buttons to import a feature, apply tags on an element, apply multiple tags on an element or to work with maproulette",
            "tagrendering_manipulation": "Special visualisations which reuse other tagRenderings to show data, but with a twist.",
            "web_and_communication": "Tools to show data from external websites, which link to external websites or which link to external profiles"
        }

        const helpTexts: string[] = []
        let lastGroup: string = null
        for (const viz of vis) {
            if (viz.group !== lastGroup) {
                lastGroup = viz.group
                if (viz.group === undefined) {
                    helpTexts.push("## Unclassified elements\n\nVarious elements")
                } else {

                    helpTexts.push("## " + viz.group)
                    if (!groupExplanations[viz.group]) {
                        throw "\n\n >>>> ERROR <<<<  Unknown visualisation group type: " + viz.group + "\n\n\n"
                    }
                    helpTexts.push(groupExplanations[viz.group])
                }
            }
            helpTexts.push(SpecialVisualizations.DocumentationFor(viz))
        }

        const example = JSON.stringify(
            {
                render: {
                    special: {
                        type: "some_special_visualisation",
                        argname: "some_arg",
                        message: {
                            en: "some other really long message",
                            nl: "een boodschap in een andere taal"
                        },
                        other_arg_name: "more args"
                    },
                    before: {
                        en: "Some text to prefix before the special element (e.g. a title)",
                        nl: "Een tekst om voor het element te zetten (bv. een titel)"
                    },
                    after: {
                        en: "Some text to put after the element, e.g. a footer"
                    }
                }
            },
            null,
            "  "
        )

        const firstPart = [
            "# Special tag renderings",
            "In a tagrendering, some special values are substituted by an advanced UI-element. This allows advanced features and visualizations to be reused by custom themes or even to query third-party API's.",
            "General usage is `{func_name()}`, `{func_name(arg, someotherarg)}` or `{func_name(args):cssClasses}`. Note that you _do not_ need to use quotes around your arguments, the comma is enough to separate them. This also implies you cannot use a comma in your args",
            "# Using expanded syntax",
            `Instead of using \`{"render": {"en": "{some_special_visualisation(some_arg, some other really long message, more args)} , "nl": "{some_special_visualisation(some_arg, een boodschap in een andere taal, more args)}}\`, one can also write`,
            "```\n" + example + "\n```\n",
            "In other words: use `{ \"before\": ..., \"after\": ..., \"special\": {\"type\": ..., \"argname\": ...argvalue...}`. The args are in the `special` block; an argvalue can be a string, a translation or another value. (Refer to class `RewriteSpecial` in case of problems)",
            "# Overview of all special components"
        ].join("\n\n")
        return firstPart + "\n\n" + helpTexts.join("\n\n")
    }

    private static initList(): SpecialVisualization[] {
        const specialVisualizations: SpecialVisualization[] = [
            ...ImageVisualisations.initList(),
            ...NoteVisualisations.initList(),
            ...FavouriteVisualisations.initList(),
            ...UISpecialVisualisations.initList(),
            ...SettingsVisualisations.initList(),
            ...ReviewSpecialVisualisations.initList(),
            ...DataImportSpecialVisualisations.initList(),
            ...TagrenderingManipulationSpecialVisualisations.initList(),
            ...WebAndCommunicationSpecialVisualisations.initList(),
            new HistogramViz(),
            {
                funcName: "export_as_gpx",
                docs: "Exports the selected feature as GPX-file",
                args: [],
                needsUrls: [],

                constr(
                    state: SpecialVisualizationState,
                    tags: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ) {
                    if (feature.geometry.type !== "LineString") {
                        return undefined
                    }
                    const t = Translations.t.general.download

                    return new SvelteUIElement(ExportFeatureButton, {
                        tags,
                        feature,
                        layer,
                        mimetype: "{gpx=application/gpx+xml}",
                        extension: "gpx",
                        construct: (feature: Feature<LineString>, title: string) =>
                            GeoOperations.toGpx(feature, title),
                        helpertext: t.downloadGpxHelper,
                        maintext: t.downloadFeatureAsGpx
                    })
                }
            },
            new UploadToOsmViz(),
            new MultiApplyViz(),

            new LanguageElement(),
            {
                funcName: "all_tags",
                docs: "Prints all key-value pairs of the object - used for debugging",
                args: [],
                constr: (
                    state,
                    tags: UIEventSource<Record<string, string>>,
                    _,
                    __,
                    layer: LayerConfig
                ) => new SvelteUIElement(AllTagsPanel, { tags, layer })
            },
            {
                funcName: "opening_hours_table",
                docs: "Creates an opening-hours table. Usage: {opening_hours_table(opening_hours)} to create a table of the tag 'opening_hours'.",
                args: [
                    {
                        name: "key",
                        defaultValue: "opening_hours",
                        doc: "The tagkey from which the table is constructed."
                    },
                    {
                        name: "prefix",
                        defaultValue: "",
                        doc: "Remove this string from the start of the value before parsing. __Note: use `&LPARENs` to indicate `(` if needed__"
                    },
                    {
                        name: "postfix",
                        defaultValue: "",
                        doc: "Remove this string from the end of the value before parsing. __Note: use `&RPARENs` to indicate `)` if needed__"
                    }
                ],
                needsUrls: [Constants.countryCoderEndpoint],
                example:
                    "A normal opening hours table can be invoked with `{opening_hours_table()}`. A table for e.g. conditional access with opening hours can be `{opening_hours_table(access:conditional, no @ &LPARENS, &RPARENS)}`",
                constr: (state, tagSource: UIEventSource<any>, args) => {
                    const [key, prefix, postfix] = args
                    return new OpeningHoursVisualization(tagSource, key, prefix, postfix)
                }
            },
            {
                funcName: "opening_hours_state",
                docs: "A small element, showing if the POI is currently open and when the next change is",
                args: [
                    {
                        name: "key",
                        defaultValue: "opening_hours",
                        doc: "The tagkey from which the opening hours are read."
                    },
                    {
                        name: "prefix",
                        defaultValue: "",
                        doc: "Remove this string from the start of the value before parsing. __Note: use `&LPARENs` to indicate `(` if needed__"
                    },
                    {
                        name: "postfix",
                        defaultValue: "",
                        doc: "Remove this string from the end of the value before parsing. __Note: use `&RPARENs` to indicate `)` if needed__"
                    }
                ],
                constr(
                    state: SpecialVisualizationState,
                    tags: UIEventSource<Record<string, string>>,
                    args: string[]
                ): SvelteUIElement {
                    const keyToUse = args[0]
                    const prefix = args[1]
                    const postfix = args[2]
                    return new SvelteUIElement(NextChangeViz, {
                        state,
                        keyToUse,
                        tags,
                        prefix,
                        postfix
                    })
                }
            },
            {
                funcName: "canonical",

                docs: "Converts a short, canonical value into the long, translated text including the unit. This only works if a `unit` is defined for the corresponding value. The unit specification will be included in the text. ",
                example:
                    "If the object has `length=42`, then `{canonical(length)}` will be shown as **42 meter** (in english), **42 metre** (in french), ...",
                args: [
                    {
                        name: "key",
                        doc: "The key of the tag to give the canonical text for",
                        required: true
                    }
                ],
                constr: (state, tagSource, args) => {
                    const key = args[0]
                    return new VariableUiElement(
                        tagSource
                            .map((tags) => tags[key])
                            .map((value) => {
                                if (value === undefined) {
                                    return undefined
                                }
                                const allUnits: Unit[] = [].concat(
                                    ...(state?.theme?.layers?.map((lyr) => lyr.units) ?? [])
                                )
                                const unit = allUnits.filter((unit) =>
                                    unit.isApplicableToKey(key)
                                )[0]
                                if (unit === undefined) {
                                    return value
                                }
                                const getCountry = () => tagSource.data._country
                                return unit.asHumanLongValue(value, getCountry)
                            })
                    )
                }
            },
            {
                funcName: "export_as_geojson",
                docs: "Exports the selected feature as GeoJson-file",
                args: [],

                constr: (state, tags, args, feature, layer) => {
                    const t = Translations.t.general.download
                    return new SvelteUIElement(ExportFeatureButton, {
                        tags,
                        feature,
                        layer,
                        mimetype: "application/vnd.geo+json",
                        extension: "geojson",
                        construct: (feature: Feature<LineString>) =>
                            JSON.stringify(feature, null, "  "),
                        maintext: t.downloadFeatureAsGeojson,
                        helpertext: t.downloadGeoJsonHelper
                    })
                }
            },

            {
                funcName: "clear_location_history",
                docs: "A button to remove the travelled track information from the device",
                args: [],

                constr: (state) => {
                    return new SubtleButton(
                        new SvelteUIElement(Trash),
                        Translations.t.general.removeLocationHistory
                    ).onClick(() => {
                        state.historicalUserLocations.features.setData([])
                        state.selectedElement.setData(undefined)
                    })
                }
            },

            {
                funcName: "title",
                args: [],

                docs: "Shows the title of the popup. Useful for some cases, e.g. 'What is phone number of {title()}?'",
                example:
                    "`What is the phone number of {title()}`, which might automatically become `What is the phone number of XYZ`.",
                constr: (
                    state: SpecialVisualizationState,
                    tags: UIEventSource<Record<string, string>>,
                    _: string[],
                    feature: Feature,
                    layer: LayerConfig
                ) => {
                    return new SvelteUIElement(FeatureTitle, { state, tags, feature, layer })
                }
            },
            {
                funcName: "statistics",
                docs: "Show general statistics about the elements currently in view. Intended to use on the `current_view`-layer",
                args: [],

                constr: (state) => {
                    return new Combine(
                        state.theme.layers
                            .filter(
                                (l) =>
                                    l.name !== null &&
                                    l.title &&
                                    state.perLayer.get(l.id) !== undefined
                            )
                            .map(
                                (l) => {
                                    const fs = state.perLayer.get(l.id)
                                    console.log(">>>", l.id, fs)
                                    const bbox = state.mapProperties.bounds
                                    const fsBboxed = new BBoxFeatureSourceForLayer(fs, bbox)
                                    return new StatisticsPanel(fsBboxed)
                                },
                                [state.mapProperties.bounds]
                            )
                    )
                }
            },


            {
                funcName: "translated",
                docs: "If the given key can be interpreted as a JSON, only show the key containing the current language (or 'en'). This specialRendering is meant to be used by MapComplete studio and is not useful in map themes",

                args: [
                    {
                        name: "key",
                        doc: "The attribute to interpret as json",
                        defaultValue: "value"
                    }
                ],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                ): BaseUIElement {
                    return new VariableUiElement(
                        tagSource.map((tags) => {
                            const v = tags[argument[0] ?? "value"]
                            try {
                                const tr = typeof v === "string" ? JSON.parse(v) : v
                                return new Translation(tr).SetClass("font-bold")
                            } catch (e) {
                                console.error("Cannot create a translation for", v, "due to", e)
                                return JSON.stringify(v)
                            }
                        })
                    )
                }
            },
            {
                funcName: "braced",
                docs: "Show a literal text within braces",

                args: [
                    {
                        name: "text",
                        required: true,
                        doc: "The value to show"
                    }
                ],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    args: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    return new FixedUiElement("{" + args[0] + "}")
                }
            },
            {
                funcName: "tags",
                docs: "Shows a (json of) tags in a human-readable way + links to the wiki",

                args: [
                    {
                        name: "key",
                        defaultValue: "value",
                        doc: "The key to look for the tags"
                    }
                ],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    const key = argument[0] ?? "value"
                    return new VariableUiElement(
                        tagSource.map((tags) => {
                            let value = tags[key]
                            if (!value) {
                                return new FixedUiElement("No tags found").SetClass("font-bold")
                            }
                            if (typeof value === "string" && value.startsWith("{")) {
                                value = JSON.parse(value)
                            }
                            try {
                                const parsed = TagUtils.Tag(value)
                                return parsed.asHumanString(true, false, {})
                            } catch (e) {
                                return new FixedUiElement(
                                    "Could not parse this tag: " +
                                    JSON.stringify(value) +
                                    " due to " +
                                    e
                                ).SetClass("alert")
                            }
                        })
                    )
                }
            },

            {
                funcName: "direction_indicator",
                args: [],

                docs: "Gives a distance indicator and a compass pointing towards the location from your GPS-location. If clicked, centers the map on the object",
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    return new SvelteUIElement(DirectionIndicator, { state, feature })
                }
            },

            {
                funcName: "direction_absolute",
                docs: "Converts compass degrees (with 0° being north, 90° being east, ...) into a human readable, translated direction such as 'north', 'northeast'",
                args: [
                    {
                        name: "key",
                        doc: "The attribute containing the degrees",
                        defaultValue: "_direction:centerpoint"
                    }
                ],

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    args: string[]
                ): BaseUIElement {
                    const key = args[0] === "" ? "_direction:centerpoint" : args[0]
                    return new VariableUiElement(
                        tagSource
                            .map((tags) => {
                                console.log("Direction value", tags[key], key)
                                return tags[key]
                            })
                            .mapD((value) => {
                                const dir = GeoOperations.bearingToHuman(
                                    GeoOperations.parseBearing(value)
                                )
                                console.log("Human dir", dir)
                                return Translations.t.general.visualFeedback.directionsAbsolute[dir]
                            })
                    )
                }
            },

            {
                funcName: "preset_description",
                docs: "Shows the extra description from the presets of the layer, if one matches. It will pick the most specific one (e.g. if preset `A` implies `B`, but `B` does not imply `A`, it'll pick B) or the first one if no ordering can be made. Might be empty",
                args: [],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                ): BaseUIElement {
                    const translation = tagSource.map((tags) => {
                        const layer = state.theme.getMatchingLayer(tags)
                        return layer?.getMostMatchingPreset(tags)?.description
                    })
                    return new VariableUiElement(translation)
                }
            },


            {
                funcName: "preset_type_select",
                docs: "An editable tag rendering which allows to change the type",
                args: [],
                constr(
                    state: SpecialVisualizationState,
                    tags: UIEventSource<Record<string, string>>,
                    argument: string[],
                    selectedElement: Feature,
                    layer: LayerConfig
                ): SvelteUIElement {
                    const t = Translations.t.preset_type
                    const question: QuestionableTagRenderingConfigJson = {
                        id: layer.id + "-type",
                        question: t.question.translations,
                        mappings: layer.presets.map((pr) => ({
                            if: new And(pr.tags).asJson(),
                            icon: "auto",
                            then: (pr.description ? t.typeDescription : t.typeTitle).Subs({
                                title: pr.title,
                                description: pr.description
                            }).translations
                        }))
                    }
                    const config = new TagRenderingConfig(question)
                    return new SvelteUIElement(TagRenderingEditable, {
                        config,
                        tags,
                        selectedElement,
                        state,
                        layer
                    })
                }
            }

        ]

        specialVisualizations.push(new AutoApplyButton(specialVisualizations))

        const regex = /[a-zA-Z_]+/
        const invalid = specialVisualizations
            .map((sp, i) => ({ sp, i }))
            .filter((sp) => sp.sp.funcName === undefined || !sp.sp.funcName.match(regex))

        if (invalid.length > 0) {
            throw (
                "Invalid special visualisation found: funcName is undefined or doesn't match " +
                regex +
                invalid.map((sp) => sp.i).join(", ") +
                ". Did you perhaps type \n  funcName: \"funcname\" // type declaration uses COLON\ninstead of:\n  funcName = \"funcName\" // value definition uses EQUAL"
            )
        }

        const allNames = specialVisualizations.map((f) => f.funcName)
        const seen = new Set<string>()
        for (let name of allNames) {
            name = name.toLowerCase()
            if (seen.has(name)) {
                throw "Invalid special visualisations: detected a duplicate name: " + name
            }
            seen.add(name)
        }

        return specialVisualizations
    }
}
