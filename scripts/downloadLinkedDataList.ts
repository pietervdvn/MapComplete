import Script from "./Script"
import LinkedDataLoader from "../src/Logic/Web/LinkedDataLoader"
import { writeFileSync } from "fs"

export default class DownloadLinkedDataList extends Script {
    constructor() {
        super("Downloads the localBusinesses from the given location. Usage: url [--no-proxy]")
    }

    async main([url, noProxy]: string[]): Promise<void> {
        const useProxy = noProxy !== "--no-proxy"
        const data = await LinkedDataLoader.fetchJsonLd(url, {}, useProxy)
        const path = "linked_data_" + url.replace(/[^a-zA-Z0-9_]/g, "_") + ".jsonld"
        writeFileSync(path, JSON.stringify(data), "utf8")
        console.log("Written", path)
    }
}

new DownloadLinkedDataList().run()
