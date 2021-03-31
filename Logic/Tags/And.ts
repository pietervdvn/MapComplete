import {TagsFilter} from "./TagsFilter";

export class And extends TagsFilter {
    public and: TagsFilter[]

    constructor(and: TagsFilter[]) {
        super();
        this.and = and;
    }

    private static combine(filter: string, choices: string[]): string[] {
        const values = [];
        for (const or of choices) {
            values.push(filter + or);
        }
        return values;
    }

    matchesProperties(tags: any): boolean {
        for (const tagsFilter of this.and) {
            if (!tagsFilter.matchesProperties(tags)) {
                return false;
            }
        }

        return true;
    }

    asOverpass(): string[] {
        let allChoices: string[] = null;
        for (const andElement of this.and) {
            const andElementFilter = andElement.asOverpass();
            if (allChoices === null) {
                allChoices = andElementFilter;
                continue;
            }

            const newChoices: string[] = [];
            for (const choice of allChoices) {
                newChoices.push(
                    ...And.combine(choice, andElementFilter)
                )
            }
            allChoices = newChoices;
        }
        return allChoices;
    }

    asHumanString(linkToWiki: boolean, shorten: boolean, properties) {
        return this.and.map(t => t.asHumanString(linkToWiki, shorten, properties)).join("&");
    }

    isUsableAsAnswer(): boolean {
        for (const t of this.and) {
            if (!t.isUsableAsAnswer()) {
                return false;
            }
        }
        return true;
    }

    isEquivalent(other: TagsFilter): boolean {
        if (!(other instanceof And)) {
            return false;
        }

        for (const selfTag of this.and) {
            let matchFound = false;
            for (let i = 0; i < other.and.length && !matchFound; i++) {
                let otherTag = other.and[i];
                matchFound = selfTag.isEquivalent(otherTag);
            }
            if (!matchFound) {
                return false;
            }
        }

        for (const selfTag of this.and) {
            let matchFound = false;
            for (const otherTag of other.and) {
                matchFound = selfTag.isEquivalent(otherTag);
                if (matchFound) {
                    break;
                }
            }
            if (!matchFound) {
                return false;
            }
        }

        for (const otherTag of other.and) {
            let matchFound = false;
            for (const selfTag of this.and) {
                matchFound = selfTag.isEquivalent(otherTag);
                if (matchFound) {
                    break;
                }
            }
            if (!matchFound) {
                return false;
            }
        }


        return true;
    }

    usedKeys(): string[] {
        return [].concat(...this.and.map(subkeys => subkeys.usedKeys()));
    }

    asChange(properties: any): { k: string; v: string }[] {
        const result = []
        for (const tagsFilter of this.and) {
            result.push(...tagsFilter.asChange(properties))
        }
        return result;
    }
}