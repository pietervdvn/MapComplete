/**
 * In some cases, a value is represented in a certain unit (such as meters for heigt/distance/..., km/h for speed, ...)
 *
 * Sometimes, multiple denominations are possible (e.g. km/h vs mile/h; megawatt vs kilowatt vs gigawatt for power generators, ...)
 *
 * This brings in some troubles, as there are multiple ways to write it (no denomitation, 'm' vs 'meter' 'metre', ...)
 *
 * Not only do we want to write consistent data to OSM, we also want to present this consistently to the user.
 * This is handled by defining units.
 *
 * # Rendering
 *
 * To render a value with long (human) denomination, use {canonical(key)}
 *
 * # Usage
 *
 * First of all, you define which keys have units applied, for example:
 *
 * ```
 * units: [
 *  appliesTo: ["maxspeed", "maxspeed:hgv", "maxspeed:bus"]
 *  applicableUnits: [
 *      ...
 *  ]
 * ]
 * ```
 *
 * ApplicableUnits defines which is the canonical extension, how it is presented to the user, ...:
 *
 * ```
 * applicableUnits: [
 * {
 *     canonicalDenomination: "km/h",
 *     alternativeDenomination: ["km/u", "kmh", "kph"]
 *     default: true,
 *     human: {
 *         en: "kilometer/hour",
 *         nl: "kilometer/uur"
 *     },
 *     humanShort: {
 *         en: "km/h",
 *         nl: "km/u"
 *     }
 * },
 * {
 *     canoncialDenomination: "mph",
 *     ... similar for miles an hour ...
 * }
 * ]
 * ```
 *
 *
 * If this is defined, then every key which the denominations apply to (`maxspeed`, `maxspeed:hgv` and `maxspeed:bus`) will be rewritten at the metatagging stage:
 * every value will be parsed and the canonical extension will be added add presented to the other parts of the code.
 *
 * Also, if a freeform text field is used, an extra dropdown with applicable denominations will be given
 *
 */
export default interface UnitConfigJson {
    /**
     * What is quantified? E.g. 'speed', 'length' (including width, diameter, ...), 'electric tension', 'electric current', 'duration'
     */
    quantity?: string
    /**
     * Every key from this list will be normalized.
     *
     * To render the value properly (with a human readable denomination), use `{canonical(<key>)}`
     */
    appliesToKey?: string[]
    /**
     * If set, invalid values will be erased in the MC application (but not in OSM of course!)
     * Be careful with setting this
     */
    eraseInvalidValues?: boolean
    /**
     * The possible denominations for this unit.
     * For length, denominations could be "meter", "kilometer", "miles", "foot"
     */
    applicableUnits: DenominationConfigJson[]

    /**
     * In some cases, the default denomination is not the most user friendly to input.
     * E.g., when measuring kerb heights, it is illogical to ask contributors to input an amount in meters.
     *
     * When a default input method should be used, this can be specified by setting the canonical denomination here, e.g.
     * `defaultInput: "cm"`. This must be a denomination which appears in the applicableUnits
     */
    defaultInput?: string
}

export interface DenominationConfigJson {
    /**
     * If this evaluates to true and the value to interpret has _no_ unit given, assumes that this unit is meant.
     * Alternatively, a list of country codes can be given where this acts as the default interpretation
     *
     * E.g., a denomination using "meter" would probably set this flag to "true";
     * a denomination for "mp/h" will use the condition "_country=gb" to indicate that it is the default in the UK.
     *
     * If none of the units indicate that they are the default, the first denomination will be used instead
     */
    useIfNoUnitGiven?: boolean | string[]

    /**
     * The canonical value for this denomination which will be added to the value in OSM.
     * e.g. "m" for meters
     * If the user inputs '42', the canonical value will be added and it'll become '42m'.
     *
     * Important: often, _no_ canonical values are expected, e.g. in the case of 'maxspeed' where 'km/h' is the default.
     * In this case, an empty string should be used
     */
    canonicalDenomination: string

    /**
     * The canonical denomination in the case that the unit is precisely '1'.
     * Used for display purposes only.
     *
     * E.g.: for duration of something in minutes: `2 minutes` but `1 minute`; the `minute` goes here
     */
    canonicalDenominationSingular?: string

    /**
     * A list of alternative values which can occur in the OSM database - used for parsing.
     * E.g.: while 'm' is canonical, `meter`, `mtrs`, ... can occur as well
     */
    alternativeDenomination?: string[]

    /**
     * The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g.
     * {
     *     "en": "meter",
     *     "fr": "metre"
     * }
     */
    human?: string | Record<string, string>

    /**
     * The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g.
     * {
     *     "en": "minute",
     *     "nl": "minuut"
     * }
     */
    humanSingular?: string | Record<string, string>

    /**
     * If set, then the canonical value will be prefixed instead, e.g. for '€'
     * Note that if all values use 'prefix', the dropdown might move to before the text field
     */
    prefix?: boolean

    /**
     * If set, add a space between the quantity and the denomination.
     *
     * E.g.: `50 mph` instad of `50mph`
     */
    addSpace?: boolean
}
