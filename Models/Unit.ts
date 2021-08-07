import BaseUIElement from "../UI/BaseUIElement";
import {FixedUiElement} from "../UI/Base/FixedUiElement";
import Combine from "../UI/Base/Combine";
import {Denomination} from "./Denomination";

export class Unit {
    public readonly appliesToKeys: Set<string>;
    public readonly denominations: Denomination[];
    public readonly denominationsSorted: Denomination[];
    public readonly defaultDenom: Denomination;
    public readonly eraseInvalid: boolean;
    private readonly possiblePostFixes: string[] = []

    constructor(appliesToKeys: string[], applicableUnits: Denomination[], eraseInvalid: boolean) {
        this.appliesToKeys = new Set(appliesToKeys);
        this.denominations = applicableUnits;
        this.defaultDenom = applicableUnits.filter(denom => denom.default)[0]
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
            str = str.toLowerCase()
            for (let i = 0; i < str.length + 1; i++) {
                const substr = str.substring(0, i)
                possiblePostFixes.add(substr)
            }
        }

        for (const denomination of this.denominations) {
            addPostfixesOf(denomination.canonical)
            denomination.alternativeDenominations.forEach(addPostfixesOf)
        }
        this.possiblePostFixes = Array.from(possiblePostFixes)
        this.possiblePostFixes.sort((a, b) => b.length - a.length)
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
        if (valueWithDenom === undefined) {
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
        const human = denom?.human
        if (human === undefined) {
            return new FixedUiElement(stripped ?? value);
        }

        const elems = denom.prefix ? [human, stripped] : [stripped, human];
        return new Combine(elems)

    }

    /**
     *   Returns the value without any (sub)parts of any denomination - usefull as preprocessing step for validating inputs.
     *   E.g.
     *   if 'megawatt' is a possible denomination, then '5 Meg' will be rewritten to '5' (which can then be validated as a valid pnat)
     *
     *   Returns the original string if nothign matches
     */
    stripUnitParts(str: string) {
        if (str === undefined) {
            return undefined;
        }

        for (const denominationPart of this.possiblePostFixes) {
            if (str.endsWith(denominationPart)) {
                return str.substring(0, str.length - denominationPart.length).trim()
            }
        }

        return str;
    }
}