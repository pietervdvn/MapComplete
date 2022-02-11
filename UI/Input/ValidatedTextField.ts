import {DropDown} from "./DropDown";
import * as EmailValidator from "email-validator";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {InputElement} from "./InputElement";
import {TextField} from "./TextField";
import {UIEventSource} from "../../Logic/UIEventSource";
import CombinedInputElement from "./CombinedInputElement";
import SimpleDatePicker from "./SimpleDatePicker";
import OpeningHoursInput from "../OpeningHours/OpeningHoursInput";
import DirectionInput from "./DirectionInput";
import ColorPicker from "./ColorPicker";
import {Utils} from "../../Utils";
import Loc from "../../Models/Loc";
import BaseUIElement from "../BaseUIElement";
import LengthInput from "./LengthInput";
import {GeoOperations} from "../../Logic/GeoOperations";
import {Unit} from "../../Models/Unit";
import {FixedInputElement} from "./FixedInputElement";
import WikidataSearchBox from "../Wikipedia/WikidataSearchBox";
import Wikidata from "../../Logic/Web/Wikidata";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import Table from "../Base/Table";
import Combine from "../Base/Combine";
import Title from "../Base/Title";
import InputElementMap from "./InputElementMap";
import Translations from "../i18n/Translations";
import {Translation} from "../i18n/Translation";

class SimpleTextFieldDef {

    public readonly name: string;
    /*
    * An explanation for the theme builder.
    * This can indicate which special input element is used, ...
    * */
    public readonly explanation: string;
    public inputmode?: string = undefined

    constructor(explanation: string | BaseUIElement, name?: string) {
        this.name = name ?? this.constructor.name.toLowerCase();
        if (this.name.endsWith("textfield")) {
            this.name = this.name.substr(0, this.name.length - "TextField".length)
        }
        if (this.name.endsWith("textfielddef")) {
            this.name = this.name.substr(0, this.name.length - "TextFieldDef".length)
        }
        if (typeof explanation === "string") {

            this.explanation = explanation
        } else {
            this.explanation = explanation.AsMarkdown();
        }
    }

    public reformat(s: string, country?: () => string): string {
        return s;
    }

    /**
     * Modification to make before the string is uploaded to OSM
     */
    public postprocess(s: string): string {
        return s
    }

    public undoPostprocess(s: string): string {
        return s;
    }

    public inputHelper(value: UIEventSource<string>, options?: {
        location: [number, number],
        mapBackgroundLayer?: UIEventSource<any>,
        args: (string | number | boolean | any)[]
        feature?: any
    }): InputElement<string> {
        return undefined
    }

    isValid(s: string, country: (() => string) | undefined): boolean {
        return true;
    }
    
    getFeedback(s: string) : Translation {
        return undefined
    }


}

class WikidataTextField extends SimpleTextFieldDef {

    constructor() {
        super(new Combine([
            "A wikidata identifier, e.g. Q42.",
            new Title("Helper arguments"),
            new Table(["name", "doc"],
                [
                    ["key", "the value of this tag will initialize search (default: name)"],
                    ["options", new Combine(["A JSON-object of type `{ removePrefixes: string[], removePostfixes: string[] }`.",
                        new Table(
                            ["subarg", "doc"],
                            [["removePrefixes", "remove these snippets of text from the start of the passed string to search"],
                                ["removePostfixes", "remove these snippets of text from the end of the passed string to search"],
                            ]
                        )])
                    ]]),
            new Title("Example usage"),
            `The following is the 'freeform'-part of a layer config which will trigger a search for the wikidata item corresponding with the name of the selected feature. It will also remove '-street', '-square', ... if found at the end of the name

\`\`\`
"freeform": {
    "key": "name:etymology:wikidata",
    "type": "wikidata",
    "helperArgs": [
        "name",
        {
            "removePostfixes": [
                "street",
                "boulevard",
                "path",
                "square",
                "plaza",
            ]
        }
    ]
}
\`\`\``
        ]));
    }


    public isValid(str): boolean {

        if (str === undefined) {
            return false;
        }
        if (str.length <= 2) {
            return false;
        }
        return !str.split(";").some(str => Wikidata.ExtractKey(str) === undefined)
    }

    public reformat(str) {
        if (str === undefined) {
            return undefined;
        }
        let out = str.split(";").map(str => Wikidata.ExtractKey(str)).join("; ")
        if (str.endsWith(";")) {
            out = out + ";"
        }
        return out;
    }

    public inputHelper(currentValue, inputHelperOptions) {
        const args = inputHelperOptions.args ?? []
        const searchKey = args[0] ?? "name"

        let searchFor = <string>inputHelperOptions.feature?.properties[searchKey]?.toLowerCase()

        const options = args[1]
        if (searchFor !== undefined && options !== undefined) {
            const prefixes = <string[]>options["removePrefixes"]
            const postfixes = <string[]>options["removePostfixes"]
            for (const postfix of postfixes ?? []) {
                if (searchFor.endsWith(postfix)) {
                    searchFor = searchFor.substring(0, searchFor.length - postfix.length)
                    break;
                }
            }

            for (const prefix of prefixes ?? []) {
                if (searchFor.startsWith(prefix)) {
                    searchFor = searchFor.substring(prefix.length)
                    break;
                }
            }

        }

        return new WikidataSearchBox({
            value: currentValue,
            searchText: new UIEventSource<string>(searchFor)
        })
    }
}

class OpeningHoursTextField extends SimpleTextFieldDef {

    constructor() {
        super(new Combine([
                "Has extra elements to easily input when a POI is opened.",
                new Title("Helper arguments"),
                new Table(["name", "doc"],
                    [
                        ["options", new Combine([
                            "A JSON-object of type `{ prefix: string, postfix: string }`. ",
                            new Table(["subarg", "doc"],
                                [
                                    ["prefix", "Piece of text that will always be added to the front of the generated opening hours. If the OSM-data does not start with this, it will fail to parse"],
                                    ["postfix", "Piece of text that will always be added to the end of the generated opening hours"],
                                ])

                        ])
                        ]
                    ]),
                new Title("Example usage"),
                "To add a conditional (based on time) access restriction:\n\n```\n" + `
"freeform": {
    "key": "access:conditional",
    "type": "opening_hours",
    "helperArgs": [
        {
          "prefix":"no @ (",
          "postfix":")"
        }
    ]
}` + "\n```\n\n*Don't forget to pass the prefix and postfix in the rendering as well*: `{opening_hours_table(opening_hours,yes @ &LPARENS, &RPARENS )`"]),
            "opening_hours");
    }

    isValid() {
        return true
    }

    reformat(str) {
        return str
    }

    inputHelper(value: UIEventSource<string>, inputHelperOptions: {
        location: [number, number],
        mapBackgroundLayer?: UIEventSource<any>,
        args: (string | number | boolean | any)[]
        feature?: any
    }) {
        const args = (inputHelperOptions.args ?? [])[0]
        const prefix = <string>args?.prefix ?? ""
        const postfix = <string>args?.postfix ?? ""

        return new OpeningHoursInput(value, prefix, postfix)
    }
}

class UrlTextfieldDef extends SimpleTextFieldDef {

    inputmode: "url"

    constructor() {
        super("The validatedTextField will format URLs to always be valid and have a https://-header (even though the 'https'-part will be hidden from the user")
    }

    postprocess(str: string) {
        if (str === undefined) {
            return undefined
        }
        if (!str.startsWith("http://") || !str.startsWith("https://")) {
            return "https://" + str
        }
        return str;
    }

    undoPostprocess(str: string) {
        if (str === undefined) {
            return undefined
        }
        if (str.startsWith("http://")) {
            return str.substr("http://".length)
        }
        if (str.startsWith("https://")) {
            return str.substr("https://".length)
        }
        return str;
    }

    reformat(str: string): string {
        try {
            let url: URL
            str = str.toLowerCase()
            if (!str.startsWith("http://") && !str.startsWith("https://") && !str.startsWith("http:")) {
                url = new URL("https://" + str)
            } else {
                url = new URL(str);
            }
            const blacklistedTrackingParams = [
                "fbclid",// Oh god, how I hate the fbclid. Let it burn, burn in hell!
                "gclid",
                "cmpid", "agid", "utm", "utm_source", "utm_medium",
                "campaignid", "campaign", "AdGroupId", "AdGroup", "TargetId", "msclkid"]
            for (const dontLike of blacklistedTrackingParams) {
                url.searchParams.delete(dontLike.toLowerCase())
            }
            let cleaned = url.toString();
            if (cleaned.endsWith("/") && !str.endsWith("/")) {
                // Do not add a trailing '/' if it wasn't typed originally
                cleaned = cleaned.substr(0, cleaned.length - 1)
            }

            if (cleaned.startsWith("https://")) {
                cleaned = cleaned.substr("https://".length)
            }

            return cleaned;
        } catch (e) {
            console.error(e)
            return undefined;
        }
    }

    isValid(str: string): boolean {
        try {
            if (!str.startsWith("http://") && !str.startsWith("https://") &&
                !str.startsWith("http:")) {
                str = "https://" + str
            }
            const url = new URL(str);
            const dotIndex = url.host.indexOf(".")
            return dotIndex > 0 && url.host[url.host.length - 1] !== ".";
        } catch (e) {
            return false;
        }
    }
}

class StringTextField extends SimpleTextFieldDef {
    constructor() {
        super("A simple piece of text");
    }
}

class TextTextField extends SimpleTextFieldDef {
    inputmode: "text"

    constructor() {
        super("A longer piece of text");
    }
}

class DateTextField extends SimpleTextFieldDef {
    constructor() {
        super("A date with date picker");
    }

    isValid = (str) => {
        return !isNaN(new Date(str).getTime());
    }

    reformat(str) {
        const d = new Date(str);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    inputHelper(value) {
        return new SimpleDatePicker(value)
    }
}

class DirectionTextField extends SimpleTextFieldDef {
    inputMode = "numeric"

    constructor() {
        super("A geographical direction, in degrees. 0° is north, 90° is east, ... Will return a value between 0 (incl) and 360 (excl)");
    }

    isValid = (str) => {
        str = "" + str;
        return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) >= 0 && Number(str) <= 360
    }

    inputHelper = (value, options) => {
        const args = options.args ?? []
        let zoom = 19
        if (args[0]) {
            zoom = Number(args[0])
            if (isNaN(zoom)) {
                throw "Invalid zoom level for argument at 'length'-input"
            }
        }
        const location = new UIEventSource<Loc>({
            lat: options.location[0],
            lon: options.location[1],
            zoom: zoom
        })
        if (args[1]) {
            // We have a prefered map!
            options.mapBackgroundLayer = AvailableBaseLayers.SelectBestLayerAccordingTo(
                location, new UIEventSource<string[]>(args[1].split(","))
            )
        }
        const di = new DirectionInput(options.mapBackgroundLayer, location, value)
        di.SetStyle("max-width: 25rem;");

        return di;
    }
}

class LengthTextField extends SimpleTextFieldDef {
    inputMode: "decimal"

    constructor() {
        super(
            "A geographical length in meters (rounded at two points). Will give an extra minimap with a measurement tool. Arguments: [ zoomlevel, preferredBackgroundMapType (comma separated) ], e.g. `[\"21\", \"map,photo\"]"
        )
    }

    isValid = (str) => {
        const t = Number(str)
        return !isNaN(t)
    }

    inputHelper = (value, options) => {
        const args = options.args ?? []
        let zoom = 19
        if (args[0]) {
            zoom = Number(args[0])
            if (isNaN(zoom)) {
                console.error("Invalid zoom level for argument at 'length'-input. The offending argument is: ", args[0], " (using 19 instead)")
                zoom = 19
            }
        }

        // Bit of a hack: we project the centerpoint to the closes point on the road - if available
        if (options.feature !== undefined && options.feature.geometry.type !== "Point") {
            const lonlat = <[number, number]>[...options.location]
            lonlat.reverse()
            options.location = <[number, number]>GeoOperations.nearestPoint(options.feature, lonlat).geometry.coordinates
            options.location.reverse()
        }

        const location = new UIEventSource<Loc>({
            lat: options.location[0],
            lon: options.location[1],
            zoom: zoom
        })
        if (args[1]) {
            // We have a prefered map!
            options.mapBackgroundLayer = AvailableBaseLayers.SelectBestLayerAccordingTo(
                location, new UIEventSource<string[]>(args[1].split(","))
            )
        }
        const li = new LengthInput(options.mapBackgroundLayer, location, value)
        li.SetStyle("height: 20rem;")
        return li;
    }
}

class IntTextField extends SimpleTextFieldDef {
    inputMode = "numeric"

    constructor() {
        super("A number");
    }

    isValid = (str) => {
        str = "" + str;
        return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str))
    }

    reformat = str => "" + Number(str)
}

class NatTextField extends SimpleTextFieldDef {
    inputMode = "numeric"

    constructor() {
        super("A positive number or zero");
    }

    isValid = (str) => {
        str = "" + str;
        return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) >= 0
    }

    reformat = str => "" + Number(str)
}

class PNatTextField extends SimpleTextFieldDef {
    inputmode = "numeric"

    constructor() {
        super("A strict positive number");
    }

    isValid = (str) => {
        str = "" + str;
        return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) > 0
    }

    reformat = str => "" + Number(str)
}

class FloatTextField extends SimpleTextFieldDef {
    inputmode = "decimal"

    constructor() {
        super("A decimal");
    }

    isValid = (str) => !isNaN(Number(str)) && !str.endsWith(".") && !str.endsWith(",")

    reformat = str => "" + Number(str)
}

class PFloatTextField extends SimpleTextFieldDef {
    inputmode = "decimal"

    constructor() {
        super("A positive decimal (inclusive zero)");
    }

    isValid = (str) => !isNaN(Number(str)) && Number(str) >= 0 && !str.endsWith(".") && !str.endsWith(",")

    reformat = str => "" + Number(str)
}

class EmailTextField extends SimpleTextFieldDef {
    inputmode = "email"

    constructor() {
        super("An email adress");
    }

    isValid = (str) => {
        if (str.startsWith("mailto:")) {
            str = str.substring("mailto:".length)
        }
        return EmailValidator.validate(str);
    }

    reformat = str => {
        if (str === undefined) {
            return undefined
        }
        if (str.startsWith("mailto:")) {
            str = str.substring("mailto:".length)
        }
        return str;
    }
}

class PhoneTextField extends SimpleTextFieldDef {
    inputmode = "tel"

    constructor() {
        super("A phone number");
    }

    isValid = (str, country: () => string) => {
        if (str === undefined) {
            return false;
        }
        if (str.startsWith("tel:")) {
            str = str.substring("tel:".length)
        }
        return parsePhoneNumberFromString(str, (country())?.toUpperCase() as any)?.isValid() ?? false
    }

    reformat = (str, country: () => string) => {
        if (str.startsWith("tel:")) {
            str = str.substring("tel:".length)
        }
        return parsePhoneNumberFromString(str, (country())?.toUpperCase() as any).formatInternational();
    }
}

class ColorTextField extends SimpleTextFieldDef {
    constructor() {
        super("Shows a color picker");
    }

    inputHelper = (value) => {
        return new ColorPicker(value.map(color => {
            return Utils.ColourNameToHex(color ?? "");
        }, [], str => Utils.HexToColourName(str)))
    }
}

export default class ValidatedTextField {

    private static allTextfieldDefs: SimpleTextFieldDef[] = [
        new StringTextField(),
        new TextTextField(),
        new DateTextField(),
        new NatTextField(),
        new IntTextField(),
        new LengthTextField(),
        new DirectionTextField(),
        new WikidataTextField(),
        new PNatTextField(),
        new FloatTextField(),
        new PFloatTextField(),
        new EmailTextField(),
        new UrlTextfieldDef(),
        new PhoneTextField(),
        new OpeningHoursTextField(),
        new ColorTextField()
    ]
    public static AllTypes: Map<string, SimpleTextFieldDef> = ValidatedTextField.allTypesDict();

    public static InputForType(type: string, options?: {
        placeholder?: string | BaseUIElement,
        value?: UIEventSource<string>,
        htmlType?: string,
        textArea?: boolean,
        inputMode?: string,
        textAreaRows?: number,
        isValid?: ((s: string, country: () => string) => boolean),
        country?: () => string,
        location?: [number /*lat*/, number /*lon*/],
        mapBackgroundLayer?: UIEventSource<any>,
        unit?: Unit,
        args?: (string | number | boolean)[] // Extra arguments for the inputHelper,
        feature?: any,
        inputStyle?: string
    }): InputElement<string> {
        options = options ?? {};
        if (options.placeholder === undefined) {
            options.placeholder = Translations.t.validation[type]?.description ?? type
        }
        const tp: SimpleTextFieldDef = ValidatedTextField.AllTypes.get(type)
        const isValidTp = tp.isValid;
        let isValid;
        options.textArea = options.textArea ?? type === "text";
        if (options.isValid) {
            const optValid = options.isValid;
            isValid = (str, country) => {
                if (str === undefined) {
                    return false;
                }
                if (options.unit) {
                    str = options.unit.stripUnitParts(str)
                }
                return isValidTp(str, country ?? options.country) && optValid(str, country ?? options.country);
            }
        } else {
            isValid = isValidTp;
        }

        if (options.unit !== undefined && isValid !== undefined) {
            // Reformatting is handled by the unit in this case
            options.isValid = str => {
                const denom = options.unit.findDenomination(str);
                if (denom === undefined) {
                    return false;
                }
                const stripped = denom[0]
                console.log("Is valid? ", str, "stripped: ", stripped, "isValid:", isValid(stripped))
                return isValid(stripped)
            }
        } else {
            options.isValid = isValid;

        }


        options.inputMode = tp.inputmode;
        if (tp.inputmode === "text") {
            options.htmlType = "area"
        }


        let input: InputElement<string> = new TextField(options);
        if (tp.reformat && options.unit === undefined) {
            input.GetValue().addCallbackAndRun(str => {
                if (!options.isValid(str, options.country)) {
                    return;
                }
                const formatted = tp.reformat(str, options.country);
                input.GetValue().setData(formatted);
            })
        }

        if (options.unit) {
            // We need to apply a unit.
            // This implies:
            // We have to create a dropdown with applicable denominations, and fuse those values
            const unit = options.unit


            const isSingular = input.GetValue().map(str => str?.trim() === "1")

            const unitDropDown =
                unit.denominations.length === 1 ?
                    new FixedInputElement(unit.denominations[0].getToggledHuman(isSingular), unit.denominations[0])
                    : new DropDown("",
                        unit.denominations.map(denom => {
                            return {
                                shown: denom.getToggledHuman(isSingular),
                                value: denom
                            }
                        })
                    )
            unitDropDown.GetValue().setData(unit.defaultDenom)
            unitDropDown.SetClass("w-min")

            const fixedDenom = unit.denominations.length === 1 ? unit.denominations[0] : undefined
            input = new CombinedInputElement(
                input,
                unitDropDown,
                // combine the value from the textfield and the dropdown into the resulting value that should go into OSM
                (text, denom) => {
                    if (denom === undefined) {
                        return text
                    }
                    return denom?.canonicalValue(text, true)
                },
                (valueWithDenom: string) => {
                    // Take the value from OSM and feed it into the textfield and the dropdown
                    const withDenom = unit.findDenomination(valueWithDenom);
                    if (withDenom === undefined) {
                        // Not a valid value at all - we give it undefined and leave the details up to the other elements (but we keep the previous denomination)
                        return [undefined, fixedDenom]
                    }
                    const [strippedText, denom] = withDenom
                    if (strippedText === undefined) {
                        return [undefined, fixedDenom]
                    }
                    return [strippedText, denom]
                }
            ).SetClass("flex")
        }
        const helper = tp.inputHelper(input.GetValue(), {
            location: options.location,
            mapBackgroundLayer: options.mapBackgroundLayer,
            args: options.args,
            feature: options.feature
        })?.SetClass("block")
        if (helper !== undefined) {
            input = new CombinedInputElement(input, helper,
                (a, _) => a, // We can ignore b, as they are linked earlier
                a => [a, a]
            ).SetClass("block w-full");
        }
        if (tp.postprocess !== undefined) {
            input = new InputElementMap<string, string>(input,
                (a, b) => a === b,
                tp.postprocess,
                tp.undoPostprocess
            )
        }

        return input;
    }

    public static HelpText(): BaseUIElement {
        const explanations: BaseUIElement[] =
            ValidatedTextField.allTextfieldDefs.map(type =>
                new Combine([new Title(type.name, 3), type.explanation]).SetClass("flex flex-col"))
        return new Combine([
            new Title("Available types for text fields", 1),
            "The listed types here trigger a special input element. Use them in `tagrendering.freeform.type` of your tagrendering to activate them",
            ...explanations
        ]).SetClass("flex flex-col")
    }

    public static AvailableTypes(): string[] {
        return ValidatedTextField.allTextfieldDefs.map(tp => tp.name)
    }

    private static allTypesDict(): Map<string, SimpleTextFieldDef> {
        const types = new Map<string, SimpleTextFieldDef>();
        for (const tp of ValidatedTextField.allTextfieldDefs) {
            types[tp.name] = tp;
            types.set(tp.name, tp);
        }
        return types;
    }
}