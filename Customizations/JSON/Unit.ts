import {Translation} from "../../UI/i18n/Translation";
import UnitConfigJson from "./UnitConfigJson";
import Translations from "../../UI/i18n/Translations";

export class Unit {
    public readonly human: Translation;
    private readonly alternativeDenominations: string [];
    private readonly canonical: string;
    private readonly default: boolean;
    private readonly prefix: boolean;

    constructor(json: UnitConfigJson, context: string) {
        context = `${context}.unit(${json.canonicalDenomination})`
        this.canonical = json.canonicalDenomination.trim()
        if ((this.canonical ?? "") === "") {
            throw `${context}: this unit has no decent canonical value defined`
        }

        json.alternativeDenomination.forEach((v, i) => {
            if (((v?.trim() ?? "") === "")) {
                throw `${context}.alternativeDenomination.${i}: invalid alternative denomination: undefined, null or only whitespace`
            }
        })

        this.alternativeDenominations = json.alternativeDenomination?.map(v => v.trim()) ?? []

        this.default = json.default ?? false;

        this.human = Translations.T(json.human, context + "human")

        this.prefix = json.prefix ?? false;

    }

    public canonicalValue(value: string) {
        const stripped = this.StrippedValue(value)
        if(stripped === null){
            return null;
        }
        return stripped + this.canonical
    }

    /**
     * Returns the core value (without unit) if:
     * - the value ends with the canonical or an alternative value (or begins with if prefix is set)
     * - the value is a Number (without unit) and default is set
     *
     * Returns null if it doesn't match this unit
     * @param value
     * @constructor
     */
    private StrippedValue(value: string): string {

        if (this.prefix) {
            if (value.startsWith(this.canonical)) {
                return value.substring(this.canonical.length).trim();
            }
            for (const alternativeValue of this.alternativeDenominations) {
                if (value.startsWith(alternativeValue)) {
                    return value.substring(alternativeValue.length).trim();
                }
            }
        } else {
            if (value.endsWith(this.canonical)) {
                return value.substring(0, value.length - this.canonical.length).trim();
            }
            for (const alternativeValue of this.alternativeDenominations) {
                if (value.endsWith(alternativeValue)) {
                    return value.substring(0, value.length - alternativeValue.length).trim();
                }
            }
        }


        if (this.default) {
            const parsed = Number(value.trim())
            if (!isNaN(parsed)) {
                return value.trim();
            }
        }

        return null;
    }


}