import {UIElement} from "../UIElement";
import {InputElement} from "./InputElement";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import * as EmailValidator from "email-validator";
import {parsePhoneNumberFromString} from "libphonenumber-js";
import {TagRenderingOptions} from "../../Customizations/TagRenderingOptions";
import {CustomLayoutFromJSON} from "../../Customizations/JSON/CustomLayoutFromJSON";
import {And, Tag} from "../../Logic/TagsFilter";

export class ValidatedTextField {
    public static inputValidation = {
        "$": (str) => true,
        "string": (str) => true,
        "date": (str) => true, // TODO validate and add a date picker
        "int": (str) => {str = ""+str; return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str))},
        "nat": (str) => {str = ""+str; return str !== undefined && str.indexOf(".") < 0 && !isNaN(Number(str)) && Number(str) > 0},
        "float": (str) => !isNaN(Number(str)),
        "pfloat": (str) => !isNaN(Number(str)) && Number(str) > 0,
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

    public static TagTextField(value: UIEventSource<Tag[]> = undefined, allowEmpty: boolean) {
        allowEmpty = allowEmpty ?? false;
        return new TextField<Tag[]>({
                placeholder: "Tags",
                fromString: str => {
                    const tags = CustomLayoutFromJSON.TagsFromJson(str);
                    console.log("Parsed",str," --> ",tags)
                    if (tags === []) {
                        if (allowEmpty) {
                            return []
                        } else {
                            return undefined;
                        }
                    }
                    return tags;
                }
                ,
                toString: (tags: Tag[]) => {
                    if (tags === undefined || tags === []) {
                        if (allowEmpty) {
                            return "";
                        } else {
                            return undefined;
                        }
                    }
                    return new And(tags).asHumanString(false);
                },
                value: value,
                startValidated: true
            }
        )
    }

    public static

    ValidatedTextField(type: string, options: { value?: UIEventSource<string>, country?: string })
        : TextField<string> {
        let isValid = ValidatedTextField.inputValidation[type];
        if (isValid === undefined
        ) {
            throw "Invalid type for textfield: " + type
        }
        let formatter = ValidatedTextField.formatting[type] ?? ((str) => str);
        return new TextField<string>({
            placeholder: type,
            toString: str => str,
            fromString: str => isValid(str, options?.country) ? formatter(str, options.country) : undefined,
            value: options.value,
            startValidated: true
        })

    }

}

export class TextField<T> extends InputElement<T> {


    private value: UIEventSource<string>;
    private mappedValue: UIEventSource<T>;
    /**
     * Pings and has the value data
     */
    public enterPressed = new UIEventSource<string>(undefined);
    private _placeholder: UIElement;
    private _fromString?: (string: string) => T;
    private _toString: (t: T) => string;
    private startValidated: boolean;


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
    }) {
        super(undefined);
        const self = this;
        this.value = new UIEventSource<string>("");

        this.mappedValue = options?.value ?? new UIEventSource<T>(undefined);
        this.mappedValue.addCallback(() => self.InnerUpdate());

        // @ts-ignore
        this._fromString = options.fromString ?? ((str) => (str))
        this.value.addCallback((str) => this.mappedValue.setData(options.fromString(str)));
        this.mappedValue.addCallback((t) => this.value.setData(options.toString(t)));


        this._placeholder = Translations.W(options.placeholder ?? "");
        this.ListenTo(this._placeholder._source);
        this._toString = options.toString ?? ((t) => ("" + t));


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

    ShowValue(t: T): boolean {
        if (!this.IsValid(t)) {
            return false;
        }
        this.mappedValue.setData(t);
    }

    InnerRender(): string {
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
            field.className = this.mappedValue.data !== undefined ? "valid" : "invalid";
        });
        
        field.className = this.mappedValue.data !== undefined ? "valid" : "invalid";

        const self = this;
        field.oninput = () => {
            // @ts-ignore
            self.value.setData(field.value);
        };

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