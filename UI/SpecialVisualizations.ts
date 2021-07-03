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
import {ImageSearcher} from "../Logic/Actors/ImageSearcher";
import BaseUIElement from "./BaseUIElement";
import LayerConfig from "../Customizations/JSON/LayerConfig";
import Title from "./Base/Title";
import Table from "./Base/Table";
import Histogram from "./BigComponents/Histogram";
import Loc from "../Models/Loc";
import {Utils} from "../Utils";
import BaseLayer from "../Models/BaseLayer";

export interface SpecialVisualization {
    funcName: string,
    constr: ((state: State, tagSource: UIEventSource<any>, argument: string[]) => BaseUIElement),
    docs: string,
    example?: string,
    args: { name: string, defaultValue?: string, doc: string }[]
}

export default class SpecialVisualizations {


    static constructMiniMap: (options?: {
        background?: UIEventSource<BaseLayer>,
        location?: UIEventSource<Loc>,
        allowMoving?: boolean
    }) => BaseUIElement;
    static constructShowDataLayer: (features: UIEventSource<{ feature: any; freshness: Date }[]>, leafletMap: UIEventSource<any>, layoutToUse: UIEventSource<any>, enablePopups?: boolean, zoomToFeatures?: boolean) => any;
    public static specialVisualizations: SpecialVisualization[] =
        [
            {
                funcName: "all_tags",
                docs: "Prints all key-value pairs of the object - used for debugging",
                args: [],
                constr: ((state: State, tags: UIEventSource<any>) => {
                    return new VariableUiElement(tags.map(tags => {
                        const parts = [];
                        for (const key in tags) {
                            if (!tags.hasOwnProperty(key)) {
                                continue;
                            }
                            parts.push(key + "=" + tags[key]);
                        }
                        return parts.join("<br/>")
                    })).SetStyle("border: 1px solid black; border-radius: 1em;padding:1em;display:block;")
                })
            },

            {
                funcName: "image_carousel",
                docs: "Creates an image carousel for the given sources. An attempt will be made to guess what source is used. Supported: Wikidata identifiers, Wikipedia pages, Wikimedia categories, IMGUR (with attribution, direct links)",
                args: [{
                    name: "image key/prefix",
                    defaultValue: "image",
                    doc: "The keys given to the images, e.g. if <span class='literal-code'>image</span> is given, the first picture URL will be added as <span class='literal-code'>image</span>, the second as <span class='literal-code'>image:0</span>, the third as <span class='literal-code'>image:1</span>, etc... "
                },
                    {
                        name: "smart search",
                        defaultValue: "true",
                        doc: "Also include images given via 'Wikidata', 'wikimedia_commons' and 'mapillary"
                    }],
                constr: (state: State, tags, args) => {
                    const imagePrefix = args[0];
                    const loadSpecial = args[1].toLowerCase() === "true";
                    const searcher: UIEventSource<{ key: string, url: string }[]> = ImageSearcher.construct(tags, imagePrefix, loadSpecial);

                    return new ImageCarousel(searcher, tags);
                }
            },

            {
                funcName: "image_upload",
                docs: "Creates a button where a user can upload an image to IMGUR",
                args: [{
                    name: "image-key",
                    doc: "Image tag to add the URL to (or image-tag:0, image-tag:1 when multiple images are added)",
                    defaultValue: "image"
                }],
                constr: (state: State, tags, args) => {
                    return new ImageUploadFlow(tags, args[0])
                }
            },
            {
                funcName: "minimap",
                docs: "A small map showing the selected feature. Note that no styling is applied, wrap this in a div",
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
                    const minimap = SpecialVisualizations.constructMiniMap(
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

                    SpecialVisualizations.constructShowDataLayer(
                        featuresToShow,
                        minimap["leafletMap"],
                        State.state.layoutToUse,
                        false,
                        true
                    )


                    minimap.SetStyle("overflow: hidden; pointer-events: none;")
                    return minimap;
                }
            },
            {
                funcName: "reviews",
                docs: "Adds an overview of the mangrove-reviews of this object. Mangrove.Reviews needs - in order to identify the reviewed object - a coordinate and a name. By default, the name of the object is given, but this can be overwritten",
                example: "<b>{reviews()}<b> for a vanilla review, <b>{reviews(name, play_forest)}</b> to review a play forest. If a name is known, the name will be used as identifier, otherwise 'play_forest' is used",
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
                }],
                constr: (state: State, tagSource: UIEventSource<any>, args) => {
                    return new OpeningHoursVisualization(tagSource, args[0])
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
                    doc: "A list of shorthands, of the format 'shorthandname:path.path.path'. Seperated by ;"
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


                            const title = state?.layoutToUse?.data?.title?.txt ?? "MapComplete";

                            let matchingLayer: LayerConfig = undefined;
                            for (const layer of (state?.layoutToUse?.data?.layers ?? [])) {
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
                                text: state?.layoutToUse?.data?.shortDescription?.txt ?? "MapComplete"
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
                                const unit = state.layoutToUse.data.units.filter(unit => unit.isApplicableToKey(key))[0]
                                if (unit === undefined) {
                                    return value;
                                }

                                return unit.asHumanLongValue(value);

                            },
                            [state.layoutToUse])
                    )
                }
            }

        ]
    static HelpMessage: BaseUIElement = SpecialVisualizations.GenHelpMessage();
    private static GenHelpMessage() {

        const helpTexts =
            SpecialVisualizations.specialVisualizations.map(viz => new Combine(
                [
                    new Title(viz.funcName, 3),
                    viz.docs,
                    new Table(["name", "default", "description"],
                        viz.args.map(arg => [arg.name, arg.defaultValue ?? "undefined", arg.doc])
                    ),
                    new Title("Example usage", 4),
                    new FixedUiElement(
                        viz.example ?? "{" + viz.funcName + "(" + viz.args.map(arg => arg.defaultValue).join(",") + ")}"
                    ).SetClass("literal-code"),

                ]
            ));


        return new Combine([
                new Title("Special tag renderings", 3),
                "In a tagrendering, some special values are substituted by an advanced UI-element. This allows advanced features and visualizations to be reused by custom themes or even to query third-party API's.",
                "General usage is `{func_name()}`, `{func_name(arg, someotherarg)}` or `{func_name(args):cssStyle}`. Note that you _do not_fcs need to use quotes around your arguments, the comma is enough to seperate them. This also implies you cannot use a comma in your args",
                ...helpTexts
            ]
        );
    }
}