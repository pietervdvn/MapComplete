import {Store, Stores, UIEventSource} from "../Logic/UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";
import LiveQueryHandler from "../Logic/Web/LiveQueryHandler";
import {ImageCarousel} from "./Image/ImageCarousel";
import Combine from "./Base/Combine";
import {FixedUiElement} from "./Base/FixedUiElement";
import {ImageUploadFlow} from "./Image/ImageUploadFlow";
import ShareButton from "./BigComponents/ShareButton";
import Svg from "../Svg";
import ReviewElement from "./Reviews/ReviewElement";
import MangroveReviews from "../Logic/Web/MangroveReviews";
import Translations from "./i18n/Translations";
import ReviewForm from "./Reviews/ReviewForm";
import OpeningHoursVisualization from "./OpeningHours/OpeningHoursVisualization";
import BaseUIElement from "./BaseUIElement";
import Title from "./Base/Title";
import Table from "./Base/Table";
import Histogram from "./BigComponents/Histogram";
import Loc from "../Models/Loc";
import {Utils} from "../Utils";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import StaticFeatureSource from "../Logic/FeatureSource/Sources/StaticFeatureSource";
import ShowDataMultiLayer from "./ShowDataLayer/ShowDataMultiLayer";
import Minimap from "./Base/Minimap";
import AllImageProviders from "../Logic/ImageProviders/AllImageProviders";
import WikipediaBox from "./Wikipedia/WikipediaBox";
import MultiApply from "./Popup/MultiApply";
import ShowDataLayer from "./ShowDataLayer/ShowDataLayer";
import {SubtleButton} from "./Base/SubtleButton";
import {DefaultGuiState} from "./DefaultGuiState";
import {GeoOperations} from "../Logic/GeoOperations";
import Hash from "../Logic/Web/Hash";
import FeaturePipelineState from "../Logic/State/FeaturePipelineState";
import {ConflateButton, ImportPointButton, ImportWayButton} from "./Popup/ImportButton";
import TagApplyButton from "./Popup/TagApplyButton";
import AutoApplyButton from "./Popup/AutoApplyButton";
import * as left_right_style_json from "../assets/layers/left_right_style/left_right_style.json";
import {OpenIdEditor, OpenJosm} from "./BigComponents/CopyrightPanel";
import Toggle from "./Input/Toggle";
import Img from "./Base/Img";
import NoteCommentElement from "./Popup/NoteCommentElement";
import ImgurUploader from "../Logic/ImageProviders/ImgurUploader";
import FileSelectorButton from "./Input/FileSelectorButton";
import {LoginToggle} from "./Popup/LoginButton";
import {SubstitutedTranslation} from "./SubstitutedTranslation";
import {TextField} from "./Input/TextField";
import Wikidata, {WikidataResponse} from "../Logic/Web/Wikidata";
import {Translation} from "./i18n/Translation";
import {AllTagsPanel} from "./AllTagsPanel";
import NearbyImages, {NearbyImageOptions, P4CPicture, SelectOneNearbyImage} from "./Popup/NearbyImages";
import Lazy from "./Base/Lazy";
import ChangeTagAction from "../Logic/Osm/Actions/ChangeTagAction";
import {Tag} from "../Logic/Tags/Tag";
import {And} from "../Logic/Tags/And";
import {SaveButton} from "./Popup/SaveButton";
import {MapillaryLink} from "./BigComponents/MapillaryLink";
import {CheckBox} from "./Input/Checkboxes";
import Slider from "./Input/Slider";
import List from "./Base/List";
import StatisticsPanel from "./BigComponents/StatisticsPanel";
import {OsmFeature} from "../Models/OsmFeature";
import EditableTagRendering from "./Popup/EditableTagRendering";
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig";

export interface SpecialVisualization {
    funcName: string,
    constr: ((state: FeaturePipelineState, tagSource: UIEventSource<any>, argument: string[], guistate: DefaultGuiState,) => BaseUIElement),
    docs: string | BaseUIElement,
    example?: string,
    args: { name: string, defaultValue?: string, doc: string, required?: false | boolean }[],
    getLayerDependencies?: (argument: string[]) => string[]
}

class CloseNoteButton implements SpecialVisualization {
    public readonly funcName = "close_note"
    public readonly docs = "Button to close a note. A predifined text can be defined to close the note with. If the note is already closed, will show a small text."
    public readonly args = [
        {
            name: "text",
            doc: "Text to show on this button",
            required: true
        },
        {
            name: "icon",
            doc: "Icon to show",
            defaultValue: "checkmark.svg"
        },
        {
            name: "idkey",
            doc: "The property name where the ID of the note to close can be found",
            defaultValue: "id"
        },
        {
            name: "comment",
            doc: "Text to add onto the note when closing",
        },
        {
            name: "minZoom",
            doc: "If set, only show the closenote button if zoomed in enough"
        },
        {
            name: "zoomButton",
            doc: "Text to show if not zoomed in enough"
        }
    ]

    public constr(state: FeaturePipelineState, tags, args): BaseUIElement {
        const t = Translations.t.notes;

        const params: {
            text: string,
            icon: string,
            idkey: string,
            comment: string,
            minZoom: string,
            zoomButton: string
        } = Utils.ParseVisArgs(this.args, args)

        let icon = Svg.checkmark_svg()
        if (params.icon !== "checkmark.svg" && (args[2] ?? "") !== "") {
            icon = new Img(args[1])
        }
        let textToShow = t.closeNote;
        if ((params.text ?? "") !== "") {
            textToShow = Translations.T(args[0])
        }

        let closeButton: BaseUIElement = new SubtleButton(icon, textToShow)
        const isClosed = tags.map(tags => (tags["closed_at"] ?? "") !== "");
        closeButton.onClick(() => {
            const id = tags.data[args[2] ?? "id"]
            state.osmConnection.closeNote(id, args[3])
                ?.then(_ => {
                    tags.data["closed_at"] = new Date().toISOString();
                    tags.ping()
                })
        })

        if ((params.minZoom ?? "") !== "" && !isNaN(Number(params.minZoom))) {
            closeButton = new Toggle(
                closeButton,
                params.zoomButton ?? "",
                state.locationControl.map(l => l.zoom >= Number(params.minZoom))
            )
        }

        return new LoginToggle(new Toggle(
            t.isClosed.SetClass("thanks"),
            closeButton,

            isClosed
        ), t.loginToClose, state)
    }

}

class NearbyImageVis implements SpecialVisualization {
    args: { name: string; defaultValue?: string; doc: string; required?: boolean }[] = [

        {
            name: "mode",
            defaultValue: "expandable",
            doc: "Indicates how this component is initialized. Options are: \n\n- `open`: always show and load the pictures\n- `collapsable`: show the pictures, but a user can collapse them\n- `expandable`: shown by default; but a user can collapse them."
        },
        {
            name: "mapillary",
            defaultValue: "true",
            doc: "If 'true', includes a link to mapillary on this location."
        }
    ]
    docs = "A component showing nearby images loaded from various online services such as Mapillary. In edit mode and when used on a feature, the user can select an image to add to the feature";
    funcName = "nearby_images";

    constr(state: FeaturePipelineState, tagSource: UIEventSource<any>, args: string[], guistate: DefaultGuiState): BaseUIElement {
        const t = Translations.t.image.nearbyPictures
        const mode: "open" | "expandable" | "collapsable" = <any>args[0]
        const feature = state.allElements.ContainingFeatures.get(tagSource.data.id)
        const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
        const id: string = tagSource.data["id"]
        const canBeEdited: boolean = !!(id?.match("(node|way|relation)/-?[0-9]+"))
        const selectedImage = new UIEventSource<P4CPicture>(undefined);


        let saveButton: BaseUIElement = undefined
        if (canBeEdited) {
            const confirmText: BaseUIElement = new SubstitutedTranslation(t.confirm, tagSource, state)

            const onSave = async () => {
                console.log("Selected a picture...", selectedImage.data)
                const osmTags = selectedImage.data.osmTags
                const tags: Tag[] = []
                for (const key in osmTags) {
                    tags.push(new Tag(key, osmTags[key]))
                }
                await state?.changes?.applyAction(
                    new ChangeTagAction(
                        id,
                        new And(tags),
                        tagSource,
                        {
                            theme: state?.layoutToUse.id,
                            changeType: "link-image"
                        }
                    )
                )
            };
            saveButton = new SaveButton(selectedImage, state.osmConnection, confirmText, t.noImageSelected)
                .onClick(onSave).SetClass("flex justify-end")
        }

        const nearby = new Lazy(() => {
            const towardsCenter = new CheckBox(t.onlyTowards, false)

            const radiusValue = state?.osmConnection?.GetPreference("nearby-images-radius", "300").sync(s => Number(s), [], i => "" + i) ?? new UIEventSource(300);

            const radius = new Slider(25, 500, {
                value:
                radiusValue, step: 25
            })
            const alreadyInTheImage = AllImageProviders.LoadImagesFor(tagSource)
            const options: NearbyImageOptions & { value } = {
                lon, lat,
                searchRadius: 500,
                shownRadius: radius.GetValue(),
                value: selectedImage,
                blacklist: alreadyInTheImage,
                towardscenter: towardsCenter.GetValue(),
                maxDaysOld: 365 * 5

            };
            const slideshow = canBeEdited ? new SelectOneNearbyImage(options, state) : new NearbyImages(options, state);
            const controls = new Combine([towardsCenter,
                new Combine([
                    new VariableUiElement(radius.GetValue().map(radius => t.withinRadius.Subs({radius}))), radius
                ]).SetClass("flex justify-between")
            ]).SetClass("flex flex-col");
            return new Combine([slideshow,
                controls,
                saveButton,
                new MapillaryLinkVis().constr(state, tagSource, []).SetClass("mt-6")])
        });

        let withEdit: BaseUIElement = nearby;
        if (canBeEdited) {
            withEdit = new Combine([
                t.hasMatchingPicture,
                nearby
            ]).SetClass("flex flex-col")
        }

        if (mode === 'open') {
            return withEdit
        }
        const toggleState = new UIEventSource<boolean>(mode === 'collapsable')
        return new Toggle(
            new Combine([new Title(t.title), withEdit]),
            new Title(t.browseNearby).onClick(() => toggleState.setData(true)),
            toggleState
        )
    }

}

export class MapillaryLinkVis implements SpecialVisualization {
    funcName = "mapillary_link"
    docs = "Adds a button to open mapillary on the specified location"
    args = [{
        name: "zoom",
        doc: "The startzoom of mapillary",
        defaultValue: "18"
    }];

    public constr(state, tagsSource, args) {
        const feat = state.allElements.ContainingFeatures.get(tagsSource.data.id);
        const [lon, lat] = GeoOperations.centerpointCoordinates(feat);
        let zoom = Number(args[0])
        if (isNaN(zoom)) {
            zoom = 18
        }
        return new MapillaryLink({
            locationControl: new UIEventSource<Loc>({
                lat, lon, zoom
            })
        })
    }
}

export default class SpecialVisualizations {

    public static specialVisualizations: SpecialVisualization[] = SpecialVisualizations.init()

    public static DocumentationFor(viz: string | SpecialVisualization): BaseUIElement | undefined {
        if (typeof viz === "string") {
            viz = SpecialVisualizations.specialVisualizations.find(sv => sv.funcName === viz)
        }
        if (viz === undefined) {
            return undefined;
        }
        return new Combine(
            [
                new Title(viz.funcName, 3),
                viz.docs,
                viz.args.length > 0 ? new Table(["name", "default", "description"],
                    viz.args.map(arg => {
                        let defaultArg = arg.defaultValue ?? "_undefined_"
                        if (defaultArg == "") {
                            defaultArg = "_empty string_"
                        }
                        return [arg.name, defaultArg, arg.doc];
                    })
                ) : undefined,
                new Title("Example usage of " + viz.funcName, 4),
                new FixedUiElement(
                    viz.example ?? "`{" + viz.funcName + "(" + viz.args.map(arg => arg.defaultValue).join(",") + ")}`"
                ).SetClass("literal-code"),

            ])
    }

    public static HelpMessage() {

        const helpTexts = SpecialVisualizations.specialVisualizations.map(viz => SpecialVisualizations.DocumentationFor(viz));

        return new Combine([
                new Combine([

                    new Title("Special tag renderings", 1),

                    "In a tagrendering, some special values are substituted by an advanced UI-element. This allows advanced features and visualizations to be reused by custom themes or even to query third-party API's.",
                    "General usage is `{func_name()}`, `{func_name(arg, someotherarg)}` or `{func_name(args):cssStyle}`. Note that you _do not_ need to use quotes around your arguments, the comma is enough to separate them. This also implies you cannot use a comma in your args",
                    new Title("Using expanded syntax", 4),
                    `Instead of using \`{"render": {"en": "{some_special_visualisation(some_arg, some other really long message, more args)} , "nl": "{some_special_visualisation(some_arg, een boodschap in een andere taal, more args)}}\`, one can also write`,
                    new FixedUiElement(JSON.stringify({
                        render: {
                            special: {
                                type: "some_special_visualisation",
                                before: {
                                    en: "Some text to prefix before the special element (e.g. a title)",
                                    nl: "Een tekst om voor het element te zetten (bv. een titel)"
                                },
                                after: {
                                    en: "Some text to put after the element, e.g. a footer"
                                },
                                "argname": "some_arg",
                                "message": {
                                    en: "some other really long message",
                                    nl: "een boodschap in een andere taal"
                                },
                                "other_arg_name": "more args"
                            }
                        }
                    }, null, "  ")).SetClass("code")
                ]).SetClass("flex flex-col"),
                ...helpTexts
            ]
        ).SetClass("flex flex-col");
    }

    private static init() {
        const specialVisualizations: SpecialVisualization[] =
            [
                {
                    funcName: "all_tags",
                    docs: "Prints all key-value pairs of the object - used for debugging",
                    args: [],
                    constr: ((state, tags: UIEventSource<any>) => new AllTagsPanel(tags, state))
                },
                {
                    funcName: "image_carousel",
                    docs: "Creates an image carousel for the given sources. An attempt will be made to guess what source is used. Supported: Wikidata identifiers, Wikipedia pages, Wikimedia categories, IMGUR (with attribution, direct links)",
                    args: [{
                        name: "image_key",
                        defaultValue: AllImageProviders.defaultKeys.join(","),
                        doc: "The keys given to the images, e.g. if <span class='literal-code'>image</span> is given, the first picture URL will be added as <span class='literal-code'>image</span>, the second as <span class='literal-code'>image:0</span>, the third as <span class='literal-code'>image:1</span>, etc... Multiple values are allowed if ';'-separated "
                    }],
                    constr: (state, tags, args) => {
                        let imagePrefixes: string[] = undefined;
                        if (args.length > 0) {
                            imagePrefixes = [].concat(...args.map(a => a.split(",")));
                        }
                        return new ImageCarousel(AllImageProviders.LoadImagesFor(tags, imagePrefixes), tags, state);
                    }
                },
                {
                    funcName: "image_upload",
                    docs: "Creates a button where a user can upload an image to IMGUR",
                    args: [{
                        name: "image-key",
                        doc: "Image tag to add the URL to (or image-tag:0, image-tag:1 when multiple images are added)",
                        defaultValue: "image"
                    }, {
                        name: "label",
                        doc: "The text to show on the button",
                        defaultValue: "Add image"
                    }],
                    constr: (state, tags, args) => {
                        return new ImageUploadFlow(tags, state, args[0], args[1])
                    }
                },
                {
                    funcName: "wikipedia",
                    docs: "A box showing the corresponding wikipedia article - based on the wikidata tag",
                    args: [
                        {
                            name: "keyToShowWikipediaFor",
                            doc: "Use the wikidata entry from this key to show the wikipedia article for. Multiple keys can be given (separated by ';'), in which case the first matching value is used",
                            defaultValue: "wikidata;wikipedia"
                        }
                    ],
                    example: "`{wikipedia()}` is a basic example, `{wikipedia(name:etymology:wikidata)}` to show the wikipedia page of whom the feature was named after. Also remember that these can be styled, e.g. `{wikipedia():max-height: 10rem}` to limit the height",
                    constr: (_, tagsSource, args) => {
                        const keys = args[0].split(";").map(k => k.trim())
                        return new VariableUiElement(
                            tagsSource.map(tags => {
                                const key = keys.find(k => tags[k] !== undefined && tags[k] !== "")
                                return tags[key];
                            })
                                .map(wikidata => {
                                    const wikidatas: string[] =
                                        Utils.NoEmpty(wikidata?.split(";")?.map(wd => wd.trim()) ?? [])
                                    return new WikipediaBox(wikidatas)
                                })
                        );
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
                    example: "`{wikidata_label()}` is a basic example, `{wikipedia(name:etymology:wikidata)}` to show the label itself",
                    constr: (_, tagsSource, args) =>
                        new VariableUiElement(
                            tagsSource.map(tags => tags[args[0]])
                                .map(wikidata => {
                                    wikidata = Utils.NoEmpty(wikidata?.split(";")?.map(wd => wd.trim()) ?? [])[0]
                                    const entry = Wikidata.LoadWikidataEntry(wikidata)
                                    return new VariableUiElement(entry.map(e => {
                                        if (e === undefined || e["success"] === undefined) {
                                            return wikidata
                                        }
                                        const response = <WikidataResponse>e["success"]
                                        return Translation.fromMap(response.labels)
                                    }))
                                }))
                },
                {
                    funcName: "minimap",
                    docs: "A small map showing the selected feature.",
                    args: [
                        {
                            doc: "The (maximum) zoomlevel: the target zoomlevel after fitting the entire feature. The minimap will fit the entire feature, then zoom out to this zoom level. The higher, the more zoomed in with 1 being the entire world and 19 being really close",
                            name: "zoomlevel",
                            defaultValue: "18"
                        },
                        {
                            doc: "(Matches all resting arguments) This argument should be the key of a property of the feature. The corresponding value is interpreted as either the id or the a list of ID's. The features with these ID's will be shown on this minimap.",
                            name: "idKey",
                            defaultValue: "id"
                        }
                    ],
                    example: "`{minimap()}`, `{minimap(17, id, _list_of_embedded_feature_ids_calculated_by_calculated_tag):height:10rem; border: 2px solid black}`",
                    constr: (state, tagSource, args, _) => {

                        if (state === undefined) {
                            return undefined
                        }
                        const keys = [...args]
                        keys.splice(0, 1)
                        const featureStore = state.allElements.ContainingFeatures
                        const featuresToShow: Store<{ freshness: Date, feature: any }[]> = tagSource.map(properties => {
                            const values: string[] = Utils.NoNull(keys.map(key => properties[key]))
                            const features: { freshness: Date, feature: any }[] = []
                            for (const value of values) {
                                let idList = [value]
                                if (value.startsWith("[")) {
                                    // This is a list of values
                                    idList = JSON.parse(value)
                                }

                                for (const id of idList) {
                                    const feature = featureStore.get(id)
                                    features.push({
                                        freshness: new Date(),
                                        feature
                                    })
                                }
                            }
                            return features
                        })
                        const properties = tagSource.data;
                        let zoom = 18
                        if (args[0]) {
                            const parsed = Number(args[0])
                            if (!isNaN(parsed) && parsed > 0 && parsed < 25) {
                                zoom = parsed;
                            }
                        }
                        const locationSource = new UIEventSource<Loc>({
                            lat: Number(properties._lat),
                            lon: Number(properties._lon),
                            zoom: zoom
                        })
                        const minimap = Minimap.createMiniMap(
                            {
                                background: state.backgroundLayer,
                                location: locationSource,
                                allowMoving: false
                            }
                        )

                        locationSource.addCallback(loc => {
                            if (loc.zoom > zoom) {
                                // We zoom back
                                locationSource.data.zoom = zoom;
                                locationSource.ping();
                            }
                        })

                        new ShowDataMultiLayer(
                            {
                                leafletMap: minimap["leafletMap"],
                                zoomToFeatures: true,
                                layers: state.filteredLayers,
                                features: new StaticFeatureSource(featuresToShow)
                            }
                        )


                        minimap.SetStyle("overflow: hidden; pointer-events: none;")
                        return minimap;
                    }
                },
                {
                    funcName: "sided_minimap",
                    docs: "A small map showing _only one side_ the selected feature. *This features requires to have linerenderings with offset* as only linerenderings with a postive or negative offset will be shown. Note: in most cases, this map will be automatically introduced",
                    args: [
                        {
                            doc: "The side to show, either `left` or `right`",
                            name: "side",
                            required: true
                        }
                    ],
                    example: "`{sided_minimap(left)}`",
                    constr: (state, tagSource, args) => {

                        const properties = tagSource.data;
                        const locationSource = new UIEventSource<Loc>({
                            lat: Number(properties._lat),
                            lon: Number(properties._lon),
                            zoom: 18
                        })
                        const minimap = Minimap.createMiniMap(
                            {
                                background: state.backgroundLayer,
                                location: locationSource,
                                allowMoving: false
                            }
                        )
                        const side = args[0]
                        const feature = state.allElements.ContainingFeatures.get(tagSource.data.id)
                        const copy = {...feature}
                        copy.properties = {
                            id: side
                        }
                        new ShowDataLayer(
                            {
                                leafletMap: minimap["leafletMap"],
                                zoomToFeatures: true,
                                layerToShow: new LayerConfig(left_right_style_json, "all_known_layers", true),
                                features: StaticFeatureSource.fromGeojson([copy]),
                                state
                            }
                        )


                        minimap.SetStyle("overflow: hidden; pointer-events: none;")
                        return minimap;
                    }
                },
                {
                    funcName: "reviews",
                    docs: "Adds an overview of the mangrove-reviews of this object. Mangrove.Reviews needs - in order to identify the reviewed object - a coordinate and a name. By default, the name of the object is given, but this can be overwritten",
                    example: "`{reviews()}` for a vanilla review, `{reviews(name, play_forest)}` to review a play forest. If a name is known, the name will be used as identifier, otherwise 'play_forest' is used",
                    args: [{
                        name: "subjectKey",
                        defaultValue: "name",
                        doc: "The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>"
                    }, {
                        name: "fallback",
                        doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value"
                    }],
                    constr: (state, tags, args) => {
                        const tgs = tags.data;
                        const key = args[0] ?? "name"
                        let subject = tgs[key] ?? args[1];
                        if (subject === undefined || subject === "") {
                            return Translations.t.reviews.name_required;
                        }
                        const mangrove = MangroveReviews.Get(Number(tgs._lon), Number(tgs._lat),
                            encodeURIComponent(subject),
                            state.mangroveIdentity,
                            state.featureSwitchIsTesting.data
                        );
                        const form = new ReviewForm((r, whenDone) => mangrove.AddReview(r, whenDone), state.osmConnection);
                        return new ReviewElement(mangrove.GetSubjectUri(), mangrove.GetReviews(), form);
                    }
                },
                {
                    funcName: "opening_hours_table",
                    docs: "Creates an opening-hours table. Usage: {opening_hours_table(opening_hours)} to create a table of the tag 'opening_hours'.",
                    args: [{
                        name: "key",
                        defaultValue: "opening_hours",
                        doc: "The tagkey from which the table is constructed."
                    }, {
                        name: "prefix",
                        defaultValue: "",
                        doc: "Remove this string from the start of the value before parsing. __Note: use `&LPARENs` to indicate `(` if needed__"
                    }, {
                        name: "postfix",
                        defaultValue: "",
                        doc: "Remove this string from the end of the value before parsing. __Note: use `&RPARENs` to indicate `)` if needed__"
                    }],
                    example: "A normal opening hours table can be invoked with `{opening_hours_table()}`. A table for e.g. conditional access with opening hours can be `{opening_hours_table(access:conditional, no @ &LPARENS, &RPARENS)}`",
                    constr: (state, tagSource: UIEventSource<any>, args) => {
                        return new OpeningHoursVisualization(tagSource, state, args[0], args[1], args[2])
                    }
                },
                {
                    funcName: "live",
                    docs: "Downloads a JSON from the given URL, e.g. '{live(example.org/data.json, shorthand:x.y.z, other:a.b.c, shorthand)}' will download the given file, will create an object {shorthand: json[x][y][z], other: json[a][b][c] out of it and will return 'other' or 'json[a][b][c]. This is made to use in combination with tags, e.g. {live({url}, {url:format}, needed_value)}",
                    example: "{live({url},{url:format},hour)} {live(https://data.mobility.brussels/bike/api/counts/?request=live&featureID=CB2105,hour:data.hour_cnt;day:data.day_cnt;year:data.year_cnt,hour)}",
                    args: [{
                        name: "Url",
                        doc: "The URL to load",
                        required: true
                    }, {
                        name: "Shorthands",
                        doc: "A list of shorthands, of the format 'shorthandname:path.path.path'. separated by ;"
                    }, {
                        name: "path",
                        doc: "The path (or shorthand) that should be returned"
                    }],
                    constr: (state, tagSource: UIEventSource<any>, args) => {
                        const url = args[0];
                        const shorthands = args[1];
                        const neededValue = args[2];
                        const source = LiveQueryHandler.FetchLiveData(url, shorthands.split(";"));
                        return new VariableUiElement(source.map(data => data[neededValue] ?? "Loading..."));
                    }
                },
                {
                    funcName: "histogram",
                    docs: "Create a histogram for a list of given values, read from the properties.",
                    example: "`{histogram('some_key')}` with properties being `{some_key: ['a','b','a','c']} to create a histogram",
                    args: [
                        {
                            name: "key",
                            doc: "The key to be read and to generate a histogram from",
                            required: true
                        },
                        {
                            name: "title",
                            doc: "This text will be placed above the texts (in the first column of the visulasition)",
                            defaultValue: ""
                        },
                        {
                            name: "countHeader",
                            doc: "This text will be placed above the bars",
                            defaultValue: ""
                        },
                        {
                            name: "colors*",
                            doc: "(Matches all resting arguments - optional) Matches a regex onto a color value, e.g. `3[a-zA-Z+-]*:#33cc33`"

                        }
                    ],
                    constr: (state, tagSource: UIEventSource<any>, args: string[]) => {

                        let assignColors = undefined;
                        if (args.length >= 3) {
                            const colors = [...args]
                            colors.splice(0, 3)
                            const mapping = colors.map(c => {
                                const splitted = c.split(":");
                                const value = splitted.pop()
                                const regex = splitted.join(":")
                                return {regex: "^" + regex + "$", color: value}
                            })
                            assignColors = (key) => {
                                for (const kv of mapping) {
                                    if (key.match(kv.regex) !== null) {
                                        return kv.color
                                    }
                                }
                                return undefined
                            }
                        }

                        const listSource: Store<string[]> = tagSource
                            .map(tags => {
                                try {
                                    const value = tags[args[0]]
                                    if (value === "" || value === undefined) {
                                        return undefined
                                    }
                                    return JSON.parse(value)
                                } catch (e) {
                                    console.error("Could not load histogram: parsing  of the list failed: ", e)
                                    return undefined;
                                }
                            })
                        return new Histogram(listSource, args[1], args[2], {assignColor: assignColors})
                    }
                },
                {
                    funcName: "share_link",
                    docs: "Creates a link that (attempts to) open the native 'share'-screen",
                    example: "{share_link()} to share the current page, {share_link(<some_url>)} to share the given url",
                    args: [
                        {
                            name: "url",
                            doc: "The url to share (default: current URL)",
                        }
                    ],
                    constr: (state, tagSource: UIEventSource<any>, args) => {
                        if (window.navigator.share) {

                            const generateShareData = () => {


                                const title = state?.layoutToUse?.title?.txt ?? "MapComplete";

                                let matchingLayer: LayerConfig = state?.layoutToUse?.getMatchingLayer(tagSource?.data);
                                let name = matchingLayer?.title?.GetRenderValue(tagSource.data)?.txt ?? tagSource.data?.name ?? "POI";
                                if (name) {
                                    name = `${name} (${title})`
                                } else {
                                    name = title;
                                }
                                let url = args[0] ?? ""
                                if (url === "") {
                                    url = window.location.href
                                }
                                return {
                                    title: name,
                                    url: url,
                                    text: state?.layoutToUse?.shortDescription?.txt ?? "MapComplete"
                                }
                            }

                            return new ShareButton(Svg.share_svg().SetClass("w-8 h-8"), generateShareData)
                        } else {
                            return new FixedUiElement("")
                        }

                    }
                },
                {
                    funcName: "canonical",
                    docs: "Converts a short, canonical value into the long, translated text including the unit. This only works if a `unit` is defined for the corresponding value. The unit specification will be included in the text. ",
                    example: "If the object has `length=42`, then `{canonical(length)}` will be shown as **42 meter** (in english), **42 metre** (in french), ...",
                    args: [{
                        name: "key",
                        doc: "The key of the tag to give the canonical text for",
                        required: true
                    }],
                    constr: (state, tagSource, args) => {
                        const key = args [0]
                        return new VariableUiElement(
                            tagSource.map(tags => tags[key]).map(value => {
                                if (value === undefined) {
                                    return undefined
                                }
                                const allUnits = [].concat(...(state?.layoutToUse?.layers?.map(lyr => lyr.units) ?? []))
                                const unit = allUnits.filter(unit => unit.isApplicableToKey(key))[0]
                                if (unit === undefined) {
                                    return value;
                                }
                                return unit.asHumanLongValue(value);

                            })
                        )
                    }
                },
                new ImportPointButton(),
                new ImportWayButton(),
                new ConflateButton(),
                {
                    funcName: "multi_apply",
                    docs: "A button to apply the tagging of this object onto a list of other features. This is an advanced feature for which you'll need calculatedTags",
                    args: [
                        {name: "feature_ids", doc: "A JSON-serialized list of IDs of features to apply the tagging on"},
                        {
                            name: "keys",
                            doc: "One key (or multiple keys, seperated by ';') of the attribute that should be copied onto the other features.",
                            required: true
                        },
                        {name: "text", doc: "The text to show on the button"},
                        {
                            name: "autoapply",
                            doc: "A boolean indicating wether this tagging should be applied automatically if the relevant tags on this object are changed. A visual element indicating the multi_apply is still shown",
                            required: true
                        },
                        {
                            name: "overwrite",
                            doc: "If set to 'true', the tags on the other objects will always be overwritten. The default behaviour will be to only change the tags on other objects if they are either undefined or had the same value before the change",
                            required: true
                        }
                    ],
                    example: "{multi_apply(_features_with_the_same_name_within_100m, name:etymology:wikidata;name:etymology, Apply etymology information on all nearby objects with the same name)}",
                    constr: (state, tagsSource, args) => {
                        const featureIdsKey = args[0]
                        const keysToApply = args[1].split(";")
                        const text = args[2]
                        const autoapply = args[3]?.toLowerCase() === "true"
                        const overwrite = args[4]?.toLowerCase() === "true"
                        const featureIds: Store<string[]> = tagsSource.map(tags => {
                            const ids = tags[featureIdsKey]
                            try {
                                if (ids === undefined) {
                                    return []
                                }
                                return JSON.parse(ids);
                            } catch (e) {
                                console.warn("Could not parse ", ids, "as JSON to extract IDS which should be shown on the map.")
                                return []
                            }
                        })
                        return new MultiApply(
                            {
                                featureIds,
                                keysToApply,
                                text,
                                autoapply,
                                overwrite,
                                tagsSource,
                                state
                            }
                        );

                    }
                },
                new TagApplyButton(),
                {
                    funcName: "export_as_gpx",
                    docs: "Exports the selected feature as GPX-file",
                    args: [],
                    constr: (state, tagSource) => {
                        const t = Translations.t.general.download;

                        return new SubtleButton(Svg.download_ui(),
                            new Combine([t.downloadFeatureAsGpx.SetClass("font-bold text-lg"),
                                t.downloadGpxHelper.SetClass("subtle")]).SetClass("flex flex-col")
                        ).onClick(() => {
                            console.log("Exporting as GPX!")
                            const tags = tagSource.data
                            const feature = state.allElements.ContainingFeatures.get(tags.id)
                            const matchingLayer = state?.layoutToUse?.getMatchingLayer(tags)
                            const gpx = GeoOperations.AsGpx(feature, matchingLayer)
                            const title = matchingLayer.title?.GetRenderValue(tags)?.Subs(tags)?.txt ?? "gpx_track"
                            Utils.offerContentsAsDownloadableFile(gpx, title + "_mapcomplete_export.gpx", {
                                mimetype: "{gpx=application/gpx+xml}"
                            })


                        })
                    }
                },
                {
                    funcName: "export_as_geojson",
                    docs: "Exports the selected feature as GeoJson-file",
                    args: [],
                    constr: (state, tagSource) => {
                        const t = Translations.t.general.download;

                        return new SubtleButton(Svg.download_ui(),
                            new Combine([t.downloadFeatureAsGeojson.SetClass("font-bold text-lg"),
                                t.downloadGeoJsonHelper.SetClass("subtle")]).SetClass("flex flex-col")
                        ).onClick(() => {
                            console.log("Exporting as Geojson")
                            const tags = tagSource.data
                            const feature = state.allElements.ContainingFeatures.get(tags.id)
                            const matchingLayer = state?.layoutToUse?.getMatchingLayer(tags)
                            const title = matchingLayer.title?.GetRenderValue(tags)?.Subs(tags)?.txt ?? "geojson"
                            const data = JSON.stringify(feature, null, "  ");
                            Utils.offerContentsAsDownloadableFile(data, title + "_mapcomplete_export.geojson", {
                                mimetype: "application/vnd.geo+json"
                            })


                        })
                    }
                },
                {
                    funcName: "open_in_iD",
                    docs: "Opens the current view in the iD-editor",
                    args: [],
                    constr: (state, feature) => {
                        return new OpenIdEditor(state, undefined, feature.data.id)
                    }
                },
                {
                    funcName: "open_in_josm",
                    docs: "Opens the current view in the JOSM-editor",
                    args: [],
                    constr: (state, feature) => {
                        return new OpenJosm(state)
                    }
                },

                {
                    funcName: "clear_location_history",
                    docs: "A button to remove the travelled track information from the device",
                    args: [],
                    constr: state => {
                        return new SubtleButton(
                            Svg.delete_icon_svg().SetStyle("height: 1.5rem"), Translations.t.general.removeLocationHistory
                        ).onClick(() => {
                            state.historicalUserLocations.features.setData([])
                            Hash.hash.setData(undefined)
                        })
                    }
                },
                new CloseNoteButton(),
                {
                    funcName: "add_note_comment",
                    docs: "A textfield to add a comment to a node (with the option to close the note).",
                    args: [
                        {
                            name: "Id-key",
                            doc: "The property name where the ID of the note to close can be found",
                            defaultValue: "id"
                        }
                    ],
                    constr: (state, tags, args) => {

                        const t = Translations.t.notes;
                        const textField = new TextField(
                            {
                                placeholder: t.addCommentPlaceholder,
                                inputStyle: "width: 100%; height: 6rem;",
                                textAreaRows: 3,
                                htmlType: "area"
                            }
                        )
                        textField.SetClass("rounded-l border border-grey")
                        const txt = textField.GetValue()

                        const addCommentButton = new SubtleButton(Svg.speech_bubble_svg().SetClass("max-h-7"), t.addCommentPlaceholder)
                            .onClick(async () => {
                                const id = tags.data[args[1] ?? "id"]

                                if ((txt.data ?? "") == "") {
                                    return;
                                }

                                if (isClosed.data) {
                                    await state.osmConnection.reopenNote(id, txt.data)
                                    await state.osmConnection.closeNote(id)
                                } else {
                                    await state.osmConnection.addCommentToNote(id, txt.data)
                                }
                                NoteCommentElement.addCommentTo(txt.data, tags, state)
                                txt.setData("")

                            })


                        const close = new SubtleButton(Svg.resolved_svg().SetClass("max-h-7"), new VariableUiElement(txt.map(txt => {
                            if (txt === undefined || txt === "") {
                                return t.closeNote
                            }
                            return t.addCommentAndClose
                        }))).onClick(() => {
                            const id = tags.data[args[1] ?? "id"]
                            state.osmConnection.closeNote(id, txt.data).then(_ => {
                                tags.data["closed_at"] = new Date().toISOString();
                                tags.ping()
                            })
                        })

                        const reopen = new SubtleButton(Svg.note_svg().SetClass("max-h-7"), new VariableUiElement(txt.map(txt => {
                            if (txt === undefined || txt === "") {
                                return t.reopenNote
                            }
                            return t.reopenNoteAndComment
                        }))).onClick(() => {
                            const id = tags.data[args[1] ?? "id"]
                            state.osmConnection.reopenNote(id, txt.data).then(_ => {
                                tags.data["closed_at"] = undefined;
                                tags.ping()
                            })
                        })

                        const isClosed = tags.map(tags => (tags["closed_at"] ?? "") !== "");
                        const stateButtons = new Toggle(new Toggle(reopen, close, isClosed), undefined, state.osmConnection.isLoggedIn)

                        return new LoginToggle(
                            new Combine([
                                new Title(t.addAComment),
                                textField,
                                new Combine([
                                    stateButtons.SetClass("sm:mr-2"),
                                    new Toggle(addCommentButton,
                                        new Combine([t.typeText]).SetClass("flex items-center h-full subtle"),
                                        textField.GetValue().map(t => t !== undefined && t.length >= 1)).SetClass("sm:mr-2")
                                ]).SetClass("sm:flex sm:justify-between sm:items-stretch")
                            ]).SetClass("border-2 border-black rounded-xl p-4 block"),
                            t.loginToAddComment, state)
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
                    ]
                    , constr: (state, tags, args) =>
                        new VariableUiElement(
                            tags.map(tags => tags[args[0]])
                                .map(commentsStr => {
                                    const comments: any[] = JSON.parse(commentsStr)
                                    const startLoc = Number(args[1] ?? 0)
                                    if (!isNaN(startLoc) && startLoc > 0) {
                                        comments.splice(0, startLoc)
                                    }
                                    return new Combine(comments
                                        .filter(c => c.text !== "")
                                        .map(c => new NoteCommentElement(c))).SetClass("flex flex-col")
                                })
                        )
                },
                {
                    funcName: "add_image_to_note",
                    docs: "Adds an image to a node",
                    args: [{
                        name: "Id-key",
                        doc: "The property name where the ID of the note to close can be found",
                        defaultValue: "id"
                    }],
                    constr: (state, tags, args) => {
                        const isUploading = new UIEventSource(false);
                        const t = Translations.t.notes;
                        const id = tags.data[args[0] ?? "id"]

                        const uploader = new ImgurUploader(url => {
                            isUploading.setData(false)
                            state.osmConnection.addCommentToNote(id, url)
                            NoteCommentElement.addCommentTo(url, tags, state)

                        })

                        const label = new Combine([
                            Svg.camera_plus_ui().SetClass("block w-12 h-12 p-1 text-4xl "),
                            Translations.t.image.addPicture
                        ]).SetClass("p-2 border-4 border-black rounded-full font-bold h-full align-center w-full flex justify-center")

                        const fileSelector = new FileSelectorButton(label)
                        fileSelector.GetValue().addCallback(filelist => {
                            isUploading.setData(true)
                            uploader.uploadMany("Image for osm.org/note/" + id, "CC0", filelist)

                        })
                        const ti = Translations.t.image
                        const uploadPanel = new Combine([
                            fileSelector,
                            new Combine([ti.willBePublished, ti.cco]),
                            ti.ccoExplanation.SetClass("subtle text-sm"),
                            ti.respectPrivacy.SetClass("text-sm")
                        ]).SetClass("flex flex-col")
                        return new LoginToggle(new Toggle(
                            Translations.t.image.uploadingPicture.SetClass("alert"),
                            uploadPanel,
                            isUploading), t.loginToAddPicture, state)
                    }

                },
                {
                    funcName: "title",
                    args: [],
                    docs: "Shows the title of the popup. Useful for some cases, e.g. 'What is phone number of {title()}?'",
                    example: "`What is the phone number of {title()}`, which might automatically become `What is the phone number of XYZ`.",
                    constr: (state, tagsSource) =>
                        new VariableUiElement(tagsSource.map(tags => {
                            const layer = state.layoutToUse.getMatchingLayer(tags)
                            const title = layer?.title?.GetRenderValue(tags)
                            if (title === undefined) {
                                return undefined
                            }
                            return new SubstitutedTranslation(title, tagsSource, state)
                        }))
                },
                new NearbyImageVis(),
                new MapillaryLinkVis(),
                {
                    funcName: "maproulette_task",
                    args: [],
                    constr(state, tagSource, argument, guistate) {
                        let parentId = tagSource.data.mr_challengeId;
                        let challenge = Stores.FromPromise(Utils.downloadJsonCached(`https://maproulette.org/api/v2/challenge/${parentId}`, 24 * 60 * 60 * 1000));

                        let details = new VariableUiElement(challenge.map(challenge => {
                            let listItems: BaseUIElement[] = [];
                            let title: BaseUIElement;

                            if (challenge?.name) {
                                title = new Title(challenge.name);
                            }

                            if (challenge?.description) {
                                listItems.push(new FixedUiElement(challenge.description));
                            }

                            if (challenge?.instruction) {
                                listItems.push(new FixedUiElement(challenge.instruction));
                            }

                            if (listItems.length === 0) {
                                return undefined;
                            } else {
                                return [title, new List(listItems)];
                            }
                        }))
                        return details;
                    },
                    docs: "Show details of a MapRoulette task"
                },
                {
                    funcName: "statistics",
                    docs: "Show general statistics about the elements currently in view. Intended to use on the `current_view`-layer",
                    args: [],
                    constr: (state, tagsSource, args, guiState) => {
                        const elementsInview = new UIEventSource<{ distance: number, center: [number, number], element: OsmFeature, layer: LayerConfig }[]>([]);

                        function update() {
                            const mapCenter = <[number, number]>[state.locationControl.data.lon, state.locationControl.data.lon]
                            const bbox = state.currentBounds.data
                            const elements = state.featurePipeline.getAllVisibleElementsWithmeta(bbox).map(el => {
                                const distance = GeoOperations.distanceBetween(el.center, mapCenter)
                                return {...el, distance}
                            })
                            elements.sort((e0, e1) => e0.distance - e1.distance)
                            elementsInview.setData(elements)

                        }

                        state.currentBounds.addCallbackAndRun(update)
                        state.featurePipeline.newDataLoadedSignal.addCallback(update);
                        state.filteredLayers.addCallbackAndRun(fls => {
                            for (const fl of fls) {
                                fl.isDisplayed.addCallback(update)
                                fl.appliedFilters.addCallback(update)
                            }
                        })
                        return new StatisticsPanel(elementsInview, state)
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
                    constr(state, tags, args) {
                        return new VariableUiElement(tags.map(tags => {

                            const [to, subject, body, button_text] = args.map(str => Utils.SubstituteKeys(str, tags))
                            const url = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body)
                            return new SubtleButton(Svg.envelope_svg(), button_text, {
                                url
                            })

                        }))
                    }
                },
                {
                    funcName: "multi",
                    docs: "Given an embedded tagRendering (read only) and a key, will read the keyname as a JSON-list. Every element of this list will be considered as tags and rendered with the tagRendering",
                    example: "```json\n" + JSON.stringify({
                        render: {
                            special: {
                                type: "multi",
                                key: "_doors_from_building_properties",
                                tagRendering: {
                                    render: "The building containing this feature has a <a href='#{id}'>door</a> of width {entrance:width}"
                                }
                            }
                        }
                    }, null, "  ") + "```",
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
                        }
                    ]
                    ,
                    constr(state, featureTags, args) {
                        const [key, tr] = args
                        const translation = new Translation({"*": tr})
                        return new VariableUiElement(featureTags.map(tags => {
                            const properties: object[] = JSON.parse(tags[key])
                            const elements = []
                            for (const property of properties) {
                                const subsTr = new SubstitutedTranslation(translation, new UIEventSource<any>(property), state)
                                elements.push(subsTr)
                            }
                            return new List(elements)
                        }))
                    }
                },
                {
                    funcName: "steal",
                    docs: "Shows a tagRendering from a different object as if this was the object itself",
                    args: [{
                        name: "featureId",
                        doc: "The key of the attribute which contains the id of the feature from which to use the tags",
                        required: true
                    },
                        {
                            name: "tagRenderingId",
                            doc: "The layer-id and tagRenderingId to render. Can be multiple value if ';'-separated (in which case every value must also contain the layerId, e.g. `layerId.tagRendering0; layerId.tagRendering1`). Note: this can cause layer injection",
                            required: true
                        }],
                    constr(state, featureTags, args) {
                        const [featureIdKey, layerAndtagRenderingIds] = args
                        const tagRenderings: [LayerConfig, TagRenderingConfig][] = []
                        for (const layerAndTagRenderingId of layerAndtagRenderingIds.split(";")) {
                            const [layerId, tagRenderingId] = layerAndTagRenderingId.trim().split(".")
                            const layer = state.layoutToUse.layers.find(l => l.id === layerId)
                            const tagRendering = layer.tagRenderings.find(tr => tr.id === tagRenderingId)
                            tagRenderings.push([layer, tagRendering])
                        }
                        return new VariableUiElement(featureTags.map(tags => {
                            const featureId = tags[featureIdKey]
                            if (featureId === undefined) {
                                return undefined;
                            }
                            const otherTags = state.allElements.getEventSourceById(featureId)
                            const elements: BaseUIElement[] = []
                            for (const [layer, tagRendering] of tagRenderings) {
                                const el = new EditableTagRendering(otherTags, tagRendering, layer.units, state, {})
                                elements.push(el)
                            }
                            if (elements.length === 1) {
                                return elements[0]
                            }
                            return new Combine(elements).SetClass("flex flex-col");
                        }))
                    },

                    getLayerDependencies(args): string[] {
                        const [_, tagRenderingId] = args
                        if (tagRenderingId.indexOf(".") < 0) {
                            throw "Error: argument 'layerId.tagRenderingId' of special visualisation 'steal' should contain a dot"
                        }
                        const [layerId, __] = tagRenderingId.split(".")
                        return [layerId]
                    }
                }
            ]

        specialVisualizations.push(new AutoApplyButton(specialVisualizations))

        return specialVisualizations;
    }

}