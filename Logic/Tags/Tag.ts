import {Utils} from "../../Utils";
import {RegexTag} from "./RegexTag";
import {TagsFilter} from "./TagsFilter";
import {TagUtils} from "./TagUtils";

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
        for (const propertiesKey in properties) {
            if (this.key === propertiesKey) {
                const value = properties[propertiesKey];
                return value === this.value;
            }
        }
        // The tag was not found
        if (this.value === "") {
            // and it shouldn't be found!
            return true;
        }

        return false;
    }

    asOverpass(): string[] {
        if (this.value === "") {
            // NOT having this key
            return ['[!"' + this.key + '"]'];
        }
        return [`["${this.key}"="${this.value}"]`];
    }

    substituteValues(tags: any) {
        return new Tag(this.key, TagUtils.ApplyTemplate(this.value as string, tags));
    }

    asHumanString(linkToWiki: boolean, shorten: boolean) {
        let v = this.value;
        if (shorten) {
            v = Utils.EllipsesAfter(v, 25);
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
        return [{k: this.key,  v: this.value}];
    }
}