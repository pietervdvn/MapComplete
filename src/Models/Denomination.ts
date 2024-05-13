import { Translation, TypedTranslation } from "../UI/i18n/Translation"
import { DenominationConfigJson } from "./ThemeConfig/Json/UnitConfigJson"
import Translations from "../UI/i18n/Translations"
import { Validator } from "../UI/InputElement/Validator"

/**
 * A 'denomination' is one way to write a certain quantity.
 * For example, 'meter', 'kilometer', 'mile' and 'foot' are all possible ways to quantify 'length'
 */
export class Denomination {
    public readonly canonical: string
    public readonly _canonicalSingular: string
    public readonly useIfNoUnitGiven: boolean | string[]
    public readonly prefix: boolean
    public readonly addSpace: boolean
    public readonly alternativeDenominations: string[]
    public readonly human: TypedTranslation<{ quantity: string }>
    public readonly humanSingular?: Translation
    private readonly _validator: Validator

    private constructor(
        canonical: string,
        _canonicalSingular: string,
        useIfNoUnitGiven: boolean | string[],
        prefix: boolean,
        addSpace: boolean,
        alternativeDenominations: string[],
        _human: TypedTranslation<{ quantity: string }>,
        _humanSingular: Translation,
        validator: Validator
    ) {
        this.canonical = canonical
        this._canonicalSingular = _canonicalSingular
        this.useIfNoUnitGiven = useIfNoUnitGiven
        this.prefix = prefix
        this.addSpace = addSpace
        this.alternativeDenominations = alternativeDenominations
        this.human = _human
        this.humanSingular = _humanSingular
        this._validator = validator
    }

    public static fromJson(json: DenominationConfigJson, validator: Validator, context: string) {
        context = `${context}.unit(${json.canonicalDenomination})`
        const canonical = json.canonicalDenomination.trim()
        if (canonical === undefined) {
            throw `${context}: this unit has no decent canonical value defined`
        }

        json.alternativeDenomination?.forEach((v, i) => {
            if ((v?.trim() ?? "") === "") {
                throw `${context}.alternativeDenomination.${i}: invalid alternative denomination: undefined, null or only whitespace`
            }
        })

        if (json["default" /* @code-quality: ignore*/] !== undefined) {
            throw `${context} uses the old 'default'-key. Use "useIfNoUnitGiven" or "useAsDefaultInput" instead`
        }

        const humanTexts = Translations.T(json.human, context + "human")
        humanTexts.OnEveryLanguage((text, language) => {
            if (text.indexOf("{quantity}") < 0) {
                throw `In denomination: a human text should contain {quantity} (at ${context}.human.${language})`
            }
            return text
        })
        return new Denomination(
            canonical,
            json.canonicalDenominationSingular?.trim(),
            json.useIfNoUnitGiven,
            json.prefix ?? false,
            json.addSpace ?? false,
            json.alternativeDenomination?.map((v) => v.trim()) ?? [],
            humanTexts,
            Translations.T(json.humanSingular, context + "humanSingular"),
            validator
        )
    }

    public clone() {
        return new Denomination(
            this.canonical,
            this._canonicalSingular,
            this.useIfNoUnitGiven,
            this.prefix,
            this.addSpace,
            this.alternativeDenominations,
            this.human,
            this.humanSingular,
            this._validator
        )
    }

    public withBlankCanonical() {
        return new Denomination(
            "",
            this._canonicalSingular,
            this.useIfNoUnitGiven,
            this.prefix,
            this.addSpace,
            [this.canonical, ...this.alternativeDenominations],
            this.human,
            this.humanSingular,
            this._validator
        )
    }

    /**
     * Create the canonical, human representation of the given value
     * @param value the value from OSM
     * @param actAsDefault if set and the value can be parsed as number, will be parsed and trimmed
     *
     * import Validators from "../UI/InputElement/Validators"
     *
     * const unit = Denomination.fromJson({
     *               canonicalDenomination: "m",
     *               alternativeDenomination: ["meter"],
     *               human: {
     *                   en: "{quantity} meter"
     *               }
     *           }, Validators.get("float"), "test")
     * unit.canonicalValue("42m", true, false) // =>"42 m"
     * unit.canonicalValue("42", true, false) // =>"42 m"
     * unit.canonicalValue("42 m", true, false) // =>"42 m"
     * unit.canonicalValue("42 meter", true, false) // =>"42 m"
     * unit.canonicalValue("42m", true, false) // =>"42 m"
     * unit.canonicalValue("42", true, false) // =>"42 m"
     *
     * // Should be trimmed if canonical is empty
     * const unit = Denomination.fromJson({
     *               canonicalDenomination: "",
     *               alternativeDenomination: ["meter","m"],
     *               human: {
     *                   en: "{quantity} meter"
     *               }
     *           }, Validators.get("float"), "test")
     * unit.canonicalValue("42m", true, false) // =>"42"
     * unit.canonicalValue("42", true, false) // =>"42"
     * unit.canonicalValue("42 m", true, false) // =>"42"
     * unit.canonicalValue("42 meter", true, false) // =>"42"
     *
     *
     */
    public canonicalValue(value: string, actAsDefault: boolean, inverted: boolean): string {
        if (value === undefined) {
            return undefined
        }
        const stripped = this.StrippedValue(value, actAsDefault, inverted)
        if (stripped === null) {
            return null
        }
        if(inverted){
            return (stripped + "/" + this.canonical).trim()

        }
        if (stripped === "1" && this._canonicalSingular !== undefined) {
            return ("1 " + this._canonicalSingular).trim()
        }
        return (stripped + " " + this.canonical).trim()
    }

    /**
     * Returns the core value (without unit) if:
     * - the value ends with the canonical or an alternative value (or begins with if prefix is set)
     * - the value is a Number (without unit) and default is set
     *
     * Returns null if it doesn't match this unit
     */
    public StrippedValue(value: string, actAsDefault: boolean, inverted: boolean): string {
        if (value === undefined || value === "") {
            return undefined
        }

        value = value.toLowerCase()
        const self = this

        function startsWith(key) {
            if (self.prefix) {
                return value.startsWith(key)
            } else {
                return value.endsWith(key)
            }
        }

        function substr(key) {
            if (self.prefix) {
                return value.substring(key.length).trim()
            }
            let trimmed = value.substring(0, value.length - key.length).trim()
            if(!inverted){
                return trimmed
            }
            if(trimmed.endsWith("/")){
                trimmed = trimmed.substring(0, trimmed.length - 1).trim()
            }
            return trimmed
        }

        if (this.canonical !== "" && startsWith(this.canonical.toLowerCase())) {
            return substr(this.canonical)
        }

        if (
            this._canonicalSingular !== undefined &&
            this._canonicalSingular !== "" &&
            startsWith(this._canonicalSingular)
        ) {
            return substr(this._canonicalSingular)
        }

        for (const alternativeValue of this.alternativeDenominations) {
            if (startsWith(alternativeValue)) {
                return substr(alternativeValue)
            }
        }

        if (!actAsDefault) {
            return null
        }

        if(!this._validator.isValid(value.trim())){
            return null
        }
        return this._validator.reformat(value.trim())
    }

    withValidator(validator: Validator) {
        return new Denomination(this.canonical, this._canonicalSingular, this.useIfNoUnitGiven, this.prefix, this.addSpace, this.alternativeDenominations, this.human, this.humanSingular, validator)
    }
}
