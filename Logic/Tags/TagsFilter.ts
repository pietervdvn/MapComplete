export abstract class TagsFilter {

    abstract asOverpass(): string[]

    abstract isUsableAsAnswer(): boolean;

    abstract isEquivalent(other: TagsFilter): boolean;

    abstract matchesProperties(properties: any): boolean;

    abstract asHumanString(linkToWiki: boolean, shorten: boolean, properties: any): string;

    abstract usedKeys(): string[];

    /**
     * Returns all normal key/value pairs
     * Regex tags, substitutions, comparisons, ... are exempt
     */
    abstract usedTags(): {key: string, value: string}[];

    /**
     * Converts the tagsFilter into a list of key-values that should be uploaded to OSM.
     * Throws an error if not applicable.
     *
     * Note: properties are the already existing tags-object. It is only used in the substituting tag
     */
    abstract asChange(properties: any): { k: string, v: string }[]

    abstract AsJson() ;

    /**
     * Returns an optimized version (or self) of this tagsFilter
     */
    abstract optimize(): TagsFilter | boolean;


}