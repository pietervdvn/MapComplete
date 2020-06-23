export class Regex implements TagsFilter {
    private _k: string;
    private _r: string;

    constructor(k: string, r: string) {
        this._k = k;
        this._r = r;
    }

    asOverpass(): string[] {
        return ["['" + this._k + "'~'" + this._r + "']"];
    }

    matches(tags: { k: string; v: string }[]): boolean {
        for (const tag of tags) {
            if (tag.k === this._k) {
                if (tag.v === "") {
                    // This tag has been removed
                    return false;
                }
                if (this._r === "*") {
                    // Any is allowed
                    return true;
                }

                return tag.v.match(this._r).length > 0;
            }
        }
        return false;
    }

}

export class Tag implements TagsFilter {
    public key: string;
    public value: string;

    constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
    }

    matches(tags: { k: string; v: string }[]): boolean {
        for (const tag of tags) {

            if (tag.k === this.key) {
                if (tag.v === "") {
                    // This tag has been removed
                    return false;
                }
                if (this.value === "*") {
                    // Any is allowed
                    return true;
                }

                return this.value === tag.v;
            }
        }
        return false;
    }

    asOverpass(): string[] {
        if (this.value === "*") {
            return ['["' + this.key + '"]'];
        }
        if (this.value === "") {
            // NOT having this key
            return ['[!"' + this.key + '"]'];
        }
        return ['["' + this.key + '"="' + this.value + '"]'];
    }

}

export class Or implements TagsFilter {

    public or: TagsFilter[]

    constructor(or: TagsFilter[]) {
        this.or = or;
    }


    matches(tags: { k: string; v: string }[]): boolean {

        for (const tagsFilter of this.or) {
            if (tagsFilter.matches(tags)) {
                return true;
            }
        }

        return false;
    }

    asOverpass(): string[] {

        const choices = [];
        for (const tagsFilter of this.or) {
            const subChoices = tagsFilter.asOverpass();
            for(const subChoice of subChoices){
                choices.push(subChoice)
            }
        }
        return choices;
    }

}

export class And implements TagsFilter {

    public and: TagsFilter[]

    constructor(and: TagsFilter[]) {
        this.and = and;
    }

    matches(tags: { k: string; v: string }[]): boolean {

        for (const tagsFilter of this.and) {
            if (!tagsFilter.matches(tags)) {
                return false;
            }
        }

        return true;
    }

    private combine(filter: string, choices: string[]): string[] {
        var values = []
        for (const or of choices) {
            values.push(filter + or);
        }
        return values;
    }

    asOverpass(): string[] {

        var allChoices = null;

        for (const andElement of this.and) {
            var andElementFilter = andElement.asOverpass();
            if (allChoices === null) {
                allChoices = andElementFilter;
                continue;
            }

            var newChoices = []
            for (var choice of allChoices) {
                newChoices.push(
                    this.combine(choice, andElementFilter)
                )
            }
            allChoices = newChoices;
        }
        return allChoices;
    }
}

export interface TagsFilter {
    matches(tags: { k: string, v: string }[]): boolean

    asOverpass(): string[]
}

export class TagUtils {

    static proprtiesToKV(properties: any): { k: string, v: string }[] {
        const result = [];
        for (const k in properties) {
            result.push({k: k, v: properties[k]})
        }
        return result;
    }

}