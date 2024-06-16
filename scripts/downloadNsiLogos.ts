import Script from "./Script"
import NameSuggestionIndex, { NSIItem } from "../src/Logic/Web/NameSuggestionIndex"
import * as nsiWD from "../node_modules/name-suggestion-index/dist/wikidata.min.json"
import { existsSync, writeFileSync } from "fs"
import ScriptUtils from "./ScriptUtils"
import { Utils } from "../src/Utils"

class DownloadNsiLogos extends Script {
    constructor() {
        super("Downloads all images of the NSI")
    }

    private async downloadLogo(nsiItem: NSIItem, type: string, basePath: string) {
        try {
            return await this.downloadLogoUnsafe(nsiItem, type, basePath)
        } catch (e) {
            console.error("Could not download", nsiItem.displayName, "due to", e)
            return false
        }
    }

    private async downloadLogoUnsafe(nsiItem: NSIItem, type: string, basePath: string) {
        if (nsiItem === undefined) {
            return false
        }
        let path = basePath + nsiItem.id

        const logos = nsiWD["wikidata"][nsiItem?.tags?.[type + ":wikidata"]]?.logos

        if (NameSuggestionIndex.isSvg(nsiItem, type)) {
            path = path + ".svg"
        }

        if (existsSync(path)) {
            return false
        }

        if (!logos) {
            return false
        }
        if (logos.facebook) {
            // Facebook logo's are generally better and square
            await ScriptUtils.DownloadFileTo(logos.facebook, path)
            return true
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

    async main(): Promise<void> {
        await this.downloadFor("operator")
        await this.downloadFor("brand")
    }

    async downloadFor(type: "brand" | "operator"): Promise<void> {
        const items = NameSuggestionIndex.allPossible(type)
        const basePath = "./public/assets/data/nsi/logos/"
        let downloadCount = 0
        const stepcount = 100
        for (let i = 0; i < items.length; i += stepcount) {
            if (i % 100 === 0) {
                console.log(i + "/" + items.length, "downloaded " + downloadCount)
            }
            await Promise.all(
                Utils.TimesT(stepcount, (j) => j).map(async (j) => {
                    const downloaded = await this.downloadLogo(items[i + j], type, basePath)
                    if (downloaded) {
                        downloadCount++
                    }
                })
            )
        }
    }
}

new DownloadNsiLogos().run()
