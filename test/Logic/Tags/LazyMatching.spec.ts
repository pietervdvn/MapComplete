import {describe} from 'mocha'
import {expect} from 'chai'
import {TagUtils} from "../../../Logic/Tags/TagUtils";
import {Tag} from "../../../Logic/Tags/Tag";

describe("Lazy object properties", () => {
    
    
    it("should be matche by a normal tag", () => {
        const properties = {}
        const key = "_key"
        Object.defineProperty(properties, key, {
            configurable: true,
            get: function () {
                delete properties[key]
                properties[key] = "yes"
                return "yes"
            }
        })
        const filter = new Tag("_key", "yes")
        expect(filter.matchesProperties(properties)).true

    })
    
        it("should be matched by a RegexTag", () => {
            const properties = {}
            const key = "_key"
            Object.defineProperty(properties, key, {
                configurable: true,
                get: function () {
                    delete properties[key]
                    properties[key] = "yes"
                    return "yes"
                }
            })
            const filter = TagUtils.Tag("_key~*")
           expect(filter.matchesProperties(properties)).true;

        })
})
