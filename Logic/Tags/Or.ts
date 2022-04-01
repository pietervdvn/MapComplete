import {TagsFilter} from "./TagsFilter";
import {TagUtils} from "./TagUtils";
import {And} from "./And";


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

    /**
     *
     * import {Tag} from "./Tag";
     * import {RegexTag} from "./RegexTag";
     * 
     * const and = new And([new Tag("boundary","protected_area"), new RegexTag("protect_class","98",true)])
     * const or = new Or([and, new Tag("leisure", "nature_reserve"])
     * or.asOverpass() // => [ "[\"boundary\"=\"protected_area\"][\"protect_class\"!~\"^98$\"]", "[\"leisure\"=\"nature_reserve\"]" ]
     * 
     * // should fuse nested ors into a single list
     * const or = new Or([new Tag("key","value"), new Or([new Tag("key1","value1"), new Tag("key2","value2")])])
     * or.asOverpass() // => [ `["key"="value"]`, `["key1"="value1"]`, `["key2"="value2"]` ]
     */
    asOverpass(): string[] {
        const choices = [];
        for (const tagsFilter of this.or) {
            const subChoices = tagsFilter.asOverpass();
            choices.push(...subChoices)
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

    usedTags(): { key: string; value: string }[] {
        return [].concat(...this.or.map(subkeys => subkeys.usedTags()));
    }

    asChange(properties: any): { k: string; v: string }[] {
        const result = []
        for (const tagsFilter of this.or) {
            result.push(...tagsFilter.asChange(properties))
        }
        return result;
    }

    AsJson() {
        return {
            or: this.or.map(o => o.AsJson())
        }
    }

    optimize(): TagsFilter | boolean {
        
        if(this.or.length === 0){
            return false;
        }
        
        const optimized = this.or.map(t => t.optimize())

        const newOrs : TagsFilter[] = []

        let containedAnds : And[] = []
        for (const tf of optimized) {
            if(tf === true){
                return true
            }
            if(tf === false){
                continue
            }

            if(tf instanceof Or){
                newOrs.push(...tf.or)
            }else if(tf instanceof And){
                containedAnds.push(tf)
            } else {
                newOrs.push(tf)
            }
        }
        
        containedAnds = containedAnds.filter(ca => {
            for (const element of ca.and) {
                if(optimized.some(opt => typeof opt !== "boolean" && element.isEquivalent(opt) )){
                    // At least one part of the 'AND' is matched by the outer or, so this means that this OR isn't needed at all
                    // XY | (XY & AB) === XY
                    return false
                }
            }
            return true;
        })

        // Extract common keys from the ANDS
        if(containedAnds.length === 1){
            newOrs.push(containedAnds[0])
        } else if(containedAnds.length > 1){
            let commonValues : TagsFilter [] = containedAnds[0].and
            for (let i = 1; i < containedAnds.length && commonValues.length > 0; i++){
                const containedAnd = containedAnds[i];
                commonValues = commonValues.filter(cv => containedAnd.and.some(candidate => candidate.isEquivalent(cv)))
            }
            if(commonValues.length === 0){
                newOrs.push(...containedAnds)
            }else{
                const newAnds: TagsFilter[] = []
                for (const containedAnd of containedAnds) {
                    const elements = containedAnd.and.filter(candidate => !commonValues.some(cv => cv.isEquivalent(candidate)))
                    newAnds.push(new And(elements))
                }

                commonValues.push(new Or(newAnds))
                const result = new And(commonValues).optimize()
                if(result === true){
                    return true
                }else if(result === false){
                    // neutral element: skip
                }else{
                    newOrs.push(new And(commonValues))
                }
            }
        }

        if(newOrs.length === 1){
            return newOrs[0]
        }
        TagUtils.sortFilters(newOrs, false)

        return new Or(newOrs)
    }
    
    isNegative(): boolean {
        return this.or.some(t => t.isNegative());
    }
}


