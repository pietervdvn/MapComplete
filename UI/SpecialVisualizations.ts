import {UIElement} from "./UIElement";
import OpeningHoursVisualization from "./OhVisualization";
import {UIEventSource} from "../Logic/UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";
import LiveQueryHandler from "../Logic/Web/LiveQueryHandler";
import {ImageCarousel} from "./Image/ImageCarousel";
import Translation from "./i18n/Translation";
import Combine from "./Base/Combine";
import {FixedUiElement} from "./Base/FixedUiElement";
import Locale from "../UI/i18n/Locale";
import {ImageUploadFlow} from "./Image/ImageUploadFlow";

export class SubstitutedTranslation extends UIElement {
    private readonly tags: UIEventSource<any>;
    private readonly translation: Translation;
    private content: UIElement[];

    constructor(
        translation: Translation,
        tags: UIEventSource<any>) {
        super(tags);
        this.translation = translation;
        this.tags = tags;
        const self = this;
        Locale.language.addCallbackAndRun(() => {
            self.content = self.CreateContent();
            self.Update();
        });
        this.dumbMode = false;
    }

    InnerRender(): string {
        return new Combine(this.content).Render();
    }


    private CreateContent(): UIElement[] {
        let txt = this.translation?.txt;
        if (txt === undefined) {
            return []
        }
        const tags = this.tags.data;
        for (const key in tags) {
            // Poor mans replace all
            txt = txt.split("{" + key + "}").join(tags[key]);
        }

        return this.EvaluateSpecialComponents(txt);
    }

    private EvaluateSpecialComponents(template: string): UIElement[] {

        for (const knownSpecial of SpecialVisualizations.specialVisualizations) {

            // NOte: the '.*?' in the regex reads as 'any character, but in a non-greedy way'
            const matched = template.match(`(.*){${knownSpecial.funcName}\\((.*?)\\)}(.*)`);
            if (matched != null) {

                // We found a special component that should be brought to live
                const partBefore = this.EvaluateSpecialComponents(matched[1]);
                const argument = matched[2].trim();
                const partAfter = this.EvaluateSpecialComponents(matched[3]);
                try {
                    const args = knownSpecial.args.map(arg => arg.defaultValue ?? "");
                    if (argument.length > 0) {
                        const realArgs = argument.split(",").map(str => str.trim());
                        for (let i = 0; i < realArgs.length; i++) {
                            if (args.length <= i) {
                                args.push(realArgs[i]);
                            } else {
                                args[i] = realArgs[i];
                            }
                        }
                    }


                    const element = knownSpecial.constr(this.tags, args);
                    return [...partBefore, element, ...partAfter]
                } catch (e) {
                    console.error(e);
                    return [...partBefore, ...partAfter]
                }
            }
        }

        // IF we end up here, no changes have to be made
        return [new FixedUiElement(template)];
    }

}

export default class SpecialVisualizations {

    public static specialVisualizations: {
        funcName: string,
        constr: ((tagSource: UIEventSource<any>, argument: string[]) => UIElement),
        docs: string,
        example?: string,
        args: { name: string, defaultValue?: string, doc: string }[]
    }[] =

        [
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
                constr: (tags, args) => {
                    return new ImageCarousel(tags, args[0], args[1].toLowerCase() === "true");
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
                constr: (tags, args) => {
                    return new ImageUploadFlow(tags, args[0])
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
                constr: (tagSource: UIEventSource<any>, args) => {
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
                constr: (tagSource: UIEventSource<any>, args) => {
                    const url = args[0];
                    const shorthands = args[1];
                    const neededValue = args[2];
                    const source = LiveQueryHandler.FetchLiveData(url, shorthands.split(";"));
                    return new VariableUiElement(source.map(data => data[neededValue] ?? "Loading..."));
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
                "In a tagrendering, some special values are substituted by an advanced UI-element. This allows advanced features and visualizations to be reused by custom themes or even to query third-party API's.",
                ...helpTexts

            ]
        );
    }
}