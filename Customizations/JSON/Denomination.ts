import {Translation} from "../../UI/i18n/Translation";
import UnitConfigJson from "./UnitConfigJson";
import Translations from "../../UI/i18n/Translations";
import BaseUIElement from "../../UI/BaseUIElement";
import Combine from "../../UI/Base/Combine";

export class Unit {
    public readonly appliesToKeys: Set<string>;
    public readonly denominations: Denomination[];
    public readonly denominationsSorted: Denomination[];
    public readonly defaultDenom: Denomination;
    public readonly eraseInvalid: boolean;

    constructor(appliesToKeys: string[], applicableUnits: Denomination[], eraseInvalid: boolean) {
        this.appliesToKeys = new Set(appliesToKeys);
        this.denominations = applicableUnits;
        this.defaultDenom = applicableUnits.filter(denom => denom.default)[0]
        this.eraseInvalid = eraseInvalid
        
        const seenUnitExtensions = new Set<string>();
        for (const denomination of this.denominations) {
            if(seenUnitExtensions.has(denomination.canonical)){
                throw "This canonical unit is already defined in another denomination: "+denomination.canonical
            }
            const duplicate = denomination.alternativeDenominations.filter(denom => seenUnitExtensions.has(denom))
            if(duplicate.length > 0){
                throw "A denomination is used multiple times: "+duplicate.join(", ")
            }
            
            seenUnitExtensions.add(denomination.canonical)
            denomination.alternativeDenominations.forEach(d => seenUnitExtensions.add(d))
        }
        this.denominationsSorted = [...this.denominations]
        this.denominationsSorted.sort((a, b) => b.canonical.length - a.canonical.length)
    }

    isApplicableToKey(key: string | undefined): boolean {
        if (key === undefined) {
            return false;
        }

        return this.appliesToKeys.has(key);
    }

    /**
     * Finds which denomination is applicable and gives the stripped value back
     */
    findDenomination(valueWithDenom: string): [string, Denomination] {
        if(valueWithDenom === undefined){
            return undefined;
        }
        for (const denomination of this.denominationsSorted) {
            const bare = denomination.StrippedValue(valueWithDenom)
            if (bare !== null) {
                return [bare, denomination]
            }
        }
        return [undefined, undefined]
    }

    asHumanLongValue(value: string): BaseUIElement {
        if (value === undefined) {
            return undefined;
        }
        const [stripped, denom] = this.findDenomination(value)
        const human = denom.human

        const elems = denom.prefix ? [human, stripped] : [stripped, human];
        return new Combine(elems)

    }
}

export class Denomination {
    public readonly canonical: string;
    readonly default: boolean;
    readonly prefix: boolean;
    private readonly _human: Translation;
    public readonly alternativeDenominations: string [];

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
        return stripped + this.canonical
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


        if (this.default || actAsDefault) {
            const parsed = Number(value.trim())
            if (!isNaN(parsed)) {
                return value.trim();
            }
        }

        return null;
    }


}