import Combine from "./Base/Combine"
import { FixedUiElement } from "./Base/FixedUiElement"
import BaseUIElement from "./BaseUIElement"
import Title from "./Base/Title"
import {
    RenderingSpecification,
    SpecialVisualization,
    SpecialVisualizationState
} from "./SpecialVisualization"
import { HistogramViz } from "./Popup/HistogramViz"
import { MinimapViz } from "./Popup/MinimapViz"
import { ShareLinkViz } from "./Popup/ShareLinkViz"
import { UploadToOsmViz } from "./Popup/UploadToOsmViz"
import { MultiApplyViz } from "./Popup/MultiApplyViz"
import { AddNoteCommentViz } from "./Popup/Notes/AddNoteCommentViz"
import { PlantNetDetectionViz } from "./Popup/PlantNetDetectionViz"
import TagApplyButton from "./Popup/TagApplyButton"
import { CloseNoteButton } from "./Popup/Notes/CloseNoteButton"
import { MapillaryLinkVis } from "./Popup/MapillaryLinkVis"
import { ImmutableStore, Store, Stores, UIEventSource } from "../Logic/UIEventSource"
import AllTagsPanel from "./Popup/AllTagsPanel.svelte"
import AllImageProviders from "../Logic/ImageProviders/AllImageProviders"
import { ImageCarousel } from "./Image/ImageCarousel"
import { VariableUiElement } from "./Base/VariableUIElement"
import { Utils } from "../Utils"
import Wikidata, { WikidataResponse } from "../Logic/Web/Wikidata"
import { Translation } from "./i18n/Translation"
import Translations from "./i18n/Translations"
import OpeningHoursVisualization from "./OpeningHours/OpeningHoursVisualization"
import { SubtleButton } from "./Base/SubtleButton"
import Svg from "../Svg"
import NoteCommentElement from "./Popup/Notes/NoteCommentElement"
import List from "./Base/List"
import StatisticsPanel from "./BigComponents/StatisticsPanel"
import AutoApplyButton from "./Popup/AutoApplyButton"
import { LanguageElement } from "./Popup/LanguageElement/LanguageElement"
import FeatureReviews from "../Logic/Web/MangroveReviews"
import Maproulette from "../Logic/Maproulette"
import SvelteUIElement from "./Base/SvelteUIElement"
import { BBoxFeatureSourceForLayer } from "../Logic/FeatureSource/Sources/TouchesBboxFeatureSource"
import { Feature, GeoJsonProperties } from "geojson"
import { GeoOperations } from "../Logic/GeoOperations"
import CreateNewNote from "./Popup/Notes/CreateNewNote.svelte"
import AddNewPoint from "./Popup/AddNewPoint/AddNewPoint.svelte"
import UserProfile from "./BigComponents/UserProfile.svelte"
import LayerConfig from "../Models/ThemeConfig/LayerConfig"
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig"
import { ExportAsGpxViz } from "./Popup/ExportAsGpxViz"
import WikipediaPanel from "./Wikipedia/WikipediaPanel.svelte"
import TagRenderingEditable from "./Popup/TagRendering/TagRenderingEditable.svelte"
import { PointImportButtonViz } from "./Popup/ImportButtons/PointImportButtonViz"
import WayImportButtonViz from "./Popup/ImportButtons/WayImportButtonViz"
import ConflateImportButtonViz from "./Popup/ImportButtons/ConflateImportButtonViz"
import DeleteWizard from "./Popup/DeleteFlow/DeleteWizard.svelte"
import OpenIdEditor from "./BigComponents/OpenIdEditor.svelte"
import FediverseValidator from "./InputElement/Validators/FediverseValidator"
import SendEmail from "./Popup/SendEmail.svelte"
import UploadImage from "./Image/UploadImage.svelte"
import { Imgur } from "../Logic/ImageProviders/Imgur"
import Constants from "../Models/Constants"
import { MangroveReviews } from "mangrove-reviews-typescript"
import Wikipedia from "../Logic/Web/Wikipedia"
import NearbyImagesSearch from "../Logic/Web/NearbyImagesSearch"
import AllReviews from "./Reviews/AllReviews.svelte"
import StarsBarIcon from "./Reviews/StarsBarIcon.svelte"
import ReviewForm from "./Reviews/ReviewForm.svelte"
import Questionbox from "./Popup/TagRendering/Questionbox.svelte"
import { TagUtils } from "../Logic/Tags/TagUtils"
import Giggity from "./BigComponents/Giggity.svelte"
import ThemeViewState from "../Models/ThemeViewState"
import LanguagePicker from "./InputElement/LanguagePicker.svelte"
import LogoutButton from "./Base/LogoutButton.svelte"
import OpenJosm from "./Base/OpenJosm.svelte"
import MarkAsFavourite from "./Popup/MarkAsFavourite.svelte"
import MarkAsFavouriteMini from "./Popup/MarkAsFavouriteMini.svelte"
import NextChangeViz from "./OpeningHours/NextChangeViz.svelte"
import NearbyImages from "./Image/NearbyImages.svelte"
import NearbyImagesCollapsed from "./Image/NearbyImagesCollapsed.svelte"
import MoveWizard from "./Popup/MoveWizard.svelte"
import { Unit } from "../Models/Unit"
import Link from "./Base/Link.svelte"
import OrientationDebugPanel from "./Debug/OrientationDebugPanel.svelte"
import MaprouletteSetStatus from "./MapRoulette/MaprouletteSetStatus.svelte"
import DirectionIndicator from "./Base/DirectionIndicator.svelte"
import Img from "./Base/Img"
import Qr from "../Utils/Qr"
import ComparisonTool from "./Comparison/ComparisonTool.svelte"
import SpecialTranslation from "./Popup/TagRendering/SpecialTranslation.svelte"
import SpecialVisualisationUtils from "./SpecialVisualisationUtils"
import LoginButton from "./Base/LoginButton.svelte"
import Toggle from "./Input/Toggle"
import ImportReviewIdentity from "./Reviews/ImportReviewIdentity.svelte"
import LinkedDataLoader from "../Logic/Web/LinkedDataLoader"
import SplitRoadWizard from "./Popup/SplitRoadWizard.svelte"
import DynLink from "./Base/DynLink.svelte"
import Locale from "./i18n/Locale"
import LanguageUtils from "../Utils/LanguageUtils"
import MarkdownUtils from "../Utils/MarkdownUtils"

class NearbyImageVis implements SpecialVisualization {
    // Class must be in SpecialVisualisations due to weird cyclical import that breaks the tests
    args: { name: string; defaultValue?: string; doc: string; required?: boolean }[] = [
        {
            name: "mode",
            defaultValue: "closed",
            doc: "Either `open` or `closed`. If `open`, then the image carousel will always be shown"
        },
        {
            name: "readonly",
            required: false,
            doc: "If 'readonly', will not show the 'link'-button"
        }
    ]
    docs =
        "A component showing nearby images loaded from various online services such as Mapillary. In edit mode and when used on a feature, the user can select an image to add to the feature"
    funcName = "nearby_images"
    needsUrls = NearbyImagesSearch.apiUrls
    svelteBased = true

    constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>,
        args: string[],
        feature: Feature,
        layer: LayerConfig
    ): BaseUIElement {
        const isOpen = args[0] === "open"
        const readonly = args[1] === "readonly"
        const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
        return new SvelteUIElement(isOpen ? NearbyImages : NearbyImagesCollapsed, {
            tags,
            state,
            lon,
            lat,
            feature,
            layer,
            linkable: !readonly
        })
    }
}

class StealViz implements SpecialVisualization {
    // Class must be in SpecialVisualisations due to weird cyclical import that breaks the tests

    funcName = "steal"
    docs = "Shows a tagRendering from a different object as if this was the object itself"
    args = [
        {
            name: "featureId",
            doc: "The key of the attribute which contains the id of the feature from which to use the tags",
            required: true
        },
        {
            name: "tagRenderingId",
            doc: "The layer-id and tagRenderingId to render. Can be multiple value if ';'-separated (in which case every value must also contain the layerId, e.g. `layerId.tagRendering0; layerId.tagRendering1`). Note: this can cause layer injection",
            required: true
        }
    ]
    needsUrls = []
    svelteBased = true

    constr(state: SpecialVisualizationState, featureTags, args) {
        const [featureIdKey, layerAndtagRenderingIds] = args
        const tagRenderings: [LayerConfig, TagRenderingConfig][] = []
        for (const layerAndTagRenderingId of layerAndtagRenderingIds.split(";")) {
            const [layerId, tagRenderingId] = layerAndTagRenderingId.trim().split(".")
            const layer = state.layout.layers.find((l) => l.id === layerId)
            const tagRendering = layer.tagRenderings.find((tr) => tr.id === tagRenderingId)
            tagRenderings.push([layer, tagRendering])
        }
        if (tagRenderings.length === 0) {
            throw "Could not create stolen tagrenddering: tagRenderings not found"
        }
        return new VariableUiElement(
            featureTags.map(
                (tags) => {
                    const featureId = tags[featureIdKey]
                    if (featureId === undefined) {
                        return undefined
                    }
                    const otherTags = state.featureProperties.getStore(featureId)
                    const otherFeature = state.indexedFeatures.featuresById.data.get(featureId)
                    const elements: BaseUIElement[] = []
                    for (const [layer, tagRendering] of tagRenderings) {
                        elements.push(
                            new SvelteUIElement(TagRenderingEditable, {
                                config: tagRendering,
                                tags: otherTags,
                                selectedElement: otherFeature,
                                state,
                                layer
                            })
                        )
                    }
                    if (elements.length === 1) {
                        return elements[0]
                    }
                    return new Combine(elements).SetClass("flex flex-col")
                },
                [state.indexedFeatures.featuresById]
            )
        )
    }

    getLayerDependencies(args): string[] {
        const [, tagRenderingId] = args
        if (tagRenderingId.indexOf(".") < 0) {
            throw "Error: argument 'layerId.tagRenderingId' of special visualisation 'steal' should contain a dot"
        }
        const [layerId] = tagRenderingId.split(".")
        return [layerId]
    }
}

/**
 * Thin wrapper around QuestionBox.svelte to include it into the special Visualisations
 */
export class QuestionViz implements SpecialVisualization {
    funcName = "questions"
    needsUrls = []
    docs =
        "The special element which shows the questions which are unkown. Added by default if not yet there"
    args = [
        {
            name: "labels",
            doc: "One or more ';'-separated labels. If these are given, only questions with these labels will be given. Use `unlabeled` for all questions that don't have an explicit label. If none given, all questions will be shown"
        },
        {
            name: "blacklisted-labels",
            doc: "One or more ';'-separated labels of questions which should _not_ be included"
        }
    ]
    svelteBased = true

    constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>,
        args: string[],
        feature: Feature,
        layer: LayerConfig
    ): BaseUIElement {
        const labels = args[0]
            ?.split(";")
            ?.map((s) => s.trim())
            ?.filter((s) => s !== "")
        const blacklist = args[1]
            ?.split(";")
            ?.map((s) => s.trim())
            ?.filter((s) => s !== "")
        return new SvelteUIElement(Questionbox, {
            layer,
            tags,
            selectedElement: feature,
            state,
            onlyForLabels: labels,
            notForLabels: blacklist
        }).SetClass("w-full")
    }
}

export default class SpecialVisualizations {
    public static specialVisualizations: SpecialVisualization[] = SpecialVisualizations.initList()

    public static DocumentationFor(viz: string | SpecialVisualization): string {
        if (typeof viz === "string") {
            viz = SpecialVisualizations.specialVisualizations.find((sv) => sv.funcName === viz)
        }
        if (viz === undefined) {
            return ""
        }
        const example = viz.example ??
            "`{" +
            viz.funcName +
            "(" +
            viz.args.map((arg) => arg.defaultValue).join(",") +
            ")}`"
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
            "<code>" + example + "</code>"
        ].join("\n\n")
    }

    public static constructSpecification(
        template: string,
        extraMappings: SpecialVisualization[] = []
    ): RenderingSpecification[] {
        return SpecialVisualisationUtils.constructSpecification(template, extraMappings)
    }

    public static HelpMessage(): string {
        const helpTexts: string[] = SpecialVisualizations.specialVisualizations.map((viz) =>
            SpecialVisualizations.DocumentationFor(viz)
        )

        const firstPart = new Combine([
            new Title("Special tag renderings", 1),

            "In a tagrendering, some special values are substituted by an advanced UI-element. This allows advanced features and visualizations to be reused by custom themes or even to query third-party API's.",
            "General usage is `{func_name()}`, `{func_name(arg, someotherarg)}` or `{func_name(args):cssStyle}`. Note that you _do not_ need to use quotes around your arguments, the comma is enough to separate them. This also implies you cannot use a comma in your args",
            new Title("Using expanded syntax", 4),
            `Instead of using \`{"render": {"en": "{some_special_visualisation(some_arg, some other really long message, more args)} , "nl": "{some_special_visualisation(some_arg, een boodschap in een andere taal, more args)}}\`, one can also write`,
            new FixedUiElement(
                JSON.stringify(
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
            ).SetClass("code"),
            "In other words: use `{ \"before\": ..., \"after\": ..., \"special\": {\"type\": ..., \"argname\": ...argvalue...}`. The args are in the `special` block; an argvalue can be a string, a translation or another value. (Refer to class `RewriteSpecial` in case of problems)"
        ]).SetClass("flex flex-col").AsMarkdown()
console.log(">>> ",helpTexts.join("\n\n"))
        return firstPart + "\n\n" + helpTexts.join("\n\n")
    }

    // noinspection JSUnusedGlobalSymbols
    public static renderExampleOfSpecial(
        state: SpecialVisualizationState,
        s: SpecialVisualization
    ): BaseUIElement {
        const examples =
            s.structuredExamples === undefined
                ? []
                : s.structuredExamples().map((e) => {
                    return s.constr(
                        state,
                        new UIEventSource<Record<string, string>>(e.feature.properties),
                        e.args,
                        e.feature,
                        undefined
                    )
                })
        return new Combine([new Title(s.funcName), s.docs, ...examples])
    }

    private static initList(): SpecialVisualization[] {
        const specialVisualizations: SpecialVisualization[] = [
            new QuestionViz(),
            {
                funcName: "add_new_point",
                docs: "An element which allows to add a new point on the 'last_click'-location. Only makes sense in the layer `last_click`",
                args: [],

                constr(state: SpecialVisualizationState, _, __, feature): BaseUIElement {
                    const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
                    return new SvelteUIElement(AddNewPoint, {
                        state,
                        coordinate: { lon, lat }
                    }).SetClass("w-full h-full overflow-auto")
                }
            },
            {
                funcName: "user_profile",
                args: [],

                docs: "A component showing information about the currently logged in user (username, profile description, profile picture + link to edit them). Mostly meant to be used in the 'user-settings'",
                constr(state: SpecialVisualizationState): BaseUIElement {
                    return new SvelteUIElement(UserProfile, {
                        osmConnection: state.osmConnection
                    })
                }
            },
            {
                funcName: "language_picker",
                args: [],
                docs: "A component to set the language of the user interface",
                constr(state: SpecialVisualizationState): BaseUIElement {
                    return new VariableUiElement(
                        Locale.showLinkToWeblate.map(showTranslations => {
                            const languages = showTranslations ? LanguageUtils.usedLanguagesSorted : state.layout.language
                            return new SvelteUIElement(LanguagePicker, {
                                assignTo: state.userRelatedState.language,
                                availableLanguages: languages,
                                preferredLanguages: state.osmConnection.userDetails.map(
                                    (ud) => ud.languages
                                )
                            })
                        })
                    )
                }
            },
            {
                funcName: "logout",
                args: [],
                needsUrls: [Constants.osmAuthConfig.url],
                docs: "Shows a button where the user can log out",

                constr(state: SpecialVisualizationState): BaseUIElement {
                    return new SvelteUIElement(LogoutButton, { osmConnection: state.osmConnection })
                }
            },
            new HistogramViz(),
            new StealViz(),
            new MinimapViz(),
            {
                funcName: "split_button",
                docs: "Adds a button which allows to split a way",
                args: [],

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>
                ): BaseUIElement {
                    return new VariableUiElement(
                        tagSource
                            .map((tags) => tags.id)
                            .map((id) => {
                                if (id.startsWith("way/")) {
                                    return new SvelteUIElement(SplitRoadWizard, { id, state })
                                }
                                return undefined
                            })
                    )
                }
            },
            {
                funcName: "move_button",
                docs: "Adds a button which allows to move the object to another location. The config will be read from the layer config",
                args: [],

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    if (feature.geometry.type !== "Point") {
                        return undefined
                    }

                    return new SvelteUIElement(MoveWizard, {
                        state,
                        featureToMove: feature,
                        layer
                    })
                }
            },
            {
                funcName: "delete_button",
                docs: "Adds a button which allows to delete the object at this location. The config will be read from the layer config",
                args: [],

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    if (!layer.deletion) {
                        return undefined
                    }
                    return new SvelteUIElement(DeleteWizard, {
                        tags: tagSource,
                        deleteConfig: layer.deletion,
                        state,
                        feature,
                        layer
                    })
                }
            },
            new ShareLinkViz(),
            new ExportAsGpxViz(),
            new UploadToOsmViz(),
            new MultiApplyViz(),
            new AddNoteCommentViz(),
            {
                funcName: "open_note",
                args: [],
                needsUrls: [Constants.osmAuthConfig.url],
                docs: "Creates a new map note on the given location. This options is placed in the 'last_click'-popup automatically if the 'notes'-layer is enabled",
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature
                ): BaseUIElement {
                    const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
                    return new SvelteUIElement(CreateNewNote, {
                        state,
                        coordinate: new UIEventSource({ lon, lat })
                    })
                }
            },
            new CloseNoteButton(),
            new PlantNetDetectionViz(),

            new TagApplyButton(),

            new PointImportButtonViz(),
            new WayImportButtonViz(),
            new ConflateImportButtonViz(),

            new NearbyImageVis(),

            {
                funcName: "wikipedia",
                docs: "A box showing the corresponding wikipedia article(s) - based on the **wikidata** tag.",
                args: [
                    {
                        name: "keyToShowWikipediaFor",
                        doc: "Use the wikidata entry from this key to show the wikipedia article for. Multiple keys can be given (separated by ';'), in which case the first matching value is used",
                        defaultValue: "wikidata;wikipedia"
                    }
                ],
                needsUrls: [...Wikidata.neededUrls, ...Wikipedia.neededUrls],

                example:
                    "`{wikipedia()}` is a basic example, `{wikipedia(name:etymology:wikidata)}` to show the wikipedia page of whom the feature was named after. Also remember that these can be styled, e.g. `{wikipedia():max-height: 10rem}` to limit the height",
                constr: (_, tagsSource, args) => {
                    const keys = args[0].split(";").map((k) => k.trim())
                    const wikiIds: Store<string[]> = tagsSource.map((tags) => {
                        const key = keys.find((k) => tags[k] !== undefined && tags[k] !== "")
                        return tags[key]?.split(";")?.map((id) => id.trim()) ?? []
                    })
                    return new SvelteUIElement(WikipediaPanel, {
                        wikiIds
                    })
                }
            },
            {
                funcName: "wikidata_label",
                docs: "Shows the label of the corresponding wikidata-item",
                args: [
                    {
                        name: "keyToShowWikidataFor",
                        doc: "Use the wikidata entry from this key to show the label",
                        defaultValue: "wikidata"
                    }
                ],
                needsUrls: Wikidata.neededUrls,
                example:
                    "`{wikidata_label()}` is a basic example, `{wikipedia(name:etymology:wikidata)}` to show the label itself",
                constr: (_, tagsSource, args) =>
                    new VariableUiElement(
                        tagsSource
                            .map((tags) => tags[args[0]])
                            .map((wikidata) => {
                                wikidata = Utils.NoEmpty(
                                    wikidata?.split(";")?.map((wd) => wd.trim()) ?? []
                                )[0]
                                const entry = Wikidata.LoadWikidataEntry(wikidata)
                                return new VariableUiElement(
                                    entry.map((e) => {
                                        if (e === undefined || e["success"] === undefined) {
                                            return wikidata
                                        }
                                        const response = <WikidataResponse>e["success"]
                                        return Translation.fromMap(response.labels)
                                    })
                                )
                            })
                    )
            },
            new MapillaryLinkVis(),
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
                funcName: "image_carousel",
                docs: "Creates an image carousel for the given sources. An attempt will be made to guess what source is used. Supported: Wikidata identifiers, Wikipedia pages, Wikimedia categories, IMGUR (with attribution, direct links)",
                args: [
                    {
                        name: "image_key",
                        defaultValue: AllImageProviders.defaultKeys.join(","),
                        doc: "The keys given to the images, e.g. if <span class='literal-code'>image</span> is given, the first picture URL will be added as <span class='literal-code'>image</span>, the second as <span class='literal-code'>image:0</span>, the third as <span class='literal-code'>image:1</span>, etc... Multiple values are allowed if ';'-separated "
                    }
                ],
                needsUrls: AllImageProviders.apiUrls,
                constr: (state, tags, args) => {
                    let imagePrefixes: string[] = undefined
                    if (args.length > 0) {
                        imagePrefixes = [].concat(...args.map((a) => a.split(",")))
                    }
                    return new ImageCarousel(
                        AllImageProviders.LoadImagesFor(tags, imagePrefixes),
                        tags,
                        state
                    )
                }
            },
            {
                funcName: "image_upload",
                docs: "Creates a button where a user can upload an image to IMGUR",
                needsUrls: [Imgur.apiUrl],
                args: [
                    {
                        name: "image-key",
                        doc: "Image tag to add the URL to (or image-tag:0, image-tag:1 when multiple images are added)",
                        required: false
                    },
                    {
                        name: "label",
                        doc: "The text to show on the button",
                        required: false
                    }
                ],
                constr: (state, tags, args) => {
                    const targetKey = args[0] === "" ? undefined : args[0]
                    return new SvelteUIElement(UploadImage, {
                        state,
                        tags,
                        targetKey,
                        labelText: args[1],
                        image: args[2]
                    })
                }
            },
            {
                funcName: "rating",
                docs: "Shows stars which represent the avarage rating on mangrove.reviews",
                needsUrls: [MangroveReviews.ORIGINAL_API],
                args: [
                    {
                        name: "subjectKey",
                        defaultValue: "name",
                        doc: "The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>"
                    },
                    {
                        name: "fallback",
                        doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value"
                    }
                ],
                constr: (state, tags, args, feature) => {
                    const nameKey = args[0] ?? "name"
                    const fallbackName = args[1]
                    const reviews = FeatureReviews.construct(
                        feature,
                        tags,
                        state.userRelatedState.mangroveIdentity,
                        {
                            nameKey: nameKey,
                            fallbackName
                        },
                        state.featureSwitchIsTesting
                    )
                    return new SvelteUIElement(StarsBarIcon, {
                        score: reviews.average
                    })
                }
            },

            {
                funcName: "create_review",
                docs: "Invites the contributor to leave a review. Somewhat small UI-element until interacted",
                needsUrls: [MangroveReviews.ORIGINAL_API],
                args: [
                    {
                        name: "subjectKey",
                        defaultValue: "name",
                        doc: "The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>"
                    },
                    {
                        name: "fallback",
                        doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value"
                    }
                ],
                constr: (state, tags, args, feature, layer) => {
                    const nameKey = args[0] ?? "name"
                    const fallbackName = args[1]
                    const reviews = FeatureReviews.construct(
                        feature,
                        tags,
                        state.userRelatedState?.mangroveIdentity,
                        {
                            nameKey: nameKey,
                            fallbackName
                        },
                        state.featureSwitchIsTesting
                    )
                    return new SvelteUIElement(ReviewForm, { reviews, state, tags, feature, layer })
                }
            },
            {
                funcName: "list_reviews",
                docs: "Adds an overview of the mangrove-reviews of this object. Mangrove.Reviews needs - in order to identify the reviewed object - a coordinate and a name. By default, the name of the object is given, but this can be overwritten",
                needsUrls: [MangroveReviews.ORIGINAL_API],
                example:
                    "`{reviews()}` for a vanilla review, `{reviews(name, play_forest)}` to review a play forest. If a name is known, the name will be used as identifier, otherwise 'play_forest' is used",
                args: [
                    {
                        name: "subjectKey",
                        defaultValue: "name",
                        doc: "The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>"
                    },
                    {
                        name: "fallback",
                        doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value"
                    }
                ],
                constr: (state, tags, args, feature, layer) => {
                    const nameKey = args[0] ?? "name"
                    const fallbackName = args[1]
                    const reviews = FeatureReviews.construct(
                        feature,
                        tags,
                        state.userRelatedState?.mangroveIdentity,
                        {
                            nameKey: nameKey,
                            fallbackName
                        },
                        state.featureSwitchIsTesting
                    )
                    return new SvelteUIElement(AllReviews, { reviews, state, tags, feature, layer })
                }
            },
            {
                funcName: "import_mangrove_key",
                docs: "Only makes sense in the usersettings. Allows to import a mangrove public key and to use this to make reviews",
                args: [
                    {
                        name: "text",
                        doc: "The text that is shown on the button"
                    }
                ],
                needsUrls: [],
                constr(
                    state: SpecialVisualizationState,
                    _: UIEventSource<Record<string, string>>,
                    argument: string[]
                ): BaseUIElement {
                    const [text] = argument
                    return new SvelteUIElement(ImportReviewIdentity, { state, text })
                }
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
                    return new OpeningHoursVisualization(tagSource, state, key, prefix, postfix)
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
                                    ...(state?.layout?.layers?.map((lyr) => lyr.units) ?? [])
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

                constr: (state, tagSource, tagsSource, feature, layer) => {
                    const t = Translations.t.general.download

                    return new SubtleButton(
                        Svg.download_svg(),
                        new Combine([
                            t.downloadFeatureAsGeojson.SetClass("font-bold text-lg"),
                            t.downloadGeoJsonHelper.SetClass("subtle")
                        ]).SetClass("flex flex-col")
                    )
                        .onClick(() => {
                            console.log("Exporting as Geojson")
                            const tags = tagSource.data
                            const title =
                                layer?.title?.GetRenderValue(tags)?.Subs(tags)?.txt ?? "geojson"
                            const data = JSON.stringify(feature, null, "  ")
                            Utils.offerContentsAsDownloadableFile(
                                data,
                                title + "_mapcomplete_export.geojson",
                                {
                                    mimetype: "application/vnd.geo+json"
                                }
                            )
                        })
                        .SetClass("w-full")
                }
            },
            {
                funcName: "open_in_iD",
                docs: "Opens the current view in the iD-editor",
                args: [],

                constr: (state, feature) => {
                    return new SvelteUIElement(OpenIdEditor, {
                        mapProperties: state.mapProperties,
                        objectId: feature.data.id
                    })
                }
            },
            {
                funcName: "open_in_josm",
                docs: "Opens the current view in the JOSM-editor",
                args: [],
                needsUrls: ["http://127.0.0.1:8111/load_and_zoom"],

                constr: (state) => {
                    return new SvelteUIElement(OpenJosm, { state })
                }
            },
            {
                funcName: "clear_location_history",
                docs: "A button to remove the travelled track information from the device",
                args: [],

                constr: (state) => {
                    return new SubtleButton(
                        Svg.delete_icon_svg().SetStyle("height: 1.5rem"),
                        Translations.t.general.removeLocationHistory
                    ).onClick(() => {
                        state.historicalUserLocations.features.setData([])
                        state.selectedElement.setData(undefined)
                    })
                }
            },
            {
                funcName: "visualize_note_comments",
                docs: "Visualises the comments for notes",
                args: [
                    {
                        name: "commentsKey",
                        doc: "The property name of the comments, which should be stringified json",
                        defaultValue: "comments"
                    },
                    {
                        name: "start",
                        doc: "Drop the first 'start' comments",
                        defaultValue: "0"
                    }
                ],
                needsUrls: [Constants.osmAuthConfig.url],
                constr: (state, tags, args) =>
                    new VariableUiElement(
                        tags
                            .map((tags) => tags[args[0]])
                            .map((commentsStr) => {
                                const comments: any[] = JSON.parse(commentsStr)
                                const startLoc = Number(args[1] ?? 0)
                                if (!isNaN(startLoc) && startLoc > 0) {
                                    comments.splice(0, startLoc)
                                }
                                return new Combine(
                                    comments
                                        .filter((c) => c.text !== "")
                                        .map(
                                            (c, i) =>
                                                new NoteCommentElement(c, state, i, comments.length)
                                        )
                                ).SetClass("flex flex-col")
                            })
                    )
            },
            {
                funcName: "add_image_to_note",
                docs: "Adds an image to a node",
                args: [
                    {
                        name: "Id-key",
                        doc: "The property name where the ID of the note to close can be found",
                        defaultValue: "id"
                    }
                ],
                needsUrls: [Imgur.apiUrl],

                constr: (state, tags, args) => {
                    const id = tags.data[args[0] ?? "id"]
                    tags = state.featureProperties.getStore(id)
                    console.log("Id is", id)
                    return new SvelteUIElement(UploadImage, { state, tags })
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
                    tagsSource: UIEventSource<Record<string, string>>,
                    _: string[],
                    feature: Feature,
                    layer: LayerConfig
                ) =>
                    new VariableUiElement(
                        tagsSource.map((tags) => {
                            if (state.layout === undefined) {
                                return "<feature title>"
                            }
                            const title = layer?.title?.GetRenderValue(tags)
                            if (title === undefined) {
                                return undefined
                            }
                            return new SvelteUIElement(SpecialTranslation, {
                                t: title,
                                tags: tagsSource,
                                state,
                                feature,
                                layer
                            })
                                .SetClass("px-1")
                                .setSpan()
                        })
                    )
            },
            {
                funcName: "maproulette_task",
                args: [],
                needsUrls: [Maproulette.defaultEndpoint],
                constr(state, tagSource) {
                    const parentId = tagSource.data.mr_challengeId
                    if (parentId === undefined) {
                        console.warn("Element ", tagSource.data.id, " has no mr_challengeId")
                        return undefined
                    }
                    const challenge = Stores.FromPromise(
                        Utils.downloadJsonCached(
                            `${Maproulette.defaultEndpoint}/challenge/${parentId}`,
                            24 * 60 * 60 * 1000
                        )
                    )

                    return new VariableUiElement(
                        challenge.map((challenge) => {
                            const listItems: BaseUIElement[] = []
                            let title: BaseUIElement

                            if (challenge?.name) {
                                title = new Title(challenge.name)
                            }

                            if (challenge?.description) {
                                listItems.push(new FixedUiElement(challenge.description))
                            }

                            if (challenge?.instruction) {
                                listItems.push(new FixedUiElement(challenge.instruction))
                            }

                            if (listItems.length === 0) {
                                return undefined
                            } else {
                                return [title, new List(listItems)]
                            }
                        })
                    )
                },
                docs: "Fetches the metadata of MapRoulette campaign that this task is part of and shows those details (namely `title`, `description` and `instruction`).\n\nThis reads the property `mr_challengeId` to detect the parent campaign."
            },
            {
                funcName: "maproulette_set_status",
                docs: "Change the status of the given MapRoulette task",
                needsUrls: [Maproulette.defaultEndpoint],
                example:
                    " The following example sets the status to '2' (false positive)\n" +
                    "\n" +
                    "```json\n" +
                    "{\n" +
                    "   \"id\": \"mark_duplicate\",\n" +
                    "   \"render\": {\n" +
                    "      \"special\": {\n" +
                    "         \"type\": \"maproulette_set_status\",\n" +
                    "         \"message\": {\n" +
                    "            \"en\": \"Mark as not found or false positive\"\n" +
                    "         },\n" +
                    "         \"status\": \"2\",\n" +
                    "         \"image\": \"close\"\n" +
                    "      }\n" +
                    "   }\n" +
                    "}\n" +
                    "```",
                args: [
                    {
                        name: "message",
                        doc: "A message to show to the user"
                    },
                    {
                        name: "image",
                        doc: "Image to show",
                        defaultValue: "confirm"
                    },
                    {
                        name: "message_confirm",
                        doc: "What to show when the task is closed, either by the user or was already closed."
                    },
                    {
                        name: "status",
                        doc: "A statuscode to apply when the button is clicked. 1 = `close`, 2 = `false_positive`, 3 = `skip`, 4 = `deleted`, 5 = `already fixed` (on the map, e.g. for duplicates), 6 = `too hard`",
                        defaultValue: "1"
                    },
                    {
                        name: "maproulette_id",
                        doc: "The property name containing the maproulette id",
                        defaultValue: "mr_taskId"
                    },
                    {
                        name: "ask_feedback",
                        doc: "If not an empty string, this will be used as question to ask some additional feedback. A text field will be added",
                        defaultValue: ""
                    }
                ],

                constr: (state, tagsSource, args) => {
                    let [
                        message,
                        image,
                        message_closed,
                        statusToSet,
                        maproulette_id_key,
                        askFeedback
                    ] = args
                    if (image === "") {
                        image = "confirm"
                    }
                    if (maproulette_id_key === "" || maproulette_id_key === undefined) {
                        maproulette_id_key = "mr_taskId"
                    }
                    statusToSet = statusToSet ?? "1"
                    return new SvelteUIElement(MaprouletteSetStatus, {
                        state,
                        tags: tagsSource,
                        message,
                        image,
                        message_closed,
                        statusToSet,
                        maproulette_id_key,
                        askFeedback
                    })
                }
            },
            {
                funcName: "statistics",
                docs: "Show general statistics about the elements currently in view. Intended to use on the `current_view`-layer",
                args: [],

                constr: (state) => {
                    return new Combine(
                        state.layout.layers
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
                funcName: "send_email",
                docs: "Creates a `mailto`-link where some fields are already set and correctly escaped. The user will be promted to send the email",
                args: [
                    {
                        name: "to",
                        doc: "Who to send the email to?",
                        required: true
                    },
                    {
                        name: "subject",
                        doc: "The subject of the email",
                        required: true
                    },
                    {
                        name: "body",
                        doc: "The text in the email",
                        required: true
                    },

                    {
                        name: "button_text",
                        doc: "The text shown on the button in the UI",
                        required: true
                    }
                ],

                constr(__, tags, args) {
                    return new SvelteUIElement(SendEmail, { args, tags })
                }
            },
            {
                funcName: "link",
                docs: "Construct a link. By using the 'special' visualisation notation, translations should be easier",
                args: [
                    {
                        name: "text",
                        doc: "Text to be shown",
                        required: true
                    },
                    {
                        name: "href",
                        doc: "The URL to link to. Note that this will be URI-encoded before ",
                        required: true
                    },
                    {
                        name: "class",
                        doc: "CSS-classes to add to the element"
                    },
                    {
                        name: "download",
                        doc: "Expects a string which denotes the filename to download the contents of `href` into. If set, this link will act as a download-button."
                    },
                    {
                        name: "arialabel",
                        doc: "If set, this text will be used as aria-label"
                    }
                ],

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    args: string[]
                ): BaseUIElement {
                    let [text, href, classnames, download, ariaLabel] = args
                    if (download === "") {
                        download = undefined
                    }
                    const newTab = download === undefined && !href.startsWith("#")
                    const textStore = tagSource.map((tags) => Utils.SubstituteKeys(text, tags))
                    const hrefStore = tagSource.map(
                        (tags) =>
                            Utils.SubstituteKeys(href, tags).replaceAll(
                                / /g,
                                "%20"
                            ) /* Chromium based browsers eat the spaces */
                    )
                    return new SvelteUIElement(DynLink, {
                        text: textStore,
                        href: hrefStore,
                        classnames: new ImmutableStore(classnames),
                        download: tagSource.map((tags) => Utils.SubstituteKeys(download, tags)),
                        ariaLabel: tagSource.map((tags) => Utils.SubstituteKeys(ariaLabel, tags)),
                        newTab: new ImmutableStore(newTab)
                    }).setSpan()
                }
            },
            {
                funcName: "multi",
                docs: "Given an embedded tagRendering (read only) and a key, will read the keyname as a JSON-list. Every element of this list will be considered as tags and rendered with the tagRendering",
                example:
                    "```json\n" +
                    JSON.stringify(
                        {
                            render: {
                                special: {
                                    type: "multi",
                                    key: "_doors_from_building_properties",
                                    tagrendering: {
                                        en: "The building containing this feature has a <a href='#{id}'>door</a> of width {entrance:width}"
                                    }
                                }
                            }
                        },
                        null,
                        "  "
                    ) +
                    "\n```",
                args: [
                    {
                        name: "key",
                        doc: "The property to read and to interpret as a list of properties",
                        required: true
                    },
                    {
                        name: "tagrendering",
                        doc: "An entire tagRenderingConfig",
                        required: true
                    },
                    {
                        name: "classes",
                        doc: "CSS-classes to apply on every individual item. Seperated by `space`"
                    }
                ],
                constr(
                    state: SpecialVisualizationState,
                    featureTags: UIEventSource<Record<string, string>>,
                    args: string[],
                    feature: Feature,
                    layer: LayerConfig
                ) {
                    const [key, tr, classesRaw] = args
                    let classes = classesRaw ?? ""
                    const translation = new Translation({ "*": tr })
                    return new VariableUiElement(
                        featureTags.map((tags) => {
                            let properties: object[]
                            if (typeof tags[key] === "string") {
                                properties = JSON.parse(tags[key])
                            } else {
                                properties = <any>tags[key]
                            }
                            if (!properties) {
                                console.debug(
                                    "Could not create a special visualization for multi(",
                                    args.join(", ") + ")",
                                    "no properties found for object",
                                    feature.properties.id
                                )
                                return undefined
                            }
                            const elements = []
                            for (const property of properties) {
                                const subsTr = new SvelteUIElement(SpecialTranslation, {
                                    t: translation,
                                    tags: new ImmutableStore(property),
                                    state,
                                    feature,
                                    layer
                                }).SetClass(classes)
                                elements.push(subsTr)
                            }
                            return elements
                        })
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
                    feature: Feature,
                    layer: LayerConfig
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
                funcName: "fediverse_link",
                docs: "Converts a fediverse username or link into a clickable link",
                args: [
                    {
                        name: "key",
                        doc: "The attribute-name containing the link",
                        required: true
                    }
                ],

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    const key = argument[0]
                    const validator = new FediverseValidator()
                    return new VariableUiElement(
                        tagSource
                            .map((tags) => tags[key])
                            .map((fediAccount) => {
                                fediAccount = validator.reformat(fediAccount)
                                const [_, username, host] = fediAccount.match(
                                    FediverseValidator.usernameAtServer
                                )

                                const normalLink = new SvelteUIElement(Link, {
                                    text: fediAccount,
                                    href: "https://" + host + "/@" + username,
                                    newTab: true
                                })

                                const loggedInContributorMastodon =
                                    state.userRelatedState?.preferencesAsTags?.data?.[
                                        "_mastodon_link"
                                        ]
                                console.log(
                                    "LoggedinContributorMastodon",
                                    loggedInContributorMastodon
                                )
                                if (!loggedInContributorMastodon) {
                                    return normalLink
                                }
                                const homeUrl = new URL(loggedInContributorMastodon)
                                const homeHost = homeUrl.protocol + "//" + homeUrl.hostname

                                return new Combine([
                                    normalLink,
                                    new SvelteUIElement(Link, {
                                        href: homeHost + "/" + fediAccount,
                                        text: Translations.t.validation.fediverse.onYourServer,
                                        newTab: true
                                    }).SetClass("button")
                                ])
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
                funcName: "giggity",
                args: [
                    {
                        name: "giggityUrl",
                        required: true,
                        doc: "The URL of the giggity-XML"
                    }
                ],
                docs: "Shows events that are happening based on a Giggity URL",
                needsUrls: (args) => args[0],

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    const giggityUrl = argument[0]
                    return new SvelteUIElement(Giggity, { tags: tagSource, state, giggityUrl })
                }
            },
            {
                funcName: "gps_all_tags",

                docs: "Shows the current tags of the GPS-representing object, used for debugging",
                args: [],
                constr(
                    state: SpecialVisualizationState,
                    _: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    const tags = (<ThemeViewState>(
                        state
                    )).geolocation.currentUserLocation.features.map(
                        (features) => features[0]?.properties
                    )
                    return new Combine([
                        new SvelteUIElement(OrientationDebugPanel, {}),
                        new SvelteUIElement(AllTagsPanel, {
                            state,
                            tags
                        })
                    ])
                }
            },
            {
                funcName: "favourite_status",

                docs: "A button that allows a (logged in) contributor to mark a location as a favourite location",
                args: [],

                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    return new SvelteUIElement(MarkAsFavourite, {
                        tags: tagSource,
                        state,
                        layer,
                        feature
                    })
                }
            },
            {
                funcName: "favourite_icon",

                docs: "A small button that allows a (logged in) contributor to mark a location as a favourite location, sized to fit a title-icon",
                args: [],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    return new SvelteUIElement(MarkAsFavouriteMini, {
                        tags: tagSource,
                        state,
                        layer,
                        feature
                    }).SetClass("w-full h-full")
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
                funcName: "qr_code",
                args: [],

                docs: "Generates a QR-code to share the selected object",
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature
                ): BaseUIElement {
                    const smallSize = 100
                    const bigSize = 200
                    const size = new UIEventSource(smallSize)
                    return new VariableUiElement(
                        tagSource
                            .map((tags) => tags.id)
                            .map(
                                (id) => {
                                    if (id.startsWith("node/-")) {
                                        // Not yet uploaded
                                        return undefined
                                    }
                                    const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
                                    const includeLayout = window.location.pathname
                                        .split("/")
                                        .at(-1)
                                        .startsWith("theme")
                                    const layout = includeLayout
                                        ? "layout=" + state.layout.id + "&"
                                        : ""
                                    const url =
                                        `${window.location.protocol}//${window.location.host}${window.location.pathname}?${layout}lat=${lat}&lon=${lon}&z=15` +
                                        `#${id}`
                                    return new Img(new Qr(url).toImageElement(size.data)).SetStyle(
                                        `width: ${size.data}px`
                                    )
                                },
                                [size]
                            )
                    ).onClick(() => {
                        if (size.data !== bigSize) {
                            size.setData(bigSize)
                        } else {
                            size.setData(smallSize)
                        }
                    })
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
                funcName: "compare_data",
                needsUrls: (args) => args[1].split(";"),
                args: [
                    {
                        name: "url",
                        required: true,
                        doc: "The attribute containing the url where to fetch more data"
                    },
                    {
                        name: "host",
                        required: true,
                        doc: "The domain name(s) where data might be fetched from - this is needed to set the CSP. A domain must include 'https', e.g. 'https://example.com'. For multiple domains, separate them with ';'. If you don't know the possible domains, use '*'. "
                    },
                    {
                        name: "readonly",
                        required: false,
                        doc: "If 'yes', will not show 'apply'-buttons"
                    }
                ],
                docs: "Gives an interactive element which shows a tag comparison between the OSM-object and the upstream object. This allows to copy some or all tags into OSM",
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    args: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    const url = args[0]
                    const readonly = args[3] === "yes"
                    const externalData = Stores.FromPromiseWithErr(Utils.downloadJson(url))
                    return new SvelteUIElement(ComparisonTool, {
                        url,
                        state,
                        tags: tagSource,
                        layer,
                        feature,
                        readonly,
                        externalData
                    })
                }
            },
            {
                funcName: "login_button",
                args: [],
                docs: "Show a login button",
                needsUrls: [],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    args: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    return new Toggle(
                        undefined,
                        new SvelteUIElement(LoginButton),
                        state.osmConnection.isLoggedIn
                    )
                }
            },
            {
                funcName: "linked_data_from_website",
                docs: "Attempts to load (via a proxy) the specified website and parsed ld+json from there. Suitable data will be offered to import into OSM",
                args: [
                    {
                        name: "key",
                        defaultValue: "website",
                        doc: "Attempt to load ld+json from the specified URL. This can be in an embedded <script type='ld+json'>"
                    },
                    {
                        name: "useProxy",
                        defaultValue: "yes",
                        doc: "If 'yes', uses the provided proxy server. This proxy server will scrape HTML and search for a script with `lang='ld+json'`. If `no`, the data will be downloaded and expects a linked-data-json directly"
                    },
                    {
                        name: "host",
                        doc: "If not using a proxy, define what host the website is allowed to connect to"
                    },
                    {
                        name: "mode",
                        doc: "If `display`, only show the data in tabular and readonly form, ignoring already existing tags. This is used to explicitly show all the tags. If unset or anything else, allow to apply/import on OSM"
                    }
                ],
                needsUrls: [Constants.linkedDataProxy, "http://www.schema.org"],
                constr(
                    state: SpecialVisualizationState,
                    tags: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    const key = argument[0] ?? "website"
                    const useProxy = argument[1] !== "no"
                    const readonly = argument[3] === "readonly"

                    const url = tags
                        .mapD((tags) => {
                            if (!tags._country || !tags[key] || tags[key] === "undefined") {
                                return null
                            }
                            return JSON.stringify({ url: tags[key], country: tags._country })
                        })
                        .mapD((data) => JSON.parse(data))
                    const sourceUrl: Store<string | undefined> = url.mapD((url) => url.url)
                    const externalData: Store<{ success: GeoJsonProperties } | { error: any }> = url.bindD(({
                                                                                                                url,
                                                                                                                country
                                                                                                            }) => {
                        if (url.startsWith("https://data.velopark.be/")) {
                            return Stores.FromPromiseWithErr(
                                (async () => {
                                    try {
                                        const loadAll = layer.id.toLowerCase().indexOf("maproulette") >= 0 // Dirty hack
                                        const features = await LinkedDataLoader.fetchVeloparkEntry(
                                            url, loadAll
                                        )
                                        const feature =
                                            features.find(
                                                (f) => f.properties["ref:velopark"] === url
                                            ) ?? features[0]
                                        const properties = feature.properties
                                        properties["ref:velopark"] = url
                                        console.log("Got properties from velopark:", properties)
                                        return properties
                                    } catch (e) {
                                        console.error(e)
                                        throw e
                                    }
                                })()
                            )
                        }
                        return Stores.FromPromiseWithErr(
                            LinkedDataLoader.fetchJsonLd(url, { country }, useProxy)
                        )
                    })

                    externalData.addCallbackAndRunD((lod) =>
                        console.log("linked_data_from_website received the following data:", lod)
                    )

                    return new Toggle(
                        new SvelteUIElement(ComparisonTool, {
                            feature,
                            state,
                            tags,
                            layer,
                            externalData,
                            sourceUrl,
                            readonly
                        }),
                        undefined,
                        url.map((url) => !!url)
                    )
                }
            }
        ]

        specialVisualizations.push(new AutoApplyButton(specialVisualizations))

        const invalid = specialVisualizations
            .map((sp, i) => ({ sp, i }))
            .filter((sp) => sp.sp.funcName === undefined)
        if (invalid.length > 0) {
            throw (
                "Invalid special visualisation found: funcName is undefined for " +
                invalid.map((sp) => sp.i).join(", ") +
                ". Did you perhaps type \n  funcName: \"funcname\" // type declaration uses COLON\ninstead of:\n  funcName = \"funcName\" // value definition uses EQUAL"
            )
        }

        SpecialVisualisationUtils.specialVisualizations = Utils.NoNull(specialVisualizations)
        return specialVisualizations
    }
}
