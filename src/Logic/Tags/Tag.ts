import { Utils } from "../../Utils"
import { TagsFilter } from "./TagsFilter"
import { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson"
import { ExpressionSpecification } from "maplibre-gl"
import { RegexTag } from "./RegexTag"

export class Tag extends TagsFilter {
    public key: string
    public value: string

    constructor(key: string, value: string) {
        super()
        this.key = key
        this.value = value
        if (key === undefined || key === "") {
            throw "Invalid key: undefined or empty"
        }
        if (value === undefined) {
            throw `Invalid value while constructing a Tag with key '${key}': value is undefined`
        }
        if (value === "*") {
            console.warn(`Got suspicious tag ${key}=*   ; did you mean ${key}~* ?`)
        }
    }

    /**
     *
     * const tag = new Tag("key","value")
     * tag.matchesProperties({"key": "value"}) // =>  true
     * tag.matchesProperties({"key": "z"}) // =>  false
     * tag.matchesProperties({"key": ""}) // => false
     * tag.matchesProperties({"other_key": ""}) // => false
     * tag.matchesProperties({"other_key": "value"}) // =>  false
     *
     * const isEmpty = new Tag("key","")
     * isEmpty.matchesProperties({"key": "value"}) // => false
     * isEmpty.matchesProperties({"key": ""}) // => true
     * isEmpty.matchesProperties({"other_key": ""}) // => true
     * isEmpty.matchesProperties({"other_key": "value"}) // => true
     * isEmpty.matchesProperties({"key": undefined}) // => true
     *
     * const isTrue = new Tag("key": "true")
     * isTrue.matchesProperties({"key":"true"}) // => true
     * isTrue.matchesProperties({"key": true}) // => true
     */
    matchesProperties(properties: Record<string, string>): boolean {
        let foundValue = properties[this.key]

        if (foundValue === undefined && (this.value === "" || this.value === undefined)) {
            // The tag was not found
            // and it shouldn't be found!
            return true
        }
        if (typeof foundValue !== "string") {
            if (foundValue === true && (this.value === "true" || this.value === "yes")) {
                return true
            }
            if (foundValue === false && (this.value === "false" || this.value === "no")) {
                return true
            }
            foundValue = "" + foundValue
        }
        return foundValue === this.value
    }

    asOverpass(): string[] {
        if (this.value === "") {
            // NOT having this key
            return ['[!"' + this.key + '"]']
        }
        return [`["${this.key}"="${this.value}"]`]
    }

    asJson(): TagConfigJson {
        return this.key + "=" + this.value
    }

    /**

     const t = new Tag("key", "value")
     t.asHumanString() // => "key=value"
     t.asHumanString(true) // => "<a href='https://wiki.openstreetmap.org/wiki/Key:key' target='_blank'>key</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:key%3Dvalue' target='_blank'>value</a>"
     */
    asHumanString(
        linkToWiki?: boolean,
        shorten?: boolean,
        currentProperties?: Record<string, string>
    ) {
        let v = this.value
        if (typeof v !== "string") {
            v = JSON.stringify(v)
        }
        if (shorten) {
            v = Utils.EllipsesAfter(v, 25)
        }
        if ((v === "" || v === undefined) && currentProperties !== undefined) {
            if (!currentProperties || Object.keys(currentProperties).length === 0) {
                // We are probably generating documentation
                return this.key + "="
            }

            // This tag will be removed if in the properties, so we indicate this with special rendering
            if ((currentProperties[this.key] ?? "") === "") {
                // This tag is not present in the current properties, so this tag doesn't change anything
                return ""
            }
            return "<span class='line-through'>" + this.key + "</span>"
        }
        if (linkToWiki) {
            return (
                `<a href='https://wiki.openstreetmap.org/wiki/Key:${this.key}' target='_blank'>${this.key}</a>` +
                `=` +
                `<a href='https://wiki.openstreetmap.org/wiki/Tag:${this.key}%3D${this.value}' target='_blank'>${v}</a>`
            )
        }
        return this.key + "=" + v
    }

    isUsableAsAnswer(): boolean {
        return true
    }

    /**
     *
     * import {RegexTag} from "./RegexTag";
     * import {And} from "./And";
     *
     * // should handle advanced regexes
     * new Tag("key", "aaa").shadows(new RegexTag("key", /a+/)) // => true
     * new Tag("key","value").shadows(new RegexTag("key", /^..*$/, true)) // => false
     * new Tag("key","value").shadows(new Tag("key","value")) // => true
     * new Tag("key","some_other_value").shadows(new RegexTag("key", "value", true)) // => true
     * new Tag("key","value").shadows(new RegexTag("key", "value", true)) // => false
     * new Tag("key","value").shadows(new RegexTag("otherkey", "value", true)) // => false
     * new Tag("key","value").shadows(new RegexTag("otherkey", "value", false)) // => false
     * new Tag("key","value").shadows(new And([new Tag("x","y"), new RegexTag("a","b", true)]) // => false
     */
    shadows(other: TagsFilter): boolean {
        if ((other["key"] !== this.key)) {
            return false
        }
        if(other instanceof Tag){
            // Other.key === this.key
            return other.value === this.value
        }
        if(other instanceof RegexTag){
            return other.matchesProperties({[this.key]: this.value})
        }
        return false
    }

    usedKeys(): string[] {
        return [this.key]
    }

    usedTags(): { key: string; value: string }[] {
        if (this.value == "") {
            return []
        }
        return [this]
    }

    asChange(): { k: string; v: string }[] {
        return [{ k: this.key, v: this.value }]
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

    asMapboxExpression(): ExpressionSpecification {
        if (this.value === "") {
            return ["any", ["!", ["has", this.key]], ["==", ["get", this.key], ""]]
        }
        return ["==", ["get", this.key], this.value]
    }
}
