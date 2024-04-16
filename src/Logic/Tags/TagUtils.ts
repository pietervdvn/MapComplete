import { Tag } from "./Tag"
import { TagsFilter } from "./TagsFilter"
import { And } from "./And"
import { Utils } from "../../Utils"
import ComparingTag from "./ComparingTag"
import { RegexTag } from "./RegexTag"
import SubstitutingTag from "./SubstitutingTag"
import { Or } from "./Or"
import { TagConfigJson } from "../../Models/ThemeConfig/Json/TagConfigJson"
import key_counts from "../../assets/key_totals.json"

import { ConversionContext } from "../../Models/ThemeConfig/Conversion/ConversionContext"

type Tags = Record<string, string>
export type UploadableTag = Tag | SubstitutingTag | And

export class TagUtils {
    public static readonly comparators: ReadonlyArray<
        ["<" | ">" | "<=" | ">=", (a: number, b: number) => boolean]
    > = [
        ["<=", (a, b) => a <= b],
        [">=", (a, b) => a >= b],
        ["<", (a, b) => a < b],
        [">", (a, b) => a > b],
    ]
    public static modeDocumentation: Record<
        string,
        { name: string; docs: string; uploadable?: boolean; overpassSupport: boolean }
    > = {
        "=": {
            name: "strict equality",
            uploadable: true,
            overpassSupport: true,
            docs:
                "Strict equality is denoted by `key=value`. This key matches __only if__ the keypair is present exactly as stated.\n" +
                "\n" +
                "**Only normal tags (eventually in an `and`) can be used in places where they are uploaded**. Normal tags are used in " +
                "the `mappings` of a [TagRendering] (unless `hideInAnswer` is specified), they are used in `addExtraTags` of [Freeform] " +
                "and are used in the `tags`-list of a preset.\n" +
                "\n" +
                "If a different kind of tag specification is given, your theme will fail to parse.\n" +
                "\n" +
                "### If key is not present\n" +
                "\n" +
                "If you want to check if a key is not present, use `key=` (pronounce as *key is empty*). A tag collection will match this\n" +
                "if `key` is missing or if `key` is a literal empty value.\n" +
                "\n" +
                "### Removing a key\n" +
                "\n" +
                "If a key should be deleted in the OpenStreetMap-database, specify `key=` as well. This can be used e.g. to remove a\n" +
                "fixme or value from another mapping if another field is filled out.",
        },
        "!=": {
            name: "strict not equals",
            overpassSupport: true,
            docs:
                "To check if a key does _not_ equal a certain value, use `key!=value`. This is converted behind the scenes\n" +
                "to `key!~^value$`\n" +
                "\n" +
                "If `key` is not present or empty, this will match too.\n" +
                "\n" +
                "### If key is present\n" +
                "\n" +
                "This implies that, to check if a key is present, `key!=` can be used. This will only match if the key is present and not\n" +
                "empty.",
        },
        "~": {
            name: "Value matches regex",
            overpassSupport: true,
            docs:
                "A tag can also be tested against a regex with `key~regex`. Note that this regex __must match__ the entire value. If the\n" +
                "value is allowed to appear anywhere as substring, use `key~.*regex.*`.\n" +
                "The regex is put within braces as to prevent runaway values.\n" +
                "\nUse `key~*` to indicate that any value is allowed. This is effectively the check that the attribute is present (defined _and_ not empty)." +
                "\n" +
                "Regexes will match the newline character with `.` too - the `s`-flag is enabled by default.",
        },
        "~i~": {
            name: "Value matches case-invariant regex",
            overpassSupport: true,
            docs: "A tag can also be tested against a regex with `key~i~regex`, where the case of the value will be ignored. The regex is still matched against the _entire_ value",
        },
        "!~": {
            name: "Value should _not_ match regex",
            overpassSupport: true,
            docs:
                "A tag can also be tested against a regex with `key!~regex`. This filter will match if the value does *not* match the regex. " +
                "\n If the\n" +
                "value is allowed to appear anywhere as substring, use `key~.*regex.*`.\n" +
                "The regex is put within braces as to prevent runaway values.\n",
        },
        "!~i~": {
            name: "Value does *not* match case-invariant regex",
            overpassSupport: true,
            docs: "A tag can also be tested against a regex with `key~i~regex`, where the case of the value will be ignored. The regex is still matched against the _entire_ value. This filter returns true if the value does *not* match",
        },
        "~~": {
            name: "Key and value should match given regex",
            overpassSupport: true,
            docs: "Both the `key` and `value` part of this specification are interpreted as regexes, both the key and value musth completely match their respective regexes",
        },
        ":=": {
            name: "Substitute `... {some_key} ...` and match `key`",
            overpassSupport: false,
            uploadable: true,
            docs:
                "**This is an advanced feature - use with caution**\n" +
                "\n" +
                "Some tags are automatically set or calculated - see [CalculatedTags](CalculatedTags.md) for an entire overview. If one\n" +
                "wants to apply such a value as tag, use a substituting-tag such, for example`survey:date:={_date:now}`. Note that the\n" +
                "separator between key and value here is `:=`. The text between `{` and `}` is interpreted as a key, and the respective\n" +
                "value is substituted into the string.\n" +
                "\n" +
                "One can also append, e.g. `key:={some_key} fixed text {some_other_key}`.\n" +
                "\n" +
                "An assigning tag _cannot_ be used to query OpenStreetMap/Overpass.\n" +
                "\n" +
                "If using a key or variable which might not be defined, add a condition in the mapping to hide the option. This is\n" +
                "because, if `some_other_key` is not defined, one might actually upload the literal text `key={some_other_key}` to OSM -\n" +
                "which we do not want.\n" +
                "\n" +
                "To mitigate this, use:\n" +
                "\n" +
                "```json\n" +
                "{\n" +
                '    "mappings": [\n' +
                "        {\n" +
                '            "if":"key:={some_other_key}",\n' +
                '            "then": "...",\n' +
                '            "hideInAnswer": "some_other_key="\n' +
                "        }\n" +
                "    ]\n" +
                "}\n" +
                "```\n" +
                "\n" +
                "One can use `key!:=prefix-{other_key}-postfix` as well, to match if `key` is _not_ the same\n" +
                "as `prefix-{other_key}-postfix` (with `other_key` substituted by the value)",
        },
        "!:=": {
            name: "Substitute `{some_key}` should not match `key`",
            overpassSupport: false,
            docs: "See `:=`, except that this filter is inverted",
        },
    }
    private static keyCounts: { keys: any; tags: any } = key_counts
    public static readonly numberAndDateComparisonDocs =
        "If the value of a tag is a number (e.g. `key=42`), one can use a filter `key<=42`, `key>=35`, `key>40` or `key<50` to\n" +
        "match this, e.g. in conditions for renderings. These tags cannot be used to generate an answer nor can they be used to\n" +
        "request data upstream from overpass.\n" +
        "\n" +
        "Note that the value coming from OSM will first be stripped by removing all non-numeric characters. For\n" +
        "example, `length=42 meter` will be interpreted as `length=42` and will thus match `length<=42` and `length>=42`. In\n" +
        "special circumstances (e.g. `surface_area=42 m2` or `length=100 feet`), this will result in erronous\n" +
        "values (`surface=422` or if a length in meters is compared to). However, this can be partially alleviated by using '\n" +
        "Units' to rewrite to a default format.\n" +
        "\n" +
        "Dates can be compared with the same expression: `somekey<2022-06-22` will match if `somekey` is a date and is smaller\n" +
        "then 22nd june '22."

    public static readonly logicalOperator =
        "\n" +
        "## Logical operators\n" +
        "\n" +
        "One can combine multiple tags by using `and` or `or`, e.g.:\n" +
        "\n" +
        "```json\n" +
        "{\n" +
        '  "osmTags": {\n' +
        '    "or": [\n' +
        '      "amenity=school",\n' +
        '      "amenity=kindergarten"\n' +
        "    ]\n" +
        "  }\n" +
        "}\n" +
        "```\n"

    public static readonly intro =
        "Tags format\n" +
        "=============\n" +
        "\n" +
        "When creating the `json` file describing your layer or theme, you'll have to add a few tags to describe what you want.\n" +
        "This document gives an overview of what every expression means and how it behaves in edge cases.\n" +
        "\n" +
        "If the schema-files note a type [`TagConfigJson`](https://github.com/pietervdvn/MapComplete/blob/develop/src/Models/ThemeConfig/Json/TagConfigJson.ts), you can use one of these values.\n" +
        "\n" +
        "In some cases, not every type of tags-filter can be used. For example,  _rendering_ an option with a regex is\n" +
        'fine (`"if": "brand~[Bb]randname", "then":" The brand is Brandname"`); but this regex can not be used to write a value\n' +
        "into the database. The theme loader will however refuse to work with such inconsistencies and notify you of this while\n" +
        "you are building your theme.\n" +
        "\n" +
        "Example\n" +
        "-------\n" +
        "\n" +
        "This example shows the most common options on how to specify tags:\n" +
        "\n" +
        "```json\n" +
        "{\n" +
        '  "and": [\n' +
        '    "key=value",\n' +
        "    {\n" +
        '      "or": [\n' +
        '        "other_key=value",\n' +
        '        "other_key=some_other_value"\n' +
        "      ]\n" +
        "    },\n" +
        '    "key_which_should_be_missing=",\n' +
        '    "key_which_should_have_a_value~*",\n' +
        '    "key~.*some_regex_a*_b+_[a-z]?",\n' +
        '    "height<1"\n' +
        "  ]\n" +
        "}\n" +
        "```\n" +
        "\n" +
        "\n"

    /**
     * Converts a list of tags into the corresponding record
     *
     * TagUtils.KVtoProperties([new Tag("a","b"), new Tag("c","d")] // => {a: "b", c: "d"}
     */
    static KVtoProperties(tags: Tag[]): Record<string, string> {
        const properties: Record<string, string> = {}
        for (const tag of tags) {
            properties[tag.key] = tag.value
        }
        return properties
    }

    static changeAsProperties(kvs: { k: string; v: string }[]): Record<string, string> {
        const tags: Record<string, string> = {}
        for (const kv of kvs) {
            tags[kv.k] = kv.v
        }
        return tags
    }

    static SplitKeys(tagsFilters: UploadableTag[]): Record<string, string[]> {
        return this.SplitKeysRegex(tagsFilters, false)
    }

    /***
     * Creates a hash {key --> [values : string | RegexTag ]}, with all the values present in the tagsfilter
     *
     * TagUtils.SplitKeysRegex([new Tag("isced:level", "bachelor; master")], true) // => {"isced:level": ["bachelor","master"]}
     */
    static SplitKeysRegex(tagsFilters: UploadableTag[], allowRegex: false): Record<string, string[]>
    static SplitKeysRegex(
        tagsFilters: UploadableTag[],
        allowRegex: boolean
    ): Record<string, (string | RegexTag)[]>
    static SplitKeysRegex(
        tagsFilters: UploadableTag[],
        allowRegex: boolean
    ): Record<string, (string | RegexTag)[]> {
        const keyValues: Record<string, (string | RegexTag)[]> = {}
        tagsFilters = [...tagsFilters] // copy all, use as queue
        while (tagsFilters.length > 0) {
            const tagsFilter = tagsFilters.shift()

            if (tagsFilter === undefined) {
                continue
            }

            if (tagsFilter instanceof And) {
                tagsFilters.push(...(<UploadableTag[]>tagsFilter.and))
                continue
            }

            if (tagsFilter instanceof Tag) {
                if (keyValues[tagsFilter.key] === undefined) {
                    keyValues[tagsFilter.key] = []
                }
                keyValues[tagsFilter.key].push(...tagsFilter.value.split(";").map((s) => s.trim()))
                continue
            }

            if (allowRegex && tagsFilter instanceof RegexTag) {
                const key = tagsFilter.key
                if (typeof key !== "string") {
                    console.error(
                        "Invalid type to flatten the multiAnswer: key is a regex too",
                        tagsFilter
                    )
                    throw "Invalid type to FlattenMultiAnswer: key is a regex too"
                }
                const keystr = <string>key
                if (keyValues[keystr] === undefined) {
                    keyValues[keystr] = []
                }
                keyValues[keystr].push(tagsFilter)
                continue
            }

            console.error("Invalid type to flatten the multiAnswer", tagsFilter)
            throw `Invalid type to FlattenMultiAnswer, not one of ${
                allowRegex ? "RegexTag, " : ""
            }Tag or And: ${tagsFilter.asHumanString(false, false, {})}`
        }
        return keyValues
    }

    /**
     * Flattens an 'uploadableTag' and replaces all 'SubstitutingTags' into normal tags
     */
    static FlattenAnd(tagFilters: UploadableTag, currentProperties: Record<string, string>): Tag[] {
        const tags: Tag[] = []
        tagFilters.visit((tf: UploadableTag) => {
            if (tf instanceof Tag) {
                tags.push(tf)
            }
            if (tf instanceof SubstitutingTag) {
                tags.push(tf.asTag(currentProperties))
            }
        })
        return tags
    }

    static optimzeJson(json: TagConfigJson): TagConfigJson | boolean {
        const optimized = TagUtils.Tag(json).optimize()
        if (optimized === true || optimized === false) {
            return optimized
        }
        return optimized.asJson()
    }

    /**
     * Given multiple tagsfilters which can be used as answer, will take the tags with the same keys together as set.
     *
     * @see MatchesMultiAnswer to do the reverse
     *
     * E.g:
     *
     * const tag = TagUtils.ParseUploadableTag({"and": [
     *     {
     *         and:  [ "x=a", "y=0;1"],
     *     },
     *     {
     *          and: ["x=", "y=3"]
     *     },
     *     {
     *         and:  ["x=b", "y=2"]
     *     }
     * ]})
     * TagUtils.FlattenMultiAnswer([tag]) // => TagUtils.Tag({and:["x=a;b", "y=0;1;2;3"] })
     *
     * TagUtils.FlattenMultiAnswer(([new Tag("x","y"), new Tag("a","b")])) // => new And([new Tag("x","y"), new Tag("a","b")])
     * TagUtils.FlattenMultiAnswer(([new Tag("x","")])) // => new And([new Tag("x","")])
     */
    static FlattenMultiAnswer(tagsFilters: UploadableTag[]): And {
        if (tagsFilters === undefined) {
            return new And([])
        }

        const keyValues = TagUtils.SplitKeys(tagsFilters)
        const and: UploadableTag[] = []
        for (const key in keyValues) {
            const values = Utils.Dedup(keyValues[key]).filter((v) => v !== "")
            values.sort()
            and.push(new Tag(key, values.join(";")))
        }
        return new And(and)
    }

    /**
     * Returns true if the properties match the tagsFilter, interpreted as a multikey.
     * Note that this might match a regex tag
     *
     * TagUtils.MatchesMultiAnswer(new Tag("isced:level","bachelor"), {"isced:level":"bachelor; master"}) // => true
     * TagUtils.MatchesMultiAnswer(new Tag("isced:level","master"), {"isced:level":"bachelor;master"}) // => true
     * TagUtils.MatchesMultiAnswer(new Tag("isced:level","doctorate"), {"isced:level":"bachelor; master"}) // => false
     *
     * // should match with a space too
     * TagUtils.MatchesMultiAnswer(new Tag("isced:level","master"), {"isced:level":"bachelor; master"}) // => true
     */
    static MatchesMultiAnswer(tag: UploadableTag, properties: Tags): boolean {
        const splitted = TagUtils.SplitKeysRegex([tag], true)
        for (const splitKey in splitted) {
            const neededValues = splitted[splitKey]
            if (properties[splitKey] === undefined) {
                return false
            }

            const actualValue = properties[splitKey].split(";").map((s) => s.trim())
            for (const neededValue of neededValues) {
                if (neededValue instanceof RegexTag) {
                    if (!neededValue.matchesProperties(properties)) {
                        return false
                    }
                    continue
                }
                if (actualValue.indexOf(neededValue) < 0) {
                    return false
                }
            }
        }
        return true
    }

    public static SimpleTag(json: string, context?: string): Tag {
        const tag = Utils.SplitFirst(json, "=")
        if (tag.length !== 2) {
            throw `Invalid tag: no (or too much) '=' found (in ${context ?? "unkown context"})`
        }
        return new Tag(tag[0], tag[1])
    }

    /**
     * Returns wether or not a keys is (probably) a valid key.
     * See 'Tags_format.md' for an overview of what every tag does
     *
     * // should accept common keys
     * TagUtils.isValidKey("name") // => true
     * TagUtils.isValidKey("image:0") // => true
     * TagUtils.isValidKey("alt_name") // => true
     *
     * // should refuse short keys
     * TagUtils.isValidKey("x") // => false
     * TagUtils.isValidKey("xy") // => false
     *
     * // should refuse a string with >255 characters
     * let a255 = ""
     * for(let i = 0; i < 255; i++) { a255 += "a"; }
     * a255.length // => 255
     * TagUtils.isValidKey(a255) // => true
     * TagUtils.isValidKey("a"+a255) // => false
     *
     * // Should refuse unexpected characters
     * TagUtils.isValidKey("with space") // => false
     * TagUtils.isValidKey("some$type") // => false
     * TagUtils.isValidKey("_name") // => false
     */
    public static isValidKey(key: string): boolean {
        return key.match(/^[a-z][a-z0-9:_]{2,253}[a-z0-9]$/) !== null
    }

    /**
     * Parses a tag configuration (a json) into a TagsFilter.
     *
     * Note that regexes must match the entire value
     *
     * TagUtils.Tag("key=value") // => new Tag("key", "value")
     * TagUtils.Tag("key=") // => new Tag("key", "")
     * TagUtils.Tag("key!=") // => new RegexTag("key", /.+/si)
     * TagUtils.Tag("key~*") // => new RegexTag("key", /.+/si)
     * TagUtils.Tag("name~i~somename") // => new RegexTag("name", /^(somename)$/si)
     * TagUtils.Tag("key!=value") // => new RegexTag("key", "value", true)
     * TagUtils.Tag("vending~.*bicycle_tube.*") // => new RegexTag("vending", /^(.*bicycle_tube.*)$/s)
     * TagUtils.Tag("x!~y") // => new RegexTag("x", /^(y)$/s, true)
     * TagUtils.Tag({"and": ["key=value", "x=y"]}) // => new And([new Tag("key","value"), new Tag("x","y")])
     * TagUtils.Tag("name~[sS]peelbos.*") // => new RegexTag("name", /^([sS]peelbos.*)$/s)
     * TagUtils.Tag("survey:date:={_date:now}") // => new SubstitutingTag("survey:date", "{_date:now}")
     * TagUtils.Tag("xyz!~\\[\\]") // => new RegexTag("xyz", /^(\[\])$/s, true)
     * TagUtils.Tag("tags~(.*;)?amenity=public_bookcase(;.*)?") // => new RegexTag("tags", /^((.*;)?amenity=public_bookcase(;.*)?)$/s)
     * TagUtils.Tag("service:bicycle:.*~~*") // => new RegexTag(/^(service:bicycle:.*)$/, /.+/si)
     * TagUtils.Tag("_first_comment~.*{search}.*") //  => new RegexTag('_first_comment', /^(.*{search}.*)$/s)
     *
     * TagUtils.Tag("xyz<5").matchesProperties({xyz: 4}) // => true
     * TagUtils.Tag("xyz<5").matchesProperties({xyz: 5}) // => false
     *
     * // RegexTags must match values with newlines
     * TagUtils.Tag("note~.*aed.*").matchesProperties({note: "Hier bevindt zich wss een defibrillator. \\n\\n De aed bevindt zich op de 5de verdieping"}) // => true
     * TagUtils.Tag("note~i~.*aed.*").matchesProperties({note: "Hier bevindt zich wss een defibrillator. \\n\\n De AED bevindt zich op de 5de verdieping"}) // => true
     *
     * // Must match case insensitive
     * TagUtils.Tag("name~i~somename").matchesProperties({name: "SoMeName"}) // => true
     *
     * // Must match the entire value
     * TagUtils.Tag("key~value").matchesProperties({key: "valueandsome"}) // => false
     * TagUtils.Tag("key~value").matchesProperties({key: "value"}) // => true
     * TagUtils.Tag("key~x|y") // => new RegexTag("key", /^(x|y)$/s)
     * TagUtils.Tag("maxspeed~[1-9]0|1[0-4]0").matchesProperties({maxspeed: "50 mph"}) // => false
     *
     * // Must match entire value: with mph
     * const regex = TagUtils.Tag("maxspeed~([1-9]0|1[0-4]0) mph")
     * regex // => new RegexTag("maxspeed", /^(([1-9]0|1[0-4]0) mph)$/s)
     * regex.matchesProperties({maxspeed: "50 mph"}) // => true
     */

    public static Tag(json: TagConfigJson, context: string | ConversionContext = ""): TagsFilter {
        try {
            const ctx = typeof context === "string" ? context : context.path.join(".")
            return this.ParseTagUnsafe(json, ctx)
        } catch (e) {
            if (typeof context === "string") {
                console.error("Could not parse tag", json, "in context", context, "due to ", e)
                throw e
            } else {
                context.err(e)
                return undefined
            }
        }
    }

    public static ParseUploadableTag(json: TagConfigJson, context: string = ""): UploadableTag {
        const t = this.Tag(json, context)

        t.visit((t: TagsFilter) => {
            if (t instanceof And) {
                return
            }
            if (t instanceof Tag) {
                return
            }
            if (t instanceof SubstitutingTag) {
                return
            }
            throw `Error at ${context}: detected a non-uploadable tag at a location where this is not supported: ${t.asHumanString(
                false,
                false,
                {}
            )}`
        })

        return <UploadableTag>t
    }

    /**
     * Same as `.Tag`, except that this will return undefined if the json is undefined
     * @param json
     * @param context
     * @constructor
     */
    public static TagD(json?: TagConfigJson, context: string = ""): TagsFilter | undefined {
        if (json === undefined) {
            return undefined
        }
        return TagUtils.Tag(json, context)
    }

    /**
     * INLINE sort of the given list
     */
    public static sortFilters(filters: TagsFilter[], usePopularity: boolean): void {
        filters.sort((a, b) => TagUtils.order(a, b, usePopularity))
    }

    public static toString(f: TagsFilter, toplevel = true): string {
        let r: string
        if (f instanceof Or) {
            r = TagUtils.joinL(f.or, "|", toplevel)
        } else if (f instanceof And) {
            r = TagUtils.joinL(f.and, "&", toplevel)
        } else {
            r = f.asHumanString(false, false, {})
        }
        if (toplevel) {
            r = r.trim()
        }

        return r
    }

    /**
     * Parses the various parts of a regex tag
     *
     * TagUtils.parseRegexOperator("key~value") // => {invert: false, key: "key", value: "value", modifier: ""}
     * TagUtils.parseRegexOperator("key!~value") // => {invert: true, key: "key", value: "value", modifier: ""}
     * TagUtils.parseRegexOperator("key~i~value") // => {invert: false, key: "key", value: "value", modifier: "i"}
     * TagUtils.parseRegexOperator("key!~i~someweirdvalue~qsdf") // => {invert: true, key: "key", value: "someweirdvalue~qsdf", modifier: "i"}
     * TagUtils.parseRegexOperator("_image:0~value") // => {invert: false, key: "_image:0", value: "value", modifier: ""}
     * TagUtils.parseRegexOperator("key~*") // => {invert: false, key: "key", value: "*", modifier: ""}
     * TagUtils.parseRegexOperator("Brugs volgnummer~*") // => {invert: false, key: "Brugs volgnummer", value: "*", modifier: ""}
     * TagUtils.parseRegexOperator("socket:USB-A~*") // => {invert: false, key: "socket:USB-A", value: "*", modifier: ""}
     * TagUtils.parseRegexOperator("tileId~*") // => {invert: false, key: "tileId", value: "*", modifier: ""}
     */
    public static parseRegexOperator(tag: string): {
        invert: boolean
        key: string
        value: string
        modifier: "i" | ""
    } | null {
        const match = tag.match(/^([_|a-zA-Z0-9: -]+)(!)?~([i]~)?(.*)$/)
        if (match == null) {
            return null
        }
        const [_, key, invert, modifier, value] = match
        return { key, value, invert: invert == "!", modifier: modifier == "i~" ? "i" : "" }
    }

    /**
     * Returns 'true' is opposite tags are detected.
     * Note that this method will never work perfectly
     *
     * // should be false for some simple cases
     * TagUtils.ContainsOppositeTags([new Tag("key", "value"), new Tag("key0", "value")]) // => false
     * TagUtils.ContainsOppositeTags([new Tag("key", "value"), new Tag("key", "value0")]) // => false
     *
     * // should detect simple cases
     * TagUtils.ContainsOppositeTags([new Tag("key", "value"), new RegexTag("key", "value", true)]) // => true
     * TagUtils.ContainsOppositeTags([new Tag("key", "value"), new RegexTag("key", /value/, true)]) // => true
     */
    public static ContainsOppositeTags(tags: TagsFilter[]): boolean {
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i]
            if (!(tag instanceof Tag || tag instanceof RegexTag)) {
                continue
            }
            for (let j = i + 1; j < tags.length; j++) {
                const guard = tags[j]
                if (!(guard instanceof Tag || guard instanceof RegexTag)) {
                    continue
                }
                if (guard.key !== tag.key) {
                    // Different keys: they can _never_ be opposites
                    continue
                }
                if ((guard.value["source"] ?? guard.value) !== (tag.value["source"] ?? tag.value)) {
                    // different values: the can _never_ be opposites
                    continue
                }
                if ((guard["invert"] ?? false) !== (tag["invert"] ?? false)) {
                    // The 'invert' flags are opposite, the key and value is the same for both
                    // This means we have found opposite tags!
                    return true
                }
            }
        }

        return false
    }

    /**
     * Returns a filtered version of 'listToFilter'.
     * For a list [t0, t1, t2], If `blackList` contains an equivalent (or broader) match of any `t`, this respective `t` is dropped from the returned list
     * Ignores nested ORS and ANDS
     *
     * TagUtils.removeShadowedElementsFrom([new Tag("key","value")],  [new Tag("key","value"), new Tag("other_key","value")]) // => [new Tag("other_key","value")]
     */
    public static removeShadowedElementsFrom(
        blacklist: TagsFilter[],
        listToFilter: TagsFilter[]
    ): TagsFilter[] {
        return listToFilter.filter((tf) => !blacklist.some((guard) => guard.shadows(tf)))
    }

    /**
     * Returns a filtered version of 'listToFilter', where no duplicates and no equivalents exists.
     *
     * TagUtils.removeEquivalents([new RegexTag("key", /^..*$/), new Tag("key","value")]) // => [new Tag("key", "value")]
     */
    public static removeEquivalents(listToFilter: (Tag | RegexTag)[]): TagsFilter[] {
        const result: TagsFilter[] = []
        outer: for (let i = 0; i < listToFilter.length; i++) {
            const tag = listToFilter[i]
            for (let j = 0; j < listToFilter.length; j++) {
                if (i === j) {
                    continue
                }
                const guard = listToFilter[j]
                if (guard.shadows(tag)) {
                    // the guard 'kills' the tag: we continue the outer loop without adding the tag
                    continue outer
                }
            }
            result.push(tag)
        }
        return result
    }

    /**
     * Returns `true` if at least one element of the 'guards' shadows one element of the 'listToFilter'.
     *
     * TagUtils.containsEquivalents([new Tag("key","value")],  [new Tag("key","value"), new Tag("other_key","value")]) // => true
     * TagUtils.containsEquivalents([new Tag("key","value")],  [ new Tag("other_key","value")]) // => false
     * TagUtils.containsEquivalents([new Tag("key","value")],  [ new Tag("key","other_value")]) // => false
     */
    public static containsEquivalents(guards: TagsFilter[], listToFilter: TagsFilter[]): boolean {
        return listToFilter.some((tf) => guards.some((guard) => guard.shadows(tf)))
    }

    /**
     * Parses a level specifier to the various available levels
     *
     * TagUtils.LevelsParser("0") // => ["0"]
     * TagUtils.LevelsParser("1") // => ["1"]
     * TagUtils.LevelsParser("0;2") // => ["0","2"]
     * TagUtils.LevelsParser("0-5") // => ["0","1","2","3","4","5"]
     * TagUtils.LevelsParser("0") // => ["0"]
     * TagUtils.LevelsParser("-1") // => ["-1"]
     * TagUtils.LevelsParser("0;-1") // => ["0", "-1"]
     * TagUtils.LevelsParser(undefined) // => []
     * TagUtils.LevelsParser("") // => []
     * TagUtils.LevelsParser(";") // => []
     *
     */
    public static LevelsParser(level: string): string[] {
        if (level === undefined || level === null) {
            return []
        }
        let spec = Utils.NoNull([level])
        spec = [].concat(...spec.map((s) => s?.split(";")))
        spec = [].concat(
            ...spec.map((s) => {
                s = s.trim()
                if (s === "") {
                    return undefined
                }
                if (s.indexOf("-") < 0 || s.startsWith("-")) {
                    return s
                }
                const [start, end] = s.split("-").map((s) => Number(s.trim()))
                if (isNaN(start) || isNaN(end)) {
                    return undefined
                }
                const values = []
                for (let i = start; i <= end; i++) {
                    values.push(i + "")
                }
                return values
            })
        )
        return Utils.NoNull(spec)
    }

    private static ParseTagUnsafe(json: TagConfigJson, context: string = ""): TagsFilter {
        if (json === undefined) {
            throw new Error(
                `Error while parsing a tag: 'json' is undefined in ${context}. Make sure all the tags are defined and at least one tag is present in a complex expression`
            )
        }
        if (typeof json != "string") {
            if (json["and"] !== undefined && json["or"] !== undefined) {
                throw `${context}: Error while parsing a TagConfig: got an object where both 'and' and 'or' are defined. Did you override a value? Perhaps use \`"=parent": { ... }\` instead of \"parent": {...}\` to trigger a replacement and not a fuse of values. The value is ${JSON.stringify(
                    json
                )}`
            }
            if (json["and"] !== undefined) {
                return new And(json["and"].map((t) => TagUtils.Tag(t, context)))
            }
            if (json["or"] !== undefined) {
                return new Or(json["or"].map((t) => TagUtils.Tag(t, context)))
            }
            throw `At ${context}: unrecognized tag: ${JSON.stringify(json)}`
        }

        const tag = json as string
        for (const [operator, comparator] of TagUtils.comparators) {
            if (tag.indexOf(operator) >= 0) {
                const split = Utils.SplitFirst(tag, operator).map((v) => v.trim())
                let val = Number(split[1])
                if (isNaN(val)) {
                    val = new Date(split[1]).getTime()
                }

                const f = (value: string | number | undefined) => {
                    if (value === undefined) {
                        return false
                    }
                    let b: number
                    if (typeof value === "number") {
                        b = value
                    } else if (typeof b === "string") {
                        b = Number(value?.trim())
                    } else {
                        b = Number(value)
                    }
                    if (isNaN(b) && typeof value === "string") {
                        b = Utils.ParseDate(value).getTime()
                        if (isNaN(b)) {
                            return false
                        }
                    }
                    return comparator(b, val)
                }
                return new ComparingTag(split[0], f, operator, "" + val)
            }
        }

        if (tag.indexOf("~~") >= 0) {
            const split = Utils.SplitFirst(tag, "~~")
            let keyRegex: RegExp
            if (split[0] === "*") {
                keyRegex = new RegExp(".+", "i")
            } else {
                keyRegex = new RegExp("^(" + split[0] + ")$")
            }
            let valueRegex: RegExp
            if (split[1] === "*") {
                valueRegex = new RegExp(".+", "si")
            } else {
                valueRegex = new RegExp("^(" + split[1] + ")$", "s")
            }
            return new RegexTag(keyRegex, valueRegex)
        }
        const withRegex = TagUtils.parseRegexOperator(tag)
        if (withRegex != null) {
            if (withRegex.value === "*" && withRegex.invert) {
                throw `Don't use 'key!~*' - use 'key=' instead (empty string as value (in the tag ${tag} while parsing ${context})`
            }
            if (withRegex.value === "") {
                throw (
                    "Detected a regextag with an empty regex; this is not allowed. Use '" +
                    withRegex.key +
                    "='instead (at " +
                    context +
                    ")"
                )
            }

            const value: string | RegExp = withRegex.value
            if (value === "*") {
                return new RegexTag(
                    withRegex.key,
                    new RegExp(".+", "si" + withRegex.modifier),
                    withRegex.invert
                )
            }
            return new RegexTag(
                withRegex.key,
                new RegExp("^(" + value + ")$", "s" + withRegex.modifier),
                withRegex.invert
            )
        }

        if (tag.indexOf("!:=") >= 0) {
            const split = Utils.SplitFirst(tag, "!:=")
            return new SubstitutingTag(split[0], split[1], true)
        }
        if (tag.indexOf(":=") >= 0) {
            const split = Utils.SplitFirst(tag, ":=")
            return new SubstitutingTag(split[0], split[1])
        }

        if (tag.indexOf("!=") >= 0) {
            const split = Utils.SplitFirst(tag, "!=")
            if (split[1] === "*") {
                throw (
                    "At " +
                    context +
                    ": invalid tag " +
                    tag +
                    ". To indicate a missing tag, use '" +
                    split[0] +
                    "!=' instead"
                )
            }
            if (split[1] === "") {
                return new RegexTag(split[0], /.+/is)
            }
            return new RegexTag(split[0], split[1], true)
        }

        if (tag.indexOf("=") >= 0) {
            const split = Utils.SplitFirst(tag, "=")
            if (split[1] == "*") {
                throw `Error while parsing tag '${tag}' in ${context}: detected a wildcard on a normal value. Use a regex pattern instead`
            }
            return new Tag(split[0], split[1])
        }
        throw `Error while parsing tag '${tag}' in ${context}: no key part and value part were found`
    }

    private static GetCount(key: string, value?: string) {
        if (key === undefined) {
            return undefined
        }
        const tag = TagUtils.keyCounts.tags[key]
        if (tag !== undefined && tag[value] !== undefined) {
            return tag[value]
        }
        return TagUtils.keyCounts.keys[key]
    }

    public static GetPopularity(tag: TagsFilter): number | undefined {
        if (tag instanceof And) {
            return Math.min(...Utils.NoNull(tag.and.map((t) => TagUtils.GetPopularity(t)))) - 1
        }
        if (tag instanceof Or) {
            return Math.max(...Utils.NoNull(tag.or.map((t) => TagUtils.GetPopularity(t)))) + 1
        }
        if (tag instanceof Tag) {
            return TagUtils.GetCount(tag.key, tag.value)
        }
        if (tag instanceof RegexTag) {
            const key = tag.key
            if (key instanceof RegExp || tag.invert || tag.isNegative()) {
                return undefined
            }
            return TagUtils.GetCount(key)
        }

        return undefined
    }

    private static order(a: TagsFilter, b: TagsFilter, usePopularity: boolean): number {
        const rta = a instanceof RegexTag
        const rtb = b instanceof RegexTag
        if (rta !== rtb) {
            // Regex tags should always go at the end: these use a lot of computation at the overpass side, avoiding it is better
            if (rta) {
                return 1 // b < a
            } else {
                return -1
            }
        }
        if (a["key"] !== undefined && b["key"] !== undefined) {
            if (usePopularity) {
                const countA = TagUtils.GetCount(a["key"], a["value"])
                const countB = TagUtils.GetCount(b["key"], b["value"])
                if (countA !== undefined && countB !== undefined) {
                    return countA - countB
                }
            }

            if (a["key"] === b["key"]) {
                return 0
            }
            if (a["key"] < b["key"]) {
                return -1
            }
            return 1
        }

        return 0
    }

    private static joinL(tfs: TagsFilter[], seperator: string, toplevel: boolean) {
        const joined = tfs.map((e) => TagUtils.toString(e, false)).join(seperator)
        if (toplevel) {
            return joined
        }
        return " (" + joined + ") "
    }

    public static generateDocs(): string {
        return [
            TagUtils.intro,
            ...Object.keys(TagUtils.modeDocumentation).map((mode) => {
                const doc = TagUtils.modeDocumentation[mode]
                return ["", "## `" + mode + "` " + doc.name, "", doc.docs, "", ""].join("\n")
            }),
            "## " +
                TagUtils.comparators.map((comparator) => "`" + comparator[0] + "`").join(" ") +
                " Logical comparators",
            TagUtils.numberAndDateComparisonDocs,
            TagUtils.logicalOperator,
        ].join("\n")
    }
}
