/**
 * The main representation of Tags.
 * See https://github.com/pietervdvn/MapComplete/blob/develop/Docs/Tags_format.md for more documentation
 *
 * type: tag
 */
export type TagConfigJson =
    | string
    | {
          and: TagConfigJson[]
      }
    | {
          or: TagConfigJson[]
      }
