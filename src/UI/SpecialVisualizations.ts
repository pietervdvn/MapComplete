import Combine from "./Base/Combine"
import { FixedUiElement } from "./Base/FixedUiElement"
import BaseUIElement from "./BaseUIElement"
import Title from "./Base/Title"
import Table from "./Base/Table"
import {
    RenderingSpecification,
    SpecialVisualization,
    SpecialVisualizationState,
} from "./SpecialVisualization"
import { HistogramViz } from "./Popup/HistogramViz"
import { MinimapViz } from "./Popup/MinimapViz"
import { ShareLinkViz } from "./Popup/ShareLinkViz"
import { UploadToOsmViz } from "./Popup/UploadToOsmViz"
import { MultiApplyViz } from "./Popup/MultiApplyViz"
import { AddNoteCommentViz } from "./Popup/AddNoteCommentViz"
import { PlantNetDetectionViz } from "./Popup/PlantNetDetectionViz"
import TagApplyButton from "./Popup/TagApplyButton"
import { CloseNoteButton } from "./Popup/CloseNoteButton"
import { MapillaryLinkVis } from "./Popup/MapillaryLinkVis"
import { Store, Stores, UIEventSource } from "../Logic/UIEventSource"
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
import NoteCommentElement from "./Popup/NoteCommentElement"
import { SubstitutedTranslation } from "./SubstitutedTranslation"
import List from "./Base/List"
import StatisticsPanel from "./BigComponents/StatisticsPanel"
import AutoApplyButton from "./Popup/AutoApplyButton"
import { LanguageElement } from "./Popup/LanguageElement"
import FeatureReviews from "../Logic/Web/MangroveReviews"
import Maproulette from "../Logic/Maproulette"
import SvelteUIElement from "./Base/SvelteUIElement"
import { BBoxFeatureSourceForLayer } from "../Logic/FeatureSource/Sources/TouchesBboxFeatureSource"
import { Feature, Point } from "geojson"
import { GeoOperations } from "../Logic/GeoOperations"
import CreateNewNote from "./Popup/CreateNewNote.svelte"
import AddNewPoint from "./Popup/AddNewPoint/AddNewPoint.svelte"
import UserProfile from "./BigComponents/UserProfile.svelte"
import Link from "./Base/Link"
import LayerConfig from "../Models/ThemeConfig/LayerConfig"
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig"
import { OsmTags, WayId } from "../Models/OsmFeature"
import MoveWizard from "./Popup/MoveWizard"
import SplitRoadWizard from "./Popup/SplitRoadWizard"
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
import NearbyImages from "./Popup/NearbyImages.svelte"
import NearbyImagesCollapsed from "./Popup/NearbyImagesCollapsed.svelte"
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

class NearbyImageVis implements SpecialVisualization {
    // Class must be in SpecialVisualisations due to weird cyclical import that breaks the tests
    args: { name: string; defaultValue?: string; doc: string; required?: boolean }[] = [
        {
            name: "mode",
            defaultValue: "closed",
            doc: "Either `open` or `closed`. If `open`, then the image carousel will always be shown",
        },
    ]
    docs =
        "A component showing nearby images loaded from various online services such as Mapillary. In edit mode and when used on a feature, the user can select an image to add to the feature"
    funcName = "nearby_images"
    needsUrls = NearbyImagesSearch.apiUrls

    constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>,
        args: string[],
        feature: Feature,
        layer: LayerConfig
    ): BaseUIElement {
        const isOpen = args[0] === "open"
        const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
        return new SvelteUIElement(isOpen ? NearbyImages : NearbyImagesCollapsed, {
            tags,
            state,
            lon,
            lat,
            feature,
            layer,
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
            required: true,
        },
        {
            name: "tagRenderingId",
            doc: "The layer-id and tagRenderingId to render. Can be multiple value if ';'-separated (in which case every value must also contain the layerId, e.g. `layerId.tagRendering0; layerId.tagRendering1`). Note: this can cause layer injection",
            required: true,
        },
    ]
    needsUrls = []

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
                                layer,
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
        const [_, tagRenderingId] = args
        if (tagRenderingId.indexOf(".") < 0) {
            throw "Error: argument 'layerId.tagRenderingId' of special visualisation 'steal' should contain a dot"
        }
        const [layerId, __] = tagRenderingId.split(".")
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
            doc: "One or more ';'-separated labels. If these are given, only questions with these labels will be given. Use `unlabeled` for all questions that don't have an explicit label. If none given, all questions will be shown",
        },
        {
            name: "blacklisted-labels",
            doc: "One or more ';'-separated labels of questions which should _not_ be included",
        },
    ]

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
            notForLabels: blacklist,
        })
    }
}

export default class SpecialVisualizations {
    public static specialVisualizations: SpecialVisualization[] = SpecialVisualizations.initList()

    static undoEncoding(str: string) {
        return str
            .trim()
            .replace(/&LPARENS/g, "(")
            .replace(/&RPARENS/g, ")")
            .replace(/&LBRACE/g, "{")
            .replace(/&RBRACE/g, "}")
            .replace(/&COMMA/g, ",")
    }

    /**
     *
     * For a given string, returns a specification what parts are fixed and what parts are special renderings.
     * Note that _normal_ substitutions are ignored.
     *
     * // Return empty list on empty input
     * SpecialVisualizations.constructSpecification("") // => []
     *
     * // Simple case
     * const oh = SpecialVisualizations.constructSpecification("The opening hours with value {opening_hours} can be seen in the following table: <br/> {opening_hours_table()}")
     * oh[0] // => "The opening hours with value {opening_hours} can be seen in the following table: <br/> "
     * oh[1].func.funcName // => "opening_hours_table"
     *
     * // Advanced cases with commas, braces and newlines should be handled without problem
     * const templates = SpecialVisualizations.constructSpecification("{send_email(&LBRACEemail&RBRACE,Broken bicycle pump,Hello&COMMA\n\nWith this email&COMMA I'd like to inform you that the bicycle pump located at https://mapcomplete.org/cyclofix?lat=&LBRACE_lat&RBRACE&lon=&LBRACE_lon&RBRACE&z=18#&LBRACEid&RBRACE is broken.\n\n Kind regards,Report this bicycle pump as broken)}")
     * const templ = <Exclude<RenderingSpecification, string>> templates[0]
     * templ.func.funcName // => "send_email"
     * templ.args[0] = "{email}"
     */
    public static constructSpecification(
        template: string,
        extraMappings: SpecialVisualization[] = []
    ): RenderingSpecification[] {
        if (template === "") {
            return []
        }

        if (template["type"] !== undefined) {
            console.trace(
                "Got a non-expanded template while constructing the specification, it still has a 'special-key':",
                template
            )
            throw "Got a non-expanded template while constructing the specification"
        }
        const allKnownSpecials = extraMappings.concat(SpecialVisualizations.specialVisualizations)
        for (const knownSpecial of allKnownSpecials) {
            // Note: the '.*?' in the regex reads as 'any character, but in a non-greedy way'
            const matched = template.match(
                new RegExp(`(.*){${knownSpecial.funcName}\\((.*?)\\)(:.*)?}(.*)`, "s")
            )
            if (matched != null) {
                // We found a special component that should be brought to live
                const partBefore = SpecialVisualizations.constructSpecification(
                    matched[1],
                    extraMappings
                )
                const argument =
                    matched[2] /* .trim()  // We don't trim, as spaces might be relevant, e.g. "what is ... of {title()}"*/
                const style = matched[3]?.substring(1) ?? ""
                const partAfter = SpecialVisualizations.constructSpecification(
                    matched[4],
                    extraMappings
                )
                const args = knownSpecial.args.map((arg) => arg.defaultValue ?? "")
                if (argument.length > 0) {
                    const realArgs = argument.split(",").map((str) => this.undoEncoding(str))
                    for (let i = 0; i < realArgs.length; i++) {
                        if (args.length <= i) {
                            args.push(realArgs[i])
                        } else {
                            args[i] = realArgs[i]
                        }
                    }
                }

                const element: RenderingSpecification = {
                    args: args,
                    style: style,
                    func: knownSpecial,
                }
                return [...partBefore, element, ...partAfter]
            }
        }

        // IF we end up here, no changes have to be made - except to remove any resting {}
        return [template]
    }

    public static DocumentationFor(viz: string | SpecialVisualization): BaseUIElement | undefined {
        if (typeof viz === "string") {
            viz = SpecialVisualizations.specialVisualizations.find((sv) => sv.funcName === viz)
        }
        if (viz === undefined) {
            return undefined
        }
        return new Combine([
            new Title(viz.funcName, 3),
            viz.docs,
            viz.args.length > 0
                ? new Table(
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
            new Title("Example usage of " + viz.funcName, 4),
            new FixedUiElement(
                viz.example ??
                    "`{" +
                        viz.funcName +
                        "(" +
                        viz.args.map((arg) => arg.defaultValue).join(",") +
                        ")}`"
            ).SetClass("literal-code"),
        ])
    }

    public static HelpMessage() {
        const helpTexts = SpecialVisualizations.specialVisualizations.map((viz) =>
            SpecialVisualizations.DocumentationFor(viz)
        )

        return new Combine([
            new Combine([
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
                                        nl: "een boodschap in een andere taal",
                                    },
                                    other_arg_name: "more args",
                                },
                                before: {
                                    en: "Some text to prefix before the special element (e.g. a title)",
                                    nl: "Een tekst om voor het element te zetten (bv. een titel)",
                                },
                                after: {
                                    en: "Some text to put after the element, e.g. a footer",
                                },
                            },
                        },
                        null,
                        "  "
                    )
                ).SetClass("code"),
                'In other words: use `{ "before": ..., "after": ..., "special": {"type": ..., "argname": ...argvalue...}`. The args are in the `special` block; an argvalue can be a string, a translation or another value. (Refer to class `RewriteSpecial` in case of problems)',
            ]).SetClass("flex flex-col"),
            ...helpTexts,
        ]).SetClass("flex flex-col")
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
                needsUrls: [],
                constr(state: SpecialVisualizationState, _, __, feature): BaseUIElement {
                    let [lon, lat] = GeoOperations.centerpointCoordinates(feature)
                    return new SvelteUIElement(AddNewPoint, {
                        state,
                        coordinate: { lon, lat },
                    }).SetClass("w-full h-full overflow-auto")
                },
            },
            {
                funcName: "user_profile",
                args: [],
                needsUrls: [],
                docs: "A component showing information about the currently logged in user (username, profile description, profile picture + link to edit them). Mostly meant to be used in the 'user-settings'",
                constr(state: SpecialVisualizationState): BaseUIElement {
                    return new SvelteUIElement(UserProfile, {
                        osmConnection: state.osmConnection,
                    })
                },
            },
            {
                funcName: "language_picker",
                args: [],
                needsUrls: [],
                docs: "A component to set the language of the user interface",
                constr(state: SpecialVisualizationState): BaseUIElement {
                    return new SvelteUIElement(LanguagePicker, {
                        assignTo: state.userRelatedState.language,
                        availableLanguages: state.layout.language,
                        preferredLanguages: state.osmConnection.userDetails.map(
                            (ud) => ud.languages
                        ),
                    })
                },
            },
            {
                funcName: "logout",
                args: [],
                needsUrls: [Constants.osmAuthConfig.url],
                docs: "Shows a button where the user can log out",
                constr(state: SpecialVisualizationState): BaseUIElement {
                    return new SvelteUIElement(LogoutButton, { osmConnection: state.osmConnection })
                },
            },
            new HistogramViz(),
            new StealViz(),
            new MinimapViz(),
            {
                funcName: "split_button",
                docs: "Adds a button which allows to split a way",
                args: [],
                needsUrls: [],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>
                ): BaseUIElement {
                    return new VariableUiElement(
                        tagSource
                            .map((tags) => tags.id)
                            .map((id) => {
                                if (id.startsWith("way/")) {
                                    return new SplitRoadWizard(<WayId>id, state)
                                }
                                return undefined
                            })
                    )
                },
            },
            {
                funcName: "move_button",
                docs: "Adds a button which allows to move the object to another location. The config will be read from the layer config",
                args: [],
                needsUrls: [],
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

                    return new MoveWizard(
                        <Feature<Point>>feature,
                        <UIEventSource<OsmTags>>tagSource,
                        state,
                        layer.allowMove
                    )
                },
            },
            {
                funcName: "delete_button",
                docs: "Adds a button which allows to delete the object at this location. The config will be read from the layer config",
                args: [],
                needsUrls: [],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    return new SvelteUIElement(DeleteWizard, {
                        tags: tagSource,
                        deleteConfig: layer.deletion,
                        state,
                        feature,
                        layer,
                    })
                },
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
                        coordinate: new UIEventSource({ lon, lat }),
                    })
                },
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
                        defaultValue: "wikidata;wikipedia",
                    },
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
                        wikiIds,
                    })
                },
            },
            {
                funcName: "wikidata_label",
                docs: "Shows the label of the corresponding wikidata-item",
                args: [
                    {
                        name: "keyToShowWikidataFor",
                        doc: "Use the wikidata entry from this key to show the label",
                        defaultValue: "wikidata",
                    },
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
                    ),
            },
            new MapillaryLinkVis(),
            new LanguageElement(),
            {
                funcName: "all_tags",
                docs: "Prints all key-value pairs of the object - used for debugging",
                args: [],
                needsUrls: [],
                constr: (state, tags: UIEventSource<any>) =>
                    new SvelteUIElement(AllTagsPanel, { tags, state }),
            },
            {
                funcName: "image_carousel",
                docs: "Creates an image carousel for the given sources. An attempt will be made to guess what source is used. Supported: Wikidata identifiers, Wikipedia pages, Wikimedia categories, IMGUR (with attribution, direct links)",
                args: [
                    {
                        name: "image_key",
                        defaultValue: AllImageProviders.defaultKeys.join(","),
                        doc: "The keys given to the images, e.g. if <span class='literal-code'>image</span> is given, the first picture URL will be added as <span class='literal-code'>image</span>, the second as <span class='literal-code'>image:0</span>, the third as <span class='literal-code'>image:1</span>, etc... Multiple values are allowed if ';'-separated ",
                    },
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
                },
            },
            {
                funcName: "image_upload",
                docs: "Creates a button where a user can upload an image to IMGUR",
                needsUrls: [Imgur.apiUrl],
                args: [
                    {
                        name: "image-key",
                        doc: "Image tag to add the URL to (or image-tag:0, image-tag:1 when multiple images are added)",
                        required: false,
                    },
                    {
                        name: "label",
                        doc: "The text to show on the button",
                        required: false,
                    },
                ],
                constr: (state, tags, args) => {
                    const targetKey = args[0] === "" ? undefined : args[0]
                    return new SvelteUIElement(UploadImage, {
                        state,
                        tags,
                        targetKey,
                        labelText: args[1],
                        image: args[2],
                    })
                },
            },
            {
                funcName: "rating",
                docs: "Shows stars which represent the avarage rating on mangrove.reviews",
                needsUrls: [MangroveReviews.ORIGINAL_API],
                args: [
                    {
                        name: "subjectKey",
                        defaultValue: "name",
                        doc: "The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>",
                    },
                    {
                        name: "fallback",
                        doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value",
                    },
                ],
                constr: (state, tags, args, feature, layer) => {
                    const nameKey = args[0] ?? "name"
                    let fallbackName = args[1]
                    const reviews = FeatureReviews.construct(
                        feature,
                        tags,
                        state.userRelatedState.mangroveIdentity,
                        {
                            nameKey: nameKey,
                            fallbackName,
                        }
                    )
                    return new SvelteUIElement(StarsBarIcon, {
                        score: reviews.average,
                    })
                },
            },

            {
                funcName: "create_review",
                docs: "Invites the contributor to leave a review. Somewhat small UI-element until interacted",
                needsUrls: [MangroveReviews.ORIGINAL_API],
                args: [
                    {
                        name: "subjectKey",
                        defaultValue: "name",
                        doc: "The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>",
                    },
                    {
                        name: "fallback",
                        doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value",
                    },
                ],
                constr: (state, tags, args, feature, layer) => {
                    const nameKey = args[0] ?? "name"
                    let fallbackName = args[1]
                    const reviews = FeatureReviews.construct(
                        feature,
                        tags,
                        state.userRelatedState?.mangroveIdentity,
                        {
                            nameKey: nameKey,
                            fallbackName,
                        }
                    )
                    return new SvelteUIElement(ReviewForm, { reviews, state, tags, feature, layer })
                },
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
                        doc: "The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>",
                    },
                    {
                        name: "fallback",
                        doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value",
                    },
                ],
                constr: (state, tags, args, feature, layer) => {
                    const nameKey = args[0] ?? "name"
                    let fallbackName = args[1]
                    const reviews = FeatureReviews.construct(
                        feature,
                        tags,
                        state.userRelatedState?.mangroveIdentity,
                        {
                            nameKey: nameKey,
                            fallbackName,
                        }
                    )
                    return new SvelteUIElement(AllReviews, { reviews, state, tags, feature, layer })
                },
            },
            {
                funcName: "opening_hours_table",
                docs: "Creates an opening-hours table. Usage: {opening_hours_table(opening_hours)} to create a table of the tag 'opening_hours'.",
                args: [
                    {
                        name: "key",
                        defaultValue: "opening_hours",
                        doc: "The tagkey from which the table is constructed.",
                    },
                    {
                        name: "prefix",
                        defaultValue: "",
                        doc: "Remove this string from the start of the value before parsing. __Note: use `&LPARENs` to indicate `(` if needed__",
                    },
                    {
                        name: "postfix",
                        defaultValue: "",
                        doc: "Remove this string from the end of the value before parsing. __Note: use `&RPARENs` to indicate `)` if needed__",
                    },
                ],
                needsUrls: [],
                example:
                    "A normal opening hours table can be invoked with `{opening_hours_table()}`. A table for e.g. conditional access with opening hours can be `{opening_hours_table(access:conditional, no @ &LPARENS, &RPARENS)}`",
                constr: (state, tagSource: UIEventSource<any>, args) => {
                    return new OpeningHoursVisualization(
                        tagSource,
                        state,
                        args[0],
                        args[1],
                        args[2]
                    )
                },
            },
            {
                funcName: "canonical",
                needsUrls: [],
                docs: "Converts a short, canonical value into the long, translated text including the unit. This only works if a `unit` is defined for the corresponding value. The unit specification will be included in the text. ",
                example:
                    "If the object has `length=42`, then `{canonical(length)}` will be shown as **42 meter** (in english), **42 metre** (in french), ...",
                args: [
                    {
                        name: "key",
                        doc: "The key of the tag to give the canonical text for",
                        required: true,
                    },
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
                                const allUnits = [].concat(
                                    ...(state?.layout?.layers?.map((lyr) => lyr.units) ?? [])
                                )
                                const unit = allUnits.filter((unit) =>
                                    unit.isApplicableToKey(key)
                                )[0]
                                if (unit === undefined) {
                                    return value
                                }
                                return unit.asHumanLongValue(value)
                            })
                    )
                },
            },
            {
                funcName: "export_as_geojson",
                docs: "Exports the selected feature as GeoJson-file",
                args: [],
                needsUrls: [],
                constr: (state, tagSource, tagsSource, feature, layer) => {
                    const t = Translations.t.general.download

                    return new SubtleButton(
                        Svg.download_svg(),
                        new Combine([
                            t.downloadFeatureAsGeojson.SetClass("font-bold text-lg"),
                            t.downloadGeoJsonHelper.SetClass("subtle"),
                        ]).SetClass("flex flex-col")
                    ).onClick(() => {
                        console.log("Exporting as Geojson")
                        const tags = tagSource.data
                        const title =
                            layer?.title?.GetRenderValue(tags)?.Subs(tags)?.txt ?? "geojson"
                        const data = JSON.stringify(feature, null, "  ")
                        Utils.offerContentsAsDownloadableFile(
                            data,
                            title + "_mapcomplete_export.geojson",
                            {
                                mimetype: "application/vnd.geo+json",
                            }
                        )
                    })
                },
            },
            {
                funcName: "open_in_iD",
                docs: "Opens the current view in the iD-editor",
                args: [],
                needsUrls: [],
                constr: (state, feature) => {
                    return new SvelteUIElement(OpenIdEditor, {
                        mapProperties: state.mapProperties,
                        objectId: feature.data.id,
                    })
                },
            },
            {
                funcName: "open_in_josm",
                docs: "Opens the current view in the JOSM-editor",
                args: [],
                needsUrls: ["http://127.0.0.1:8111/load_and_zoom"],

                constr: (state) => {
                    return new SvelteUIElement(OpenJosm, { state })
                },
            },
            {
                funcName: "clear_location_history",
                docs: "A button to remove the travelled track information from the device",
                args: [],
                needsUrls: [],
                constr: (state) => {
                    return new SubtleButton(
                        Svg.delete_icon_svg().SetStyle("height: 1.5rem"),
                        Translations.t.general.removeLocationHistory
                    ).onClick(() => {
                        state.historicalUserLocations.features.setData([])
                        state.selectedElement.setData(undefined)
                    })
                },
            },
            {
                funcName: "visualize_note_comments",
                docs: "Visualises the comments for notes",
                args: [
                    {
                        name: "commentsKey",
                        doc: "The property name of the comments, which should be stringified json",
                        defaultValue: "comments",
                    },
                    {
                        name: "start",
                        doc: "Drop the first 'start' comments",
                        defaultValue: "0",
                    },
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
                                        .map((c) => new NoteCommentElement(c))
                                ).SetClass("flex flex-col")
                            })
                    ),
            },
            {
                funcName: "add_image_to_note",
                docs: "Adds an image to a node",
                args: [
                    {
                        name: "Id-key",
                        doc: "The property name where the ID of the note to close can be found",
                        defaultValue: "id",
                    },
                ],
                needsUrls: [Imgur.apiUrl],
                constr: (state, tags, args) => {
                    const id = tags.data[args[0] ?? "id"]
                    tags = state.featureProperties.getStore(id)
                    console.log("Id is", id)
                    return new SvelteUIElement(UploadImage, { state, tags })
                },
            },
            {
                funcName: "title",
                args: [],
                needsUrls: [],
                docs: "Shows the title of the popup. Useful for some cases, e.g. 'What is phone number of {title()}?'",
                example:
                    "`What is the phone number of {title()}`, which might automatically become `What is the phone number of XYZ`.",
                constr: (state, tagsSource) =>
                    new VariableUiElement(
                        tagsSource.map((tags) => {
                            if (state.layout === undefined) {
                                return "<feature title>"
                            }
                            const layer = state.layout?.getMatchingLayer(tags)
                            const title = layer?.title?.GetRenderValue(tags)
                            if (title === undefined) {
                                return undefined
                            }
                            return new SubstitutedTranslation(title, tagsSource, state).SetClass(
                                "px-1"
                            )
                        })
                    ),
            },
            {
                funcName: "maproulette_task",
                args: [],
                needsUrls: [Maproulette.defaultEndpoint],
                constr(state, tagSource) {
                    let parentId = tagSource.data.mr_challengeId
                    if (parentId === undefined) {
                        console.warn("Element ", tagSource.data.id, " has no mr_challengeId")
                        return undefined
                    }
                    let challenge = Stores.FromPromise(
                        Utils.downloadJsonCached(
                            `${Maproulette.defaultEndpoint}/challenge/${parentId}`,
                            24 * 60 * 60 * 1000
                        )
                    )

                    return new VariableUiElement(
                        challenge.map((challenge) => {
                            let listItems: BaseUIElement[] = []
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
                docs: "Fetches the metadata of MapRoulette campaign that this task is part of and shows those details (namely `title`, `description` and `instruction`).\n\nThis reads the property `mr_challengeId` to detect the parent campaign.",
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
                    '   "id": "mark_duplicate",\n' +
                    '   "render": {\n' +
                    '      "special": {\n' +
                    '         "type": "maproulette_set_status",\n' +
                    '         "message": {\n' +
                    '            "en": "Mark as not found or false positive"\n' +
                    "         },\n" +
                    '         "status": "2",\n' +
                    '         "image": "close"\n' +
                    "      }\n" +
                    "   }\n" +
                    "}\n" +
                    "```",
                args: [
                    {
                        name: "message",
                        doc: "A message to show to the user",
                    },
                    {
                        name: "image",
                        doc: "Image to show",
                        defaultValue: "confirm",
                    },
                    {
                        name: "message_confirm",
                        doc: "What to show when the task is closed, either by the user or was already closed.",
                    },
                    {
                        name: "status",
                        doc: "A statuscode to apply when the button is clicked. 1 = `close`, 2 = `false_positive`, 3 = `skip`, 4 = `deleted`, 5 = `already fixed` (on the map, e.g. for duplicates), 6 = `too hard`",
                        defaultValue: "1",
                    },
                    {
                        name: "maproulette_id",
                        doc: "The property name containing the maproulette id",
                        defaultValue: "mr_taskId",
                    },
                ],
                constr: (state, tagsSource, args) => {
                    let [message, image, message_closed, status, maproulette_id_key] = args
                    if (image === "") {
                        image = "confirm"
                    }
                    if (maproulette_id_key === "" || maproulette_id_key === undefined) {
                        maproulette_id_key = "mr_taskId"
                    }
                    const failed = new UIEventSource(false)

                    const closeButton = new SubtleButton(image, message).OnClickWithLoading(
                        Translations.t.general.loading,
                        async () => {
                            const maproulette_id =
                                tagsSource.data[maproulette_id_key] ??
                                tagsSource.data.mr_taskId ??
                                tagsSource.data.id
                            try {
                                await Maproulette.singleton.closeTask(
                                    Number(maproulette_id),
                                    Number(status),
                                    {
                                        tags: `MapComplete MapComplete:${state.layout.id}`,
                                    }
                                )
                                tagsSource.data["mr_taskStatus"] =
                                    Maproulette.STATUS_MEANING[Number(status)]
                                tagsSource.data.status = status
                                tagsSource.ping()
                            } catch (e) {
                                console.error(e)
                                failed.setData(true)
                            }
                        }
                    )

                    let message_closed_element = undefined
                    if (message_closed !== undefined && message_closed !== "") {
                        message_closed_element = new FixedUiElement(message_closed)
                    }

                    return new VariableUiElement(
                        tagsSource
                            .map((tgs) => {
                                if (tgs["status"]) {
                                    return tgs["status"]
                                }
                                const code = tgs["mr_taskStatus"]
                                console.log("Code is", code, Maproulette.codeToIndex(code))
                                return Maproulette.codeToIndex(code)
                            })
                            .map(Number)
                            .map(
                                (status) => {
                                    console.log("Close MR button: status is", status)
                                    if (failed.data) {
                                        return new FixedUiElement(
                                            "ERROR - could not close the MapRoulette task"
                                        ).SetClass("block alert")
                                    }
                                    if (status === Maproulette.STATUS_OPEN) {
                                        return closeButton
                                    }
                                    return message_closed_element ?? "Closed!"
                                },
                                [failed]
                            )
                    )
                },
            },
            {
                funcName: "statistics",
                docs: "Show general statistics about the elements currently in view. Intended to use on the `current_view`-layer",
                args: [],
                needsUrls: [],
                constr: (state) => {
                    return new Combine(
                        state.layout.layers
                            .filter((l) => l.name !== null)
                            .map(
                                (l) => {
                                    const fs = state.perLayer.get(l.id)
                                    const bbox = state.mapProperties.bounds
                                    const fsBboxed = new BBoxFeatureSourceForLayer(fs, bbox)
                                    return new StatisticsPanel(fsBboxed)
                                },
                                [state.mapProperties.bounds]
                            )
                    )
                },
            },
            {
                funcName: "send_email",
                docs: "Creates a `mailto`-link where some fields are already set and correctly escaped. The user will be promted to send the email",
                args: [
                    {
                        name: "to",
                        doc: "Who to send the email to?",
                        required: true,
                    },
                    {
                        name: "subject",
                        doc: "The subject of the email",
                        required: true,
                    },
                    {
                        name: "body",
                        doc: "The text in the email",
                        required: true,
                    },

                    {
                        name: "button_text",
                        doc: "The text shown on the button in the UI",
                        required: true,
                    },
                ],
                needsUrls: [],

                constr(__, tags, args) {
                    return new SvelteUIElement(SendEmail, { args, tags })
                },
            },
            {
                funcName: "link",
                docs: "Construct a link. By using the 'special' visualisation notation, translations should be easier",
                args: [
                    {
                        name: "text",
                        doc: "Text to be shown",
                        required: true,
                    },
                    {
                        name: "href",
                        doc: "The URL to link to",
                        required: true,
                    },
                    {
                        name: "class",
                        doc: "CSS-classes to add to the element",
                    },
                    {
                        name: "download",
                        doc: "If set, this link will act as a download-button. The contents of `href` will be offered for download; this parameter will act as the proposed filename",
                    },
                ],
                needsUrls: [],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    args: string[]
                ): BaseUIElement {
                    const [text, href, classnames, download] = args
                    return new VariableUiElement(
                        tagSource.map((tags) =>
                            new Link(
                                Utils.SubstituteKeys(text, tags),
                                Utils.SubstituteKeys(href, tags),
                                download === undefined && !href.startsWith("#"),
                                Utils.SubstituteKeys(download, tags)
                            ).SetClass(classnames)
                        )
                    )
                },
            },
            {
                funcName: "multi",
                docs: "Given an embedded tagRendering (read only) and a key, will read the keyname as a JSON-list. Every element of this list will be considered as tags and rendered with the tagRendering",
                needsUrls: [],
                example:
                    "```json\n" +
                    JSON.stringify(
                        {
                            render: {
                                special: {
                                    type: "multi",
                                    key: "_doors_from_building_properties",
                                    tagrendering: {
                                        en: "The building containing this feature has a <a href='#{id}'>door</a> of width {entrance:width}",
                                    },
                                },
                            },
                        },
                        null,
                        "  "
                    ) +
                    "\n```",
                args: [
                    {
                        name: "key",
                        doc: "The property to read and to interpret as a list of properties",
                        required: true,
                    },
                    {
                        name: "tagrendering",
                        doc: "An entire tagRenderingConfig",
                        required: true,
                    },
                ],
                constr(state, featureTags, args) {
                    const [key, tr] = args
                    const translation = new Translation({ "*": tr })
                    return new VariableUiElement(
                        featureTags.map((tags) => {
                            const properties: object[] = JSON.parse(tags[key])
                            const elements = []
                            for (const property of properties) {
                                const subsTr = new SubstitutedTranslation(
                                    translation,
                                    new UIEventSource<any>(property),
                                    state
                                )
                                elements.push(subsTr)
                            }
                            return new List(elements)
                        })
                    )
                },
            },
            {
                funcName: "translated",
                docs: "If the given key can be interpreted as a JSON, only show the key containing the current language (or 'en'). This specialRendering is meant to be used by MapComplete studio and is not useful in map themes",
                needsUrls: [],
                args: [
                    {
                        name: "key",
                        doc: "The attribute to interpret as json",
                        defaultValue: "value",
                    },
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
                },
            },
            {
                funcName: "fediverse_link",
                docs: "Converts a fediverse username or link into a clickable link",
                args: [
                    {
                        name: "key",
                        doc: "The attribute-name containing the link",
                        required: true,
                    },
                ],
                needsUrls: [],
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

                                return new Link(
                                    fediAccount,
                                    "https://" + host + "/@" + username,
                                    true
                                )
                            })
                    )
                },
            },
            {
                funcName: "braced",
                docs: "Show a literal text within braces",
                needsUrls: [],
                args: [
                    {
                        name: "text",
                        required: true,
                        doc: "The value to show",
                    },
                ],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    args: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    return new FixedUiElement("{" + args[0] + "}")
                },
            },
            {
                funcName: "tags",
                docs: "Shows a (json of) tags in a human-readable way + links to the wiki",
                needsUrls: [],
                args: [
                    {
                        name: "key",
                        defaultValue: "value",
                        doc: "The key to look for the tags",
                    },
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
                },
            },
            {
                funcName: "giggity",
                args: [
                    {
                        name: "giggityUrl",
                        required: true,
                        doc: "The URL of the giggity-XML",
                    },
                ],
                docs: "Shows events that are happening based on a Giggity URL",
                needsUrls: ["*"],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    const giggityUrl = argument[0]
                    return new SvelteUIElement(Giggity, { tags: tagSource, state, giggityUrl })
                },
            },
            {
                funcName: "gps_all_tags",
                needsUrls: [],
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
                    return new SvelteUIElement(AllTagsPanel, {
                        state,
                        tags,
                    })
                },
            },
            {
                funcName: "favourite_status",
                needsUrls: [],
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
                        feature,
                    })
                },
            },
            {
                funcName: "favourite_icon",
                needsUrls: [],
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
                        feature,
                    })
                },
            },
        ]

        specialVisualizations.push(new AutoApplyButton(specialVisualizations))

        const invalid = specialVisualizations
            .map((sp, i) => ({ sp, i }))
            .filter((sp) => sp.sp.funcName === undefined)
        if (invalid.length > 0) {
            throw (
                "Invalid special visualisation found: funcName is undefined for " +
                invalid.map((sp) => sp.i).join(", ") +
                '. Did you perhaps type \n  funcName: "funcname" // type declaration uses COLON\ninstead of:\n  funcName = "funcName" // value definition uses EQUAL'
            )
        }

        return specialVisualizations
    }
}
