import { TagsFilter } from "./TagsFilter"
import { Or } from "./Or"
import { TagUtils } from "./TagUtils"
import { Tag } from "./Tag"
import { RegexTag } from "./RegexTag"
import { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson"
import { ExpressionSpecification } from "maplibre-gl"
import ComparingTag from "./ComparingTag"

export class And extends TagsFilter {
    public and: TagsFilter[]

    constructor(and: TagsFilter[]) {
        super()
        this.and = and
    }

    public static construct(and: TagsFilter[]): TagsFilter {
        if (and.length === 1) {
            return and[0]
        }
        return new And(and)
    }

    private static combine(filter: string, choices: string[]): string[] {
        const values = []
        for (const or of choices) {
            values.push(filter + or)
        }
        return values
    }

    normalize() {
        const ands = []
        for (const c of this.and) {
            if (c instanceof And) {
                ands.push(...c.and)
            } else {
                ands.push(c)
            }
        }
        return new And(ands)
    }

    matchesProperties(tags: Record<string, string>): boolean {
        for (const tagsFilter of this.and) {
            if (!tagsFilter.matchesProperties(tags)) {
                return false
            }
        }

        return true
    }

    /**
     *
     * const and = new And([new Tag("boundary","protected_area"), new RegexTag("protect_class","98",true)])
     * and.asOverpass() // => [ "[\"boundary\"=\"protected_area\"][\"protect_class\"!=\"98\"]" ]
     */
    asOverpass(): string[] {
        let allChoices: string[] = null
        for (const andElement of this.and) {
            const andElementFilter = andElement.asOverpass()
            if (allChoices === null) {
                allChoices = andElementFilter
                continue
            }

            const newChoices: string[] = []
            for (const choice of allChoices) {
                newChoices.push(...And.combine(choice, andElementFilter))
            }
            allChoices = newChoices
        }
        return allChoices
    }

    asJson(): TagConfigJson {
        return { and: this.and.map((a) => a.asJson()) }
    }

    asHumanString(linkToWiki?: boolean, shorten?: boolean, properties?: Record<string, string>) {
        return this.and
            .map((t) => {
                let e = t.asHumanString(linkToWiki, shorten, properties)
                if (t["or"]) {
                    e = "(" + e + ")"
                }
                return e
            })
            .filter((x) => x !== "")
            .join(" & ")
    }

    isUsableAsAnswer(): boolean {
        for (const t of this.and) {
            if (!t.isUsableAsAnswer()) {
                return false
            }
        }
        return true
    }

    /**
     * const t0 = new And([
     *     new Tag("valves:special", "A"),
     *     new Tag("valves", "A")
     * ])
     * const t1 = new And([new Tag("valves", "A")])
     * const t2 = new And([new Tag("valves", "B")])
     * t0.shadows(t0) // => true
     * t1.shadows(t1) // => true
     * t2.shadows(t2) // => true
     * t0.shadows(t1) // => false
     * t0.shadows(t2) // => false
     * t1.shadows(t0) // => false
     * t1.shadows(t2) // => false
     * t2.shadows(t0) // => false
     * t2.shadows(t1) // => false
     */
    shadows(other: TagsFilter): boolean {
        if (!(other instanceof And)) {
            return false
        }

        for (const selfTag of this.and) {
            let matchFound = false
            for (const otherTag of other.and) {
                matchFound = selfTag.shadows(otherTag)
                if (matchFound) {
                    break
                }
            }
            if (!matchFound) {
                return false
            }
        }

        for (const otherTag of other.and) {
            let matchFound = false
            for (const selfTag of this.and) {
                matchFound = selfTag.shadows(otherTag)
                if (matchFound) {
                    break
                }
            }
            if (!matchFound) {
                return false
            }
        }

        return true
    }

    usedKeys(): string[] {
        return [].concat(...this.and.map((subkeys) => subkeys.usedKeys()))
    }

    usedTags(): { key: string; value: string }[] {
        return [].concat(...this.and.map((subkeys) => subkeys.usedTags()))
    }

    asChange(properties: Readonly<Record<string, string>>): { k: string; v: string }[] {
        const result = []
        for (const tagsFilter of this.and) {
            result.push(...tagsFilter.asChange(properties))
        }
        return result
    }

    /**
     * IN some contexts, some expressions can be considered true, e.g.
     * (X=Y | (A=B & X=Y))
     *        ^---------^
     * When the evaluation hits (A=B & X=Y), we know _for sure_ that X=Y does _not_ match, as it would have matched the first clause otherwise.
     * This means that the entire 'AND' is considered FALSE
     *
     * new And([ new Tag("key","value") ,new Tag("other_key","value")]).removePhraseConsideredKnown(new Tag("key","value"), true) // => new Tag("other_key","value")
     * new And([ new Tag("key","value") ,new Tag("other_key","value")]).removePhraseConsideredKnown(new Tag("key","value"), false) // => false
     * new And([ new RegexTag("key",/^..*$/) ,new Tag("other_key","value")]).removePhraseConsideredKnown(new Tag("key","value"), true) // => new Tag("other_key","value")
     * new And([ new Tag("key","value") ]).removePhraseConsideredKnown(new Tag("key","value"), true) // => true
     *
     * // should remove 'club~*' if we know that 'club=climbing'
     * const expr = <And> TagUtils.Tag({and: ["sport=climbing", {or:["club~*", "office~*"]}]} )
     * expr.removePhraseConsideredKnown(new Tag("club","climbing"), true) // => new Tag("sport","climbing")
     *
     * const expr = <And> TagUtils.Tag({and: ["sport=climbing", {or:["club~*", "office~*"]}]} )
     * expr.removePhraseConsideredKnown(new Tag("club","climbing"), false) // => expr
     */
    removePhraseConsideredKnown(knownExpression: TagsFilter, value: boolean): TagsFilter | boolean {
        const newAnds: TagsFilter[] = []
        for (const tag of this.and) {
            if (tag instanceof And) {
                throw "Optimize expressions before using removePhraseConsideredKnown"
            }
            if (tag instanceof Or) {
                const r = tag.removePhraseConsideredKnown(knownExpression, value)
                if (r === true) {
                    continue
                }
                if (r === false) {
                    return false
                }
                newAnds.push(r)
                continue
            }
            if (value && knownExpression.shadows(tag)) {
                /**
                 * At this point, we do know that 'knownExpression' is true in every case
                 * As `shadows` does define that 'tag' MUST be true if 'knownExpression' is true,
                 * we can be sure that 'tag' is true as well.
                 *
                 * "True" is the neutral element in an AND, so we can skip the tag
                 */
                continue
            }
            if (!value && tag.shadows(knownExpression)) {
                /**
                 * We know that knownExpression is unmet.
                 * if the tag shadows 'knownExpression' (which is the case when control flows gets here),
                 * then tag CANNOT be met too, as known expression is not met.
                 *
                 * This implies that 'tag' must be false too!
                 */

                // false is the element which absorbs all
                return false
            }

            newAnds.push(tag)
        }
        if (newAnds.length === 0) {
            return true
        }
        return And.construct(newAnds)
    }

    /**
     * const raw = {"and": [{"or":["leisure=playground","playground!=forest"]},{"or":["leisure=playground","playground!=forest"]}]}
     * const parsed = TagUtils.Tag(raw)
     * parsed.optimize().asJson() // => {"or":["leisure=playground","playground!=forest"]}
     *
     * const raw = {"and": [{"and":["advertising=screen"]}, {"and":["advertising~*"]}]}]
     * const parsed = TagUtils.Tag(raw)
     * parsed.optimize().asJson() // => "advertising=screen"
     *
     * const raw = {"and": ["count=0", "count>0"]}
     * const parsed = TagUtils.Tag(raw)
     * parsed.optimize() // => false
     *
     * const raw = {"and": ["count>0", "count>10"]}
     * const parsed = TagUtils.Tag(raw)
     * parsed.optimize().asJson() // => "count>0"
     *
     * // regression test
     * const orig = {
     *   "and": [
     *     "sport=climbing",
     *     "climbing!~route",
     *     "climbing!=route_top",
     *     "climbing!=route_bottom",
     *     "leisure!~sports_centre"
     *   ]
     * }
     * const parsed = TagUtils.Tag(orig)
     * parsed.optimize().asJson() // => orig
     */
    optimize(): TagsFilter | boolean {
        if (this.and.length === 0) {
            return true
        }
        const optimizedRaw = this.and
            .map((t) => t.optimize())
            .filter((t) => t !== true /* true is the neutral element in an AND, we drop them*/)
        if (optimizedRaw.some((t) => t === false)) {
            // We have an AND with a contained false: this is always 'false'
            return false
        }
        const optimized = <TagsFilter[]>optimizedRaw

        for (let i = 0; i <optimized.length; i++) {
            for (let j = i + 1; j < optimized.length; j++) {
                const ti = optimized[i]
                const tj = optimized[j]
                if(ti.shadows(tj)){
                    // if 'ti' is true, this implies 'tj' is always true as well.
                    // if 'ti' is false, then 'tj' might be true or false
                    // (e.g. let 'ti' be 'count>0' and 'tj' be 'count>10'.
                    // As such, it is no use to keep 'tj' around:
                    // If 'ti' is true, then 'tj' will be true too and 'tj' can be ignored
                    // If 'ti' is false, then the entire expression will be false and it doesn't matter what 'tj' yields
                    optimized.splice(j, 1)
                }else if (tj.shadows(ti)){
                    optimized.splice(i, 1)
                    i--
                    continue
                }
            }
        }


        {
            // Conflicting keys do return false
            const properties: Record<string, string> = {}
            for (const opt of optimized) {
                if (opt instanceof Tag) {
                    properties[opt.key] = opt.value
                }
            }

            for (let i = 0; i < optimized.length; i++) {
                const opt = optimized[i]
                if (opt instanceof Tag) {
                    const k = opt.key
                    const v = properties[k]
                    if (v === undefined) {
                        continue
                    }
                    if (v !== opt.value) {
                        // detected an internal conflict
                        return false
                    }
                } else if (opt instanceof RegexTag) {
                    const k = opt.key
                    if (typeof k !== "string") {
                        continue
                    }
                    const v = properties[k]
                    if (v === undefined) {
                        continue
                    }
                    if (opt.invert) {
                        // We should _not_ match this value
                        // If 'v' is given, we already know what value it should be
                        // If 'v' is the not-expected value, we have a conflict and return false
                        // Otherwise, we can safely drop this value

                        const doesMatch =
                            (typeof opt.value === "string" && v === opt.value) ||
                            v.match(<RegExp>opt.value) !== null

                        if (doesMatch) {
                            // We have a conflict as 'opt' is inverted
                            return false
                        } else {
                            optimized.splice(i, 1)
                            i--
                        }
                    } else {
                        if (!v.match(opt.value)) {
                            // We _know_ that for the key of the RegexTag `opt`, the value will be `v`.
                            // As such, if `opt.value` cannot match `v`, we detected an internal conflict and can fail

                            return false
                        } else {
                            // Another tag already provided a _stricter_ value then this regex, so we can remove this one!
                            optimized.splice(i, 1)
                            i--
                        }
                    }
                }else if(opt instanceof ComparingTag) {
                    const ct = opt
                    if(properties[ct.key] !== undefined && !ct.matchesProperties(properties)){
                        return false
                    }
                }
            }
        }

        const newAnds: TagsFilter[] = []

        let containedOrs: Or[] = []
        for (const tf of optimized) {
            if (tf instanceof And) {
                newAnds.push(...tf.and)
            } else if (tf instanceof Or) {
                containedOrs.push(tf)
            } else {
                newAnds.push(tf)
            }
        }

        {
            let dirty = false
            do {
                const cleanedContainedOrs: Or[] = []
                outer: for (let containedOr of containedOrs) {
                    for (const known of newAnds) {
                        // input for optimazation: (K=V & (X=Y | K=V))
                        // containedOr: (X=Y | K=V)
                        // newAnds (and thus known): (K=V) --> true
                        const cleaned = containedOr.removePhraseConsideredKnown(known, true)
                        if (cleaned === true) {
                            // The neutral element within an AND
                            continue outer // skip addition too
                        }
                        if (cleaned === false) {
                            // zero element
                            return false
                        }
                        if (cleaned instanceof Or) {
                            containedOr = cleaned
                            continue
                        }
                        // the 'or' dissolved into a normal tag -> it has to be added to the newAnds
                        newAnds.push(cleaned)
                        dirty = true // rerun this algo later on
                        continue outer
                    }
                    cleanedContainedOrs.push(containedOr)
                }
                containedOrs = cleanedContainedOrs
            } while (dirty)
        }

        containedOrs = containedOrs.filter((ca) => {
            const isShadowed = TagUtils.containsEquivalents(newAnds, ca.or)
            // If 'isShadowed', then at least one part of the 'OR' is matched by the outer and, so this means that this OR isn't needed at all
            // XY & (XY | AB) === XY
            return !isShadowed
        })

        // Extract common keys from the OR
        if (containedOrs.length === 1) {
            newAnds.push(containedOrs[0])
        } else if (containedOrs.length > 1) {
            let commonValues: TagsFilter[] = containedOrs[0].or
            for (let i = 1; i < containedOrs.length && commonValues.length > 0; i++) {
                const containedOr = containedOrs[i]
                commonValues = commonValues.filter((cv) =>
                    containedOr.or.some((candidate) => candidate.shadows(cv))
                )
            }
            if (commonValues.length === 0) {
                newAnds.push(...containedOrs)
            } else {
                const newOrs: TagsFilter[] = []
                for (const containedOr of containedOrs) {
                    const elements = containedOr.or.filter(
                        (candidate) => !commonValues.some((cv) => cv.shadows(candidate))
                    )
                    if (elements.length > 0) {
                        newOrs.push(Or.construct(elements))
                    }
                }
                if (newOrs.length > 0) {
                    commonValues.push(And.construct(newOrs))
                }
                const result = new Or(commonValues).optimize()
                if (result === false) {
                    return false
                } else if (result === true) {
                    // neutral element: skip
                } else {
                    newAnds.push(result)
                }
            }
        }
        if (newAnds.length === 0) {
            return true
        }

        if (TagUtils.ContainsOppositeTags(newAnds)) {
            return false
        }

        TagUtils.sortFilters(newAnds, true)

        return And.construct(newAnds)
    }

    isNegative(): boolean {
        return !this.and.some((t) => !t.isNegative())
    }

    visit(f: (tagsFilter: TagsFilter) => void) {
        f(this)
        this.and.forEach((sub) => sub.visit(f))
    }

    asMapboxExpression(): ExpressionSpecification {
        return ["all", ...this.and.map((t) => t.asMapboxExpression())]
    }
}
