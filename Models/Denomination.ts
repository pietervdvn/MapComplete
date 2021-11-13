import {Translation} from "../UI/i18n/Translation";
import {ApplicableUnitJson} from "./ThemeConfig/Json/UnitConfigJson";
import Translations from "../UI/i18n/Translations";
import {UIEventSource} from "../Logic/UIEventSource";
import BaseUIElement from "../UI/BaseUIElement";
import Toggle from "../UI/Input/Toggle";

export class Denomination {
    public readonly canonical: string;
    public readonly _canonicalSingular: string;
    public readonly default: boolean;
    public readonly prefix: boolean;
    public readonly alternativeDenominations: string [];
    private readonly _human: Translation;
    private readonly _humanSingular?: Translation;


    constructor(json: ApplicableUnitJson, context: string) {
        context = `${context}.unit(${json.canonicalDenomination})`
        this.canonical = json.canonicalDenomination.trim()
        if (this.canonical === undefined) {
            throw `${context}: this unit has no decent canonical value defined`
        }
        this._canonicalSingular = json.canonicalDenominationSingular?.trim()


        json.alternativeDenomination.forEach((v, i) => {
            if (((v?.trim() ?? "") === "")) {
                throw `${context}.alternativeDenomination.${i}: invalid alternative denomination: undefined, null or only whitespace`
            }
        })

        this.alternativeDenominations = json.alternativeDenomination?.map(v => v.trim()) ?? []

        this.default = json.default ?? false;

        this._human = Translations.T(json.human, context + "human")
        this._humanSingular = Translations.T(json.humanSingular, context + "humanSingular")

        this.prefix = json.prefix ?? false;

    }

    get human(): Translation {
        return this._human.Clone()
    }

    get humanSingular(): Translation {
        return (this._humanSingular ?? this._human).Clone()
    }

    getToggledHuman(isSingular: UIEventSource<boolean>): BaseUIElement {
        if (this._humanSingular === undefined) {
            return this.human
        }
        return new Toggle(
            this.humanSingular,
            this.human,
            isSingular
        )
    }

    public canonicalValue(value: string, actAsDefault?: boolean) {
        if (value === undefined) {
            return undefined;
        }
        const stripped = this.StrippedValue(value, actAsDefault)
        if (stripped === null) {
            return null;
        }
        if (stripped === "1" && this._canonicalSingular !== undefined) {
            return "1 " + this._canonicalSingular
        }
        return stripped + " " + this.canonical;
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
        const self = this;

        function startsWith(key) {
            if (self.prefix) {
                return value.startsWith(key)
            } else {
                return value.endsWith(key)
            }
        }

        function substr(key) {
            if (self.prefix) {
                return value.substr(key.length).trim()
            } else {
                return value.substring(0, value.length - key.length).trim()
            }
        }

        if (this.canonical !== "" && startsWith(this.canonical.toLowerCase())) {
            return substr(this.canonical)
        }

        if (this._canonicalSingular !== undefined && this._canonicalSingular !== "" && startsWith(this._canonicalSingular)) {
            return substr(this._canonicalSingular)
        }

        for (const alternativeValue of this.alternativeDenominations) {
            if (startsWith(alternativeValue)) {
                return substr(alternativeValue);
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