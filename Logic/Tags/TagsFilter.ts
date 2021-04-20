export abstract class TagsFilter {

    abstract asOverpass(): string[]

    abstract isUsableAsAnswer(): boolean;

    abstract isEquivalent(other: TagsFilter): boolean;

    abstract matchesProperties(properties: any): boolean;

    abstract asHumanString(linkToWiki: boolean, shorten: boolean, properties: any);

    abstract usedKeys(): string[];
    
    /**
     * Converts the tagsFilter into a list of key-values that should be uploaded to OSM.
     * Throws an error if not applicable.
     * 
     * Note: properties are the already existing tags-object. It is only used in the substituting tag
     */
    abstract asChange(properties:any): {k: string, v:string}[]
    
}