import {describe} from 'mocha'
import {expect} from 'chai'
import {TagUtils} from "../../../Logic/Tags/TagUtils";
import {equal} from "assert";

describe("TagUtils", () => {

    describe("ParseTag", () => {


        it("should refuse a key!=* tag", () => {
            expect(() => TagUtils.Tag("key!=*")).to.throw();
        })

        it("should handle compare tag <=5", () => {
            let compare = TagUtils.Tag("key<=5")
            equal(compare.matchesProperties({"key": undefined}), false);
            equal(compare.matchesProperties({"key": "6"}), false);
            equal(compare.matchesProperties({"key": "5"}), true);
            equal(compare.matchesProperties({"key": "4"}), true);
        })
        
        it("should handle compare tag < 5", () => {
            const compare = TagUtils.Tag("key<5")
            equal(compare.matchesProperties({"key": undefined}), false);
            equal(compare.matchesProperties({"key": "6"}), false);
            equal(compare.matchesProperties({"key": "5"}), false);
            equal(compare.matchesProperties({"key": "4.2"}), true);
        })

        it("should handle compare tag >5", () => {
            const compare = TagUtils.Tag("key>5")
            equal(compare.matchesProperties({"key": undefined}), false);
            equal(compare.matchesProperties({"key": "6"}), true);
            equal(compare.matchesProperties({"key": "5"}), false);
            equal(compare.matchesProperties({"key": "4.2"}), false);
        })
        it("should handle compare tag >=5", () => {
            const compare = TagUtils.Tag("key>=5")
            equal(compare.matchesProperties({"key": undefined}), false);
            equal(compare.matchesProperties({"key": "6"}), true);
            equal(compare.matchesProperties({"key": "5"}), true);
            equal(compare.matchesProperties({"key": "4.2"}), false);
        })
        
        it("should handle date comparison tags", () => {
            const filter = TagUtils.Tag("date_created<2022-01-07")
            expect(filter.matchesProperties({"date_created": "2022-01-08"})).false
            expect(filter.matchesProperties({"date_created": "2022-01-01"})).true
        })
    })
})
