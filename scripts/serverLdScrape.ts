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
        const cache: Record<string, any> = []
        new Server(port, {}, [
            {
                mustMatch: "extractgraph",
                mimetype: "application/ld+json",
                async handle(content, searchParams: URLSearchParams) {
                    const url = searchParams.get("url")
                    console.log("Fetching", url)
                    if (cache[url]) {
                        return JSON.stringify(cache[url])
                    }
                    const dloaded = await Utils.download(url, {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36", //     "MapComplete/openstreetmap scraper; pietervdvn@posteo.net; https://github.com/pietervdvn/MapComplete",
                    })
                    // return dloaded
                    const parsed = parse(dloaded)
                    const scripts = Array.from(parsed.getElementsByTagName("script"))
                    for (const script of scripts) {
                        const tp = script.attributes["type"]
                        if (tp !== "application/ld+json") {
                            continue
                        }
                        try {
                            const snippet = JSON.parse(script.textContent)
                            snippet["@base"] = url
                            cache[url] = snippet

                            return JSON.stringify(snippet)
                        } catch (e) {
                            console.error(e)
                        }
                    }

                    return JSON.stringify({})
                },
            },
        ])
    }
}

new ServerLdScrape().run()
