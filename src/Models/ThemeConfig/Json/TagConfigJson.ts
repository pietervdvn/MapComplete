/**
 * The main representation of Tags.
 * See https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation
 */
export type TagConfigJson = string | AndTagConfigJson | OrTagConfigJson

/**
 * Chain many tags, to match, all of these should be true
 * See https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation
 */
export type OrTagConfigJson = {
    or: TagConfigJson[]
}
/**
 * Chain many tags, to match, a single of these should be true
 * See https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation
 */
export type AndTagConfigJson = {
    and: TagConfigJson[]
}
