import {DropDown} from "./DropDown";
import * as EmailValidator from "email-validator";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import InputElementMap from "./InputElementMap";
import {InputElement} from "./InputElement";
import {TextField} from "./TextField";
import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import CombinedInputElement from "./CombinedInputElement";
import SimpleDatePicker from "./SimpleDatePicker";
import OpeningHoursInput from "../OpeningHours/OpeningHoursInput";
import DirectionInput from "./DirectionInput";
import ColorPicker from "./ColorPicker";
import {Utils} from "../../Utils";

interface TextFieldDef {
    name: string,
    explanation: string,
    isValid: ((s: string, country?: () => string) => boolean),
    reformat?: ((s: string, country?: () => string) => string),
    inputHelper?: (value: UIEventSource<string>, options?: {
        location: [number, number]
    }) => InputElement<string>,

    inputmode?: string
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
            "wikidata",
            "A wikidata identifier, e.g. Q42"),
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
            "direction",
            "A geographical direction, in degrees. 0° is north, 90° is east, ... Will return a value between 0 (incl) and 360 (excl)",
            (str) => {
                str = "" + str;
                return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) >= 0 && Number(str) <= 360
            }, str => str,
            (value) => {
                return new DirectionInput(value);
            },
            "numeric"
        ),
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

    public static TypeDropdown(): DropDown<string> {
        const values: { value: string, shown: string }[] = [];
        const expl = ValidatedTextField.tpList;
        for (const key in expl) {
            values.push({value: expl[key].name, shown: `${expl[key].name} - ${expl[key].explanation}`})
        }
        return new DropDown<string>("", values)
    }

    public static InputForType(type: string, options?: {
        placeholder?: string | UIElement,
        value?: UIEventSource<string>,
        htmlType?: string,
        textArea?:boolean,
        inputMode?:string,
        textAreaRows?: number,
        isValid?: ((s: string, country: () => string) => boolean),
        country?: () => string,
        location?: [number /*lat*/, number /*lon*/]
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

        if (tp.inputHelper) {
            input = new CombinedInputElement(input, tp.inputHelper(input.GetValue(), {
                location: options.location
            }));
        }
        return input;
    }

    public static NumberInput(type: string = "int", extraValidation: (number: Number) => boolean = undefined): InputElement<number> {
        const isValid = ValidatedTextField.AllTypes[type].isValid;
        extraValidation = extraValidation ?? (() => true)

        const fromString = str => {
            if (!isValid(str)) {
                return undefined;
            }
            const n = Number(str);
            if (!extraValidation(n)) {
                return undefined;
            }
            return n;
        };
        const toString = num => {
            if (num === undefined) {
                return undefined;
            }
            return "" + num;
        };
        const textField = ValidatedTextField.InputForType(type);
        return new InputElementMap(textField, (n0, n1) => n0 === n1, fromString, toString)
    }

    public static KeyInput(allowEmpty: boolean = false): InputElement<string> {

        function fromString(str) {
            if (str?.match(/^[a-zA-Z][a-zA-Z0-9:_-]*$/)) {
                return str;
            }
            if (str === "" && allowEmpty) {
                return "";
            }

            return undefined
        }

        const toString = str => str

        function isSame(str0, str1) {
            return str0 === str1;
        }

        const textfield = new TextField({
            placeholder: "key",
            isValid: str => fromString(str) !== undefined,
            value: new UIEventSource<string>("")
        });

        return new InputElementMap(textfield, isSame, fromString, toString);
    }

    static Mapped<T>(fromString: (str) => T, toString: (T) => string, options?: {
        placeholder?: string | UIElement,
        type?: string,
        value?: UIEventSource<string>,
        startValidated?: boolean,
        textArea?: boolean,
        textAreaRows?: number,
        isValid?: ((string: string) => boolean),
        country?: () => string
    }): InputElement<T> {
        let textField: InputElement<string>;
        if (options?.type) {
            textField = ValidatedTextField.InputForType(options.type, options);
        } else {
            textField = new TextField(options);
        }
        return new InputElementMap(
            textField, (a, b) => a === b,
            fromString, toString
        );

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
                          location: [number, number]
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