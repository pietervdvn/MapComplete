import { TagsFilter } from "./TagsFilter"
import { TagUtils } from "./TagUtils"
import { And } from "./And"
import { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson"
import { ExpressionSpecification } from "maplibre-gl"

export class Or extends TagsFilter {
    public or: TagsFilter[]

    constructor(or: TagsFilter[]) {
        super()
        this.or = or
    }

    public static construct(or: TagsFilter[]): TagsFilter {
        if (or.length === 1) {
            return or[0]
        }
        return new Or(or)
    }

    matchesProperties(properties: Record<string, string>): boolean {
        for (const tagsFilter of this.or) {
            if (tagsFilter.matchesProperties(properties)) {
                return true
            }
        }

        return false
    }

    asJson(): TagConfigJson {
        return { or: this.or.map((o) => o.asJson()) }
    }

    /**
     *
     * import {Tag} from "./Tag";
     * import {RegexTag} from "./RegexTag";
     *
     * const and = new And([new Tag("boundary","protected_area"), new RegexTag("protect_class","98",true)])
     * const or = new Or([and, new Tag("leisure", "nature_reserve"])
     * or.asOverpass() // => [ "[\"boundary\"=\"protected_area\"][\"protect_class\"!=\"98\"]", "[\"leisure\"=\"nature_reserve\"]" ]
     *
     * // should fuse nested ors into a single list
     * const or = new Or([new Tag("key","value"), new Or([new Tag("key1","value1"), new Tag("key2","value2")])])
     * or.asOverpass() // => [ `["key"="value"]`, `["key1"="value1"]`, `["key2"="value2"]` ]
     */
    asOverpass(): string[] {
        const choices = []
        for (const tagsFilter of this.or) {
            const subChoices = tagsFilter.asOverpass()
            choices.push(...subChoices)
        }
        return choices
    }

    asHumanString(linkToWiki: boolean, shorten: boolean, properties: Record<string, string>) {
        return this.or
            .map((t) => {
                let e = t.asHumanString(linkToWiki, shorten, properties)
                if (t["and"]) {
                    e = "(" + e + ")"
                }
                return e
            })
            .join(" | ")
    }

    isUsableAsAnswer(): boolean {
        return false
    }

    shadows(other: TagsFilter): boolean {
        if (other instanceof Or) {
            for (const selfTag of this.or) {
                let matchFound = false
                for (let i = 0; i < other.or.length && !matchFound; i++) {
                    let otherTag = other.or[i]
                    matchFound = selfTag.shadows(otherTag)
                }
                if (!matchFound) {
                    return false
                }
            }
            return true
        }
        return false
    }

    usedKeys(): string[] {
        return [].concat(...this.or.map((subkeys) => subkeys.usedKeys()))
    }

    usedTags(): { key: string; value: string }[] {
        return [].concat(...this.or.map((subkeys) => subkeys.usedTags()))
    }

    asChange(properties: Readonly<Record<string, string>>): { k: string; v: string }[] {
        const result = []
        for (const tagsFilter of this.or) {
            result.push(...tagsFilter.asChange(properties))
        }
        return result
    }

    /**
     * IN some contexts, some expressions can be considered true, e.g.
     * (X=Y & (A=B | X=Y))
     *        ^---------^
     * When the evaluation hits (A=B | X=Y), we know _for sure_ that X=Y _does match, as it would have failed the first clause otherwise.
     * This means we can safely ignore this in the OR
     *
     * new Or([ new Tag("key","value") ,new Tag("other_key","value")]).removePhraseConsideredKnown(new Tag("key","value"), true) // =>true
     * new Or([ new Tag("key","value") ,new Tag("other_key","value")]).removePhraseConsideredKnown(new Tag("key","value"), false) // => new Tag("other_key","value")
     * new Or([ new Tag("key","value") ]).removePhraseConsideredKnown(new Tag("key","value"), true) // => true
     * new Or([ new Tag("key","value") ]).removePhraseConsideredKnown(new Tag("key","value"), false) // => false
     * new Or([new RegexTag("x", "y", true),new RegexTag("c", "d")]).removePhraseConsideredKnown(new Tag("foo","bar"), false) // => new Or([new RegexTag("x", "y", true),new RegexTag("c", "d")])
     */
    removePhraseConsideredKnown(knownExpression: TagsFilter, value: boolean): TagsFilter | boolean {
        const newOrs: TagsFilter[] = []
        for (const tag of this.or) {
            if (tag instanceof Or) {
                throw "Optimize expressions before using removePhraseConsideredKnown"
            }
            if (tag instanceof And) {
                const r = tag.removePhraseConsideredKnown(knownExpression, value)
                if (r === false) {
                    continue
                }
                if (r === true) {
                    return true
                }
                newOrs.push(r)
                continue
            }
            if (value && knownExpression.shadows(tag)) {
                /**
                 * At this point, we do know that 'knownExpression' is true in every case
                 * As `shadows` does define that 'tag' MUST be true if 'knownExpression' is true,
                 * we can be sure that 'tag' is true as well.
                 *
                 * "True" is the absorbing element in an OR, so we can return true
                 */
                return true
            }
            if (!value && tag.shadows(knownExpression)) {
                /**
                 * We know that knownExpression is unmet.
                 * if the tag shadows 'knownExpression' (which is the case when control flows gets here),
                 * then tag CANNOT be met too, as known expression is not met.
                 *
                 * This implies that 'tag' must be false too!
                 * false is the neutral element in an OR
                 */
                continue
            }
            newOrs.push(tag)
        }
        if (newOrs.length === 0) {
            return false
        }
        return Or.construct(newOrs)
    }

    /**
     * const raw = {"or": [{"and":["leisure=playground","playground!=forest"]},{"and":["leisure=playground","playground!=forest"]}]}
     * const parsed = TagUtils.Tag(raw)
     * parsed.optimize().asJson() // => {"and":["leisure=playground","playground!=forest"]}
     *
     */
    optimize(): TagsFilter | boolean {
        if (this.or.length === 0) {
            return false
        }

        const optimizedRaw = this.or
            .map((t) => t.optimize())
            .filter((t) => t !== false /* false is the neutral element in an OR, we drop them*/)
        if (optimizedRaw.some((t) => t === true)) {
            // We have an OR with a contained true: this is always 'true'
            return true
        }
        const optimized = <TagsFilter[]>optimizedRaw

        const newOrs: TagsFilter[] = []
        let containedAnds: And[] = []
        for (const tf of optimized) {
            if (tf["or"]) {
                // expand all the nested ors...
                newOrs.push(...tf["or"])
            } else if (tf instanceof And) {
                // partition of all the ands
                containedAnds.push(tf)
            } else {
                newOrs.push(tf)
            }
        }

        {
            let dirty = false
            do {
                const cleanedContainedANds: And[] = []
                outer: for (let containedAnd of containedAnds) {
                    for (const known of newOrs) {
                        // input for optimization: (K=V | (X=Y & K=V))
                        // containedAnd: (X=Y & K=V)
                        // newOrs (and thus known): (K=V) --> false
                        const cleaned = containedAnd.removePhraseConsideredKnown(known, false)
                        if (cleaned === false) {
                            // The neutral element within an OR
                            continue outer // skip addition too
                        }
                        if (cleaned === true) {
                            // zero element
                            return true
                        }
                        if (cleaned instanceof And) {
                            containedAnd = cleaned
                            continue // clean up with the other known values
                        }
                        // the 'and' dissolved into a normal tag -> it has to be added to the newOrs
                        newOrs.push(cleaned)
                        dirty = true // rerun this algo later on
                        continue outer
                    }
                    cleanedContainedANds.push(containedAnd)
                }
                containedAnds = cleanedContainedANds
            } while (dirty)
        }
        // Extract common keys from the ANDS
        if (containedAnds.length === 1) {
            newOrs.push(containedAnds[0])
        } else if (containedAnds.length > 1) {
            let commonValues: TagsFilter[] = containedAnds[0].and
            for (let i = 1; i < containedAnds.length && commonValues.length > 0; i++) {
                const containedAnd = containedAnds[i]
                commonValues = commonValues.filter((cv) =>
                    containedAnd.and.some((candidate) => candidate.shadows(cv))
                )
            }
            if (commonValues.length === 0) {
                newOrs.push(...containedAnds)
            } else {
                const newAnds: TagsFilter[] = []
                for (const containedAnd of containedAnds) {
                    const elements = containedAnd.and.filter(
                        (candidate) => !commonValues.some((cv) => cv.shadows(candidate))
                    )
                    if (elements.length == 0) {
                        continue
                    }
                    newAnds.push(And.construct(elements))
                }
                if (newAnds.length > 0) {
                    commonValues.push(Or.construct(newAnds))
                }

                const result = new And(commonValues).optimize()
                if (result === true) {
                    return true
                } else if (result === false) {
                    // neutral element: skip
                } else if (commonValues.length > 0) {
                    newOrs.push(And.construct(commonValues))
                }
            }
        }

        if (newOrs.length === 0) {
            return false
        }

        if (TagUtils.ContainsOppositeTags(newOrs)) {
            return true
        }

        TagUtils.sortFilters(newOrs, false)

        return Or.construct(newOrs)
    }

    isNegative(): boolean {
        return this.or.some((t) => t.isNegative())
    }

    visit(f: (tagsFilter: TagsFilter) => void) {
        f(this)
        this.or.forEach((t) => t.visit(f))
    }

    asMapboxExpression(): ExpressionSpecification {
        return ["any", ...this.or.map((t) => t.asMapboxExpression())]
    }
}
