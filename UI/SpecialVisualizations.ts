import {UIElement} from "./UIElement";
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
import OpeningHoursVisualization from "./OpeningHours/OhVisualization";

import State from "../State";
import {ImageSearcher} from "../Logic/Actors/ImageSearcher";

export default class SpecialVisualizations {

    public static specialVisualizations: {
        funcName: string,
        constr: ((state: State, tagSource: UIEventSource<any>, argument: string[]) => UIElement),
        docs: string,
        example?: string,
        args: { name: string, defaultValue?: string, doc: string }[]
    }[] =

        [{
            funcName: "all_tags",
            docs: "Prints all key-value pairs of the object - used for debugging",
            args: [],
            constr: ((state: State, tags: UIEventSource<any>) => {
                return new VariableUiElement(tags.map(tags => {
                    const parts = [];
                    for (const key in tags) {
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
                    const form = new ReviewForm((r, whenDone) => mangrove.AddReview(r, whenDone), state.osmConnection.userDetails);
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
                    let keyname = args[0];
                    if (keyname === undefined || keyname === "") {
                        keyname = keyname ?? "opening_hours"
                    }
                    return new OpeningHoursVisualization(tagSource, keyname)
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
                        const title = state.layoutToUse.data.title.txt;
                        let name = tagSource.data.name;
                        if (name) {
                            name = `${name} (${title})`
                        } else {
                            name = title;
                        }
                        let url = args[0] ?? ""
                        if (url === "") {
                            url = window.location.href
                        }
                        return new ShareButton(Svg.share_ui(), {
                            title: name,
                            url: url,
                            text: state.layoutToUse.data.shortDescription.txt
                        })
                    } else {
                        return new FixedUiElement("")
                    }

                }
            }

        ]
    static HelpMessage: UIElement = SpecialVisualizations.GenHelpMessage();

    private static GenHelpMessage() {

        const helpTexts =
            SpecialVisualizations.specialVisualizations.map(viz => new Combine(
                [
                    `<h3>${viz.funcName}</h3>`,
                    viz.docs,
                    "<ol>",
                    ...viz.args.map(arg => new Combine([
                        "<li>",
                        "<b>" + arg.name + "</b>: ",
                        arg.doc,
                        arg.defaultValue === undefined ? "" : (" Default: <span class='literal-code'>" + arg.defaultValue + "</span>"),
                        "</li>"
                    ])),
                    "</ol>",
                    "<b>Example usage: </b>",
                    new FixedUiElement(
                        viz.example ?? "{" + viz.funcName + "(" + viz.args.map(arg => arg.defaultValue).join(",") + ")}"
                    ).SetClass("literal-code"),

                ]
            ));


        return new Combine([
                "<h3>Special tag renderings</h3>",
                "In a tagrendering, some special values are substituted by an advanced UI-element. This allows advanced features and visualizations to be reused by custom themes or even to query third-party API's.",
                "General usage is <b>{func_name()}</b> or <b>{func_name(arg, someotherarg)}</b>. Note that you <i>do not</i> need to use quotes around your arguments, the comma is enough to seperate them. This also implies you cannot use a comma in your args",
                ...helpTexts

            ]
        );
    }
}