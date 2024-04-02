import { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson"
import { ExpressionSpecification } from "maplibre-gl"

export abstract class TagsFilter {
    abstract asOverpass(): string[]

    abstract isUsableAsAnswer(): boolean

    /**
     * Indicates some form of equivalency:
     * if `this.shadows(t)`, then `this.matches(properties)` implies that `t.matches(properties)` for all possible properties
     */
    abstract shadows(other: TagsFilter): boolean

    abstract matchesProperties(properties: Record<string, string>): boolean

    abstract asHumanString(
        linkToWiki?: boolean,
        shorten?: boolean,
        properties?: Record<string, string>
    ): string

    abstract asJson(): TagConfigJson

    abstract usedKeys(): string[]

    /**
     * Returns all normal key/value pairs
     * Regex tags, substitutions, comparisons, ... are exempt
     */
    abstract usedTags(): { key: string; value: string }[]

    /**
     * Converts the tagsFilter into a list of key-values that should be uploaded to OSM.
     * Throws an error if not applicable.
     *
     * @param properties are the already existing tags-object. It is only used in the substituting tag and will not be changed
     */
    abstract asChange(properties: Readonly<Record<string, string>>): { k: string; v: string }[]

    public applyOn(properties: Readonly<Record<string, string>>): Record<string, string> {
        const copy = { ...properties }
        const changes = this.asChange(properties)
        for (const { k, v } of changes) {
            copy[k] = v
        }
        return copy
    }

    /**
     * Returns an optimized version (or self) of this tagsFilter
     */
    abstract optimize(): TagsFilter | boolean

    /**
     * Returns 'true' if the tagsfilter might select all features (i.e. the filter will return everything from OSM, except a few entries).
     *
     * A typical negative tagsfilter is 'key!=value'
     *
     * import {RegexTag} from "./RegexTag";
     * import {Tag} from "./Tag";
     * import {And} from "./And";
     * import {Or} from "./Or";
     *
     * new Tag("key","value").isNegative() // => false
     * new And([new RegexTag("key","value", true)]).isNegative() // => true
     * new Or([new RegexTag("key","value", true), new Tag("x","y")]).isNegative() // => true
     * new And([new RegexTag("key","value", true), new Tag("x","y")]).isNegative() // => false
     */
    abstract isNegative(): boolean

    /**
     * Walks the entire tree, every tagsFilter will be passed into the function once
     */
    abstract visit(f: (tagsFilter: TagsFilter) => void)

    abstract asMapboxExpression(): ExpressionSpecification
}
