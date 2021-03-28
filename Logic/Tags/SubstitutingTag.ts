import {TagsFilter} from "./TagsFilter";

/**
 * The substituting-tag uses the tags of a feature a variables and replaces them.
 *
 * e.g. key:={other_key}_{ref} will match an object that has at least 'key'.
 * If {other_key} is _not_ defined, it will not be substituted.
 *
 * The 'key' is always fixed and should not contain substitutions.
 * This cannot be used to query features
 */
export default class SubstitutingTag implements TagsFilter {
    private readonly _key: string;
    private readonly _value: string;

    constructor(key: string, value: string) {
        this._key = key;
        this._value = value;
    }

    private static substituteString(template: string, dict: any) {
        for (const k in dict) {
            template = template.replace(new RegExp("\\{" + k + "\\}", 'g'), dict[k])
        }
        return template;
    }

    asHumanString(linkToWiki: boolean, shorten: boolean) {
        return this._key + ":=" + this._value;
    }

    asOverpass(): string[] {
        throw "A variable with substitution can not be used to query overpass"
    }

    isEquivalent(other: TagsFilter): boolean {
        if (!(other instanceof SubstitutingTag)) {
            return false;
        }
        return other._key === this._key && other._value === this._value;
    }

    isUsableAsAnswer(): boolean {
        return true;
    }

    matchesProperties(properties: any): boolean {
        const value = properties[this._key];
        if (value === undefined || value === "") {
            return false;
        }
        const expectedValue = SubstitutingTag.substituteString(this._value, properties);
        return value === expectedValue;
    }

    usedKeys(): string[] {
        return [this._key];
    }
}