import {Utils} from "../../Utils";
import {RegexTag} from "./RegexTag";
import {TagsFilter} from "./TagsFilter";

export class Tag extends TagsFilter {
    public key: string
    public value: string

    constructor(key: string, value: string) {
        super()
        this.key = key
        this.value = value
        if (key === undefined || key === "") {
            throw "Invalid key: undefined or empty";
        }
        if (value === undefined) {
            throw "Invalid value: value is undefined";
        }
        if (value === "*") {
            console.warn(`Got suspicious tag ${key}=*   ; did you mean ${key}~* ?`)
        }
    }


    matchesProperties(properties: any): boolean {
        const foundValue = properties[this.key]
        if (foundValue === undefined && (this.value === "" || this.value === undefined)) {
            // The tag was not found
            // and it shouldn't be found!
            return true;
        }

        return foundValue === this.value;
    }

    asOverpass(): string[] {
        if (this.value === "") {
            // NOT having this key
            return ['[!"' + this.key + '"]'];
        }
        return [`["${this.key}"="${this.value}"]`];
    }

    asHumanString(linkToWiki?: boolean, shorten?: boolean, currentProperties?: any) {
        let v = this.value;
        if (shorten) {
            v = Utils.EllipsesAfter(v, 25);
        }
        if (v === "" || v === undefined) {
            // This tag will be removed if in the properties, so we indicate this with special rendering
            if (currentProperties !== undefined && (currentProperties[this.key] ?? "") === "") {
                // This tag is not present in the current properties, so this tag doesn't change anything
                return ""
            }
            return "<span class='line-through'>" + this.key + "</span>"
        }
        if (linkToWiki) {
            return `<a href='https://wiki.openstreetmap.org/wiki/Key:${this.key}' target='_blank'>${this.key}</a>` +
                `=` +
                `<a href='https://wiki.openstreetmap.org/wiki/Tag:${this.key}%3D${this.value}' target='_blank'>${v}</a>`
        }
        return this.key + "=" + v;
    }

    isUsableAsAnswer(): boolean {
        return true;
    }

    isEquivalent(other: TagsFilter): boolean {
        if (other instanceof Tag) {
            return this.key === other.key && this.value === other.value;
        }
        if (other instanceof RegexTag) {
            other.isEquivalent(this);
        }
        return false;
    }

    usedKeys(): string[] {
        return [this.key];
    }

    asChange(properties: any): { k: string; v: string }[] {
        return [{k: this.key, v: this.value}];
    }

    AsJson() {
        return this.asHumanString(false, false)
    }
}