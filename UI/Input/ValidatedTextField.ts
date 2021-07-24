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
import {Unit} from "../../Customizations/JSON/Denomination";
import BaseUIElement from "../BaseUIElement";
import LengthInput from "./LengthInput";
import {GeoOperations} from "../../Logic/GeoOperations";

interface TextFieldDef {
    name: string,
    explanation: string,
    isValid: ((s: string, country?: () => string) => boolean),
    reformat?: ((s: string, country?: () => string) => string),
    inputHelper?: (value: UIEventSource<string>, options?: {
        location: [number, number],
        mapBackgroundLayer?: UIEventSource<any>,
        args: (string | number | boolean)[]
        feature?: any
    }) => InputElement<string>,
    inputmode?: string
}

export default class ValidatedTextField {

    public static bestLayerAt: (location: UIEventSource<Loc>, preferences: UIEventSource<string[]>) => any

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
                    options.mapBackgroundLayer = ValidatedTextField.bestLayerAt(
                        location, new UIEventSource<string[]>(args[1].split(","))
                    )
                }
                const di = new DirectionInput(options.mapBackgroundLayer, location, value)
                di.SetStyle("height: 20rem;");

                return di;
            },
            "numeric"
        ),
        ValidatedTextField.tp(
            "length",
            "A geographical length in meters (rounded at two points). Will give an extra minimap with a measurement tool. Arguments: [ zoomlevel, preferredBackgroundMapType (comma seperated) ], e.g. `[\"21\", \"map,photo\"]",
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
                        throw "Invalid zoom level for argument at 'length'-input"
                    }
                }
                
                // Bit of a hack: we project the centerpoint to the closes point on the road - if available
                if(options.feature){
                    const lonlat: [number, number] = [...options.location]
                    lonlat.reverse()
                    options.location = <[number,number]> GeoOperations.nearestPoint(options.feature, lonlat).geometry.coordinates
                    options.location.reverse()
                }
                options.feature
                
                const location = new UIEventSource<Loc>({
                    lat: options.location[0],
                    lon: options.location[1],
                    zoom: zoom
                })
                if (args[1]) {
                    // We have a prefered map!
                    options.mapBackgroundLayer = ValidatedTextField.bestLayerAt(
                        location, new UIEventSource<string[]>(args[1].split(","))
                    )
                }
                const li = new LengthInput(options.mapBackgroundLayer, location, value)
                li.SetStyle("height: 20rem;")
                return li;
            }
        ),
        ValidatedTextField.tp(
            "wikidata",
            "A wikidata identifier, e.g. Q42",
            (str) => {
                if (str === undefined) {
                    return false;
                }
                return (str.length > 1 && (str.startsWith("q") || str.startsWith("Q")) || str.startsWith("https://www.wikidata.org/wiki/Q"))
            },
            (str) => {
                if (str === undefined) {
                    return undefined;
                }
                const wd = "https://www.wikidata.org/wiki/";
                if (str.startsWith(wd)) {
                    str = str.substr(wd.length)
                }
                return str.toUpperCase();
            }),

        ValidatedTextField.tp(
            "int",
            "A number",
            (str) => {
                str = "" + str;
                return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str))
            },
            undefined,
            undefined,
            "numeric"),
        ValidatedTextField.tp(
            "nat",
            "A positive number or zero",
            (str) => {
                str = "" + str;
                return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) >= 0
            },
            undefined,
            undefined,
            "numeric"),
        ValidatedTextField.tp(
            "pnat",
            "A strict positive number",
            (str) => {
                str = "" + str;
                return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) > 0
            },
            undefined,
            undefined,
            "numeric"),
        ValidatedTextField.tp(
            "float",
            "A decimal",
            (str) => !isNaN(Number(str)),
            undefined,
            undefined,
            "decimal"),
        ValidatedTextField.tp(
            "pfloat",
            "A positive decimal (incl zero)",
            (str) => !isNaN(Number(str)) && Number(str) >= 0,
            undefined,
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
        ValidatedTextField.tp(
            "opening_hours",
            "Has extra elements to easily input when a POI is opened",
            () => true,
            str => str,
            (value) => {
                return new OpeningHoursInput(value);
            }
        ),
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
        options.isValid = isValid;
        options.inputMode = tp.inputmode;
        let input: InputElement<string> = new TextField(options);
        if (tp.reformat) {
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
            const unitDropDown = new DropDown("",
                unit.denominations.map(denom => {
                    return {
                        shown: denom.human,
                        value: denom
                    }
                })
            )
            unitDropDown.GetValue().setData(unit.defaultDenom)
            unitDropDown.SetClass("w-min")

            input = new CombinedInputElement(
                input,
                unitDropDown,
                // combine the value from the textfield and the dropdown into the resulting value that should go into OSM
                (text, denom) => denom?.canonicalValue(text, true) ?? undefined,
                (valueWithDenom: string) => {
                    // Take the value from OSM and feed it into the textfield and the dropdown
                    const withDenom = unit.findDenomination(valueWithDenom);
                    if (withDenom === undefined) {
                        // Not a valid value at all - we give it undefined and leave the details up to the other elements
                        return [undefined, undefined]
                    }
                    const [strippedText, denom] = withDenom
                    if (strippedText === undefined) {
                        return [undefined, undefined]
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
            })
            input = new CombinedInputElement(input, helper,
                (a, _) => a, // We can ignore b, as they are linked earlier
                a => [a, a]
            );
        }
        return input;
    }

    public static HelpText(): string {
        const explanations = ValidatedTextField.tpList.map(type => ["## " + type.name, "", type.explanation].join("\n")).join("\n\n")
        return "# Available types for text fields\n\nThe listed types here trigger a special input element. Use them in `tagrendering.freeform.type` of your tagrendering to activate them\n\n" + explanations
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