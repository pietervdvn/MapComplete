import {UIElement} from "../UIElement";
import {InputElement} from "./InputElement";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import * as EmailValidator from "email-validator";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {DropDown} from "./DropDown";

export class ValidatedTextField {
    
    public static explanations = {
        "string": "A basic, 255-char string",
        "date": "A date",
        "wikidata": "A wikidata identifier, e.g. Q42",
        "int": "A number",
        "nat": "A positive number",
        "float": "A decimal",
        "pfloat": "A positive decimal",
        "email": "An email adress",
        "url": "A url",
        "phone": "A phone number"
    }
    
    public static TypeDropdown() : DropDown<string>{
        const values : {value: string, shown: string}[] = [];
        const expl = ValidatedTextField.explanations;
        for(const key in expl){
            values.push({value: key, shown: `${key} - ${expl[key]}`})
        }
        return new DropDown<string>("", values)
    }
    
    
    public static inputValidation = {
        "$": () => true,
        "string": () => true,
        "date": () => true, // TODO validate and add a date picker
        "wikidata": () => true, // TODO validate wikidata IDS
        "int": (str) => {str = ""+str; return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str))},
        "nat": (str) => {str = ""+str; return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) > 0},
        "float": (str) => !isNaN(Number(str)),
        "pfloat": (str) => !isNaN(Number(str)) && Number(str) >= 0,
        "email": (str) => EmailValidator.validate(str),
        "url": (str) => str,
        "phone": (str, country) => {
            return parsePhoneNumberFromString(str, country.toUpperCase())?.isValid() ?? false;
        }
    }

    public static formatting = {
        "phone": (str, country) => {
            console.log("country formatting", country)
            return parsePhoneNumberFromString(str, country.toUpperCase()).formatInternational()
        }
    }
}

export class TextField<T> extends InputElement<T> {
   
    public static StringInput(textArea: boolean = false): TextField<string> {
        return new TextField<string>({
            toString: str => str,
            fromString: str => str,
            textArea: textArea
        });
    }
    
    public static KeyInput(allowEmpty : boolean = false): TextField<string>{
        return new TextField<string>({
            placeholder: "key",
            fromString: str => {
                if (str?.match(/^[a-zA-Z][a-zA-Z0-9:_-]*$/)) {
                    return str;
                }
                if(str === "" && allowEmpty){
                    return "";
                }
                
                return undefined
            },
            toString: str => str
        });
    }
    
    public static NumberInput(type: string = "int", extraValidation: (number: Number) => boolean = undefined) : TextField<number>{
        const isValid = ValidatedTextField.inputValidation[type];
        extraValidation = extraValidation ?? (() => true)
        return new TextField({
            fromString: str => {
                if(!isValid(str)){
                    return undefined;
                }
                const n = Number(str);
                if(!extraValidation(n)){
                    return undefined;
                }
                return n;
            },
            toString: num => ""+num,
            placeholder: type
        });
    }


    private readonly value: UIEventSource<string>;
    private readonly mappedValue: UIEventSource<T>;
    public readonly enterPressed = new UIEventSource<string>(undefined);
    private readonly _placeholder: UIElement;
    private readonly _fromString?: (string: string) => T;
    private readonly _toString: (t: T) => string;
    private readonly startValidated: boolean;
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _isArea: boolean;
    private _textAreaRows: number;

    constructor(options: {
        /**
         * Shown as placeholder
         */
        placeholder?: string | UIElement,

        /**
         * Converts the T to a (canonical) string
         * @param t
         */
        toString: (t: T) => string,
        /**
         * Converts the string to a T
         * Returns undefined if invalid
         * @param string
         */
        fromString: (string: string) => T,
        value?: UIEventSource<T>,
        startValidated?: boolean,
        textArea?: boolean,
        textAreaRows?: number
    }) {
        super(undefined);
        const self = this;
        this.value = new UIEventSource<string>("");
        this._isArea = options.textArea ?? false;
        this.mappedValue = options?.value ?? new UIEventSource<T>(undefined);
        this.mappedValue.addCallback(() => self.InnerUpdate());

        // @ts-ignore
        this._fromString = options.fromString ?? ((str) => (str))
        this.value.addCallback((str) => this.mappedValue.setData(options.fromString(str)));
        this.mappedValue.addCallback((t) => this.value.setData(options.toString(t)));
        this._textAreaRows = options.textAreaRows;

        this._placeholder = Translations.W(options.placeholder ?? "");
        this.ListenTo(this._placeholder._source);
        this._toString = options.toString ?? ((t) => ("" + t));

        this.onClick(() => {
            self.IsSelected.setData(true)
        });
        this.mappedValue.addCallback((t) => {
            if (t === undefined || t === null) {
                return;
            }
            const field = document.getElementById('text-' + this.id);
            if (field === undefined || field === null) {
                return;
            }
            // @ts-ignore
            field.value = options.toString(t);
        });
        this.startValidated = options.startValidated ?? false;
    }

    GetValue(): UIEventSource<T> {
        return this.mappedValue;
    }
    InnerRender(): string {
        
        if(this._isArea){
            return `<textarea id="text-${this.id}" class="form-text-field" rows="${this._textAreaRows}" cols="50" style="max-width: 100%; width: 100%; box-sizing: border-box"></textarea>`
        }
        
        return `<form onSubmit='return false' class='form-text-field'>` +
            `<input type='text' placeholder='${this._placeholder.InnerRender()}' id='text-${this.id}'>` +
            `</form>`;
    }

    InnerUpdate() {
        const field = document.getElementById('text-' + this.id);
        if (field === null) {
            return;
        }

        this.mappedValue.addCallback((data) => {
            field.className = data !== undefined ? "valid" : "invalid";
        });

        field.className = this.mappedValue.data !== undefined ? "valid" : "invalid";

        const self = this;
        field.oninput = () => {
            // @ts-ignore
            self.value.setData(field.value);
        };

        field.addEventListener("focusin", () => self.IsSelected.setData(true));
        field.addEventListener("focusout", () => self.IsSelected.setData(false));


        field.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                // @ts-ignore
                self.enterPressed.setData(field.value);
            }
        });

        if (this.IsValid(this.mappedValue.data)) {
            const expected = this._toString(this.mappedValue.data);
            // @ts-ignore
            if (field.value !== expected) {
                // @ts-ignore
                field.value = expected;
            }
        }


    }

    IsValid(t: T): boolean {
        if(t === undefined || t === null){
            return false;
        }
        const result = this._toString(t);
        return result !== undefined && result !== null;
    }

    Clear() {
        const field = document.getElementById('text-' + this.id);
        if (field !== undefined) {
            // @ts-ignore
            field.value = "";
        }
    }
}