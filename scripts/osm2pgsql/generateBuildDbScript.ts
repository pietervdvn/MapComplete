import { TagsFilter } from "../../src/Logic/Tags/TagsFilter"
import { Tag } from "../../src/Logic/Tags/Tag"
import { And } from "../../src/Logic/Tags/And"
import Script from "../Script"
import fs from "fs"
import { Or } from "../../src/Logic/Tags/Or"
import { RegexTag } from "../../src/Logic/Tags/RegexTag"
import { Utils } from "../../src/Utils"
import { ValidateThemeEnsemble } from "../../src/Models/ThemeConfig/Conversion/Validation"
import { AllKnownLayouts } from "../../src/Customizations/AllKnownLayouts"

class LuaSnippets {
    /**
     * The main piece of code that calls `process_poi`
     */
    static tail = [
        "function osm2pgsql.process_node(object)",
        "  process_poi(object, object:as_point())",
        "end",
        "",
        "function osm2pgsql.process_way(object)",
        "  if object.is_closed then",
        "    process_poi(object, object:as_polygon():centroid())",
        "  end",
        "end",
        ""].join("\n")

    public static combine(calls: string[]): string {
        return [
            `function process_poi(object, geom)`,
            ...calls.map(c => "  " + c + "(object, geom)"),
            `end`,
        ].join("\n")
    }
}

class GenerateLayerLua {
    private readonly _id: string
    private readonly _tags: TagsFilter
    private readonly _foundInThemes: string[]

    constructor(id: string, tags: TagsFilter, foundInThemes: string[] = []) {
        this._tags = tags
        this._id = id
        this._foundInThemes = foundInThemes
    }

    public functionName() {
        if (!this._tags) {
            return undefined
        }
        return `process_poi_${this._id}`
    }

    public generateFunction(): string {
        if (!this._tags) {
            return undefined
        }
        return [
            `local pois_${this._id} = osm2pgsql.define_table({`,
            this._foundInThemes ? "-- used in themes: " + this._foundInThemes.join(", ") : "",
            `  name = '${this._id}',`,
            "  ids = { type = 'any', type_column = 'osm_type', id_column = 'osm_id' },",
            "  columns = {",
            "    { column = 'tags', type = 'jsonb' },",
            "    { column = 'geom', type = 'point', projection = 4326, not_null = true },",
            "  }" +
            "})",
            "",
            "",
            `function ${this.functionName()}(object, geom)`,
            "  local matches_filter = " + this.toLuaFilter(this._tags),
            "  if( not matches_filter) then",
            "    return",
            "  end",
            "  local a = {",
            "    geom = geom,",
            "    tags = object.tags",
            "  }",
            "  ",
            `  pois_${this._id}:insert(a)`,
            "end",
            "",
        ].join("\n")
    }

    private regexTagToLua(tag: RegexTag) {
        if (typeof tag.value === "string" && tag.invert) {
            return `object.tags["${tag.key}"] ~= "${tag.value}"`
        }

        const v = (<RegExp> tag.value).source.replace(/\\\//g, "/")

        if ("" + tag.value === "/.+/is" && !tag.invert) {
            return `object.tags["${tag.key}"] ~= nil`
        }

        if ("" + tag.value === "/.+/is" && tag.invert) {
            return `object.tags["${tag.key}"] == nil`
        }

        if (tag.matchesEmpty && !tag.invert) {
            return `object.tags["${tag.key}"] == nil or object.tags["${tag.key}"] == ""`
        }


        if (tag.matchesEmpty && tag.invert) {
            return `object.tags["${tag.key}"] ~= nil or object.tags["${tag.key}"] ~= ""`
        }

        if (tag.invert) {
            return `object.tags["${tag.key}"] == nil or not string.find(object.tags["${tag.key}"], "${v}")`
        }

        return `(object.tags["${tag.key}"] ~= nil and string.find(object.tags["${tag.key}"], "${v}"))`
    }

    private toLuaFilter(tag: TagsFilter, useParens: boolean = false): string {
        if (tag instanceof Tag) {
            return `object.tags["${tag.key}"] == "${tag.value}"`
        }
        if (tag instanceof And) {
            const expr = tag.and.map(t => this.toLuaFilter(t, true)).join(" and ")
            if (useParens) {
                return "(" + expr + ")"
            }
            return expr
        }
        if (tag instanceof Or) {
            const expr = tag.or.map(t => this.toLuaFilter(t, true)).join(" or ")
            if (useParens) {
                return "(" + expr + ")"
            }
            return expr
        }
        if (tag instanceof RegexTag) {
            let expr = this.regexTagToLua(tag)
            if (useParens) {
                expr = "(" + expr + ")"
            }
            return expr
        }
        let msg = "Could not handle" + tag.asHumanString(false, false, {})
        console.error(msg)
        throw msg
    }
}

class GenerateBuildDbScript extends Script {
    constructor() {
        super("Generates a .lua-file to use with osm2pgsql")
    }

    async main(args: string[]) {
        const allNeededLayers = new ValidateThemeEnsemble().convertStrict(
            AllKnownLayouts.allKnownLayouts.values(),
        )

        const generators: GenerateLayerLua[] = []

        allNeededLayers.forEach(({ tags, foundInTheme }, layerId) => {
            generators.push(new GenerateLayerLua(layerId, tags, foundInTheme))
        })

        const script = [
            ...generators.map(g => g.generateFunction()),
            LuaSnippets.combine(Utils.NoNull(generators.map(g => g.functionName()))),
            LuaSnippets.tail,
        ].join("\n\n\n")
        const path = "build_db.lua"
        fs.writeFileSync(path, script, "utf-8")
        console.log("Written", path)
        console.log(allNeededLayers.size+" layers will be created. Make sure to set 'max_connections' to at least  "+(10 + allNeededLayers.size) )
    }
}

new GenerateBuildDbScript().run()
