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

interface TextFieldDef {
    name: string,
    explanation: string,
    isValid: ((s: string, country?: string) => boolean),
    reformat?: ((s: string, country?: string) => string),
    inputHelper?: (value:UIEventSource<string>) => InputElement<string>,
}

export default class ValidatedTextField {


    private static tp(name: string,
                      explanation: string,
                      isValid?: ((s: string, country?: string) => boolean),
                      reformat?: ((s: string, country?: string) => string),
                      inputHelper?: (value: UIEventSource<string>) => InputElement<string>): TextFieldDef {

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
            inputHelper: inputHelper
        }
    }

    public static tpList: TextFieldDef[] = [
        ValidatedTextField.tp(
            "string",
            "A basic string"),
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
            }),
        ValidatedTextField.tp(
            "nat",
            "A positive number or zero",
            (str) => {
                str = "" + str;
                return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) >= 0
            }),
        ValidatedTextField.tp(
            "pnat",
            "A strict positive number",
            (str) => {
                str = "" + str;
                return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) > 0
            }),
        ValidatedTextField.tp(
            "float",
            "A decimal",
            (str) => !isNaN(Number(str))),
        ValidatedTextField.tp(
            "pfloat",
            "A positive decimal (incl zero)",
            (str) => !isNaN(Number(str)) && Number(str) >= 0),
        ValidatedTextField.tp(
            "email",
            "An email adress",
            (str) => EmailValidator.validate(str)),
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
            }, (str) => {
                try {
                    const url = new URL(str);
                    const blacklistedTrackingParams = [
                        "fbclid",// Oh god, how I hate the fbclid. Let it burn, burn in hell!
                        "gclid",
                        "cmpid", "agid", "utm", "utm_source","utm_medium"]
                    for (const dontLike of blacklistedTrackingParams) {
                        url.searchParams.delete(dontLike)
                    }
                    return url.toString();
                } catch (e) {
                    console.error(e)
                    return undefined;
                }
            }),
        ValidatedTextField.tp(
            "phone",
            "A phone number",
            (str, country: any) => {
                if (str === undefined) {
                    return false;
                }
                return parsePhoneNumberFromString(str, country?.toUpperCase())?.isValid() ?? false
            },
            (str, country: any) => parsePhoneNumberFromString(str, country?.toUpperCase()).formatInternational()
        )
    ]
    
    private static allTypesDict(){
        const types = {};
        for (const tp of ValidatedTextField.tpList) {
            types[tp.name] = tp;
        }
        return types;
    }

    public static TypeDropdown(): DropDown<string> {
        const values: { value: string, shown: string }[] = [];
        const expl = ValidatedTextField.tpList;
        for (const key in expl) {
            values.push({value: key, shown: `${expl[key].name} - ${expl[key].explanation}`})
        }
        return new DropDown<string>("", values)
    }

    public static AllTypes = ValidatedTextField.allTypesDict();

    public static InputForType(type: string, options?: {
        placeholder?: string | UIElement,
        value?: UIEventSource<string>,
        textArea?: boolean,
        textAreaRows?: number,
        isValid?: ((s: string, country: string) => boolean),
        country?: string
    }): InputElement<string> {
        options = options ?? {};
        options.placeholder = options.placeholder ?? type;
        const tp: TextFieldDef = ValidatedTextField.AllTypes[type]
        const isValidTp = tp.isValid;
        let isValid;
        if (options.isValid) {
            const optValid = options.isValid;
            isValid = (str, country) => {
                if(str === undefined){
                    return false;
                }
                return isValidTp(str, country ?? options.country) && optValid(str, country ?? options.country);
            }
        }else{
            isValid = isValidTp;
        }
        options.isValid = isValid;

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
            input = new CombinedInputElement(input, tp.inputHelper(input.GetValue()));
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
        country?: string
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
}