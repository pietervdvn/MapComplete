export default interface UnitConfigJson {

    /**
     * Every key from this list will be normalized
     */
    appliesToKey: string[],
    /**
     * If set, invalid values will be erased in the MC application (but not in OSM of course!)
     * Be careful with setting this
     */
    eraseInvalidValues?: boolean;
    /**
     * The possible denominations
     */
    applicableUnits:ApplicableUnitJson[]

}

export interface ApplicableUnitJson
{
    /**
     * The canonical value which will be added to the text.
     * e.g. "m" for meters
     * If the user inputs '42', the canonical value will be added and it'll become '42m'
     */
    canonicalDenomination: string,
    /**
     * The canonical denomination in the case that the unit is precisely '1'
     */
    canonicalDenominationSingular?: string,
    
    
    /**
     * A list of alternative values which can occur in the OSM database - used for parsing.
     */
    alternativeDenomination?: string[],

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

    /**
     * The default interpretation - only one can be set.
     * If none is set, the first unit will be considered the default interpretation of a value without a unit
     */
    default?: boolean
}