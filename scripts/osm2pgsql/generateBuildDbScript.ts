import { TagsFilter } from "../../src/Logic/Tags/TagsFilter"
import { Tag } from "../../src/Logic/Tags/Tag"
import { And } from "../../src/Logic/Tags/And"
import Script from "../Script"
import fs from "fs"
import { Or } from "../../src/Logic/Tags/Or"
import { RegexTag } from "../../src/Logic/Tags/RegexTag"
import { ValidateThemeEnsemble } from "../../src/Models/ThemeConfig/Conversion/Validation"
import { AllKnownLayouts } from "../../src/Customizations/AllKnownLayouts"
import { OsmObject } from "../../src/Logic/Osm/OsmObject"

class LuaSnippets {
    public static helpers = [
        "function countTbl(tbl)\n" +
            "  local c = 0\n" +
            "  for n in pairs(tbl) do \n" +
            "    c = c + 1 \n" +
            "  end\n" +
            "  return c\n" +
            "end",
    ].join("\n")

    public static isPolygonFeature(): { blacklist: TagsFilter; whitelisted: TagsFilter } {
        const dict = OsmObject.polygonFeatures
        const or: TagsFilter[] = []
        const blacklisted: TagsFilter[] = []
        dict.forEach(({ values, blacklist }, k) => {
            if (blacklist) {
                if (values === undefined) {
                    blacklisted.push(new RegexTag(k, /.+/is))
                    return
                }
                values.forEach((v) => {
                    blacklisted.push(new RegexTag(k, v))
                })
                return
            }
            if (values === undefined || values === null) {
                or.push(new RegexTag(k, /.+/is))
                return
            }
            values.forEach((v) => {
                or.push(new RegexTag(k, v))
            })
        })
        console.log(
            "Polygon features are:",
            or.map((t) => t.asHumanString(false, false, {}))
        )
        return { blacklist: new Or(blacklisted), whitelisted: new Or(or) }
    }

    public static toLuaFilter(tag: TagsFilter, useParens: boolean = false): string {
        if (tag instanceof Tag) {
            return `object.tags["${tag.key}"] == "${tag.value}"`
        }
        if (tag instanceof And) {
            const expr = tag.and.map((t) => this.toLuaFilter(t, true)).join(" and ")
            if (useParens) {
                return "(" + expr + ")"
            }
            return expr
        }
        if (tag instanceof Or) {
            const expr = tag.or.map((t) => this.toLuaFilter(t, true)).join(" or ")
            if (useParens) {
                return "(" + expr + ")"
            }
            return expr
        }
        if (tag instanceof RegexTag) {
            let expr = LuaSnippets.regexTagToLua(tag)
            if (useParens) {
                expr = "(" + expr + ")"
            }
            return expr
        }
        let msg = "Could not handle" + tag.asHumanString(false, false, {})
        console.error(msg)
        throw msg
    }

    private static regexTagToLua(tag: RegexTag) {
        if (typeof tag.value === "string" && tag.invert) {
            return `object.tags["${tag.key}"] ~= "${tag.value}"`
        }

        if (typeof tag.value === "string" && !tag.invert) {
            return `object.tags["${tag.key}"] == "${tag.value}"`
        }

        let v: string = (<RegExp>tag.value).source.replace(/\\\//g, "/")

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

        let head = "^((.*;)?"
        let tail = "(;.*)?)$"
        if (v.startsWith(head)) {
            v = "(" + v.substring(head.length)
        }
        if (v.endsWith(tail)) {
            v = v.substring(0, v.length - tail.length) + ")"
            // We basically remove the optional parts at the start and the end, as object.find has this freedom anyway.
            // This might result in _some_ incorrect values that end up in the database (e.g. when matching 'friture', it might als match "abc;foo_friture_bar;xyz", but the frontend will filter this out
        }

        if (v.indexOf(")?") > 0) {
            throw (
                "LUA regexes have a bad support for (optional) capture groups, as such, " +
                v +
                " is not supported"
            )
        }

        if (tag.invert) {
            return `object.tags["${tag.key}"] == nil or not string.find(object.tags["${tag.key}"], "${v}")`
        }

        return `(object.tags["${tag.key}"] ~= nil and string.find(object.tags["${tag.key}"], "${v}"))`
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

    public generateTables(): string {
        if (!this._tags) {
            return undefined
        }
        return [
            `db_tables.pois_${this._id} = osm2pgsql.define_table({`,
            this._foundInThemes ? "-- used in themes: " + this._foundInThemes.join(", ") : "",
            `  name = 'pois_${this._id}',`,
            "  ids = { type = 'any', type_column = 'osm_type', id_column = 'osm_id' },",
            "  columns = {",
            "    { column = 'tags', type = 'jsonb' },",
            "    { column = 'geom', type = 'point', projection = 4326, not_null = true },",
            "  }",
            "})",
            "",
            `db_tables.lines_${this._id} = osm2pgsql.define_table({`,
            this._foundInThemes ? "-- used in themes: " + this._foundInThemes.join(", ") : "",
            `  name = 'lines_${this._id}',`,
            "  ids = { type = 'any', type_column = 'osm_type', id_column = 'osm_id' },",
            "  columns = {",
            "    { column = 'tags', type = 'jsonb' },",
            "    { column = 'geom', type = 'linestring', projection = 4326, not_null = true },",
            "  }",
            "})",

            `db_tables.polygons_${this._id} = osm2pgsql.define_table({`,
            this._foundInThemes ? "-- used in themes: " + this._foundInThemes.join(", ") : "",
            `  name = 'polygons_${this._id}',`,
            "  ids = { type = 'any', type_column = 'osm_type', id_column = 'osm_id' },",
            "  columns = {",
            "    { column = 'tags', type = 'jsonb' },",
            "    { column = 'geom', type = 'polygon', projection = 4326, not_null = true },",
            "  }",
            "})",
            "",
        ].join("\n")
    }
}

class GenerateBuildDbScript extends Script {
    constructor() {
        super("Generates a .lua-file to use with osm2pgsql")
    }

    async main(args: string[]) {
        const allLayers = new ValidateThemeEnsemble().convertStrict(
            AllKnownLayouts.allKnownLayouts.values()
        )
        if (allLayers.size === 0) {
            throw "No layers found at all"
        }
        const notCounted: string[] = []
        const allNeededLayers: Map<string, { tags: TagsFilter; foundInTheme: string[] }> = new Map<
            string,
            { tags: TagsFilter; foundInTheme: string[] }
        >()
        for (const key of allLayers.keys()) {
            const layer = allLayers.get(key)
            if (layer.isCounted) {
                allNeededLayers.set(key, layer)
            } else {
                notCounted.push(key)
            }
        }
        const generators: GenerateLayerLua[] = []

        allNeededLayers.forEach(({ tags, foundInTheme }, layerId) => {
            generators.push(new GenerateLayerLua(layerId, tags, foundInTheme))
        })

        const script = [
            "local db_tables = {}",
            LuaSnippets.helpers,
            ...generators.map((g) => g.generateTables()),
            this.generateProcessPoi(allNeededLayers),
            this.generateProcessWay(allNeededLayers),
        ].join("\n\n\n")
        const path = "build_db.lua"
        fs.writeFileSync(path, script, "utf-8")
        console.log("Written", path)
        console.log(
            "Following layers are _not_ indexed as they are not counted:",
            notCounted.join(", ")
        )
        console.log(
            allNeededLayers.size +
                " layers will be created with 3 tables each. Make sure to set 'max_connections' to at least  " +
                (10 + 3 * allNeededLayers.size)
        )
    }

    private earlyAbort() {
        return ["  if countTbl(object.tags) == 0 then", "    return", "  end", ""].join("\n")
    }

    private generateProcessPoi(
        allNeededLayers: Map<string, { tags: TagsFilter; foundInTheme: string[] }>
    ) {
        const body: string[] = []
        allNeededLayers.forEach(({ tags }, layerId) => {
            body.push(this.insertInto(tags, layerId, "pois_").join("\n"))
        })

        return [
            "function osm2pgsql.process_node(object)",
            this.earlyAbort(),
            "  local geom = object:as_point()",
            "  local matches_filter = false",
            body.join("\n"),
            "end",
        ].join("\n")
    }

    /**
     * If matches_filter
     * @param tags
     * @param layerId
     * @param tableprefix
     * @private
     */
    private insertInto(
        tags: TagsFilter,
        layerId: string,
        tableprefix: "pois_" | "lines_" | "polygons_"
    ) {
        const filter = LuaSnippets.toLuaFilter(tags)
        return [
            "  matches_filter = " + filter,
            "  if matches_filter then",
            "    db_tables." + tableprefix + layerId + ":insert({",
            "      geom = geom,",
            "      tags = object.tags",
            "    })",
            "  end",
        ]
    }

    private generateProcessWay(allNeededLayers: Map<string, { tags: TagsFilter }>) {
        const bodyLines: string[] = []
        allNeededLayers.forEach(({ tags }, layerId) => {
            bodyLines.push(this.insertInto(tags, layerId, "lines_").join("\n"))
        })

        const bodyPolygons: string[] = []
        allNeededLayers.forEach(({ tags }, layerId) => {
            bodyPolygons.push(this.insertInto(tags, layerId, "polygons_").join("\n"))
        })

        const isPolygon = LuaSnippets.isPolygonFeature()
        return [
            "function process_polygon(object, geom)",
            "  local matches_filter",
            ...bodyPolygons,
            "end",
            "function process_linestring(object, geom)",
            "  local matches_filter",
            ...bodyLines,
            "end",
            "",
            "function osm2pgsql.process_way(object)",
            this.earlyAbort(),
            "  local object_is_line = not object.is_closed or " +
                LuaSnippets.toLuaFilter(isPolygon.blacklist),
            `  local object_is_area = object.is_closed and (object.tags["area"] == "yes" or (not object_is_line and ${LuaSnippets.toLuaFilter(
                isPolygon.whitelisted,
                true
            )}))`,
            "  if object_is_area then",
            "    process_polygon(object, object:as_polygon())",
            "  else",
            "    process_linestring(object, object:as_linestring())",
            "  end",
            "end",
        ].join("\n")
    }
}

new GenerateBuildDbScript().run()
