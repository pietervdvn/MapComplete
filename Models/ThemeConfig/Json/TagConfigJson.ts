/**
 * A small interface to combine tags and tagsfilters.
 * 
 * See https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for documentation
 */
export interface AndOrTagConfigJson {
    and?: (string | AndOrTagConfigJson)[]
    or?: (string | AndOrTagConfigJson)[]
}