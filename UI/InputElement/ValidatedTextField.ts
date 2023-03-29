import BaseUIElement from "../BaseUIElement"
import Combine from "../Base/Combine"
import Title from "../Base/Title"
import Translations from "../i18n/Translations"
import { Translation } from "../i18n/Translation"
import WikidataValidator from "./Validators/WikidataValidator"
import StringValidator from "./Validators/StringValidator"
import TextValidator from "./Validators/TextValidator"
import DateValidator from "./Validators/DateValidator"
import LengthValidator from "./Validators/LengthValidator"
import IntValidator from "./Validators/IntValidator"
import EmailValidator from "./Validators/EmailValidator"
import DirectionValidator from "./Validators/DirectionValidator"
import NatValidator from "./Validators/NatValidator"
import OpeningHoursValidator from "./Validators/OpeningHoursValidator"
import PFloatValidator from "./Validators/PFloatValidator"
import ColorValidator from "./Validators/ColorValidator"
import PhoneValidator from "./Validators/PhoneValidator"
import UrlValidator from "./Validators/UrlValidator"
import FloatValidator from "./Validators/FloatValidator"
import PNatValidator from "./Validators/PNatValidator"

/**
 * A 'TextFieldValidator' contains various methods to check and cleanup an entered value or to give feedback.
 * They also double as an index of supported types for textfields in MapComplete
 */
export abstract class Validator {
    public readonly name: string
    /*
     * An explanation for the theme builder.
     * This can indicate which special input element is used, ...
     * */
    public readonly explanation: string
    /**
     * What HTML-inputmode to use
     */
    public readonly inputmode?: string

    constructor(name: string, explanation: string | BaseUIElement, inputmode?: string) {
        this.name = name
        this.inputmode = inputmode
        if (this.name.endsWith("textfield")) {
            this.name = this.name.substr(0, this.name.length - "TextField".length)
        }
        if (this.name.endsWith("textfielddef")) {
            this.name = this.name.substr(0, this.name.length - "TextFieldDef".length)
        }
        if (typeof explanation === "string") {
            this.explanation = explanation
        } else {
            this.explanation = explanation.AsMarkdown()
        }
    }

    /**
     * Gets a piece of feedback. By default, validation.<type> will be used, resulting in a generic 'not a valid <type>'.
     * However, inheritors might overwrite this to give more specific feedback
     * @param s
     */
    public getFeedback(s: string): Translation {
        const tr = Translations.t.validation[this.name]
        if (tr !== undefined) {
            return tr["feedback"]
        }
    }

    public isValid(string: string, requestCountry: () => string): boolean {
        return true
    }

    public reformat(s: string, country?: () => string): string {
        return s
    }
}

export default class Validators {
    private static readonly AllValidators: ReadonlyArray<Validator> = [
        new StringValidator(),
        new TextValidator(),
        new DateValidator(),
        new NatValidator(),
        new IntValidator(),
        new LengthValidator(),
        new DirectionValidator(),
        new WikidataValidator(),
        new PNatValidator(),
        new FloatValidator(),
        new PFloatValidator(),
        new EmailValidator(),
        new UrlValidator(),
        new PhoneValidator(),
        new OpeningHoursValidator(),
        new ColorValidator(),
    ]
    public static allTypes: Map<string, Validator> = Validators.allTypesDict()

    public static HelpText(): BaseUIElement {
        const explanations: BaseUIElement[] = Validators.AllValidators.map((type) =>
            new Combine([new Title(type.name, 3), type.explanation]).SetClass("flex flex-col")
        )
        return new Combine([
            new Title("Available types for text fields", 1),
            "The listed types here trigger a special input element. Use them in `tagrendering.freeform.type` of your tagrendering to activate them",
            ...explanations,
        ]).SetClass("flex flex-col")
    }

    public static AvailableTypes(): string[] {
        return Validators.AllValidators.map((tp) => tp.name)
    }

    private static allTypesDict(): Map<string, Validator> {
        const types = new Map<string, Validator>()
        for (const tp of Validators.AllValidators) {
            types.set(tp.name, tp)
        }
        return types
    }
}
