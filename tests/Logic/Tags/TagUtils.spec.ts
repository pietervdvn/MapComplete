import {describe} from 'mocha'
import {expect} from 'chai'
import {TagUtils} from "../../../Logic/Tags/TagUtils";
import {Tag} from "../../../Logic/Tags/Tag";
import {RegexTag} from "../../../Logic/Tags/RegexTag";
import {And} from "../../../Logic/Tags/And";

describe("TagUtils", () => {
    
    describe("ParseTag", () => {
        it("should parse a simple key=value tag", () => {
            const tag = TagUtils.Tag("key=value") as Tag;
            expect(tag.key).eq( "key");
            expect(tag.value).eq("value");
        })

        it("should parse an 'empty spec' key= tag", () => {
            const tag = TagUtils.Tag("key=") as Tag;
            expect(tag.key).eq( "key");
            expect(tag.value).eq("");
        })
        it("should parse a 'not-empty spec' key!= tag", () => {
            const tag = TagUtils.Tag("key!=") as RegexTag;
            expect(tag.invert).true
            expect(tag.key).eq( "key");
            expect(tag.value["source"]).eq("^..*$");
        })
        
        it("should parse a normal 'not-equals-value' key!=value tag", () => {
            const tag = TagUtils.Tag("key!=value") as RegexTag
            expect(tag.invert).true
            expect(tag.key).eq( "key");
            expect(tag.value["source"]).eq("^value$");
        })

        it("should refuse a key!=* tag", () => {
            expect(() => TagUtils.Tag("key!=*")).to.throw();
        })
        
        it("should parse regextags", () => {
            const notReg = TagUtils.Tag("x!~y") as RegexTag;
            expect(notReg.key).eq("x")
            expect(notReg.value["source"]).eq("^y$")
            expect(notReg.invert).true
        })
        
        it("should parse and", () => {
            const and = TagUtils.Tag({"and": ["key=value", "x=y"]}) as And;
            expect(and.and[0]["key"]).eq("key")
            expect(and.and[0]["value"]).eq("value")
            expect(and.and[1]["key"]).eq("x")
            expect(and.and[1]["value"]).eq("y")

        })
    })
})
