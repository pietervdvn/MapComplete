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
    private content: UIElement;

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
        })
    }

    InnerRender(): string {
        return this.content.Render();
    }


    CreateContent(): UIElement {
        let txt = this.translation?.txt;
        if (txt === undefined) {
            return new FixedUiElement("")
        }
        const tags = this.tags.data;
        for (const key in tags) {
            // Poor mans replace all
            txt = txt.split("{" + key + "}").join(tags[key]);
        }


        return new Combine(this.EvaluateSpecialComponents(txt));
    }

    public EvaluateSpecialComponents(template: string): UIElement[] {

        for (const knownSpecial of SpecialVisualizations.specialVisualizations) {

            // NOte: the '.*?' in the regex reads as 'any character, but in a non-greedy way'
            const matched = template.match(`(.*){${knownSpecial.funcName}\\((.*?)\\)}(.*)`);
            if (matched != null) {

                // We found a special component that should be brought to live
                const partBefore = this.EvaluateSpecialComponents(matched[1]);
                const argument = matched[2];
                const partAfter = this.EvaluateSpecialComponents(matched[3]);
                try {
                    const args = argument.trim().split(",").map(str => str.trim());
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
        args: { name: string, defaultValue?: string, doc: string }[]
    }[] =

        [
            {
                funcName: "image_carousel",
                docs: "Creates an image carousel for the given sources. An attempt will be made to guess what source is used. Supported: Wikidata identifiers, Wikipedia pages, Wikimedia categories, IMGUR (with attribution, direct links)",
                args: [{
                    name: "image tag(s)",
                    defaultValue: "image,image:*,wikidata,wikipedia,wikimedia_commons",
                    doc: "Image tag(s) where images are searched"
                }],
                constr: (tags, args) => {
                    if (args.length > 0) {
                        console.error("TODO HANDLE THESE ARGS") // TODO FIXME

                    }
                    return new ImageCarousel(tags);
                }
            },

            {
                funcName: "image_upload",
                docs: "Creates a button where a user can upload an image to IMGUR",
                args: [{
                    doc: "Image tag to add the URL to (or image-tag:0, image-tag:1 when multiple images are added)",
                    defaultValue: "image", name: "image-key"
                }],
                constr: (tags, args) => {
                    if (args.length > 0) {
                        console.error("TODO HANDLE THESE ARGS") // TODO FIXME

                    }
                    return new ImageUploadFlow(tags)
                }
            },
            {
                funcName: "opening_hours_table",
                docs: "Creates an opening-hours table. Usage: {opening_hours_table(opening_hours)} to create a table of the tag 'opening_hours'.",
                args: [{
                    name: "key",
                    defaultValue: "opening_hours",
                    doc: "The tag from which the table is constructed"
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

}