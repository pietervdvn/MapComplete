import Script from "../scripts/Script"
import { Server } from "../scripts/server"
import { Utils } from "../src/Utils"
import parse from "node-html-parser"
class ServerLdScrape extends Script {
    constructor() {
        super("Starts a server which fetches a webpage and returns embedded LD+JSON")
    }
    async main(args: string[]): Promise<void> {
        const port = Number(args[0] ?? 2346)
        new Server(port, {}, [
            {
                mustMatch: "extractgraph",
                mimetype: "application/ld+json",
                async handle(content, searchParams: URLSearchParams) {
                    const url = searchParams.get("url")
                    const dloaded = await Utils.download(url, {
                        "User-Agent":
                            "MapComplete/openstreetmap scraper; pietervdvn@posteo.net; https://github.com/pietervdvn/MapComplete",
                    })
                    const parsed = parse(dloaded)
                    const scripts = Array.from(parsed.getElementsByTagName("script"))
                    const snippets = []
                    for (const script of scripts) {
                        const tp = script.attributes["type"]
                        if (tp !== "application/ld+json") {
                            continue
                        }
                        try {
                            snippets.push(JSON.parse(script.textContent))
                        } catch (e) {
                            console.error(e)
                        }
                    }

                    return JSON.stringify(snippets)
                },
            },
        ])
    }
}

new ServerLdScrape().run()
