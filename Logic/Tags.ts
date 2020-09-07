import {Utils} from "../Utils";

export abstract class TagsFilter {
    abstract matches(tags: { k: string, v: string }[]): boolean
    abstract asOverpass(): string[]
    abstract substituteValues(tags: any) : TagsFilter;
    abstract isUsableAsAnswer() : boolean;

    matchesProperties(properties: Map<string, string>): boolean {
        return this.matches(TagUtils.proprtiesToKV(properties));
    }

    abstract asHumanString(linkToWiki: boolean, shorten: boolean);
}


export class RegexTag extends TagsFilter {
    private readonly key: RegExp | string;
    private readonly value: RegExp | string;
    private readonly invert: boolean;

    constructor(key: string | RegExp, value: RegExp | string, invert: boolean = false) {
        super();
        this.key = key;
        this.value = value;
        this.invert = invert;
    }

    asOverpass(): string[] {
        return [`['${RegexTag.source(this.key)}'${this.invert ? "!" : ""}~'${RegexTag.source(this.value)}']`];
    }

    private static doesMatch(fromTag: string, possibleRegex: string | RegExp): boolean {
        if(typeof possibleRegex === "string"){
            return fromTag === possibleRegex;
        }
        return fromTag.match(possibleRegex) !== null;
    }

    private static source(r: string | RegExp) {
        if (typeof (r) === "string") {
            return r;
        }
        return r.source;
    }
    
    isUsableAsAnswer(): boolean {
        return false;
    }

    matches(tags: { k: string; v: string }[]): boolean {
        for (const tag of tags) {
            if (RegexTag.doesMatch(tag.k, this.key)){
                return RegexTag.doesMatch(tag.v, this.value) != this.invert;
            }
        }
        // The matching key was not found
        return this.invert;
    }

    substituteValues(tags: any) : TagsFilter{
        return this;
    }
    
    asHumanString() {
        if (typeof this.key === "string") {
            return `${this.key}${this.invert ? "!" : ""}~${RegexTag.source(this.value)}`;
        }
        return `~${this.key.source}${this.invert ? "!" : ""}~${RegexTag.source(this.value)}`
    }
}


export class Tag extends TagsFilter {
    public key: string
    public value: string

    constructor(key: string, value: string) {
        super()
        this.key = key
        this.value = value
        if(key === undefined || key === ""){
            throw "Invalid key";
        }
        if(value === undefined){
            throw "Invalid value";
        }
        if(value === "*"){
         console.warn(`Got suspicious tag ${key}=*   ; did you mean ${key}~* ?`)
        }
    }

    matches(tags: { k: string; v: string }[]): boolean {
        if (this.value === "") {
            return true
        }
        
        for (const tag of tags) {
            if (this.key == tag.k) {

                if (tag.v === "") {
                    // This tag has been removed -> always matches false
                    return false;
                }

                if (this.value === tag.v) {
                    return true;
                }
            }
        }

        return false;
    }

    asOverpass(): string[] {
        if (this.value === "") {
            // NOT having this key
            return ['[!"' + this.key + '"]'];
        }
        return [`["${this.key}"="${this.value}"]`];
    }

    substituteValues(tags: any) {
        return new Tag(this.key, TagUtils.ApplyTemplate(this.value as string, tags));
    }

    asHumanString(linkToWiki: boolean, shorten: boolean) {
        let v = this.value;
        if (shorten) {
            v = Utils.EllipsesAfter(v, 25);
        }
        if (linkToWiki) {
            return `<a href='https://wiki.openstreetmap.org/wiki/Key:${this.key}' target='_blank'>${this.key}</a>` +
                `=` +
                `<a href='https://wiki.openstreetmap.org/wiki/Tag:${this.key}%3D${this.value}' target='_blank'>${v}</a>`
        }
        return this.key + "=" + v;
    }
    
    isUsableAsAnswer(): boolean {
        return true;
    }
}


export class Or extends TagsFilter {
    public or: TagsFilter[]

    constructor(or: TagsFilter[]) {
        super();
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
}


export class And extends TagsFilter {
    public and: TagsFilter[]

    constructor(and: TagsFilter[]) {
        super();
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

    private static combine(filter: string, choices: string[]): string[] {
        const values = [];
        for (const or of choices) {
            values.push(filter + or);
        }
        return values;
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

    substituteValues(tags: any): TagsFilter {
        const newChoices = [];
        for (const c of this.and) {
            newChoices.push(c.substituteValues(tags));
        }
        return new And(newChoices);
    }

    asHumanString(linkToWiki: boolean, shorten: boolean) {
        return this.and.map(t => t.asHumanString(linkToWiki, shorten)).join("&");
    }
    
    isUsableAsAnswer(): boolean {
        for (const t of this.and) {
            if(!t.isUsableAsAnswer()){
                return false;
            }
        }
        return true;
    }
}



export class TagUtils {
    static proprtiesToKV(properties: any): { k: string, v: string }[] {
        const result = [];
        for (const k in properties) {
            result.push({k: k, v: properties[k]})
        }
        return result;
    }

    static ApplyTemplate(template: string, tags: any): string {
        for (const k in tags) {
            while (template.indexOf("{" + k + "}") >= 0) {
                const escaped = tags[k].replace(/</g, '&lt;').replace(/>/g, '&gt;');
                template = template.replace("{" + k + "}", escaped);
            }
        }
        return template;
    }

    static KVtoProperties(tags: Tag[]): any {
        const properties = {};
        for (const tag of tags) {
            properties[tag.key] = tag.value
        }
        return properties;
    }
    
}
