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

export class TextFieldDef {

    public readonly name: string;
    /*
    * An explanation for the theme builder.
    * This can indicate which special input element is used, ...
    * */
    public readonly explanation: string;
    protected inputmode?: string = undefined

    constructor(name: string,
                explanation: string | BaseUIElement) {
        this.name = name;
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

    protectedisValid(s: string, _: (() => string) | undefined): boolean {
        return true;
    }

    public getFeedback(s: string): Translation {
        const tr = Translations.t.validation[this.name]
        if(tr !== undefined){
            return tr["feedback"]
        }
    }

    public ConstructInputElement(options: {
        value?: UIEventSource<string>,
        inputStyle?: string,
        feedback?: UIEventSource<Translation>
        placeholder?: string | BaseUIElement,
        country?: () => string,
        location?: [number /*lat*/, number /*lon*/],
        mapBackgroundLayer?: UIEventSource<any>,
        unit?: Unit,
        args?: (string | number | boolean)[] // Extra arguments for the inputHelper,
        feature?: any,
    } = {}): InputElement<string> {

        if (options.placeholder === undefined) {
            options.placeholder = Translations.t.validation[this.name]?.description ?? this.name
        }

        options["textArea"] = this.name === "text";

        const self = this;

        if (options.unit !== undefined) {
            // Reformatting is handled by the unit in this case
            options["isValid"] = str => {
                const denom = options.unit.findDenomination(str);
                if (denom === undefined) {
                    return false;
                }
                const stripped = denom[0]
                return self.isValid(stripped, options.country)
            }
        } else {
            options["isValid"] = str => self.isValid(str, options.country);
        }


        options["inputMode"] = this.inputmode;
        if (this.inputmode === "text") {
            options["htmlType"] = "area"
        }


        const textfield = new TextField(options);
        let input: InputElement<string> = textfield
        if (options.feedback) {
            textfield.GetRawValue().addCallback(v => {
                if(self.isValid(v, options.country)){
                    options.feedback.setData(undefined)
                }else{
                options.feedback.setData(self.getFeedback(v))
                }
            })
        }


        if (this.reformat && options.unit === undefined) {
            input.GetValue().addCallbackAndRun(str => {
                if (!options["isValid"](str, options.country)) {
                    return;
                }
                const formatted = this.reformat(str, options.country);
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
        const helper = this.inputHelper(input.GetValue(), {
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
        if (this.postprocess !== undefined) {
            input = new InputElementMap<string, string>(input,
                (a, b) => a === b,
                this.postprocess,
                this.undoPostprocess
            )
        }

        return input;
    }

    protected isValid(string: string, requestCountry: () => string): boolean {
        return true;
    }

    protected reformat(s: string, country?: () => string): string {
        return s;
    }

    /**
     * Modification to make before the string is uploaded to OSM
     */
    protected postprocess(s: string): string {
        return s
    }

    protected undoPostprocess(s: string): string {
        return s;
    }

    protected inputHelper(value: UIEventSource<string>, options?: {
        location: [number, number],
        mapBackgroundLayer?: UIEventSource<any>,
        args: (string | number | boolean | any)[]
        feature?: any
    }): InputElement<string> {
        return undefined
    }


}

class WikidataTextField extends TextFieldDef {

    constructor() {
        super(
            "wikidata",
            new Combine([
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

class OpeningHoursTextField extends TextFieldDef {

    constructor() {
        super(
            "opening_hours",
            new Combine([
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
}` + "\n```\n\n*Don't forget to pass the prefix and postfix in the rendering as well*: `{opening_hours_table(opening_hours,yes @ &LPARENS, &RPARENS )`"]),);
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

class UrlTextfieldDef extends TextFieldDef {

    inputmode: "url"

    constructor() {
        super("url", "The validatedTextField will format URLs to always be valid and have a https://-header (even though the 'https'-part will be hidden from the user")
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

class StringTextField extends TextFieldDef {
    constructor() {
        super("string", "A simple piece of text");
    }
}

class TextTextField extends TextFieldDef {
    inputmode: "text"

    constructor() {
        super("text", "A longer piece of text");
    }
}

class DateTextField extends TextFieldDef {
    constructor() {
        super("date", "A date with date picker");
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


class LengthTextField extends TextFieldDef {
    inputMode: "decimal"

    constructor() {
        super(
            "decimal", "A geographical length in meters (rounded at two points). Will give an extra minimap with a measurement tool. Arguments: [ zoomlevel, preferredBackgroundMapType (comma separated) ], e.g. `[\"21\", \"map,photo\"]"
        )
    }

    isValid = (str) => {
        const t = Number(str)
        return !isNaN(t)
    }

    inputHelper = (value, options) => {
        options = options ?? {}
        options.location = options.location ?? [0, 0]

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
        if (options?.feature !== undefined && options.feature.geometry.type !== "Point") {
            const lonlat = <[number, number]>[...options.location]
            lonlat.reverse(/*Changes a clone, this is safe */)
            options.location = <[number, number]>GeoOperations.nearestPoint(options.feature, lonlat).geometry.coordinates
            options.location.reverse(/*Changes a clone, this is safe */)
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
        const li = new LengthInput(options?.mapBackgroundLayer, location, value)
        li.SetStyle("height: 20rem;")
        return li;
    }
}

class FloatTextField extends TextFieldDef {
    inputmode = "decimal"

    constructor(name?: string, explanation?: string) {
        super(name ?? "float", explanation ?? "A decimal");
    }

    isValid(str) {
        return !isNaN(Number(str)) && !str.endsWith(".") && !str.endsWith(",")
    }

    reformat( str): string {
        return "" + Number(str);
    }

    getFeedback(s: string): Translation {
        if (isNaN(Number(s))) {
            return Translations.t.validation.nat.notANumber
        }

        return undefined
    }
}

class IntTextField extends FloatTextField {
    inputMode = "numeric"

    constructor(name?: string, explanation?: string) {
        super(name ?? "int", explanation ?? "A number");
    }

    isValid(str): boolean {
        str = "" + str;
        return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str))
    }

    getFeedback(s: string): Translation {
        const n = Number(s)
        if (isNaN(n)) {
            return Translations.t.validation.nat.notANumber
        }
        if (Math.floor(n) !== n) {
            return Translations.t.validation.nat.mustBeWhole
        }
        return undefined
    }

}

class NatTextField extends IntTextField {
    inputMode = "numeric"

    constructor(name?: string, explanation?: string) {
        super(name ?? "nat", explanation ?? "A positive number or zero");
    }

    isValid(str): boolean {
        if (str === undefined) {
            return false;
        }
        str = "" + str;

        return str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) >= 0
    }


    getFeedback(s: string): Translation {
        const spr = super.getFeedback(s)
        if (spr !== undefined) {
            return spr
        }
        const n = Number(s)
        if (n < 0) {
            return Translations.t.validation.nat.mustBePositive
        }
        return undefined
    }
}

class PNatTextField extends NatTextField {
    inputmode = "numeric"

    constructor() {
        super("pnat", "A strict positive number");
    }

    getFeedback(s: string): Translation {
        const spr = super.getFeedback(s);
        if (spr !== undefined) {
            return spr
        }
        if (Number(s) === 0) {
            return Translations.t.validation.pnat.noZero
        }
        return undefined
    }

    isValid = (str) => {
        if (!super.isValid(str)) {
            return false
        }
        return Number(str) > 0
    }

}

class PFloatTextField extends FloatTextField {
    inputmode = "decimal"

    constructor() {
        super("pfloat", "A positive decimal (inclusive zero)");
    }

    isValid = (str) => !isNaN(Number(str)) && Number(str) >= 0 && !str.endsWith(".") && !str.endsWith(",")

    getFeedback(s: string): Translation {
        const spr = super.getFeedback(s);
        if (spr !== undefined) {
            return spr
        }
        if (Number(s) < 0) {
            return Translations.t.validation.nat.mustBePositive
        }
        return undefined;
    }
}

class EmailTextField extends TextFieldDef {
    inputmode = "email"

    constructor() {
        super("email", "An email adress");
    }

    isValid = (str) => {
        if (str === undefined) {
            return false
        }
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
    
    getFeedback(s: string): Translation {
        if(s.indexOf('@') < 0){return Translations.t.validation.email.noAt}
        
        return super.getFeedback(s);
    }
}

class PhoneTextField extends TextFieldDef {
    inputmode = "tel"

    constructor() {
        super("phone", "A phone number");
    }

    isValid(str, country: () => string): boolean {
        if (str === undefined) {
            return false;
        }
        if (str.startsWith("tel:")) {
            str = str.substring("tel:".length)
        }
        let countryCode = undefined
        if(country !== undefined){
            countryCode = (country())?.toUpperCase()
        }
        return parsePhoneNumberFromString(str, countryCode)?.isValid() ?? false
    }

    reformat = (str, country: () => string) => {
        if (str.startsWith("tel:")) {
            str = str.substring("tel:".length)
        }
        return parsePhoneNumberFromString(str, (country())?.toUpperCase() as any)?.formatInternational();
    }
}

class ColorTextField extends TextFieldDef {
    constructor() {
        super("color", "Shows a color picker");
    }

    inputHelper = (value) => {
        return new ColorPicker(value.map(color => {
            return Utils.ColourNameToHex(color ?? "");
        }, [], str => Utils.HexToColourName(str)))
    }
}

class DirectionTextField extends IntTextField {
    inputMode = "numeric"

    constructor() {
        super("direction", "A geographical direction, in degrees. 0° is north, 90° is east, ... Will return a value between 0 (incl) and 360 (excl)");
    }
    
    reformat(str): string {
        const n = (Number(str) % 360) 
        return ""+n
    }

  
    inputHelper = (value, options) => {
        const args = options.args ?? []
        options.location = options.location ?? [0, 0]
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


export default class ValidatedTextField {

    private static AllTextfieldDefs: TextFieldDef[] = [
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
    public static allTypes: Map<string, TextFieldDef> = ValidatedTextField.allTypesDict();
    public static ForType(type: string = "string"): TextFieldDef {
        return ValidatedTextField.allTypes.get(type)
    }

    public static HelpText(): BaseUIElement {
        const explanations: BaseUIElement[] =
            ValidatedTextField.AllTextfieldDefs.map(type =>
                new Combine([new Title(type.name, 3), type.explanation]).SetClass("flex flex-col"))
        return new Combine([
            new Title("Available types for text fields", 1),
            "The listed types here trigger a special input element. Use them in `tagrendering.freeform.type` of your tagrendering to activate them",
            ...explanations
        ]).SetClass("flex flex-col")
    }

    public static AvailableTypes(): string[] {
        return ValidatedTextField.AllTextfieldDefs.map(tp => tp.name)
    }

    private static allTypesDict(): Map<string, TextFieldDef> {
        const types = new Map<string, TextFieldDef>();
        for (const tp of ValidatedTextField.AllTextfieldDefs) {
            types[tp.name] = tp;
            types.set(tp.name, tp);
        }
        return types;
    }
}