import fs from "fs"
import readline from "readline"
import Script from "../Script"
import LinkedDataLoader from "../../src/Logic/Web/LinkedDataLoader"
import UrlValidator from "../../src/UI/InputElement/Validators/UrlValidator"
// vite-node scripts/importscripts/compareWebsiteData.ts -- ~/Downloads/ShopsWithWebsiteNodes.csv ~/data/scraped_websites/
class CompareWebsiteData extends Script {
    constructor() {
        super(
            "Given a csv file with 'id', 'tags' and 'website', attempts to fetch jsonld and compares the attributes. Usage: csv-file datadir"
        )
    }

    private readonly urlFormatter = new UrlValidator()
    async getWithCache(cachedir: string, url: string): Promise<any> {
        const filename = cachedir + "/" + encodeURIComponent(url)
        if (fs.existsSync(filename)) {
            return JSON.parse(fs.readFileSync(filename, "utf-8"))
        }
        const jsonLd = await LinkedDataLoader.fetchJsonLd(url, undefined, true)
        console.log("Got:", jsonLd)
        fs.writeFileSync(filename, JSON.stringify(jsonLd))
        return jsonLd
    }
    async handleEntry(line: string, cachedir: string, targetfile: string): Promise<boolean> {
        const id = JSON.parse(line.split(",")[0])
        let tags = line.substring(line.indexOf("{") - 1)
        tags = tags.substring(1, tags.length - 1)
        tags = tags.replace(/""/g, '"')
        const data = JSON.parse(tags)

        try {
            const website = this.urlFormatter.reformat(data.website)
            console.log(website)
            const jsonld = await this.getWithCache(cachedir, website)
            if (Object.keys(jsonld).length === 0) {
                return false
            }
            const diff = LinkedDataLoader.removeDuplicateData(jsonld, data)
            fs.appendFileSync(targetfile, id + ", " + JSON.stringify(diff) + "\n\n")
            return true
        } catch (e) {
            console.error("Could not download ", data.website)
        }
    }

    async main(args: string[]): Promise<void> {
        if (args.length < 2) {
            throw "Not enough arguments"
        }

        const readInterface = readline.createInterface({
            input: fs.createReadStream(args[0]),
        })

        let handled = 0
        let diffed = 0
        const targetfile = "diff.csv"
        fs.writeFileSync(targetfile, "id, diff-json\n")
        for await (const line of readInterface) {
            try {
                if (line.startsWith('"id"')) {
                    continue
                }
                const madeComparison = await this.handleEntry(line, args[1], targetfile)
                handled++
                diffed = diffed + (madeComparison ? 1 : 0)
                if (handled % 1000 == 0) {
                    console.log("Handled ", handled, " got ", diffed, "diff results")
                }
            } catch (e) {
                // console.error(e)
            }
        }
    }
}

new CompareWebsiteData().run()
