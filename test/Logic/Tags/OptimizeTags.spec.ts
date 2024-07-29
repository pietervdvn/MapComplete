import { TagsFilter } from "../../../src/Logic/Tags/TagsFilter"
import { And } from "../../../src/Logic/Tags/And"
import { Tag } from "../../../src/Logic/Tags/Tag"
import { TagUtils } from "../../../src/Logic/Tags/TagUtils"
import { Or } from "../../../src/Logic/Tags/Or"
import { RegexTag } from "../../../src/Logic/Tags/RegexTag"
import { describe, expect, it } from "vitest"

describe("Tag optimalization", () => {
    describe("And", () => {
        it("with condition and nested and should be flattened", () => {
            const t = new And([new And([new Tag("x", "y")]), new Tag("a", "b")])
            const opt = <TagsFilter>t.optimize()
            expect(TagUtils.toString(opt)).toBe(`a=b&x=y`)
        })

        it("should be 'true' if no conditions are given", () => {
            const t = new And([])
            const opt = t.optimize()
            expect(opt).toBe(true)
        })

        it("should return false on conflicting tags", () => {
            const t = new And([new Tag("key", "a"), new Tag("key", "b")])
            const opt = t.optimize()
            expect(opt).toBe(false)
        })

        it("with nested ors and common property should be extracted", () => {
            // foo&bar & (x=y | a=b) & (x=y | c=d) & foo=bar is equivalent too foo=bar & ((x=y) | (a=b & c=d))
            const t = new And([
                new Tag("foo", "bar"),
                new Or([new Tag("x", "y"), new Tag("a", "b")]),
                new Or([new Tag("x", "y"), new Tag("c", "d")])
            ])
            const opt = <TagsFilter>t.optimize()
            expect(TagUtils.toString(opt)).toBe("foo=bar& (x=y| (a=b&c=d) )")
        })

        it("with nested ors and common regextag should be extracted", () => {
            // foo&bar & (x=y | a=b) & (x=y | c=d) & foo=bar is equivalent too foo=bar & ((x=y) | (a=b & c=d))
            const t = new And([
                new Tag("foo", "bar"),
                new Or([new RegexTag("x", "y"), new RegexTag("a", "b")]),
                new Or([new RegexTag("x", "y"), new RegexTag("c", "d")])
            ])
            const opt = <TagsFilter>t.optimize()
            expect(TagUtils.toString(opt)).toBe("foo=bar& ( (a=b&c=d) |x=y)")
        })

        it("with nested ors and inverted regextags should _not_ be extracted", () => {
            // foo&bar & (x=y | a=b) & (x=y | c=d) & foo=bar is equivalent too foo=bar & ((x=y) | (a=b & c=d))
            const t = new And([
                new Tag("foo", "bar"),
                new Or([new RegexTag("x", "y"), new RegexTag("a", "b")]),
                new Or([new RegexTag("x", "y", true), new RegexTag("c", "d")])
            ])
            const opt = <TagsFilter>t.optimize()
            expect(TagUtils.toString(opt)).toBe("foo=bar& (a=b|x=y) & (c=d|x!=y)")
        })

        it("should move regextag to the end", () => {
            const t = new And([new RegexTag("x", "y"), new Tag("a", "b")])
            const opt = <TagsFilter>t.optimize()
            expect(TagUtils.toString(opt)).toBe("a=b&x=y")
        })

        it("should sort tags by their popularity (least popular first)", () => {
            const t = new And([new Tag("bicycle", "yes"), new Tag("amenity", "binoculars")])
            const opt = <TagsFilter>t.optimize()
            expect(TagUtils.toString(opt)).toBe("amenity=binoculars&bicycle=yes")
        })

        it("should correctly optimize key=A&key!=B into key=A", () => {
            const t = new And([new Tag("shop", "sports"), new RegexTag("shop", "mall", true)])
            const opt = t.optimize()
            expect(typeof opt !== "boolean").true
            expect(TagUtils.toString(<TagsFilter>opt)).toBe("shop=sports")
        })

        it("should optimize nested ORs", () => {
            const filter = TagUtils.Tag({
                or: [
                    "X=Y",
                    "FOO=BAR",
                    {
                        and: [
                            {
                                or: ["X=Y", "FOO=BAR"]
                            },
                            "bicycle=yes"
                        ]
                    }
                ]
            })
            // (X=Y | FOO=BAR | (bicycle=yes & (X=Y | FOO=BAR)) )
            // This is equivalent to (X=Y | FOO=BAR)
            const opt = filter.optimize()
            console.log(opt)
        })

        it("should optimize an advanced, real world case", () => {
            const filter = TagUtils.Tag({
                or: [
                    {
                        and: [
                            {
                                or: [
                                    "amenity=charging_station",
                                    "disused:amenity=charging_station",
                                    "planned:amenity=charging_station",
                                    "construction:amenity=charging_station"
                                ]
                            },
                            "bicycle=yes"
                        ]
                    },
                    {
                        and: [
                            {
                                or: [
                                    "amenity=charging_station",
                                    "disused:amenity=charging_station",
                                    "planned:amenity=charging_station",
                                    "construction:amenity=charging_station"
                                ]
                            }
                        ]
                    },
                    "amenity=toilets",
                    "amenity=bench",
                    "leisure=picnic_table",
                    {
                        and: ["tower:type=observation"]
                    },
                    {
                        and: ["amenity=bicycle_repair_station"]
                    },
                    {
                        and: [
                            {
                                or: [
                                    "amenity=bicycle_rental",
                                    "bicycle_rental~*",
                                    "service:bicycle:rental=yes",
                                    "rental~.*bicycle.*"
                                ]
                            },
                            "bicycle_rental!=docking_station"
                        ]
                    },
                    {
                        and: ["leisure=playground", "playground!=forest"]
                    }
                ]
            })
            const opt = <TagsFilter>filter.optimize()
            const expected = [
                "amenity=charging_station",
                "amenity=toilets",
                "amenity=bench",
                "amenity=bicycle_repair_station",
                "construction:amenity=charging_station",
                "disused:amenity=charging_station",
                "leisure=picnic_table",
                "planned:amenity=charging_station",
                "tower:type=observation",
                "(amenity=bicycle_rental|service:bicycle:rental=yes|bicycle_rental~.+|rental~^(.*bicycle.*)$) &bicycle_rental!=docking_station",
                "leisure=playground&playground!=forest"
            ]

            expect((<Or>opt).or.map((f) => TagUtils.toString(f))).toEqual(expected)
        })

        it("should detect conflicting tags", () => {
            const q = new And([new Tag("key", "value"), new RegexTag("key", "value", true)])
            expect(q.optimize()).toBe(false)
        })

        it("should detect conflicting tags with a regex", () => {
            const q = new And([new Tag("key", "value"), new RegexTag("key", /value/, true)])
            expect(q.optimize()).toBe(false)
        })
    })

    describe("Or", () => {
        it("with nested And which has a common property should be dropped", () => {
            const t = new Or([
                new Tag("foo", "bar"),
                new And([new Tag("foo", "bar"), new Tag("x", "y")])
            ])
            const opt = <TagsFilter>t.optimize()
            expect(TagUtils.toString(opt)).toBe("foo=bar")
        })

        it("should flatten nested ors", () => {
            const t = new Or([new Or([new Tag("x", "y")])]).optimize()
            expect(t).toEqual(new Tag("x", "y"))
        })

        it("should flatten nested ors", () => {
            const t = new Or([new Tag("a", "b"), new Or([new Tag("x", "y")])]).optimize()
            expect(t).toEqual(new Or([new Tag("a", "b"), new Tag("x", "y")]))
        })
    })

    it("should not generate a conflict for climbing tags", () => {
        const club_tags = TagUtils.Tag({
            or: [
                "club=climbing",
                {
                    and: [
                        "sport=climbing",
                        {
                            or: ["office~*", "club~*"]
                        }
                    ]
                }
            ]
        })
        const gym_tags = TagUtils.Tag({
            and: ["sport=climbing", "leisure=sports_centre"]
        })
        const other_climbing = TagUtils.Tag({
            and: [
                "sport=climbing",
                "climbing!~route",
                "leisure!~sports_centre",
                "climbing!=route_top",
                "climbing!=route_bottom"
            ]
        })
        const together = new Or([club_tags, gym_tags, other_climbing])
        const opt = together.optimize()

        /*
         club=climbing | (sport=climbing&(office~* | club~*))
         OR
         sport=climbing & leisure=sports_centre
         OR
         sport=climbing & climbing!~route & leisure!~sports_centre
        */

        /*
         > When the first OR is written out, this becomes
         club=climbing
         OR
         (sport=climbing&(office~* | club~*))
         OR
         (sport=climbing & leisure=sports_centre)
         OR
         (sport=climbing & climbing!~route & leisure!~sports_centre & ...)
         */

        /*
         > We can join the 'sport=climbing' in the last 3 phrases
         club=climbing
         OR
         (sport=climbing AND
             (office~* | club~*))
             OR
             (leisure=sports_centre)
             OR
             (climbing!~route & leisure!~sports_centre & ...)
         )
         */

        expect(opt).toEqual(
            TagUtils.Tag({
                or: [
                    "club=climbing",
                    {
                        and: ["sport=climbing", { or: ["club~*", "office~*"] }]
                    },
                    {
                        and: [
                            "sport=climbing",
                            {
                                or: [
                                    "leisure=sports_centre",
                                    {
                                        and: [
                                            "climbing!~route",
                                            "climbing!=route_top",
                                            "climbing!=route_bottom",
                                            "leisure!~sports_centre"
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            })
        )
    })

    it("should optimize a complicated nested case", () => {
        const spec = {
            "and":
                ["service:bicycle:retail=yes",
                    {
                        "or": [
                            {
                                "and": [
                                    { "or": ["shop=outdoor", "shop=sport", "shop=diy", "shop=doityourself"] },
                                    {
                                        "or": ["service:bicycle:repair=yes", "shop=bicycle",
                                            {
                                                "and": ["shop=sports",
                                                    { "or": ["sport=bicycle", "sport=cycling", "sport="] },
                                                    "service:bicycle:retail!=no",
                                                    "service:bicycle:repair!=no"]
                                            }]
                                    }]
                            }, {
                                "and":
                                    [
                                        {
                                            "or":
                                                ["shop=outdoor", "shop=sport", "shop=diy", "shop=doityourself"]
                                        },
                                        {
                                            "or": ["service:bicycle:repair=yes", "shop=bicycle",
                                                {
                                                    "and": ["shop=sports",
                                                        { "or": ["sport=bicycle", "sport=cycling", "sport="] },
                                                        "service:bicycle:retail!=no", "service:bicycle:repair!=no"]
                                                }]
                                        }]
                            }, {
                                "and":
                                    [{
                                        "or":
                                            ["craft=shoe_repair", "craft=key_cutter", "shop~.+"]
                                    },
                                        { "or": ["shop=outdoor", "shop=sport", "shop=diy", "shop=doityourself"] },
                                        "shop!=mall"]
                            },
                            "service:bicycle:retail~.+",
                            "service:bicycle:retail~.+"]
                    }]
        }

        const tag = TagUtils.Tag(spec)
        const opt = tag.optimize()
        if (opt === false || opt === true) {
            throw "Did not expect a boolean"
        }
        console.log(opt)
    })
})
