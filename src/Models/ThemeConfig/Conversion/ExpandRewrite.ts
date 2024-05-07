import { Conversion } from "./Conversion"
import RewritableConfigJson from "../Json/RewritableConfigJson"
import Translations from "../../../UI/i18n/Translations"
import { ConversionContext } from "./ConversionContext"
import { Utils } from "../../../Utils"

export class ExpandRewrite<T> extends Conversion<T | RewritableConfigJson<T>, T[]> {
    constructor() {
        super("Applies a rewrite", [], "ExpandRewrite")
    }

    /**
     * Used for left|right group creation and replacement.
     * Every 'keyToRewrite' will be replaced with 'target' recursively. This substitution will happen in place in the object 'tr'
     *
     * The 'target' object will be cloned, the changes will be applied in this clone
     *
     * // should substitute strings
     * const spec = {
     *   "someKey": "somevalue {xyz}"
     * }
     * ExpandRewrite.RewriteParts("{xyz}", "rewritten", spec) // => {"someKey": "somevalue rewritten"}
     *
     * // should substitute all occurances in strings
     * const spec = {
     *   "someKey": "The left|right side has {key:left|right}"
     * }
     * ExpandRewrite.RewriteParts("left|right", "left", spec) // => {"someKey": "The left side has {key:left}"}
     *
     */
    public static RewriteParts<T>(keyToRewrite: string, target: string | any, tr: T): T {
        const targetIsTranslation = Translations.isProbablyATranslation(target)

        function replaceRecursive(obj: string | any, target) {
            if (obj === keyToRewrite) {
                return target
            }

            if (typeof obj === "string") {
                // This is a simple string - we do a simple replace
                while (obj.indexOf(keyToRewrite) >= 0) {
                    obj = obj.replace(keyToRewrite, target)
                }
                return obj
            }
            if (Array.isArray(obj)) {
                // This is a list of items
                return obj.map((o) => replaceRecursive(o, target))
            }

            if (typeof obj === "object") {
                obj = { ...obj }

                const isTr = targetIsTranslation && Translations.isProbablyATranslation(obj)

                for (const key in obj) {
                    let subtarget = target
                    if (isTr) {
                        // The target is a translation AND the current object is a translation
                        // This means we should recursively replace with the translated value
                        if (target[key]) {
                            // A translation is available!
                            subtarget = target[key]
                        } else if (target["en"]) {
                            subtarget = target["en"]
                        } else {
                            // Take the first
                            subtarget = target[Object.keys(target)[0]]
                        }
                    }
                    obj[key] = replaceRecursive(obj[key], subtarget)
                }
                return obj
            }
            return obj
        }

        return replaceRecursive(tr, target)
    }

    /**
     * Used for check that a key is present in a string somewhere in the object
     *
     * // should substitute strings
     * const spec = {
     *   "someKey": "somevalue {xyz}"
     * }
     * ExpandRewrite.contains("{xyz}", spec) // => true
     * ExpandRewrite.contains("{abc}", spec) // => false
     *
     */
    public static contains<T>(keyToRewrite: string, tr: T): boolean {
        function findRecursive(obj: string | any): boolean {
            if (obj === keyToRewrite) {
                return true
            }

            if (typeof obj === "string") {
                // This is a simple string - we do a simple replace
                return obj.indexOf(keyToRewrite) >= 0
            }
            if (Array.isArray(obj)) {
                // This is a list of items
                return obj.some((o) => findRecursive(o))
            }

            if (typeof obj === "object") {
                obj = { ...obj }

                for (const key in obj) {
                    if (findRecursive(obj[key])) {
                        return true
                    }
                }
                return false
            }
            return false
        }

        return findRecursive(tr)
    }

    /**
     * // should convert simple strings
     * const spec = <RewritableConfigJson<string>>{
     *     rewrite: {
     *         sourceString: ["xyz","abc"],
     *         into: [
     *             ["X", "A"],
     *             ["Y", "B"],
     *             ["Z", "C"]],
     *     },
     *     renderings: "The value of xyz is abc"
     * }
     * new ExpandRewrite().convertStrict(spec, ConversionContext.test()) // => ["The value of X is A", "The value of Y is B", "The value of Z is C"]
     *
     * // should rewrite with translations
     * const spec = <RewritableConfigJson<any>>{
     *     rewrite: {
     *         sourceString: ["xyz","abc"],
     *         into: [
     *             ["X", {en: "value", nl: "waarde"}],
     *             ["Y", {en: "some other value", nl: "een andere waarde"}],
     *     },
     *     renderings: {en: "The value of xyz is abc", nl: "De waarde van xyz is abc"}
     * }
     * const expected = [
     *  {
     *      en: "The value of X is value",
     *      nl: "De waarde van X is waarde"
     *  },
     *  {
     *      en: "The value of Y is some other value",
     *      nl: "De waarde van Y is een andere waarde"
     *  }
     * ]
     * new ExpandRewrite().convertStrict(spec, ConversionContext.test()) // => expected
     *
     *
     * // should expand sublists
     * const spec = <RewritableConfigJson<any>>{
     *     rewrite: {
     *         sourceString: ["{{key}}","{{values}}"],
     *         into: [
     *             ["a", [1,2,3] ],
     *             ["b", [42, 43] ],
     *     },
     *     subexpand: {"options": ["{{values}}"]},
     *     renderings: {question: "What are values for {{key}}?", options: [{if: "x={{values}}", then: "{{values}} is value" }] }
     * }
     * const expected = [
     *  {question: "What are values for a?",
     *  options: [{if: "x=1", then: "1 is value" },
     *      {if: "x=2", then: "2 is value" },
     *      {if: "x=3", then: "3 is value" }
     *  ] }
     *  {question: "What are values for b?", options: [
     *  {if: "x=42", then: "42 is value" },
     *  {if: "x=43", then: "43 is value" }
     *  ] }
     * ]
     * new ExpandRewrite().convertStrict(spec, ConversionContext.test()) // => expected
     *
     *
     * // should expand sublists if there is one
     * const spec = <RewritableConfigJson<any>>{
     *     rewrite: {
     *         sourceString: ["{{key}}","{{values}}"],
     *         into: [
     *             ["a", [] ],
     *             ["b", [42, 43] ],
     *             ["c", null ],
     *     },
     *     subexpand: {"options": ["{{values}}"]},
     *     renderings: [
     *      {question: "What is {{key}}?", options: [{if: "x={{values}}", then: "{{values}} is value" }],
     *      {question: "How is {{key}}?", options: [{a: 5}, {b: 6}] },
     *      {question: "Why is {{key}}?" }
     *    ]
     * }
     * const expected = [
     *  {question: "What is a?",
     *  options: []},
     *  {question: "How is a?", options: [{a: 5}, {b: 6}] },
     *  {question: "Why is a?" },
     *  {question: "What is b?", options: [
     *  {if: "x=42", then: "42 is value" },
     *  {if: "x=43", then: "43 is value" }
     *  ] },
     *  {question: "How is b?", options: [{a: 5}, {b: 6}] },
     *  {question: "Why is b?" },
     *  {question: "What is c?"},
     *  {question: "How is c?", options: [{a: 5}, {b: 6}] },
     *  {question: "Why is c?" },
     * ]
     * new ExpandRewrite().convertStrict(spec, ConversionContext.test()) // => expected
     */
    convert(json: T | RewritableConfigJson<T>, context: ConversionContext): T[] {
        if (json === null || json === undefined) {
            return []
        }

        if (json["rewrite"] === undefined) {
            // not a rewrite
            return [<T>json]
        }

        const rewrite = <RewritableConfigJson<T>>json
        const keysToRewrite = rewrite.rewrite
        const results: T[] = []

        {
            // sanity check: rewrite: ["xyz", "longer_xyz"] is not allowed as "longer_xyz" will never be triggered
            for (let i = 0; i < keysToRewrite.sourceString.length; i++) {
                const guard = keysToRewrite.sourceString[i]
                for (let j = i + 1; j < keysToRewrite.sourceString.length; j++) {
                    const toRewrite = keysToRewrite.sourceString[j]
                    if (toRewrite.indexOf(guard) >= 0) {
                        context.err(
                            `sourcestring[${i}] is a substring of sourcestring[${j}]: ${guard} will be substituted away before ${toRewrite} is reached.`
                        )
                    }
                }
            }
        }

        {
            // sanity check: {rewrite: ["a", "b"] should have the right amount of 'intos' in every case
            for (let i = 0; i < rewrite.rewrite.into.length; i++) {
                const into = keysToRewrite.into[i]
                if (into.length !== rewrite.rewrite.sourceString.length) {
                    context
                        .enters("into", i)
                        .err(
                            `Error in rewrite: there are ${rewrite.rewrite.sourceString.length} keys to rewrite, but entry ${i} has only ${into.length} values`
                        )
                }
            }
        }

        const renderings = Array.isArray(rewrite.renderings)
            ? rewrite.renderings
            : [rewrite.renderings]
        for (let i = 0; i < keysToRewrite.into.length; i++) {
            const ts: T[] = <T[]>Utils.Clone(renderings)
            for (const tx of ts) {
                let t = <T>tx
                const sourceKeysToIgnore: string[] = []
                for (const listKey in rewrite.subexpand) {
                    const original = t[listKey]
                    if (!original) {
                        continue
                    }
                    const sourceKeys = rewrite.subexpand[listKey].filter((sk) =>
                        ExpandRewrite.contains(sk, original)
                    )
                    if (sourceKeys.length === 0) {
                        // no delete t[listKey] needed, fixed values we need to retain
                        continue
                    }

                    if (sourceKeys.length > 1) {
                        throw (
                            "Too much matching sourcekeys for sublist `" +
                            listKey +
                            "`: it matches all of " +
                            sourceKeys.join(", ")
                        )
                    }

                    const sourceKey = sourceKeys[0]
                    sourceKeysToIgnore.push(sourceKey)
                    const rw = rewrite.rewrite
                    const values = rw.into[i][rw.sourceString.indexOf(sourceKey)]

                    if (!values) {
                        delete t[listKey]
                        continue
                    }
                    if (!Array.isArray(values)) {
                        throw (
                            "Sublist expansion of `" +
                            listKey +
                            "` failed: not an array to expand with:" +
                            JSON.stringify(values)
                        )
                    }
                    t[listKey] = [].concat(
                        ...values.map((v) => ExpandRewrite.RewriteParts(sourceKey, v, original))
                    )
                }

                for (let j = 0; j < keysToRewrite.sourceString.length; j++) {
                    // The string that should be replaced everywhere in `t`
                    const key = keysToRewrite.sourceString[j]
                    if (sourceKeysToIgnore.indexOf(key) >= 0) {
                        continue
                    }
                    // The object that `key` should be replaced with
                    const target = keysToRewrite.into[i][j]
                    t = ExpandRewrite.RewriteParts(key, target, t)
                }
                results.push(t)
            }
        }

        return results
    }
}
