/***
 * Parses presets from the iD repository and extracts some usefull tags from them
 */
import ScriptUtils from "../ScriptUtils"
import { existsSync, readFileSync, writeFileSync } from "fs"
import known_languages from "../../src/assets/language_native.json"
import { LayerConfigJson } from "../../src/Models/ThemeConfig/Json/LayerConfigJson"
import { MappingConfigJson } from "../../src/Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import SmallLicense from "../../src/Models/smallLicense"

interface IconThief {
    steal(iconName: string): boolean
}

interface IdPresetJson {
    icon: string
    geometry: ("point" | "line" | "area")[]
    /**
     * Extra search terms
     */
    terms: string[]
    tags: Record<string, string>
    name: string
    searchable?: boolean
}

class IdPreset implements IdPresetJson {
    private _preset: IdPresetJson

    constructor(preset: IdPresetJson) {
        this._preset = preset
    }

    public get searchable(): boolean {
        return this._preset.searchable
    }

    public get name() {
        return this._preset.name
    }

    public get terms() {
        return this._preset.terms
    }

    public get tags() {
        return this._preset.tags
    }

    public get geometry() {
        return this._preset.geometry
    }

    public get icon(): string {
        return this._preset.icon
    }

    static fromFile(file: string): IdPreset {
        return new IdPreset(JSON.parse(readFileSync(file, "utf8")))
    }

    public parseTags(): string | { and: string[] } {
        const preset = this._preset
        const tagKeys = Object.keys(preset.tags)
        if (tagKeys.length === 1) {
            return tagKeys[0] + "=" + preset.tags[tagKeys[0]]
        } else {
            return {
                and: tagKeys.map((key) => key + "=" + preset.tags[key]),
            }
        }
    }
}

class MakiThief implements IconThief {
    public readonly _prefix: string
    private readonly _directory: string
    private readonly _license: SmallLicense
    private readonly _targetDir: string

    constructor(
        directory: string,
        targetDir: string,
        license: SmallLicense,
        prefix: string = "maki-"
    ) {
        this._license = license
        this._directory = directory
        this._targetDir = targetDir
        this._prefix = prefix
    }

    public steal(iconName: string): boolean {
        const target = this._targetDir + iconName + ".svg"
        if (existsSync(target)) {
            return true
        }
        try {
            const file = readFileSync(this._directory + iconName + ".svg", "utf8")
            writeFileSync(target, file, "utf8")

            writeFileSync(
                target + ".license_info.json",
                JSON.stringify({ ...this._license, path: this._prefix + iconName + ".svg" }),
                "utf8"
            )
            console.log("Successfully stolen " + iconName)
            return true
        } catch (e) {
            console.log("Could not steal " + iconName + " due to " + e.message)
            return false
        }
    }
}

class AggregateIconThief implements IconThief {
    private readonly makiThiefs: MakiThief[]

    constructor(makiThiefs: MakiThief[]) {
        this.makiThiefs = makiThiefs
    }

    public steal(iconName: string): boolean {
        for (const makiThief1 of this.makiThiefs) {
            if (iconName.startsWith(makiThief1._prefix)) {
                return makiThief1.steal(iconName.substr(makiThief1._prefix.length))
            }
        }
        return false
    }
}

class IdThief {
    private readonly _idPresetsRepository: string

    private readonly _tranlationFiles: Record<string, object> = {}
    private readonly _knownLanguages: string[]
    private readonly _iconThief: IconThief

    public constructor(idPresetsRepository: string, iconThief: IconThief) {
        this._idPresetsRepository = idPresetsRepository
        this._iconThief = iconThief
        const knownById = ScriptUtils.readDirRecSync(
            `${this._idPresetsRepository}/dist/translations/`
        )
            .map((pth) => pth.substring(pth.lastIndexOf("/") + 1, pth.length - ".json".length))
            .filter((lng) => !lng.endsWith(".min"))
        const missing = Object.keys(known_languages).filter(
            (lng) => knownById.indexOf(lng.replace("-", "_")) < 0
        )
        this._knownLanguages = knownById.filter((lng) => known_languages[lng] !== undefined)
        console.log(
            "Id knows following languages:",
            this._knownLanguages.join(", "),
            "missing:",
            missing
        )
    }

    public getTranslation(language: string, ...path: string[]): string {
        let obj = this.loadTranslationFile(language)[language]
        for (const p of path) {
            obj = obj[p]
            if (obj === undefined) {
                return undefined
            }
        }
        return obj
    }

    /**
     * Creates a mapRendering-mapping for the 'shop' theme
     */
    public readShopIcons(): { if: string | { and: string[] }; then: string }[] {
        const dir = this._idPresetsRepository + "/data/presets/shop"

        const mappings: {
            if: string | { and: string[] }
            then: string
        }[] = []
        const files = ScriptUtils.readDirRecSync(dir, 1)
        for (const file of files) {
            const preset = IdPreset.fromFile(file)

            if (!this._iconThief.steal(preset.icon)) {
                continue
            }

            const mapping = {
                if: preset.parseTags(),
                then: "./assets/layers/id_presets/" + preset.icon + ".svg",
            }
            mappings.push(mapping)
        }

        return mappings
    }

    /**
     * Creates a tagRenderingConfigJson for the 'shop' theme
     */
    public readShopPresets(): MappingConfigJson[] {
        const dir = this._idPresetsRepository + "/data/presets/shop"

        const mappings: MappingConfigJson[] = []
        const files = ScriptUtils.readDirRecSync(dir, 1)
        for (const file of files) {
            const name = file.substring(file.lastIndexOf("/") + 1, file.length - ".json".length)
            const preset = IdPreset.fromFile(file)

            if (preset.searchable === false) {
                continue
            }

            console.log(`     ${name} (shop=${preset.tags["shop"]}), ${preset.icon}`)

            const thenClause: Record<string, string> = {
                en: preset.name,
            }
            const terms: Record<string, string[]> = {
                en: preset.terms,
            }
            for (const lng of this._knownLanguages) {
                const lngMc = lng.replace("-", "_")
                const tr = this.getTranslation(lng, "presets", "presets", "shop/" + name, "name")
                if (tr !== undefined) {
                    thenClause[lngMc] = tr
                }

                const termsTr = this.getTranslation(
                    lng,
                    "presets",
                    "presets",
                    "shop/" + name,
                    "terms"
                )
                if (termsTr !== undefined) {
                    terms[lngMc] = termsTr.split(",")
                }
            }

            let tag = preset.parseTags()
            const mapping: MappingConfigJson = {
                if: tag,
                then: thenClause,
                searchTerms: terms,
            }
            if (preset.tags["shop"] == "yes") {
                mapping["hideInAnswer"] = true
                mapping.if["en"] = "Unspecified shop"
            }

            if (this._iconThief.steal(preset.icon)) {
                mapping["icon"] = {
                    path: "./assets/layers/id_presets/" + preset.icon + ".svg",
                    class: "medium",
                }
            } else {
                console.log(preset.icon + " could not be stolen :(")
            }

            mappings.push(mapping)
        }

        return mappings
    }

    private loadTranslationFile(language: string): object {
        const cached = this._tranlationFiles[language]
        if (cached) {
            return cached
        }
        return (this._tranlationFiles[language] = JSON.parse(
            readFileSync(`${this._idPresetsRepository}/dist/translations/${language}.json`, "utf8")
        ))
    }
}

const targetDir = "./assets/layers/id_presets/"

const makiThief = new MakiThief(
    "../maki/icons/",
    targetDir + "maki-",
    {
        authors: ["Maki icon set"],
        license: "CC0",
        path: null,
        sources: ["https://github.com/mapbox/maki"],
    },
    "maki-"
)

const temakiThief = new MakiThief(
    "../temaki/icons/",
    targetDir + "temaki-",
    {
        authors: ["Temaki icon set"],
        license: "CC0",
        path: null,
        sources: ["https://github.com/ideditor/temaki"],
    },
    "temaki-"
)
const fasThief = new MakiThief(
    "../Font-Awesome/svgs/solid/",
    targetDir + "fas-",
    {
        authors: ["Font-Awesome icon set"],
        license: "CC-BY 4.0",
        path: null,
        sources: ["https://github.com/FortAwesome/Font-Awesome"],
    },
    "fas-"
)
const iconThief = new AggregateIconThief([makiThief, temakiThief, fasThief])

const thief = new IdThief("../id-tagging-schema/", iconThief)

const id_presets_path = targetDir + "id_presets.json"
const idPresets = <LayerConfigJson>JSON.parse(readFileSync(id_presets_path, "utf8"))
idPresets.tagRenderings = [
    {
        id: "shop_types",
        mappings: thief.readShopPresets(),
    },
    {
        id: "shop_rendering",
        mappings: thief.readShopIcons(),
    },
]
console.log("Writing id presets to", id_presets_path)
writeFileSync(id_presets_path, JSON.stringify(idPresets, null, "  "), "utf8")
