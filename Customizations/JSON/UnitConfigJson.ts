export default interface UnitConfigJson{

    /**
     * The canonical value which will be added to the text.
     * e.g. "m" for meters
     * If the user inputs '42', the canonical value will be added and it'll become '42m'
     */
    canonicalDenomination: string,

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
    human?:string | any

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