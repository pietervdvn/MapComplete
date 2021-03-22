export abstract class TagsFilter {

    abstract asOverpass(): string[]

    abstract substituteValues(tags: any): TagsFilter;

    abstract isUsableAsAnswer(): boolean;

    abstract isEquivalent(other: TagsFilter): boolean;

    abstract matchesProperties(properties: any): boolean;

    abstract asHumanString(linkToWiki: boolean, shorten: boolean);

    abstract usedKeys(): string[];

    public matches(tags: { k: string, v: string }[]) {
        const properties = {};
        for (const kv of tags) {
            properties[kv.k] = kv.v;
        }
        return this.matchesProperties(properties);
    }
}