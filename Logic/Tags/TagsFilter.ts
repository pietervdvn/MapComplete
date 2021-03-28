export abstract class TagsFilter {

    abstract asOverpass(): string[]

    abstract isUsableAsAnswer(): boolean;

    abstract isEquivalent(other: TagsFilter): boolean;

    abstract matchesProperties(properties: any): boolean;

    abstract asHumanString(linkToWiki: boolean, shorten: boolean);

    abstract usedKeys(): string[];
    
}