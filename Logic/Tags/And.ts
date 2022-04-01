import {TagsFilter} from "./TagsFilter";
import {Or} from "./Or";
import {TagUtils} from "./TagUtils";

export class And extends TagsFilter {
    public and: TagsFilter[]
    constructor(and: TagsFilter[]) {
        super();
        this.and = and
    }

    private static combine(filter: string, choices: string[]): string[] {
        const values = [];
        for (const or of choices) {
            values.push(filter + or);
        }
        return values;
    }

    normalize() {
        const ands = []
        for (const c of this.and) {
            if (c instanceof And) {
                ands.push(...c.and)
            } else {
                ands.push(c)
            }
        }
        return new And(ands)
    }

    matchesProperties(tags: any): boolean {
        for (const tagsFilter of this.and) {
            if (!tagsFilter.matchesProperties(tags)) {
                return false;
            }
        }

        return true;
    }

    /**
     *
     * import {Tag} from "./Tag";
     * import {RegexTag} from "./RegexTag";
     * 
     * const and = new And([new Tag("boundary","protected_area"), new RegexTag("protect_class","98",true)])
     * and.asOverpass() // => [ "[\"boundary\"=\"protected_area\"][\"protect_class\"!~\"^98$\"]" ]
     */
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
        return this.and.map(t => t.asHumanString(linkToWiki, shorten, properties)).filter(x => x !== "").join("&");
    }

    isUsableAsAnswer(): boolean {
        for (const t of this.and) {
            if (!t.isUsableAsAnswer()) {
                return false;
            }
        }
        return true;
    }

    /**
     * const t0 = new And([
     *     new Tag("valves:special", "A"),
     *     new Tag("valves", "A")
     * ])
     * const t1 = new And([new Tag("valves", "A")])
     * const t2 = new And([new Tag("valves", "B")])
     * t0.isEquivalent(t0) // => true
     * t1.isEquivalent(t1) // => true
     * t2.isEquivalent(t2) // => true
     * t0.isEquivalent(t1) // => false
     * t0.isEquivalent(t2) // => false
     * t1.isEquivalent(t0) // => false
     * t1.isEquivalent(t2) // => false
     * t2.isEquivalent(t0) // => false
     * t2.isEquivalent(t1) // => false
     */
    isEquivalent(other: TagsFilter): boolean {
        if (!(other instanceof And)) {
            return false;
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
    
    usedTags(): { key: string; value: string }[] {
        return [].concat(...this.and.map(subkeys => subkeys.usedTags()));
    }

    asChange(properties: any): { k: string; v: string }[] {
        const result = []
        for (const tagsFilter of this.and) {
            result.push(...tagsFilter.asChange(properties))
        }
        return result;
    }

    AsJson() {
        return {
            and: this.and.map(a => a.AsJson())
        }
    }
    
    optimize(): TagsFilter | boolean {
        if(this.and.length === 0){
            return true
        }
        const optimized = this.and.map(t => t.optimize())
        
        const newAnds : TagsFilter[] = []
        
        let containedOrs : Or[] = []
        for (const tf of optimized) {
            if(tf === false){
                return false
            }
            if(tf === true){
                continue
            }
            
            if(tf instanceof And){
                newAnds.push(...tf.and)
            }else if(tf instanceof Or){
                containedOrs.push(tf)
            } else {
                newAnds.push(tf)
            }
        }

        containedOrs = containedOrs.filter(ca => {
            for (const element of ca.or) {
                if(optimized.some(opt => typeof opt !== "boolean" && element.isEquivalent(opt) )){
                    // At least one part of the 'OR' is matched by the outer or, so this means that this OR isn't needed at all
                    // XY & (XY | AB) === XY
                    return false
                }
            }
            return true;
        })

        // Extract common keys from the OR
        if(containedOrs.length === 1){
            newAnds.push(containedOrs[0])
        }
        if(containedOrs.length > 1){
            let commonValues : TagsFilter [] = containedOrs[0].or
            for (let i = 1; i < containedOrs.length && commonValues.length > 0; i++){
                const containedOr = containedOrs[i];
                commonValues = commonValues.filter(cv => containedOr.or.some(candidate => candidate.isEquivalent(cv)))
            }
            if(commonValues.length === 0){
                newAnds.push(...containedOrs)
            }else{
                const newOrs: TagsFilter[] = []
                for (const containedOr of containedOrs) {
                    const elements = containedOr.or
                        .filter(candidate => !commonValues.some(cv => cv.isEquivalent(candidate)))
                    const or = new Or(elements).optimize()
                    if(or === true){
                        // neutral element
                        continue
                    }
                    if(or === false){
                        return false
                    }
                    newOrs.push(or)
                }
                
                commonValues.push(new And(newOrs))
                const result = new Or(commonValues).optimize()
                if(result === false){
                    return false
                }else if(result === true){
                    // neutral element: skip
                }else{
                    newAnds.push(result)
                }
            }
        }

        if(newAnds.length === 1){
            return newAnds[0]
        }
        TagUtils.sortFilters(newAnds, true)
        
        return new And(newAnds)
    }
    
    isNegative(): boolean {
        return !this.and.some(t => !t.isNegative());
    }
}