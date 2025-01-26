import Script from "./Script"
import NameSuggestionIndex, { NSIItem } from "../src/Logic/Web/NameSuggestionIndex"
import * as nsiWD from "../node_modules/name-suggestion-index/dist/wikidata.min.json"
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "fs"
import ScriptUtils from "./ScriptUtils"
import { Utils } from "../src/Utils"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import { FilterConfigOptionJson } from "../src/Models/ThemeConfig/Json/FilterConfigJson"
import { TagUtils } from "../src/Logic/Tags/TagUtils"
import { openSync, readSync } from "node:fs"
import { QuestionableTagRenderingConfigJson } from "../src/Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"

class NsiLogos extends Script {
    constructor() {
        super("Contains various subcommands for NSI logo maintainance")
    }

    private async downloadLogo(nsiItem: NSIItem, type: string, basePath: string, alreadyDownloaded: Map<string, string>) {
        if(nsiItem === undefined){
            return false
        }
        if(alreadyDownloaded.has(nsiItem.id)){
            return false
        }
        try {
            return await this.downloadLogoUnsafe(nsiItem, type, basePath)
        } catch (e) {
            console.error("Could not download", nsiItem.displayName, "due to", e)
            return "error"
        }
    }

    private async downloadLogoUnsafe(nsiItem: NSIItem, type: string, basePath: string) {
        if (nsiItem === undefined) {
            return false
        }
        let path = basePath + nsiItem.id

        const logos = nsiWD["wikidata"][nsiItem?.tags?.[type + ":wikidata"]]?.logos
        const nsi = await NameSuggestionIndex.getNsiIndex()
        if (nsi.isSvg(nsiItem, type)) {
            path = path + ".svg"
        }

        if (existsSync(path)) {
            return false
        }

        if (!logos) {
            return false
        }
        if (logos.facebook) {
            // Facebook's logos are generally better and square
            await ScriptUtils.DownloadFileTo(logos.facebook, path)
            // Validate
            const content = readFileSync(path, "utf8")
            if (content.startsWith("{\"error\"")) {
                unlinkSync(path)
                console.error("Attempted to fetch", logos.facebook, " but this gave an error")
            } else {
                return true
            }
        }
        if (logos.wikidata) {
            let url: string = logos.wikidata
            console.log("Downloading", url)
            let ttl = 10
            do {
                ttl--
                const dloaded = await Utils.downloadAdvanced(url, {
                    "User-Agent":
                        "MapComplete NSI scraper/0.1 (https://github.com/pietervdvn/MapComplete; pietervdvn@posteo.net)",
                })
                const redirect: string | undefined = dloaded["redirect"]
                if (redirect) {
                    url = redirect
                    continue
                }
                if ((<string>logos.wikidata).toLowerCase().endsWith(".svg")) {
                    if (!path.endsWith(".svg")) {
                        throw "Undetected svg path:" + logos.wikidata
                    }
                    writeFileSync(path, dloaded["content"], "utf8")
                    return true
                }

                await ScriptUtils.DownloadFileTo(url, path)
                return true
            } while (ttl > 0)

            return false
        }

        return false
    }

    /**
     * Returns
     * @param type
     */
    async downloadFor(type: string): Promise<{ downloadCount: number; errored: number }> {
        const nsi = await NameSuggestionIndex.getNsiIndex()
        const items = nsi.allPossible(type)
        const basePath = "./public/assets/data/nsi/logos/"
        let downloadCount = 0
        let errored = 0
        let skipped = 0
        const alreadyDownloaded = NsiLogos.downloadedFiles()
        const stepcount = 50
        for (let i = 0; i < items.length; i += stepcount) {
            if (downloadCount > 0 || i % 200 === 0) {
                console.log(i + "/" + items.length, `downloaded ${downloadCount}; failed ${errored}; skipped ${skipped} for NSI type ${type}`)
            }

            const results = await Promise.all(
                Utils.TimesT(stepcount, (j) => j).map(async (j) => {
                    return await this.downloadLogo(items[i + j], type, basePath, alreadyDownloaded)
                }),
            )
            for (let j = 0; j < results.length; j++) {
                let didDownload = results[j]
                if (didDownload === true) {
                    downloadCount++
                }
                if (didDownload === false) {
                    skipped++
                }
                if (didDownload !== "error") {
                    continue
                }
                console.log("Retrying", items[i + j].id, type)
                didDownload = await this.downloadLogo(items[i + j], type, basePath, alreadyDownloaded)
                if (didDownload === "error") {
                    errored++
                    console.log("Failed again:", items[i + j].id)
                } else if (didDownload) {
                    downloadCount++
                }
            }
        }
        return {
            downloadCount, errored,
        }
    }

    private async generateRendering(type: string) {
        const nsi = await NameSuggestionIndex.getNsiIndex()
        const items = nsi.allPossible(type)
        const filterOptions: FilterConfigOptionJson[] = items.map((item) => {
            return {
                question: item.displayName,
                icon: nsi.getIconUrl(item),
                osmTags: NameSuggestionIndex.asFilterTags(item),
            }
        })
        const mappings = items.map((item) => ({
            if: NameSuggestionIndex.asFilterTags(item),
            then: nsi.getIconUrl(item)
        })).filter(mapping => mapping.then !== undefined)

        console.log("Checking for shadow-mappings... This will take a while")
        let deleted = 0
        for (let i = mappings.length - 1; i >= 0; i--) {
            const condition = TagUtils.Tag(mappings[i].if)
            if (i % 100 === 0) {
                console.log("Checking for shadow-mappings...", i, "/", mappings.length, "deleted", deleted)
            }
            const shadowsSomething = mappings.some((m, j) => {
                if (i === j) {
                    return false
                }
                return condition.shadows(TagUtils.Tag(m.if))
            })
            // If this one matches, the other one will match as well
            // We can thus remove this one in favour of the other one
            if (shadowsSomething) {
                deleted++
                mappings.splice(i, 1)
            }
        }

        const iconsTr: QuestionableTagRenderingConfigJson = <any>{
            strict: true,
            id: "icon",
            mappings,
        }

        const config: LayerConfigJson = {
            id: "nsi_" + type,
            description: {
                en: "Exposes part of the NSI to reuse in other themes, e.g. for rendering",
            },
            source: "special:library",
            pointRendering: null,
            tagRenderings: [iconsTr],
            filter: [
                <any>{
                    "#": "ignore-possible-duplicate",
                    id: type,
                    strict: true,
                    options: [{ question: type }, ...filterOptions],
                },
            ],
            allowMove: false,
            "#dont-translate": "*",
        }
        const path = "./assets/layers/nsi_" + type
        mkdirSync(path, { recursive: true })
        writeFileSync(path + "/nsi_" + type + ".json", JSON.stringify(config, null, "  "))
        console.log("Written", path)
    }

    private async download() {
        const types = ["brand", "operator"]
        let dload = 0
        let failed = 0
        for (const type of types) {
            const { downloadCount, errored } = await this.downloadFor(type)
            dload += downloadCount
            failed += errored
        }
        console.log(`Downloading completed: downloaded ${dload}; failed: ${failed}`)
    }

    private async generateRenderings() {
        const types = ["brand", "operator"]
        for (const type of types) {
            await this.generateRendering(type)
        }
    }

    private static readonly path: string = "./public/assets/data/nsi/logos"
    private static headers: Readonly<Record<string, ReadonlyArray<ReadonlyArray<number>>>> = {
        "png": [[137, 80, 78, 71, 13, 10, 26, 10]],
        "jpg": [[255, 216], [255, 232]],
        "gif": [[71, 73]],
    }

    private static downloadedFiles(): Map<string, string> {
        const allFiles = ScriptUtils.readDirRecSync(NsiLogos.path, 1)
        const ids = new Map<string, string>()
        for (const f of allFiles) {
            const match = f.match("^.*/([a-zA-Z0-9-]+)(.[a-z]{3})?")
            const id = match[1]
            ids.set(id, f)
        }
        return ids
    }

    /**
     * Delete all files not mentioned in the current NSI file
     * @private
     */
    private static async prune() {
        const nsi = await NameSuggestionIndex.getNsiIndex()
        const types = nsi.supportedTypes()
        const ids = new Set<string>()
        for (const t of types) {
            const items = nsi.allPossible(t)
            for (const item of items) {
                ids.add(item.id)
            }
        }
        const allFiles = ScriptUtils.readDirRecSync(NsiLogos.path, 1)
        let pruned = 0
        for (const f of allFiles) {
            const match = f.match("^.*/([a-zA-Z0-9-]+)(.[a-z]{3})?")
            const id = match[1]
            if (!ids.has(id)) {
                console.log("Obsolete file:", f, id)
                unlinkSync(f)
                pruned++
            }
        }
        console.log("Removed ", pruned, "files")


    }

    private startsWith(buffer: Buffer, header: ReadonlyArray<number>): boolean {
        let doesMatch = true
        for (let i = 0; i < header.length; i++) {
            doesMatch &&= buffer[i] === header[i]
        }
        return doesMatch
    }

    private startsWithAnyOf(buffer: Buffer, headers: ReadonlyArray<ReadonlyArray<number>>): boolean {
        return headers.some(header => this.startsWith(buffer, header))
    }

    private async addExtensions() {
        const allFiles = ScriptUtils.readDirRecSync(NsiLogos.path, 1)
        for (const f of allFiles) {
            if (f.match("[a-zA-Z0-9-].[a-z]{3}$")) {
                continue
            }

            const fd = openSync(f, "r")
            const buffer = Buffer.alloc(10)
            const num = readSync(fd, buffer, 0, 10, null)
            if (num === 0)
                throw "INvalid file:" + f

            let matchFound = false
            for (const format in NsiLogos.headers) {
                const matches = this.startsWithAnyOf(buffer, NsiLogos.headers[format])
                if (matches) {
                    renameSync(f, f + "." + format)
                    matchFound = true
                    break
                }
            }
            if (matchFound) {
                continue
            }
            const text = readFileSync(f, "utf8")
            if (text.startsWith("<!DOCTYPE html>")) {
                console.error("Got invalid file - is a HTML file:", f)
                unlinkSync(f)
                continue
            }
            throw "No format found for " + f + buffer.slice(0, 10).join(" ") + " ascii: " + text.slice(0, 40)

        }
    }

    private async patchNsiFile(){
        const files = NsiLogos.downloadedFiles()
        const path = "./public/assets/data/nsi/nsi.min.json"

        const nsi = JSON.parse(readFileSync(path, "utf8"))
        const types = nsi.nsi

        for (const k in types) {
            const t: NSIItem[] = types[k].items
            for (const nsiItem of t) {
                const file = files.get(nsiItem.id)
                if(!file){
                    continue
                }
                const extension = file.match(/.*\.([a-z]{3})/)[1]
                nsiItem["ext"] = extension
                delete nsiItem.fromTemplate
            }
        }
        writeFileSync(path, JSON.stringify(nsi), "utf8")

    }

    private commands: Record<string, { f: () => Promise<void>, doc?: string }> = {
        "download": { f: () => this.download(), doc: "Download all icons" },
        "generateRenderings": {
            f: () => this.generateRenderings(),
            doc: "Generates the layer files 'nsi_brand' and 'nsi_operator' which allows to reuse the icons in renderings",
        },
        "prune": { f: () => NsiLogos.prune(), doc: "Remove no longer needed files" },
        "addExtensions": {
            f: () => this.addExtensions(),
            doc: "Inspects all files without an extension; might remove invalid files",
        },
        "patch": {
            f: () => this.patchNsiFile(),
            doc: "Reads nsi.min.json, adds the 'ext' (extension) field to every relevant entry"
        },
        "all": {
            doc: "Run `download`, `generateRenderings`, `prune`  and `addExtensions`",
            f: async () => {
                await NsiLogos.prune()
                await this.download()
                await this.generateRenderings()
                await this.addExtensions()
                await this.patchNsiFile()
            },
        },
    }

    printHelp() {
        super.printHelp()
        console.log("Supported commands are: ")
        for (const command in this.commands) {
            console.log(`  ${command}\t: ${this.commands[command].doc ?? ""}`)
        }
    }

    async main(args: string[]): Promise<void> {
        if (args.length == 0) {
            this.printHelp()
            return
        }

        for (const command of args) {

            const c = this.commands[command]
            if (!c) {
                console.log("Unrecognized command:", c)
                this.printHelp()
                return
            }
            console.log("> " + command + " <")
            await c.f()
        }
    }
}

new NsiLogos().run()
