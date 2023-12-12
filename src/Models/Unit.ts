import BaseUIElement from "../UI/BaseUIElement"
import { FixedUiElement } from "../UI/Base/FixedUiElement"
import Combine from "../UI/Base/Combine"
import { Denomination } from "./Denomination"
import UnitConfigJson from "./ThemeConfig/Json/UnitConfigJson"
import unit from "../../assets/layers/unit/unit.json"

export class Unit {
    private static allUnits = this.initUnits()
    public readonly appliesToKeys: Set<string>
    public readonly denominations: Denomination[]
    public readonly denominationsSorted: Denomination[]
    public readonly eraseInvalid: boolean
    public readonly quantity: string

    constructor(
        quantity: string,
        appliesToKeys: string[],
        applicableDenominations: Denomination[],
        eraseInvalid: boolean
    ) {
        this.quantity = quantity
        this.appliesToKeys = new Set(appliesToKeys)
        this.denominations = applicableDenominations
        this.eraseInvalid = eraseInvalid

        const seenUnitExtensions = new Set<string>()
        for (const denomination of this.denominations) {
            if (seenUnitExtensions.has(denomination.canonical)) {
                throw (
                    "This canonical unit is already defined in another denomination: " +
                    denomination.canonical
                )
            }
            const duplicate = denomination.alternativeDenominations.filter((denom) =>
                seenUnitExtensions.has(denom)
            )
            if (duplicate.length > 0) {
                throw "A denomination is used multiple times: " + duplicate.join(", ")
            }

            seenUnitExtensions.add(denomination.canonical)
            denomination.alternativeDenominations.forEach((d) => seenUnitExtensions.add(d))
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

    static fromJson(
        json:
            | UnitConfigJson
            | Record<string, string | { quantity: string; denominations: string[] }>,
        ctx: string
    ): Unit[] {
        if (!json.appliesToKey && !json.quantity) {
            return this.loadFromLibrary(<any>json, ctx)
        }
        return [this.parse(<UnitConfigJson>json, ctx)]
    }

    /**
     *
     * // Should detect invalid defaultInput
     * let threwError = false
     * try{
     *   Unit.parse({
     *     appliesToKey: ["length"],
     *     defaultInput: "xcm",
     *     applicableUnits: [
     *         {
     *             canonicalDenomination: "m",
     *             useIfNoUnitGiven: true,
     *             human: "meter"
     *         }
     *     ]
     *   },"test")
     * }catch(e){
     *     threwError = true
     * }
     * threwError // => true
     *
     * // Should work
     * Unit.parse({
     *     appliesToKey: ["length"],
     *     defaultInput: "xcm",
     *     applicableUnits: [
     *         {
     *             canonicalDenomination: "m",
     *             useIfNoUnitGiven: true,
     *             humen: "meter"
     *         },
     *         {
     *             canonicalDenomination: "cm",
     *             human: "centimeter"
     *         }
     *     ]
     * }, "test")
     */
    private static parse(json: UnitConfigJson, ctx: string): Unit {
        const appliesTo = json.appliesToKey
        for (let i = 0; i < (appliesTo ?? []).length; i++) {
            let key = appliesTo[i]
            if (key.trim() !== key) {
                throw `${ctx}.appliesToKey[${i}] is invalid: it starts or ends with whitespace`
            }
        }

        if ((json.applicableUnits ?? []).length === 0) {
            throw `${ctx}: define at least one applicable unit`
        }
        // Some keys do have unit handling

        const applicable = json.applicableUnits.map((u, i) =>
            Denomination.fromJson(u, `${ctx}.units[${i}]`)
        )

        if (
            json.defaultInput &&
            !applicable.some((denom) => denom.canonical.trim() === json.defaultInput)
        ) {
            throw `${ctx}: no denomination has the specified default denomination. The default denomination is '${
                json.defaultInput
            }', but the available denominations are ${applicable
                .map((denom) => denom.canonical)
                .join(", ")}`
        }
        return new Unit(
            json.quantity ?? "",
            appliesTo,
            applicable,
            json.eraseInvalidValues ?? false
        )
    }

    private static initUnits(): Map<string, Unit> {
        const m = new Map<string, Unit>()
        const units = (<UnitConfigJson[]>unit.units).map((json, i) =>
            this.parse(json, "unit.json.units." + i)
        )

        for (const unit of units) {
            m.set(unit.quantity, unit)
        }
        return m
    }

    private static getFromLibrary(name: string, ctx: string): Unit {
        const loaded = this.allUnits.get(name)
        if (loaded === undefined) {
            throw (
                "No unit with quantity name " +
                name +
                " found (at " +
                ctx +
                "). Try one of: " +
                Array.from(this.allUnits.keys()).join(", ")
            )
        }
        return loaded
    }

    private static loadFromLibrary(
        spec: Record<
            string,
            string | { quantity: string; denominations: string[]; canonical?: string }
        >,
        ctx: string
    ): Unit[] {
        const units: Unit[] = []
        for (const key in spec) {
            const toLoad = spec[key]
            if (typeof toLoad === "string") {
                const loaded = this.getFromLibrary(toLoad, ctx)
                units.push(
                    new Unit(loaded.quantity, [key], loaded.denominations, loaded.eraseInvalid)
                )
                continue
            }

            const loaded = this.getFromLibrary(toLoad.quantity, ctx)
            const quantity = toLoad.quantity
            function fetchDenom(d: string): Denomination {
                const found = loaded.denominations.find(
                    (denom) => denom.canonical.toLowerCase() === d
                )
                if (!found) {
                    throw (
                        `Could not find a denomination \`${d}\`for quantity ${quantity} at ${ctx}. Perhaps you meant to use on of ` +
                        loaded.denominations.map((d) => d.canonical).join(", ")
                    )
                }
                return found
            }

            const denoms = toLoad.denominations
                .map((d) => d.toLowerCase())
                .map((d) => fetchDenom(d))

            if (toLoad.canonical) {
                const canonical = fetchDenom(toLoad.canonical)
                denoms.unshift(canonical.withBlankCanonical())
            }
            units.push(new Unit(loaded.quantity, [key], denoms, loaded.eraseInvalid))
        }
        return units
    }

    isApplicableToKey(key: string | undefined): boolean {
        if (key === undefined) {
            return false
        }

        return this.appliesToKeys.has(key)
    }

    /**
     * Finds which denomination is applicable and gives the stripped value back
     */
    findDenomination(valueWithDenom: string, country: () => string): [string, Denomination] {
        if (valueWithDenom === undefined) {
            return undefined
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

    asHumanLongValue(value: string, country: () => string): BaseUIElement | string {
        if (value === undefined) {
            return undefined
        }
        const [stripped, denom] = this.findDenomination(value, country)
        if (stripped === "1") {
            return denom?.humanSingular ?? stripped
        }
        const human = denom?.human
        if (human === undefined) {
            return stripped ?? value
        }

        return human.Subs({ quantity: value })
    }

    public toOsm(value: string, denomination: string) {
        const denom = this.denominations.find((d) => d.canonical === denomination)
        const space = denom.addSpace ? " " : ""
        if (denom.prefix) {
            return denom.canonical + space + value
        }
        return value + space + denom.canonical
    }

    public getDefaultDenomination(country: () => string) {
        for (const denomination of this.denominations) {
            if (denomination.useIfNoUnitGiven === true) {
                return denomination
            }
            if (
                denomination.useIfNoUnitGiven === undefined ||
                denomination.useIfNoUnitGiven === false
            ) {
                continue
            }
            let countries: string | string[] = country() ?? []
            if (typeof countries === "string") {
                countries = countries.split(",")
            }
            const denominationCountries: string[] = denomination.useIfNoUnitGiven
            if (countries.some((country) => denominationCountries.indexOf(country) >= 0)) {
                return denomination
            }
        }
        for (const denomination of this.denominations) {
            if (denomination.canonical === "") {
                return denomination
            }
        }
        return this.denominations[0]
    }
}
