import { TagsFilter } from "./TagsFilter"
import { Tag } from "./Tag"
import { Utils } from "../../Utils"
import { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson"
import { ExpressionSpecification } from "maplibre-gl"

/**
 * The substituting-tag uses the tags of a feature a variables and replaces them.
 *
 * e.g. key:={other_key}_{ref} will match an object that has at least 'key'.
 * If {other_key} is _not_ defined, it will not be substituted.
 *
 * The 'key' is always fixed and should not contain substitutions.
 * This cannot be used to query features
 */
export default class SubstitutingTag extends TagsFilter {
    private readonly _key: string
    private readonly _value: string
    private readonly _invert: boolean

    constructor(key: string, value: string, invert = false) {
        super()
        this._key = key
        this._value = value
        this._invert = invert
    }

    asMapboxExpression(): ExpressionSpecification {
        throw new Error("Method not implemented.")
    }

    private static substituteString(template: string, dict: Record<string, string>): string {
        for (const k in dict) {
            template = template.replace(new RegExp("\\{" + k + "\\}", "g"), dict[k])
        }
        return template.replace(/{.*}/g, "")
    }

    asTag(currentProperties: Record<string, string>) {
        if (this._invert) {
            throw "Cannot convert an inverted substituting tag"
        }
        return new Tag(this._key, Utils.SubstituteKeys(this._value, currentProperties))
    }

    asHumanString(linkToWiki?: boolean, shorten?: boolean, properties?: Record<string, string>) {
        return (
            this._key +
            (this._invert ? "!" : "") +
            "=" +
            SubstitutingTag.substituteString(this._value, properties)
        )
    }

    asJson(): TagConfigJson {
        return this._key + (this._invert ? "!" : "") + ":=" + this._value
    }

    asOverpass(): string[] {
        throw "A variable with substitution can not be used to query overpass"
    }

    shadows(other: TagsFilter): boolean {
        if (!(other instanceof SubstitutingTag)) {
            return false
        }
        return (
            other._key === this._key &&
            other._value === this._value &&
            other._invert === this._invert
        )
    }

    isUsableAsAnswer(): boolean {
        return !this._invert
    }

    /**
     * const assign = new SubstitutingTag("survey:date", "{_date:now}")
     * assign.matchesProperties({"survey:date": "2021-03-29", "_date:now": "2021-03-29"}) // => true
     * assign.matchesProperties({"survey:date": "2021-03-29", "_date:now": "2021-01-01"}) // => false
     * assign.matchesProperties({"survey:date": "2021-03-29"}) // => false
     * assign.matchesProperties({"_date:now": "2021-03-29"}) // => false
     * assign.matchesProperties({"some_key": "2021-03-29"}) // => false
     */
    matchesProperties(properties: Record<string, string>): boolean {
        const value = properties[this._key]
        if (value === undefined || value === "") {
            return false
        }
        const expectedValue = SubstitutingTag.substituteString(this._value, properties)
        return (value === expectedValue) !== this._invert
    }

    usedKeys(): string[] {
        return [this._key]
    }

    usedTags(): { key: string; value: string }[] {
        return []
    }

    asChange(properties: Readonly<Record<string, string>>): { k: string; v: string }[] {
        if (this._invert) {
            throw "An inverted substituting tag can not be used to create a change"
        }
        const v = SubstitutingTag.substituteString(this._value, properties)
        if (v.match(/{.*}/) !== null) {
            throw "Could not calculate all the substitutions: still have " + v
        }
        return [{ k: this._key, v: v }]
    }

    optimize(): TagsFilter | boolean {
        return this
    }

    isNegative(): boolean {
        return false
    }

    visit(f: (tagsFilter: TagsFilter) => void) {
        f(this)
    }
}
