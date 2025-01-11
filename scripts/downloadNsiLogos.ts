import Script from "./Script"
import NameSuggestionIndex, { NSIItem } from "../src/Logic/Web/NameSuggestionIndex"
import * as nsiWD from "../node_modules/name-suggestion-index/dist/wikidata.min.json"
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs"
import ScriptUtils from "./ScriptUtils"
import { Utils } from "../src/Utils"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import { FilterConfigOptionJson } from "../src/Models/ThemeConfig/Json/FilterConfigJson"
import { TagUtils } from "../src/Logic/Tags/TagUtils"
import { TagRenderingConfigJson } from "../src/Models/ThemeConfig/Json/TagRenderingConfigJson"

class DownloadNsiLogos extends Script {
    constructor() {
        super("Downloads all images of the NSI")
    }

    private async downloadLogo(nsiItem: NSIItem, type: string, basePath: string) {
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
                    console.log("Got a redirect from", url, "to", redirect)
                    url = redirect
                    continue
                }
                if ((<string>logos.wikidata).toLowerCase().endsWith(".svg")) {
                    console.log("Written SVG", path)
                    if (!path.endsWith(".svg")) {
                        throw "Undetected svg path:" + logos.wikidata
                    }
                    writeFileSync(path, dloaded["content"], "utf8")
                    return true
                }

                console.log("Got data from", url, "-->", path)
                await ScriptUtils.DownloadFileTo(url, path)
                return true
            } while (ttl > 0)

            return false
        }

        return false
    }


    async downloadFor(type: string): Promise<void> {
        const nsi = await NameSuggestionIndex.getNsiIndex()
        const items = nsi.allPossible(type)
        const basePath = "./public/assets/data/nsi/logos/"
        let downloadCount = 0
        const stepcount = 5
        for (let i = 0; i < items.length; i += stepcount) {
            if (downloadCount > 0 || i % 200 === 0) {
                console.log(i + "/" + items.length, "downloaded " + downloadCount)
            }

            const results = await Promise.all(
                Utils.TimesT(stepcount, (j) => j).map(async (j) => {
                    const downloaded = await this.downloadLogo(items[i + j], type, basePath)
                    if (downloaded) {
                        downloadCount++
                    }
                    return downloaded
                }),
            )
            for (let j = 0; j < results.length; j++) {
                let didDownload = results[j]
                if (didDownload !== "error") {
                    continue
                }
                console.log("Retrying", items[i + j].id, type)
                didDownload = await this.downloadLogo(items[i + j], type, basePath)
                if (didDownload === "error") {
                    console.log("Failed again:", items[i + j].id)
                }
            }
        }
    }

    private async generateRendering(type: string) {
        const nsi = await NameSuggestionIndex.getNsiIndex()
        const items = nsi.allPossible(type)
        const filterOptions: FilterConfigOptionJson[] = items.map(item => {
            return ({
                question: item.displayName,
                icon: nsi.getIconUrl(item, type),
                osmTags: NameSuggestionIndex.asFilterTags(item),
            })
        })
        const mappings = items.map(item => ({
            if: NameSuggestionIndex.asFilterTags(item),
            then: nsi.getIconUrl(item, type),
        }))

        console.log("Checking for shadow-mappings...")
        for (let i = mappings.length - 1; i >= 0 ; i--) {
            const condition = TagUtils.Tag(mappings[i].if)
            if(i % 100 === 0){
                console.log("Checking for shadow-mappings...",i,"/",mappings.length )

            }
            const shadowsSomething = mappings.some((m,j)     => {
                if(i===j ){
                    return false
                }
                return condition.shadows(TagUtils.Tag(m.if))
            })
            // If this one matches, the other one will match as well
            // We can thus remove this one in favour of the other one
            if(shadowsSomething){
                mappings.splice(i, 1)
            }
        }

        const iconsTr: TagRenderingConfigJson = <any>{
            strict: true,
            id: "icon",
            mappings,
        }

        const config: LayerConfigJson = {
            "#dont-translate": "*",
            "#no-index": "yes",
            id: "nsi_" + type,
            source: "special:library",
            description: {
                en: "Exposes part of the NSI to reuse in other themes, e.g. for rendering",
            },
            pointRendering: null,
            tagRenderings: [
                iconsTr,
            ],
            filter: [
                <any>{
                    "#":"ignore-possible-duplicate",
                    id: type,
                    strict: true,
                    options: [{ question: type }, ...filterOptions],
                },
            ],
            allowMove: false,
        }
        const path = "./assets/layers/nsi_" + type
        mkdirSync(path, { recursive: true })
        writeFileSync(path + "/nsi_" + type + ".json", JSON.stringify(config, null, "  "))
        console.log("Written", path)
    }

    async main(): Promise<void> {
        const nsi = await NameSuggestionIndex.getNsiIndex()
        const types = ["brand", "operator"]
        for (const type of types) {
            await this.generateRendering(type)
            // await this.downloadFor(type)
        }
    }


}

new DownloadNsiLogos().run()
