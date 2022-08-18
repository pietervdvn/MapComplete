import BaseUIElement from "../UI/BaseUIElement";
import {FixedUiElement} from "../UI/Base/FixedUiElement";
import Combine from "../UI/Base/Combine";
import {Denomination} from "./Denomination";
import UnitConfigJson from "./ThemeConfig/Json/UnitConfigJson";

export class Unit {
    public readonly appliesToKeys: Set<string>;
    public readonly denominations: Denomination[];
    public readonly denominationsSorted: Denomination[];
    public readonly eraseInvalid: boolean;

    constructor(appliesToKeys: string[], applicableDenominations: Denomination[], eraseInvalid: boolean) {
        this.appliesToKeys = new Set(appliesToKeys);
        this.denominations = applicableDenominations;
        this.eraseInvalid = eraseInvalid

        const seenUnitExtensions = new Set<string>();
        for (const denomination of this.denominations) {
            if (seenUnitExtensions.has(denomination.canonical)) {
                throw "This canonical unit is already defined in another denomination: " + denomination.canonical
            }
            const duplicate = denomination.alternativeDenominations.filter(denom => seenUnitExtensions.has(denom))
            if (duplicate.length > 0) {
                throw "A denomination is used multiple times: " + duplicate.join(", ")
            }

            seenUnitExtensions.add(denomination.canonical)
            denomination.alternativeDenominations.forEach(d => seenUnitExtensions.add(d))
        }
        this.denominationsSorted = [...this.denominations]
        this.denominationsSorted.sort((a, b) => b.canonical.length - a.canonical.length)

        const possiblePostFixes = new Set<string>()

        function addPostfixesOf(str) {
            if (str === undefined) {
                return
            }
            str = str.toLowerCase()
            for (let i = 0; i < str.length + 1; i++) {
                const substr = str.substring(0, i)
                possiblePostFixes.add(substr)
            }
        }

        for (const denomination of this.denominations) {
            addPostfixesOf(denomination.canonical)
            addPostfixesOf(denomination._canonicalSingular)
            denomination.alternativeDenominations.forEach(addPostfixesOf)
        }
    }


    static fromJson(json: UnitConfigJson, ctx: string) {
        const appliesTo = json.appliesToKey
        for (let i = 0; i < appliesTo.length; i++) {
            let key = appliesTo[i];
            if (key.trim() !== key) {
                throw `${ctx}.appliesToKey[${i}] is invalid: it starts or ends with whitespace`
            }
        }

        if ((json.applicableUnits ?? []).length === 0) {
            throw  `${ctx}: define at least one applicable unit`
        }
        // Some keys do have unit handling

        if(json.applicableUnits.some(denom => denom.useAsDefaultInput !== undefined)){
            json.applicableUnits.forEach(denom => {
                denom.useAsDefaultInput = denom.useAsDefaultInput ?? false
            })
        }
        
        const applicable = json.applicableUnits.map((u, i) => new Denomination(u, `${ctx}.units[${i}]`))
        return new Unit(appliesTo, applicable, json.eraseInvalidValues ?? false)
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
    findDenomination(valueWithDenom: string, country: () => string): [string, Denomination] {
        if (valueWithDenom === undefined) {
            return undefined;
        }
        const defaultDenom = this.getDefaultDenomination(country)
        for (const denomination of this.denominationsSorted) {
            const bare = denomination.StrippedValue(valueWithDenom, defaultDenom === denomination)
            if (bare !== null) {
                return [bare, denomination]
            }
        }
        return [undefined, undefined]
    }

    asHumanLongValue(value: string, country: () => string): BaseUIElement {
        if (value === undefined) {
            return undefined;
        }
        const [stripped, denom] = this.findDenomination(value, country)
        const human = stripped === "1" ? denom?.humanSingular : denom?.human
        if (human === undefined) {
            return new FixedUiElement(stripped ?? value);
        }

        const elems = denom.prefix ? [human, stripped] : [stripped, human];
        return new Combine(elems)

    }


    public getDefaultInput(country: () => string | string[]) {
        console.log("Searching the default denomination for input", country)
        for (const denomination of this.denominations) {
            if (denomination.useAsDefaultInput === true) {
                return denomination
            }
            if (denomination.useAsDefaultInput === undefined || denomination.useAsDefaultInput === false) {
                continue
            }
            let countries: string | string[] = country()
            if (typeof countries === "string") {
                countries = countries.split(",")
            }
            const denominationCountries: string[] = denomination.useAsDefaultInput
            if (countries.some(country => denominationCountries.indexOf(country) >= 0)) {
                return denomination
            }
        }
        return this.denominations[0]
    }
    
    public getDefaultDenomination(country: () => string){
        for (const denomination of this.denominations) {
            if (denomination.useIfNoUnitGiven === true || denomination.canonical === "") {
                return denomination
            }
            if (denomination.useIfNoUnitGiven === undefined || denomination.useIfNoUnitGiven === false) {
                continue
            }
            let countries: string | string[] = country()
            if (typeof countries === "string") {
                countries = countries.split(",")
            }
            const denominationCountries: string[] = denomination.useIfNoUnitGiven
            if (countries.some(country => denominationCountries.indexOf(country) >= 0)) {
                return denomination
            }
        }
        return this.denominations[0]
    }

}