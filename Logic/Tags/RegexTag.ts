import {Tag} from "./Tag";
import {TagsFilter} from "./TagsFilter";

export class RegexTag extends TagsFilter {
    private readonly key: RegExp | string;
    private readonly value: RegExp | string;
    private readonly invert: boolean;
    private readonly matchesEmpty: boolean

    constructor(key: string | RegExp, value: RegExp | string, invert: boolean = false) {
        super();
        this.key = key;
        this.value = value;
        this.invert = invert;
        this.matchesEmpty = RegexTag.doesMatch("", this.value);
    }

    private static doesMatch(fromTag: string, possibleRegex: string | RegExp): boolean {
        if(fromTag === undefined){
            return;
        }
        if (typeof possibleRegex === "string") {
            return fromTag === possibleRegex;
        }
        return fromTag.match(possibleRegex) !== null;
    }

    private static source(r: string | RegExp) {
        if (typeof (r) === "string") {
            return r;
        }
        return r.source;
    }

    asOverpass(): string[] {
        if (typeof this.key === "string") {
            return [`['${this.key}'${this.invert ? "!" : ""}~'${RegexTag.source(this.value)}']`];
        }
        return [`[~'${this.key.source}'${this.invert ? "!" : ""}~'${RegexTag.source(this.value)}']`];
    }

    isUsableAsAnswer(): boolean {
        return false;
    }

    matchesProperties(tags: any): boolean {
        for (const key in tags) {
            if(key === undefined){
                continue;
            }
            if (RegexTag.doesMatch(key, this.key)) {
                const value = tags[key] ?? "";
                return RegexTag.doesMatch(value, this.value) != this.invert;
            }
        }
        if (this.matchesEmpty) {
            // The value is 'empty'
            return !this.invert;
        }
        // The matching key was not found
        return this.invert;
    }

    asHumanString() {
        if (typeof this.key === "string") {
            return `${this.key}${this.invert ? "!" : ""}~${RegexTag.source(this.value)}`;
        }
        return `${this.key.source}${this.invert ? "!" : ""}~~${RegexTag.source(this.value)}`
    }

    isEquivalent(other: TagsFilter): boolean {
        if (other instanceof RegexTag) {
            return other.asHumanString() == this.asHumanString();
        }
        if (other instanceof Tag) {
            return RegexTag.doesMatch(other.key, this.key) && RegexTag.doesMatch(other.value, this.value);
        }
        return false;
    }

    usedKeys(): string[] {
        if (typeof this.key === "string") {
            return [this.key];
        }
        throw "Key cannot be determined as it is a regex"
    }

    asChange(properties: any): { k: string; v: string }[] {
        if(this.invert){
            return []
        }
        if (typeof this.key === "string") {
            if( typeof this.value === "string"){
                return [{k: this.key, v: this.value}]
            }
            if(this.value.toString() != "/^..*$/"){
                console.warn("Regex value in tag; using wildcard:", this.key, this.value)
            }
            return [{k: this.key, v: undefined}]
        }
        console.error("Cannot export regex tag to asChange; ", this.key, this.value)
        return []
    }
}