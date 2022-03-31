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

    /**
     * Returns 'true' if the tagsfilter might select all features (i.e. the filter will return everything from OSM, except a few entries).
     * 
     * A typical negative tagsfilter is 'key!=value'
     * 
     * import {RegexTag} from "./RegexTag";
     * import {Tag} from "./Tag";
     * import {And} from "./And";
     * import {Or} from "./Or";  
     * 
     * new Tag("key","value").isNegative() // => false
     * new And([new RegexTag("key","value", true)]).isNegative() // => true
     * new Or([new RegexTag("key","value", true), new Tag("x","y")]).isNegative() // => true
     * new And([new RegexTag("key","value", true), new Tag("x","y")]).isNegative() // => false
     */
    abstract isNegative(): boolean
    
}