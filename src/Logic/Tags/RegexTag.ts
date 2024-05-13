import { Tag } from "./Tag"
import { TagsFilter } from "./TagsFilter"
import { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson"
import { ExpressionSpecification } from "maplibre-gl"

export class RegexTag extends TagsFilter {
    public readonly key: RegExp | string
    public readonly value: RegExp | string
    public readonly invert: boolean
    public readonly matchesEmpty: boolean

    constructor(key: string | RegExp, value: RegExp | string, invert: boolean = false) {
        super()
        this.key = key
        this.value = value
        if (this.value instanceof RegExp && ("" + this.value).startsWith("^(^(")) {
            throw "Detected a duplicate start marker ^(^( in a regextag:" + this.value
        }
        this.invert = invert
        this.matchesEmpty = RegexTag.doesMatch("", this.value)
    }

    /**
     *
     * Checks that the value provided by the object properties (`fromTag`) match the specified regex `possibleRegex
     *
     * RegexTag.doesMatch("abc", /abc/) // => true
     * RegexTag.doesMatch("ab", /abc/) // => false
     * RegexTag.doesMatch("", /.+/) // => false
     * RegexTag.doesMatch("", new RegExp(".*")) // => true
     *
     * @param fromTag
     * @param possibleRegex
     * @private
     */
    private static doesMatch(fromTag: string | number, possibleRegex: string | RegExp): boolean {
        if (fromTag === undefined) {
            return
        }
        if (typeof fromTag === "number") {
            fromTag = "" + fromTag
        }
        if (typeof possibleRegex === "string") {
            return fromTag === possibleRegex
        }
        return possibleRegex.test(fromTag)
    }

    private static source(r: string | RegExp, includeStartMarker: boolean = true) {
        if (typeof r === "string") {
            return r
        }
        if (r === undefined) {
            return undefined
        }
        const src = r.source
        if (includeStartMarker) {
            return src
        }
        if (src.startsWith("^(") && src.endsWith(")$")) {
            return src.substring(2, src.length - 2)
        }
        return src
    }

    /**
     * new RegexTag("a", /^[xyz]$/).asOverpass() // => [ `["a"~"^[xyz]$"]` ]
     *
     * // A wildcard regextag should only give the key
     * new RegexTag("a", /^..*$/).asOverpass() // => [ `["a"]` ]
     * new RegexTag("a", /.+/).asOverpass() // => [ `["a"]` ]
     *
     * // A regextag with a regex key should give correct output
     * new RegexTag(/a.*x/, /^..*$/).asOverpass() // => [ `[~"a.*x"~\"^..*$\"]` ]
     *
     * // A regextag with a case invariant flag should signal this to overpass
     * new RegexTag("key", /^.*value.*$/i).asOverpass() // => [ `["key"~\"^.*value.*$\",i]` ]
     */
    asOverpass(): string[] {
        const inv = this.invert ? "!" : ""
        if (typeof this.key !== "string") {
            // The key is a regex too
            return [`[~"${this.key.source}"${inv}~"${RegexTag.source(this.value)}"]`]
        }

        if (this.value instanceof RegExp) {
            const src = this.value.source
            if (src === "^..*$" || src === ".+") {
                // anything goes
                return [`[${inv}"${this.key}"]`]
            }
            const modifier = this.value.ignoreCase ? ",i" : ""
            return [`["${this.key}"${inv}~"${src}"${modifier}]`]
        } else {
            // Normal key and normal value
            return [`["${this.key}"${inv}="${this.value}"]`]
        }
    }

    /**
     * import { TagUtils } from "./TagUtils";
     *
     * const t = TagUtils.Tag("a~b")
     * t.asJson() // => "a~b"
     *
     * const t = TagUtils.Tag("a=")
     * t.asJson() // => "a="
     */
    asJson(): TagConfigJson {
        const v = RegexTag.source(this.value, false)
        if (typeof this.key === "string") {
            const oper = typeof this.value === "string" ? "=" : "~"
            return `${this.key}${this.invert ? "!" : ""}${oper}${v}`
        }
        return `${this.key.source}${this.invert ? "!" : ""}~~${v}`
    }

    isUsableAsAnswer(): boolean {
        return false
    }

    /**
     * Checks if this tag matches the given properties
     *
     * const isNotEmpty = new RegexTag("key",/^$/, true);
     * isNotEmpty.matchesProperties({"key": "value"}) // => true
     * isNotEmpty.matchesProperties({"key": "other_value"}) // => true
     * isNotEmpty.matchesProperties({"key": ""}) // => false
     * isNotEmpty.matchesProperties({"other_key": ""}) // => false
     * isNotEmpty.matchesProperties({"other_key": "value"}) // => false
     *
     * const isNotEmpty = new RegexTag("key",/^..*$/, true);
     * isNotEmpty.matchesProperties({"key": "value"}) // => false
     * isNotEmpty.matchesProperties({"key": "other_value"}) // => false
     * isNotEmpty.matchesProperties({"key": ""}) // => true
     * isNotEmpty.matchesProperties({"other_key": ""}) // => true
     * isNotEmpty.matchesProperties({"other_key": "value"}) // => true
     *
     * const notRegex = new RegexTag("x", /^y$/, true)
     * notRegex.matchesProperties({"x": "y"}) // => false
     * notRegex.matchesProperties({"x": "z"}) // => true
     * notRegex.matchesProperties({"x": ""}) // => true
     * notRegex.matchesProperties({}) // => true
     *
     * const bicycleTubeRegex = new RegexTag("vending", /^.*bicycle_tube.*$/)
     * bicycleTubeRegex.matchesProperties({"vending": "bicycle_tube"}) // => true
     * bicycleTubeRegex.matchesProperties({"vending": "something;bicycle_tube"}) // => true
     * bicycleTubeRegex.matchesProperties({"vending": "bicycle_tube;something"}) // => true
     * bicycleTubeRegex.matchesProperties({"vending": "xyz;bicycle_tube;something"}) // => true
     *
     * const nameStartsWith = new RegexTag("name", /^[sS]peelbox.*$/)
     * nameStartsWith.matchesProperties({"name": "Speelbos Sint-Anna"} => true
     * nameStartsWith.matchesProperties({"name": "speelbos Sint-Anna"} => true
     * nameStartsWith.matchesProperties({"name": "Sint-Anna"} => false
     * nameStartsWith.matchesProperties({"name": ""} => false
     *
     * const notEmptyList = new RegexTag("xyz", /^\[\]$/, true)
     * notEmptyList.matchesProperties({"xyz": undefined}) // => true
     * notEmptyList.matchesProperties({"xyz": "[]"}) // => false
     * notEmptyList.matchesProperties({"xyz": "[\"abc\"]"}) // => true
     *
     * const importMatch = new RegexTag("tags", /(^|.*;)amenity=public_bookcase($|;.*)/)
     * importMatch.matchesProperties({"tags": "amenity=public_bookcase;name=test"}) // =>true
     * importMatch.matchesProperties({"tags": "amenity=public_bookcase"}) // =>true
     * importMatch.matchesProperties({"tags": "name=test;amenity=public_bookcase"}) // =>true
     * importMatch.matchesProperties({"tags": "amenity=bench"}) // =>false
     *
     * new RegexTag("key","value").matchesProperties({"otherkey":"value"}) // => false
     * new RegexTag("key","value",true).matchesProperties({"otherkey":"something"}) // => true
     *
     * const v: string = <any> {someJson: ""}
     * new RegexTag("key", new RegExp(".*")).matchesProperties({"key": v}) // => true
     * new RegexTag("key", new RegExp(".*")).matchesProperties({"key": ""}) // => true
     * new RegexTag("key", new RegExp(".*")).matchesProperties({"key": null}) // => true
     * new RegexTag("key", new RegExp(".*")).matchesProperties({"key": undefined}) // => true
     *
     * const v: string = <any> {someJson: ""}
     * new RegexTag("key", new RegExp(".+")).matchesProperties({"key": null}) // => false
     * new RegexTag("key", new RegExp(".+")).matchesProperties({"key": undefined}) // => false
     * new RegexTag("key", new RegExp(".+")).matchesProperties({"key": v}) // => true
     * new RegexTag("key", new RegExp(".+")).matchesProperties({"key": ""}) // => false
     *
     * // Show work with non-string objects
     * new RegexTag("key", "true").matchesProperties({"key": true}) // => true
     * new RegexTag("key", "true", true).matchesProperties({"key": true}) // => false
     */
    matchesProperties(tags: Record<string, string | number | boolean>): boolean {
        if (typeof this.key === "string") {
            let value = tags[this.key]
            if (!value || value === "") {
                // No tag is known, so we assume the empty string
                // If this regexTag matches the empty string, we return true, otherwise false
                // (Note: if inverted, we must reverse this)
                return this.invert !== this.matchesEmpty
            }

            if (typeof value === "string") {
                return RegexTag.doesMatch(value, this.value) != this.invert
            }

            // The value under test is _not_ a string; it can be a culculated tag, thus be e.g. a number or a boolean
            // It might also be an object

            if (typeof this.value !== "string") {
                const regExp = this.value
                if (regExp.source === ".*") {
                    // We match anything, and we do have some value
                    return !this.invert
                }
            }
            if (typeof value !== "string") {
                value = JSON.stringify(value)
            }
            return RegexTag.doesMatch(value, this.value) != this.invert
        }

        for (const key in tags) {
            if (key === undefined) {
                continue
            }
            if (RegexTag.doesMatch(key, this.key)) {
                let value = tags[key] ?? ""
                if (typeof value !== "string") {
                    value = JSON.stringify(value)
                }
                return RegexTag.doesMatch(value, this.value) != this.invert
            }
        }
        if (this.matchesEmpty) {
            // The value is 'empty'
            return !this.invert
        }
        // The matching key was not found
        return this.invert
    }

    asHumanString() {
        if (typeof this.key === "string") {
            const oper = typeof this.value === "string" ? "=" : "~"
            return `${this.key}${this.invert ? "!" : ""}${oper}${RegexTag.source(this.value)}`
        }
        return `${this.key.source}${this.invert ? "!" : ""}~~${RegexTag.source(this.value)}`
    }

    /**
     *
     * new RegexTag("key","value").shadows(new Tag("key","value")) // => true
     * new RegexTag("key",/value/).shadows(new RegexTag("key","value")) // => true
     * new RegexTag("key",/^..*$/).shadows(new Tag("key","value")) // => false
     * new RegexTag("key",/^..*$/).shadows(new Tag("other_key","value")) // => false
     * new RegexTag("key", /^a+$/).shadows(new Tag("key", "a")) // => false
     *
     *
     * // should not shadow too eagerly: the first tag might match 'key=abc', the second won't
     *  new RegexTag("key", /^..*$/).shadows(new Tag("key", "some_value")) // => false
     *
     * // should handle 'invert'
     * new RegexTag("key",/^..*$/, true).shadows(new Tag("key","value")) // => false
     * new RegexTag("key",/^..*$/, true).shadows(new Tag("key","")) // => true
     * new RegexTag("key","value", true).shadows(new Tag("key","value")) // => false
     * new RegexTag("key","value", true).shadows(new Tag("key","some_other_value")) // => false
     * new RegexTag("key","value", true).shadows(new Tag("key","some_other_value", true)) // => false
     *
     * const route = TagUtils.Tag("climbing!~route")
     * const routeBottom = TagUtils.Tag("climbing!~route_bottom")
     * route.shadows(routeBottom) // => false
     * routeBottom.shadows(route) // => false
     *
     */
    shadows(other: TagsFilter): boolean {
        if (other instanceof RegexTag) {
            if ((other.key["source"] ?? other.key) !== (this.key["source"] ?? this.key)) {
                // Keys don't match, never shadowing
                return false
            }
            if (
                (other.value["source"] ?? other.value) === (this.value["source"] ?? this.value) &&
                this.invert == other.invert
            ) {
                // Values (and inverts) match
                return true
            }
            if (typeof other.value === "string") {
                const valuesMatch = RegexTag.doesMatch(other.value, this.value)
                if (!this.invert && !other.invert) {
                    // this: key~value, other: key=value
                    return valuesMatch
                }
                if (this.invert && !other.invert) {
                    // this: key!~value, other: key=value
                    return !valuesMatch
                }
                if (!this.invert && other.invert) {
                    // this: key~value, other: key!=value
                    return !valuesMatch
                }
                if (!this.invert && !other.invert) {
                    // this: key!~value, other: key!=value
                    return valuesMatch
                }
            }
            return false
        }
        if (other instanceof Tag) {
            if (!RegexTag.doesMatch(other.key, this.key)) {
                // Keys don't match
                return false
            }

            if (this.value["source"] === "^..*$") {
                if (this.invert) {
                    return other.value === ""
                }
                return false
            }

            if (this.invert) {
                /*
                 * this: "a!=b"
                 * other: "a=c"
                 * actual property: a=x
                 * In other words: shadowing will never occur here
                 */
                return false
            }
            // Unless the values are the same, it is pretty hard to figure out if they are shadowing. This is future work
            return (this.value["source"] ?? this.value) === other.value
        }
        return false
    }

    usedKeys(): string[] {
        if (typeof this.key === "string") {
            return [this.key]
        }
        return []
    }

    usedTags(): { key: string; value: string }[] {
        return []
    }

    asChange(): { k: string; v: string }[] {
        if (this.invert) {
            return []
        }
        if (typeof this.key === "string") {
            if (typeof this.value === "string") {
                return [{ k: this.key, v: this.value }]
            }
            return [{ k: this.key, v: undefined }]
        }
        console.error("Cannot export regex tag to asChange; ", this.key, this.value)
        return []
    }

    optimize(): TagsFilter | boolean {
        return this
    }

    isNegative(): boolean {
        return this.invert
    }

    visit(f: (TagsFilter) => void) {
        f(this)
    }

    asMapboxExpression(): ExpressionSpecification {
        if (typeof this.key === "string" && typeof this.value === "string") {
            return [this.invert ? "!=" : "==", ["get", this.key], this.value]
        }
        throw "TODO"
    }
}
