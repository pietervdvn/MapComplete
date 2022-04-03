/**
 * Rewrites and multiplies the given renderings of type T.
 * 
 * For example:
 *
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
 *         renderings: {
 *             "key":"a|b|c"
 *         }
 *     }
 * }
 * ```
 * will result in _three_ copies (as the values to rewrite into have three values, namely:
 * 
 * [
 *   {
 *   // The first pair: key --> X, a|b|c --> 0
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
        sourceString: string[],
        into: (string | any)[][]
    },
    renderings: T
}