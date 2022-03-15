import {describe} from 'mocha'
import {expect} from 'chai'
import {TagsFilter} from "../../../Logic/Tags/TagsFilter";
import {And} from "../../../Logic/Tags/And";
import {Tag} from "../../../Logic/Tags/Tag";
import {TagUtils} from "../../../Logic/Tags/TagUtils";
import {Or} from "../../../Logic/Tags/Or";
import {RegexTag} from "../../../Logic/Tags/RegexTag";

describe("Tag optimalization", () => {
    
    describe("And", () => {
        it("with condition and nested and should be flattened", () => {
            const t = new And(
                [
                    new And([
                        new Tag("x", "y")
                    ]),
                    new Tag("a", "b")
                ]
            )
            const opt =<TagsFilter> t.optimize()
            expect(TagUtils.toString(opt)).eq(`a=b&x=y`)
        })
        
        it("with nested ors and commons property should be extracted", () => {

            // foo&bar & (x=y | a=b) & (x=y | c=d) & foo=bar is equivalent too foo=bar & ((x=y) | (a=b & c=d))
            const t = new And([
                new Tag("foo","bar"),
                new Or([
                    new Tag("x", "y"),
                    new Tag("a", "b")
                ]),
                new Or([
                    new Tag("x", "y"),
                    new Tag("c", "d")
                ])
            ])
            const opt =<TagsFilter> t.optimize()
            expect(TagUtils.toString(opt)).eq("foo=bar& (x=y| (a=b&c=d) )")
        })
    
        it("should move regextag to the end", () => {
            const t = new And([
                new RegexTag("x","y"),
                new Tag("a","b")
            ])
            const opt =<TagsFilter> t.optimize()
            expect(TagUtils.toString(opt)).eq("a=b&x~^y$")

        })
        
        it("should sort tags by their popularity (least popular first)", () => {
            const t = new And([
                new Tag("bicycle","yes"),
                new Tag("amenity","binoculars")
            ])
            const opt =<TagsFilter> t.optimize()
            expect(TagUtils.toString(opt)).eq("amenity=binoculars&bicycle=yes")

        })
    
        it("should optimize an advanced, real world case", () => {
            const filter = TagUtils.Tag(  {or:   [
                    {
                        "and": [
                            {
                                "or": ["amenity=charging_station","disused:amenity=charging_station","planned:amenity=charging_station","construction:amenity=charging_station"]
                            },
                            "bicycle=yes"
                        ]
                    },
                    {
                        "and": [
                            {
                                "or": ["amenity=charging_station","disused:amenity=charging_station","planned:amenity=charging_station","construction:amenity=charging_station"]
                            },
                        ]
                    },
                    "amenity=toilets",
                    "amenity=bench",
                    "leisure=picnic_table",
                    {
                        "and": [
                            "tower:type=observation"
                        ]
                    },
                    {
                        "and": [
                            "amenity=bicycle_repair_station"
                        ]
                    },
                    {
                        "and": [
                            {
                                "or": [
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
                        "and": [
                            "leisure=playground",
                            "playground!=forest"
                        ]
                    }
                ]});
            const opt = <TagsFilter> filter.optimize()
            const expected = "amenity=charging_station|" +
                "amenity=toilets|" +
                "amenity=bench|" +
                "amenity=bicycle_repair_station" +
                "|construction:amenity=charging_station|" +
                "disused:amenity=charging_station|" +
                "leisure=picnic_table|" +
                "planned:amenity=charging_station|" +
                "tower:type=observation| " +
                "( (amenity=bicycle_rental|service:bicycle:rental=yes|bicycle_rental~^..*$|rental~^.*bicycle.*$) &bicycle_rental!~^docking_station$) |" +
                " (leisure=playground&playground!~^forest$)"
            
            expect(TagUtils.toString(opt).replace(/ /g, ""))
                .eq(expected.replace(/ /g, ""))

        })
    
    })
    
    describe("Or", () => {
        it("with nested And which has a common property should be dropped", () => {

            const t = new Or([
                new Tag("foo","bar"),
                new And([
                    new Tag("foo", "bar"),
                    new Tag("x", "y"),
                ])
            ])
            const opt =<TagsFilter> t.optimize()
            expect(TagUtils.toString(opt)).eq("foo=bar")

        })

        })
})