export default interface UnitConfigJson {
    /**
     * Every key from this list will be normalized.
     *
     * To render a united value properly, use
     */
    appliesToKey: string[]
    /**
     * If set, invalid values will be erased in the MC application (but not in OSM of course!)
     * Be careful with setting this
     */
    eraseInvalidValues?: boolean
    /**
     * The possible denominations
     */
    applicableUnits: DenominationConfigJson[]
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
     * Use this value as default denomination when the user inputs a value (e.g. to force using 'centimeters' instead of 'meters' by default).
     * If unset for all values, this will use 'useIfNoUnitGiven'. If at least one denomination has this set, this will default to false
     */
    useAsDefaultInput?: boolean | string[]

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
     * Used for display purposes
     */
    canonicalDenominationSingular?: string

    /**
     * A list of alternative values which can occur in the OSM database - used for parsing.
     */
    alternativeDenomination?: string[]

    /**
     * The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g.
     * {
     *     "en": "meter",
     *     "fr": "metre"
     * }
     */
    human?: string | any

    /**
     * The value for humans in the dropdown. This should not use abbreviations and should be translated, e.g.
     * {
     *     "en": "minute",
     *     "nl": "minuut"x²
     * }
     */
    humanSingular?: string | any

    /**
     * If set, then the canonical value will be prefixed instead, e.g. for '€'
     * Note that if all values use 'prefix', the dropdown might move to before the text field
     */
    prefix?: boolean
}
