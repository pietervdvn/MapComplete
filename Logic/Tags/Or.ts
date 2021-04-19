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

    asHumanString(linkToWiki: boolean, shorten: boolean, properties) {
        return this.or.map(t => t.asHumanString(linkToWiki, shorten, properties)).join("|");
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

    asChange(properties: any): { k: string; v: string }[] {
        const result = []
        for (const tagsFilter of this.or) {
            result.push(...tagsFilter.asChange(properties))
        }
        return result;
    }
}


