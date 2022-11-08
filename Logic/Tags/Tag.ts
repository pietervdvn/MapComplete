import { Utils } from "../../Utils"
import { TagsFilter } from "./TagsFilter"

export class Tag extends TagsFilter {
    public key: string
    public value: string
    public static newlyCreated = new Tag("_newly_created", "yes")
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
        if (value.indexOf("&") >= 0) {
            const tags = (key + "=" + value).split("&")
            throw `Invalid value for a tag: it contains '&'. You probably meant to use '{"and":[${tags
                .map((kv) => '"' + kv + '"')
                .join(", ")}]}'`
        }
    }

    /**
     * imort
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
     */
    matchesProperties(properties: any): boolean {
        const foundValue = properties[this.key]
        if (foundValue === undefined && (this.value === "" || this.value === undefined)) {
            // The tag was not found
            // and it shouldn't be found!
            return true
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

    /**

     const t = new Tag("key", "value")
     t.asHumanString() // => "key=value"
     t.asHumanString(true) // => "<a href='https://wiki.openstreetmap.org/wiki/Key:key' target='_blank'>key</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:key%3Dvalue' target='_blank'>value</a>"
     */
    asHumanString(linkToWiki?: boolean, shorten?: boolean, currentProperties?: any) {
        let v = this.value
        if (shorten) {
            v = Utils.EllipsesAfter(v, 25)
        }
        if (v === "" || (v === undefined && currentProperties !== undefined)) {
            // This tag will be removed if in the properties, so we indicate this with special rendering
            if (currentProperties !== undefined && (currentProperties[this.key] ?? "") === "") {
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
     *
     * // should handle advanced regexes
     * new Tag("key", "aaa").shadows(new RegexTag("key", /a+/)) // => true
     * new Tag("key","value").shadows(new RegexTag("key", /^..*$/, true)) // => false
     * new Tag("key","value").shadows(new Tag("key","value")) // => true
     * new Tag("key","some_other_value").shadows(new RegexTag("key", "value", true)) // => true
     * new Tag("key","value").shadows(new RegexTag("key", "value", true)) // => false
     * new Tag("key","value").shadows(new RegexTag("otherkey", "value", true)) // => false
     * new Tag("key","value").shadows(new RegexTag("otherkey", "value", false)) // => false
     */
    shadows(other: TagsFilter): boolean {
        if (other["key"] !== undefined) {
            if (other["key"] !== this.key) {
                return false
            }
        }
        return other.matchesProperties({ [this.key]: this.value })
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

    asChange(properties: any): { k: string; v: string }[] {
        return [{ k: this.key, v: this.value }]
    }

    optimize(): TagsFilter | boolean {
        return this
    }

    isNegative(): boolean {
        return false
    }

    visit(f: (TagsFilter) => void) {
        f(this)
    }
}
