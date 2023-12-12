/**
 * Rewrites and multiplies the given renderings of type T.
 *
 * This can be used for introducing many similar questions automatically,
 * which also makes translations easier.
 *
 * (Note that the key does _not_ need to be wrapped in {}.
 * However, we recommend to use them if the key is used in a translation, as missing keys will be picked up and warned for by the translation scripts)
 *
 * For example:
 *
 * ```
 * {
 *     rewrite: {
 *         sourceString: ["key", "a|b|c"],
 *         into: [
 *             ["X", 0]
 *             ["Y", 1],
 *             ["Z", 2]
 *         ],
 *         renderings: [{
 *             "key":"a|b|c"
 *         }]
 *     }
 * }
 * ```
 * will result in _three_ copies (as the values to rewrite into have three values, namely:
 *
 * [
 *   {
 *   # The first pair: key --> X, a|b|c --> 0
 *       "X": 0
 *   },
 *   {
 *       "Y": 1
 *   },
 *   {
 *       "Z": 2
 *   }
 *
 * ]
 *
 * @see ExpandRewrite
 */
export default interface RewritableConfigJson<T> {
    rewrite: {
        sourceString: string[]
        into: (string | any)[][]
    }
    subexpand?: Record<string, string[]>
    renderings: T | T[]
}
