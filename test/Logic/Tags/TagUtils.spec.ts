import { TagUtils } from "../../../src/Logic/Tags/TagUtils"
import { equal } from "assert"
import { describe, expect, it } from "vitest"

describe("TagUtils", () => {
    describe("ParseTag", () => {
        it("should refuse a key!=* tag", () => {
            expect(() => TagUtils.Tag("key!=*")).toThrowError()
        })

        it("should handle compare tag <=5", () => {
            const compare = TagUtils.Tag("key<=5")
            equal(compare.matchesProperties({ key: undefined }), false)
            equal(compare.matchesProperties({ key: "6" }), false)
            equal(compare.matchesProperties({ key: "5" }), true)
            equal(compare.matchesProperties({ key: "4" }), true)
        })

        it("should handle compare tag < 5", () => {
            const compare = TagUtils.Tag("key<5")
            equal(compare.matchesProperties({ key: undefined }), false)
            equal(compare.matchesProperties({ key: "6" }), false)
            equal(compare.matchesProperties({ key: "5" }), false)
            equal(compare.matchesProperties({ key: "4.2" }), true)
        })

        it("should handle compare tag >5", () => {
            const compare = TagUtils.Tag("key>5")
            equal(compare.matchesProperties({ key: undefined }), false)
            equal(compare.matchesProperties({ key: "6" }), true)
            equal(compare.matchesProperties({ key: "5" }), false)
            equal(compare.matchesProperties({ key: "4.2" }), false)
        })
        it("should handle compare tag >=5", () => {
            const compare = TagUtils.Tag("key>=5")
            equal(compare.matchesProperties({ key: undefined }), false)
            equal(compare.matchesProperties({ key: "6" }), true)
            equal(compare.matchesProperties({ key: "5" }), true)
            equal(compare.matchesProperties({ key: "4.2" }), false)
        })

        it("should handle date comparison tags", () => {
            const filter = TagUtils.Tag("date_created<2022-01-07")
            expect(filter.matchesProperties({ date_created: "2022-01-08" })).toBe(false)
            expect(filter.matchesProperties({ date_created: "2022-01-01" })).toBe(true)
        })
    })
    describe("regextag", () => {
        it("should match tags", () => {
            const t = TagUtils.Tag("_tags~(^|.*;)leisure=picnic_table($|;.*)")
            const properties = {
                _tags: "leisure=picnic_table",
            }
            expect(t.matchesProperties(properties)).toBe(true)
        })
    })
})
