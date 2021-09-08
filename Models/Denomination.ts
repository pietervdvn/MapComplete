import {Translation} from "../UI/i18n/Translation";
import UnitConfigJson from "./ThemeConfig/Json/UnitConfigJson";
import Translations from "../UI/i18n/Translations";

export class Denomination {
    public readonly canonical: string;
    readonly default: boolean;
    readonly prefix: boolean;
    public readonly alternativeDenominations: string [];
    private readonly _human: Translation;

    constructor(json: UnitConfigJson, context: string) {
        context = `${context}.unit(${json.canonicalDenomination})`
        this.canonical = json.canonicalDenomination.trim()
        if (this.canonical === undefined) {
            throw `${context}: this unit has no decent canonical value defined`
        }

        json.alternativeDenomination.forEach((v, i) => {
            if (((v?.trim() ?? "") === "")) {
                throw `${context}.alternativeDenomination.${i}: invalid alternative denomination: undefined, null or only whitespace`
            }
        })

        this.alternativeDenominations = json.alternativeDenomination?.map(v => v.trim()) ?? []

        this.default = json.default ?? false;

        this._human = Translations.T(json.human, context + "human")

        this.prefix = json.prefix ?? false;

    }

    get human(): Translation {
        return this._human.Clone()
    }

    public canonicalValue(value: string, actAsDefault?: boolean) {
        if (value === undefined) {
            return undefined;
        }
        const stripped = this.StrippedValue(value, actAsDefault)
        if (stripped === null) {
            return null;
        }
        return (stripped + " " + this.canonical.trim()).trim();
    }

    /**
     * Returns the core value (without unit) if:
     * - the value ends with the canonical or an alternative value (or begins with if prefix is set)
     * - the value is a Number (without unit) and default is set
     *
     * Returns null if it doesn't match this unit
     */
    public StrippedValue(value: string, actAsDefault?: boolean): string {

        if (value === undefined) {
            return undefined;
        }

        value = value.toLowerCase()
        if (this.prefix) {
            if (value.startsWith(this.canonical) && this.canonical !== "") {
                return value.substring(this.canonical.length).trim();
            }
            for (const alternativeValue of this.alternativeDenominations) {
                if (value.startsWith(alternativeValue)) {
                    return value.substring(alternativeValue.length).trim();
                }
            }
        } else {
            if (value.endsWith(this.canonical.toLowerCase()) && this.canonical !== "") {
                return value.substring(0, value.length - this.canonical.length).trim();
            }
            for (const alternativeValue of this.alternativeDenominations) {
                if (value.endsWith(alternativeValue.toLowerCase())) {
                    return value.substring(0, value.length - alternativeValue.length).trim();
                }
            }
        }


        if (this.default || actAsDefault) {
            const parsed = Number(value.trim())
            if (!isNaN(parsed)) {
                return value.trim();
            }
        }

        return null;
    }


}