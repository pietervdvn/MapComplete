import {TagsFilter} from "./TagsFilter";

export default class ComparingTag implements TagsFilter {
    private readonly _key: string;
    private readonly _predicate: (value: string) => boolean;
    private readonly _representation: string;

    constructor(key: string, predicate: (value: string | undefined) => boolean, representation: string = "") {
        this._key = key;
        this._predicate = predicate;
        this._representation = representation;
    }

    asChange(properties: any): { k: string; v: string }[] {
        throw "A comparable tag can not be used to be uploaded to OSM"
    }

    asHumanString(linkToWiki: boolean, shorten: boolean, properties: any) {
        return this._key + this._representation
    }

    asOverpass(): string[] {
        throw "A comparable tag can not be used as overpass filter"
    }

    isEquivalent(other: TagsFilter): boolean {
        return other === this;
    }

    isUsableAsAnswer(): boolean {
        return false;
    }

    /**
     * Checks if the properties match
     * 
     * const t = new ComparingTag("key", (x => Number(x) < 42))
     * t.matchesProperties({key: 42}) // => false
     * t.matchesProperties({key: 41}) // => true
     * t.matchesProperties({key: 0}) // => true
     * t.matchesProperties({differentKey: 42}) // => false
     */
    matchesProperties(properties: any): boolean {
        return this._predicate(properties[this._key]);
    }

    usedKeys(): string[] {
        return [this._key];
    }
    
    usedTags(): { key: string; value: string }[] {
        return [];
    }

    AsJson() {
        return this.asHumanString(false, false, {})
    }

    optimize(): TagsFilter | boolean {
        return this;
    }
}