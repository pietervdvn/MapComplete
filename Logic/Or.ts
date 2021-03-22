import {TagsFilter} from "./TagsFilter";


export class Or extends TagsFilter {
    public or: TagsFilter[]

    constructor(or: TagsFilter[]) {
        super();
        this.or = or;
    }
    
    matchesProperties(properties: any): boolean {
        for (const tagsFilter of this.or) {
            if (tagsFilter.matchesProperties(properties)) {
                return true;
            }
        }

        return false;
    }

    asOverpass(): string[] {
        const choices = [];
        for (const tagsFilter of this.or) {
            const subChoices = tagsFilter.asOverpass();
            for (const subChoice of subChoices) {
                choices.push(subChoice)
            }
        }
        return choices;
    }

    substituteValues(tags: any): TagsFilter {
        const newChoices = [];
        for (const c of this.or) {
            newChoices.push(c.substituteValues(tags));
        }
        return new Or(newChoices);
    }

    asHumanString(linkToWiki: boolean, shorten: boolean) {
        return this.or.map(t => t.asHumanString(linkToWiki, shorten)).join("|");
    }

    isUsableAsAnswer(): boolean {
        return false;
    }

    isEquivalent(other: TagsFilter): boolean {
        if (other instanceof Or) {

            for (const selfTag of this.or) {
                let matchFound = false;
                for (let i = 0; i < other.or.length && !matchFound; i++) {
                    let otherTag = other.or[i];
                    matchFound = selfTag.isEquivalent(otherTag);
                }
                if (!matchFound) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    usedKeys(): string[] {
        return [].concat(...this.or.map(subkeys => subkeys.usedKeys()));
    }
}


