import {DropDown} from "./DropDown";
import * as EmailValidator from "email-validator";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import InputElementMap from "./InputElementMap";
import {InputElement} from "./InputElement";
import {TextField} from "./TextField";
import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class ValidatedTextField {


    private static tp(name: string,
                      explanation: string,
                      isValid?: ((s: string, country?: string) => boolean),
                      reformat?: ((s: string, country?: string) => string)): {
        name: string,
        explanation: string,
        isValid: ((s: string, country?: string) => boolean),
        reformat?: ((s: string, country?: string) => string)
    } {

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
            reformat: reformat
        }
    }

    public static tpList = [
        ValidatedTextField.tp(
            "string",
            "A basic string"),
        ValidatedTextField.tp(
            "date",
            "A date"),
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
            "A url"),
        ValidatedTextField.tp(
            "phone",
            "A phone number",
            (str, country: any) => {
                return parsePhoneNumberFromString(str, country?.toUpperCase())?.isValid() ?? false
            },
            (str, country: any) => {
                console.log("country formatting", country)
                return parsePhoneNumberFromString(str, country?.toUpperCase()).formatInternational()
            }
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
            values.push({value: key, shown: `${key} - ${expl[key]}`})
        }
        return new DropDown<string>("", values)
    }
    
    public static AllTypes = ValidatedTextField.allTypesDict();

    public static InputForType(type: string): TextField {
        
        return new TextField({
            placeholder: type,
            isValid: ValidatedTextField.AllTypes[type]
        })
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
        value?: UIEventSource<string>,
        startValidated?: boolean,
        textArea?: boolean,
        textAreaRows?: number,
        isValid?: ((string: string) => boolean)
    }): InputElement<T> {
        const textField = new TextField(options);
        return new InputElementMap(
            textField, (a, b) => a === b,
            fromString, toString
        );

    }
}