import LayerConfig from "../../src/Models/ThemeConfig/LayerConfig"
import { TagsFilter } from "../../src/Logic/Tags/TagsFilter"
import { Tag } from "../../src/Logic/Tags/Tag"
import { And } from "../../src/Logic/Tags/And"
import Script from "../Script"
import { AllSharedLayers } from "../../src/Customizations/AllSharedLayers"
import fs from "fs"
import { Or } from "../../src/Logic/Tags/Or"
import { RegexTag } from "../../src/Logic/Tags/RegexTag"
import { Utils } from "../../src/Utils"

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
    private readonly _layer: LayerConfig

    constructor(layer: LayerConfig) {
        this._layer = layer
    }

    public functionName() {
        const l = this._layer
        if (!l.source?.osmTags) {
            return undefined
        }
        return `process_poi_${l.id}`
    }

    public generateFunction(): string {
        const l = this._layer
        if (!l.source?.osmTags) {
            return undefined
        }
        return [
            `local pois_${l.id} = osm2pgsql.define_table({`,
            `  name = '${l.id}',`,
            "  ids = { type = 'any', type_column = 'osm_type', id_column = 'osm_id' },",
            "  columns = {",
            "    { column = 'tags', type = 'jsonb' },",
            "    { column = 'geom', type = 'point', projection = 4326, not_null = true },",
            "  }" +
            "})",
            "",
            "",
            `function ${this.functionName()}(object, geom)`,
            "  local matches_filter = " + this.toLuaFilter(l.source.osmTags),
            "  if( not matches_filter) then",
            "    return",
            "  end",
            "  local a = {",
            "    geom = geom,",
            "    tags = object.tags",
            "  }",
            "  ",
            `  pois_${l.id}:insert(a)`,
            "end",
            "",
        ].join("\n")
    }

    private regexTagToLua(tag: RegexTag) {
        if (typeof tag.value === "string" && tag.invert) {
            return `object.tags["${tag.key}"] ~= "${tag.value}"`
        }

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
            return `object.tags["${tag.key}"] == nil or not string.find(object.tags["${tag.key}"], "${tag.value}")`
        }

        return `(object.tags["${tag.key}"] ~= nil and string.find(object.tags["${tag.key}"], "${tag.value}"))`
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

class GenerateLayerFile extends Script {
    constructor() {
        super("Generates a .lua-file to use with osm2pgsql")
    }

    async main(args: string[]) {
        const layers = Array.from(AllSharedLayers.sharedLayers.values())

        const generators = layers.filter(l => l.source.geojsonSource === undefined).map(l => new GenerateLayerLua(l))

        const script = [
            ...generators.map(g => g.generateFunction()),
            LuaSnippets.combine(Utils.NoNull(generators.map(g => g.functionName()))),
            LuaSnippets.tail,
        ].join("\n\n\n")
        const path = "build_db.lua"
        fs.writeFileSync(path, script, "utf-8")
        console.log("Written", path)
    }
}

new GenerateLayerFile().run()
