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

interface TextFieldDef {
    name: string,
    explanation: string,
    isValid: ((s: string, country?: () => string) => boolean),
    reformat?: ((s: string, country?: () => string) => string),
    inputHelper?: (value: UIEventSource<string>, options?: {
        location: [number, number],
        mapBackgroundLayer?: UIEventSource<any>,
        args: (string | number | boolean | any)[]
        feature?: any
    }) => InputElement<string>,
    inputmode?: string
}

class WikidataTextField implements TextFieldDef {
    name = "wikidata"
    explanation =
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
        ]).AsMarkdown()


    public isValid(str) {

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

class OpeningHoursTextField implements TextFieldDef {
    name = "opening_hours"
    explanation =
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
}` + "\n```\n\n*Don't forget to pass the prefix and postfix in the rendering as well*: `{opening_hours_table(opening_hours,yes @ &LPARENS, &RPARENS )`"]).AsMarkdown()


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

export default class ValidatedTextField {

    public static tpList: TextFieldDef[] = [
        ValidatedTextField.tp(
            "string",
            "A basic string"),
        ValidatedTextField.tp(
            "text",
            "A string, but allows input of longer strings more comfortably (a text area)",
            undefined,
            undefined,
            undefined,
            "text"),

        ValidatedTextField.tp(
            "date",
            "A date",
            (str) => {
                const time = Date.parse(str);
                return !isNaN(time);
            },
            (str) => {
                const d = new Date(str);
                let month = '' + (d.getMonth() + 1);
                let day = '' + d.getDate();
                const year = d.getFullYear();

                if (month.length < 2)
                    month = '0' + month;
                if (day.length < 2)
                    day = '0' + day;

                return [year, month, day].join('-');
            },
            (value) => new SimpleDatePicker(value)),
        ValidatedTextField.tp(
            "direction",
            "A geographical direction, in degrees. 0° is north, 90° is east, ... Will return a value between 0 (incl) and 360 (excl)",
            (str) => {
                str = "" + str;
                return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) >= 0 && Number(str) <= 360
            }, str => str,
            (value, options) => {
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
            },
            "numeric"
        ),
        ValidatedTextField.tp(
            "length",
            "A geographical length in meters (rounded at two points). Will give an extra minimap with a measurement tool. Arguments: [ zoomlevel, preferredBackgroundMapType (comma separated) ], e.g. `[\"21\", \"map,photo\"]",
            (str) => {
                const t = Number(str)
                return !isNaN(t)
            },
            str => str,
            (value, options) => {
                const args = options.args ?? []
                let zoom = 19
                if (args[0]) {
                    zoom = Number(args[0])
                    if (isNaN(zoom)) {
                        console.error("Invalid zoom level for argument at 'length'-input. The offending argument is: ",args[0]," (using 19 instead)")
                        zoom = 19
                    }
                }

                // Bit of a hack: we project the centerpoint to the closes point on the road - if available
                if (options.feature !== undefined && options.feature.geometry.type !== "Point") {
                    const lonlat: [number, number] = [...options.location]
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
            },
            "decimal"
        ),
        new WikidataTextField(),

        ValidatedTextField.tp(
            "int",
            "A number",
            (str) => {
                str = "" + str;
                return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str))
            },
            str => "" + Number(str),
            undefined,
            "numeric"),
        ValidatedTextField.tp(
            "nat",
            "A positive number or zero",
            (str) => {
                str = "" + str;
                return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) >= 0
            },
            str => "" + Number(str),
            undefined,
            "numeric"),
        ValidatedTextField.tp(
            "pnat",
            "A strict positive number",
            (str) => {
                str = "" + str;
                return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) > 0
            },
            str => "" + Number(str),
            undefined,
            "numeric"),
        ValidatedTextField.tp(
            "float",
            "A decimal",
            (str) => !isNaN(Number(str)) && !str.endsWith(".") && !str.endsWith(","),
            str => "" + Number(str),
            undefined,
            "decimal"),
        ValidatedTextField.tp(
            "pfloat",
            "A positive decimal (incl zero)",
            (str) => !isNaN(Number(str)) && Number(str) >= 0 && !str.endsWith(".") && !str.endsWith(","),
            str => "" + Number(str),
            undefined,
            "decimal"),
        ValidatedTextField.tp(
            "email",
            "An email adress",
            (str) => EmailValidator.validate(str),
            undefined,
            undefined,
            "email"),
        ValidatedTextField.tp(
            "url",
            "A url",
            (str) => {
                try {
                    new URL(str);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            (str) => {
                try {
                    const url = new URL(str);
                    const blacklistedTrackingParams = [
                        "fbclid",// Oh god, how I hate the fbclid. Let it burn, burn in hell!
                        "gclid",
                        "cmpid", "agid", "utm", "utm_source", "utm_medium"]
                    for (const dontLike of blacklistedTrackingParams) {
                        url.searchParams.delete(dontLike)
                    }
                    let cleaned = url.toString();
                    if (cleaned.endsWith("/") && !str.endsWith("/")) {
                        // Do not add a trailing '/' if it wasn't typed originally
                        cleaned = cleaned.substr(0, cleaned.length - 1)
                    }
                    return cleaned;
                } catch (e) {
                    console.error(e)
                    return undefined;
                }
            },
            undefined,
            "url"),
        ValidatedTextField.tp(
            "phone",
            "A phone number",
            (str, country: () => string) => {
                if (str === undefined) {
                    return false;
                }
                return parsePhoneNumberFromString(str, (country())?.toUpperCase() as any)?.isValid() ?? false
            },
            (str, country: () => string) => parsePhoneNumberFromString(str, (country())?.toUpperCase() as any).formatInternational(),
            undefined,
            "tel"
        ),
        new OpeningHoursTextField(),
        ValidatedTextField.tp(
            "color",
            "Shows a color picker",
            () => true,
            str => str,
            (value) => {
                return new ColorPicker(value.map(color => {
                    return Utils.ColourNameToHex(color ?? "");
                }, [], str => Utils.HexToColourName(str)))
            }
        )
    ]
    /**
     * {string (typename) --> TextFieldDef}
     */
    public static AllTypes = ValidatedTextField.allTypesDict();

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
        feature?: any
    }): InputElement<string> {
        options = options ?? {};
        options.placeholder = options.placeholder ?? type;
        const tp: TextFieldDef = ValidatedTextField.AllTypes[type]
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
        if (tp.inputHelper) {
            const helper = tp.inputHelper(input.GetValue(), {
                location: options.location,
                mapBackgroundLayer: options.mapBackgroundLayer,
                args: options.args,
                feature: options.feature
            }).SetClass("block")
            input = new CombinedInputElement(input, helper,
                (a, _) => a, // We can ignore b, as they are linked earlier
                a => [a, a]
            ).SetClass("block w-full");
        }
        return input;
    }

    public static HelpText(): string {
        const explanations = ValidatedTextField.tpList.map(type => ["## " + type.name, "", type.explanation].join("\n")).join("\n\n")
        return new Combine([
            new Title("Available types for text fields", 1),
            "The listed types here trigger a special input element. Use them in `tagrendering.freeform.type` of your tagrendering to activate them",
            explanations
        ]).SetClass("flex flex-col").AsMarkdown()
    }

    private static tp(name: string,
                      explanation: string,
                      isValid?: ((s: string, country?: () => string) => boolean),
                      reformat?: ((s: string, country?: () => string) => string),
                      inputHelper?: (value: UIEventSource<string>, options?: {
                          location: [number, number],
                          mapBackgroundLayer: UIEventSource<any>,
                          args: string[],
                          feature: any
                      }) => InputElement<string>,
                      inputmode?: string): TextFieldDef {

        if (isValid === undefined) {
            isValid = () => true;
        }

        if (reformat === undefined) {
            reformat = (str, _) => str;
        }


        return {
            name: name,
            explanation: explanation,
            isValid: isValid,
            reformat: reformat,
            inputHelper: inputHelper,
            inputmode: inputmode
        }
    }


    private static allTypesDict() {
        const types = {};
        for (const tp of ValidatedTextField.tpList) {
            types[tp.name] = tp;
        }
        return types;
    }
}