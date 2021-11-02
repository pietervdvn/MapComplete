import {UIEventSource} from "../Logic/UIEventSource";
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
import State from "../State";
import BaseUIElement from "./BaseUIElement";
import Title from "./Base/Title";
import Table from "./Base/Table";
import Histogram from "./BigComponents/Histogram";
import Loc from "../Models/Loc";
import {Utils} from "../Utils";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import {ImportButtonSpecialViz} from "./BigComponents/ImportButton";
import {Tag} from "../Logic/Tags/Tag";
import StaticFeatureSource from "../Logic/FeatureSource/Sources/StaticFeatureSource";
import ShowDataMultiLayer from "./ShowDataLayer/ShowDataMultiLayer";
import Minimap from "./Base/Minimap";
import AllImageProviders from "../Logic/ImageProviders/AllImageProviders";
import WikipediaBox from "./Wikipedia/WikipediaBox";
import SimpleMetaTagger from "../Logic/SimpleMetaTagger";
import MultiApply from "./Popup/MultiApply";
import AllKnownLayers from "../Customizations/AllKnownLayers";
import ShowDataLayer from "./ShowDataLayer/ShowDataLayer";
import Link from "./Base/Link";
import List from "./Base/List";
import {OsmConnection} from "../Logic/Osm/OsmConnection";
import {SubtleButton} from "./Base/SubtleButton";
import ChangeTagAction from "../Logic/Osm/Actions/ChangeTagAction";
import {And} from "../Logic/Tags/And";
import Toggle from "./Input/Toggle";
import Img from "./Base/Img";
import FilteredLayer from "../Models/FilteredLayer";
import {DefaultGuiState} from "./DefaultGuiState";

export interface SpecialVisualization {
    funcName: string,
    constr: ((state: State, tagSource: UIEventSource<any>, argument: string[], guistate: DefaultGuiState) => BaseUIElement),
    docs: string,
    example?: string,
    args: { name: string, defaultValue?: string, doc: string }[]
}

export default class SpecialVisualizations {

    static tagsToApplyHelpText = Utils.Special_visualizations_tagsToApplyHelpText
    public static specialVisualizations: SpecialVisualization[] =
        [
            {
                funcName: "all_tags",
                docs: "Prints all key-value pairs of the object - used for debugging",
                args: [],
                constr: ((state: State, tags: UIEventSource<any>) => {
                    const calculatedTags = [].concat(
                        SimpleMetaTagger.lazyTags,
                        ...state.layoutToUse.layers.map(l => l.calculatedTags?.map(c => c[0]) ?? []))
                    return new VariableUiElement(tags.map(tags => {
                        const parts = [];
                        for (const key in tags) {
                            if (!tags.hasOwnProperty(key)) {
                                continue
                            }
                            let v = tags[key]
                            if (v === "") {
                                v = "<b>empty string</b>"
                            }
                            parts.push([key, v ?? "<b>undefined</b>"]);
                        }

                        for (const key of calculatedTags) {
                            const value = tags[key]
                            if (value === undefined) {
                                continue
                            }
                            parts.push(["<i>" + key + "</i>", value])
                        }

                        return new Table(
                            ["key", "value"],
                            parts
                        )
                    })).SetStyle("border: 1px solid black; border-radius: 1em;padding:1em;display:block;")
                })
            },
            {
                funcName: "image_carousel",
                docs: "Creates an image carousel for the given sources. An attempt will be made to guess what source is used. Supported: Wikidata identifiers, Wikipedia pages, Wikimedia categories, IMGUR (with attribution, direct links)",
                args: [{
                    name: "image key/prefix (multiple values allowed if comma-seperated)",
                    defaultValue: AllImageProviders.defaultKeys.join(","),
                    doc: "The keys given to the images, e.g. if <span class='literal-code'>image</span> is given, the first picture URL will be added as <span class='literal-code'>image</span>, the second as <span class='literal-code'>image:0</span>, the third as <span class='literal-code'>image:1</span>, etc... "
                }],
                constr: (state: State, tags, args) => {
                    let imagePrefixes: string[] = undefined;
                    if (args.length > 0) {
                        imagePrefixes = [].concat(...args.map(a => a.split(",")));
                    }
                    return new ImageCarousel(AllImageProviders.LoadImagesFor(tags, imagePrefixes), tags, imagePrefixes);
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
                constr: (state: State, tags, args) => {
                    return new ImageUploadFlow(tags, args[0], args[1])
                }
            },
            {
                funcName: "wikipedia",
                docs: "A box showing the corresponding wikipedia article - based on the wikidata tag",
                args: [
                    {
                        name: "keyToShowWikipediaFor",
                        doc: "Use the wikidata entry from this key to show the wikipedia article for",
                        defaultValue: "wikidata"
                    }
                ],
                example: "`{wikipedia()}` is a basic example, `{wikipedia(name:etymology:wikidata)}` to show the wikipedia page of whom the feature was named after. Also remember that these can be styled, e.g. `{wikipedia():max-height: 10rem}` to limit the height",
                constr: (_, tagsSource, args) =>
                    new VariableUiElement(
                        tagsSource.map(tags => tags[args[0]])
                            .map(wikidata => {
                                const wikidatas: string[] =
                                    Utils.NoEmpty(wikidata?.split(";")?.map(wd => wd.trim()) ?? [])
                                return new WikipediaBox(wikidatas)
                            })
                    )

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
                constr: (state, tagSource, args) => {

                    const keys = [...args]
                    keys.splice(0, 1)
                    const featureStore = state.allElements.ContainingFeatures
                    const featuresToShow: UIEventSource<{ freshness: Date, feature: any }[]> = tagSource.map(properties => {
                        const values: string[] = Utils.NoNull(keys.map(key => properties[key]))
                        const features: { freshness: Date, feature: any }[] = []
                        for (const value of values) {
                            let idList = [value]
                            if (value.startsWith("[")) {
                                // This is a list of values
                                idList = JSON.parse(value)
                            }

                            for (const id of idList) {
                                features.push({
                                    freshness: new Date(),
                                    feature: featureStore.get(id)
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
                            enablePopups: false,
                            zoomToFeatures: true,
                            layers: State.state.filteredLayers,
                            features: new StaticFeatureSource(featuresToShow, true),
                            allElements: State.state.allElements
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
                            enablePopups: false,
                            zoomToFeatures: true,
                            layerToShow: AllKnownLayers.sharedLayers.get("left_right_style"),
                            features: new StaticFeatureSource([copy], false),
                            allElements: State.state.allElements
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
                constr: (state: State, tags, args) => {
                    const tgs = tags.data;
                    const key = args[0] ?? "name"
                    let subject = tgs[key] ?? args[1];
                    if (subject === undefined || subject === "") {
                        return Translations.t.reviews.name_required;
                    }
                    const mangrove = MangroveReviews.Get(Number(tgs._lon), Number(tgs._lat),
                        encodeURIComponent(subject),
                        state.mangroveIdentity,
                        state.osmConnection._dryRun
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
                constr: (state: State, tagSource: UIEventSource<any>, args) => {
                    return new OpeningHoursVisualization(tagSource, args[0], args[1], args[2])
                }
            },
            {
                funcName: "live",
                docs: "Downloads a JSON from the given URL, e.g. '{live(example.org/data.json, shorthand:x.y.z, other:a.b.c, shorthand)}' will download the given file, will create an object {shorthand: json[x][y][z], other: json[a][b][c] out of it and will return 'other' or 'json[a][b][c]. This is made to use in combination with tags, e.g. {live({url}, {url:format}, needed_value)}",
                example: "{live({url},{url:format},hour)} {live(https://data.mobility.brussels/bike/api/counts/?request=live&featureID=CB2105,hour:data.hour_cnt;day:data.day_cnt;year:data.year_cnt,hour)}",
                args: [{
                    name: "Url", doc: "The URL to load"
                }, {
                    name: "Shorthands",
                    doc: "A list of shorthands, of the format 'shorthandname:path.path.path'. separated by ;"
                }, {
                    name: "path", doc: "The path (or shorthand) that should be returned"
                }],
                constr: (state: State, tagSource: UIEventSource<any>, args) => {
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
                        doc: "The key to be read and to generate a histogram from"
                    },
                    {
                        name: "title",
                        doc: "The text to put above the given values column",
                        defaultValue: ""
                    },
                    {
                        name: "countHeader",
                        doc: "The text to put above the counts",
                        defaultValue: ""
                    },
                    {
                        name: "colors*",
                        doc: "(Matches all resting arguments - optional) Matches a regex onto a color value, e.g. `3[a-zA-Z+-]*:#33cc33`"

                    }
                ],
                constr: (state: State, tagSource: UIEventSource<any>, args: string[]) => {

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

                    const listSource: UIEventSource<string[]> = tagSource
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
                    return new Histogram(listSource, args[1], args[2], assignColors)
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
                constr: (state: State, tagSource: UIEventSource<any>, args) => {
                    if (window.navigator.share) {

                        const generateShareData = () => {


                            const title = state?.layoutToUse?.title?.txt ?? "MapComplete";

                            let matchingLayer: LayerConfig = undefined;
                            for (const layer of (state?.layoutToUse?.layers ?? [])) {
                                if (layer.source.osmTags.matchesProperties(tagSource?.data)) {
                                    matchingLayer = layer
                                }
                            }
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
                docs: "Converts a short, canonical value into the long, translated text",
                example: "{canonical(length)} will give 42 metre (in french)",
                args: [{
                    name: "key",
                    doc: "The key of the tag to give the canonical text for"
                }],
                constr: (state, tagSource, args) => {
                    const key = args [0]
                    return new VariableUiElement(
                        tagSource.map(tags => tags[key]).map(value => {
                            if (value === undefined) {
                                return undefined
                            }
                            const allUnits = [].concat(...state.layoutToUse.layers.map(lyr => lyr.units))
                            const unit = allUnits.filter(unit => unit.isApplicableToKey(key))[0]
                            if (unit === undefined) {
                                return value;
                            }
                            return unit.asHumanLongValue(value);

                        })
                    )
                }
            },
            new ImportButtonSpecialViz(),
            {
                funcName: "multi_apply",
                docs: "A button to apply the tagging of this object onto a list of other features. This is an advanced feature for which you'll need calculatedTags",
                args: [
                    {name: "feature_ids", doc: "A JSOn-serialized list of IDs of features to apply the tagging on"},
                    {
                        name: "keys",
                        doc: "One key (or multiple keys, seperated by ';') of the attribute that should be copied onto the other features."
                    },
                    {name: "text", doc: "The text to show on the button"},
                    {
                        name: "autoapply",
                        doc: "A boolean indicating wether this tagging should be applied automatically if the relevant tags on this object are changed. A visual element indicating the multi_apply is still shown"
                    },
                    {
                        name: "overwrite",
                        doc: "If set to 'true', the tags on the other objects will always be overwritten. The default behaviour will be to only change the tags on other objects if they are either undefined or had the same value before the change"
                    }
                ],
                example: "{multi_apply(_features_with_the_same_name_within_100m, name:etymology:wikidata;name:etymology, Apply etymology information on all nearby objects with the same name)}",
                constr: (state, tagsSource, args) => {
                    const featureIdsKey = args[0]
                    const keysToApply = args[1].split(";")
                    const text = args[2]
                    const autoapply = args[3]?.toLowerCase() === "true"
                    const overwrite = args[4]?.toLowerCase() === "true"
                    const featureIds: UIEventSource<string[]> = tagsSource.map(tags => {
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
            {
                funcName: "tag_apply",
                docs: "Shows a big button; clicking this button will apply certain tags onto the feature.\n\nThe first argument takes a specification of which tags to add.\n" + SpecialVisualizations.tagsToApplyHelpText,
                args: [
                    {
                        name: "tags_to_apply",
                        doc: "A specification of the tags to apply"
                    },
                    {
                        name: "message",
                        doc: "The text to show to the contributor"
                    },
                    {
                        name: "image",
                        doc: "An image to show to the contributor on the button"
                    },
                    {
                        name: "id_of_object_to_apply_this_one",
                        defaultValue: undefined,
                        doc: "If specified, applies the the tags onto _another_ object. The id will be read from properties[id_of_object_to_apply_this_one] of the selected object. The tags are still calculated based on the tags of the _selected_ element"
                    }
                ],
                example: "`{tag_apply(survey_date:=$_now:date, Surveyed today!)}`",
                constr: (state, tags, args) => {
                    const tagsToApply = SpecialVisualizations.generateTagsToApply(args[0], tags)
                    const msg = args[1]
                    let image = args[2]?.trim()
                    if (image === "" || image === "undefined") {
                        image = undefined
                    }
                    const targetIdKey = args[3]
                    const t = Translations.t.general.apply_button
                    
                    const tagsExplanation = new VariableUiElement(tagsToApply.map(tagsToApply => {
                            const tagsStr = tagsToApply.map(t => t.asHumanString(false, true)).join("&");
                            let el: BaseUIElement = new FixedUiElement(tagsStr)
                            if(targetIdKey !== undefined){
                                 const targetId = tags.data[targetIdKey] ?? tags.data.id
                                el = t.appliedOnAnotherObject.Subs({tags: tagsStr , id: targetId })
                            }
                            return el;
                        }
                    )).SetClass("subtle")
                    
                    const applied = new UIEventSource(false)
                    const applyButton = new SubtleButton(image, new Combine([msg, tagsExplanation]).SetClass("flex flex-col"))
                        .onClick(() => {
                            const targetId = tags.data[ targetIdKey] ?? tags.data.id
                            const changeAction = new ChangeTagAction(targetId,
                                new And(tagsToApply.data),
                                tags.data, // We pass in the tags of the selected element, not the tags of the target element!
                                {
                                    theme: state.layoutToUse.id,
                                    changeType: "answer"
                                }
                            )
                            state.changes.applyAction(changeAction)
                            applied.setData(true)
                        })

                    
                    return new Toggle(
                        new Toggle(
                         t.isApplied.SetClass("thanks"),   
                        applyButton,
                            applied
                        )
                        , undefined, state.osmConnection.isLoggedIn)
                }
            }
        ]

    static generateTagsToApply(spec: string, tagSource: UIEventSource<any>): UIEventSource<Tag[]> {

        const tgsSpec = spec.split(";").map(spec => {
            const kv = spec.split("=").map(s => s.trim());
            if (kv.length != 2) {
                throw "Invalid key spec: multiple '=' found in " + spec
            }
            return kv
        })
        return tagSource.map(tags => {
            const newTags: Tag [] = []
            for (const [key, value] of tgsSpec) {
                if (value.indexOf('$') >= 0) {

                    let parts = value.split("$")
                    // THe first of the split won't start with a '$', so no substitution needed
                    let actualValue = parts[0]
                    parts.shift()

                    for (const part of parts) {
                        const [_, varName, leftOver] = part.match(/([a-zA-Z0-9_:]*)(.*)/)
                        actualValue += (tags[varName] ?? "") + leftOver
                    }
                    newTags.push(new Tag(key, actualValue))
                } else {
                    newTags.push(new Tag(key, value))
                }
            }
            return newTags
        })

    }

    public static HelpMessage() {

        const helpTexts =
            SpecialVisualizations.specialVisualizations.map(viz => new Combine(
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
                    new Title("Example usage", 4),
                    new FixedUiElement(
                        viz.example ?? "`{" + viz.funcName + "(" + viz.args.map(arg => arg.defaultValue).join(",") + ")}`"
                    ).SetClass("literal-code"),

                ]
            ));


        const toc = new List(
            SpecialVisualizations.specialVisualizations.map(viz => new Link(viz.funcName, "#" + viz.funcName))
        )

        return new Combine([
                new Title("Special tag renderings", 3),
                "In a tagrendering, some special values are substituted by an advanced UI-element. This allows advanced features and visualizations to be reused by custom themes or even to query third-party API's.",
                "General usage is `{func_name()}`, `{func_name(arg, someotherarg)}` or `{func_name(args):cssStyle}`. Note that you _do not_ need to use quotes around your arguments, the comma is enough to separate them. This also implies you cannot use a comma in your args",
                toc,
                ...helpTexts
            ]
        ).SetClass("flex flex-col");
    }

}