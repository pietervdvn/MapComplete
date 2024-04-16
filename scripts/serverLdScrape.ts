import Script from "../scripts/Script"
import { Server } from "./server"
import parse from "node-html-parser"
import ScriptUtils from "./ScriptUtils"

class ServerLdScrape extends Script {
    constructor() {
        super("Starts a server which fetches a webpage and returns embedded LD+JSON")
    }

    async main(args: string[]): Promise<void> {
        const port = Number(args[0] ?? 2346)
        const cache: Record<string, { date: Date; contents: any }> = {}
        new Server(port, {}, [
            {
                mustMatch: "extractgraph",
                mimetype: "application/ld+json",
                addHeaders: {
                    "Cache-control": "max-age=3600, public",
                },
                async handle(content, searchParams: URLSearchParams) {
                    const url = searchParams.get("url")
                    console.log("URL", url)
                    if (cache[url] !== undefined) {
                        const { date, contents } = cache[url]
                        console.log(">>>", date, contents)
                        // In seconds
                        const tdiff = (new Date().getTime() - (date?.getTime() ?? 0)) / 1000
                        if (tdiff < 24 * 60 * 60) {
                            return JSON.stringify(contents)
                        }
                    }
                    let dloaded: { content: string } | { redirect: string } | "timeout" = {
                        redirect: url,
                    }
                    do {
                        dloaded = await ScriptUtils.Download(
                            dloaded["redirect"],
                            {
                                "User-Agent":
                                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36", // MapComplete/openstreetmap scraper; pietervdvn@posteo.net; https://github.com/pietervdvn/MapComplete",
                            },
                            10
                        )
                        if (dloaded === "timeout") {
                            return '{"#":"timout reached"}'
                        }
                    } while (dloaded["redirect"])

                    if (dloaded["content"].startsWith("{")) {
                        // This is probably a json
                        const snippet = JSON.parse(dloaded["content"])
                        console.log("Snippet is", snippet)
                        cache[url] = { contents: snippet, date: new Date() }
                        return JSON.stringify(snippet)
                    }

                    const parsed = parse(dloaded["content"])
                    const scripts = Array.from(parsed.getElementsByTagName("script"))
                    for (const script of scripts) {
                        const tp = script.attributes["type"]
                        if (tp !== "application/ld+json") {
                            continue
                        }
                        try {
                            const snippet = JSON.parse(script.textContent)
                            snippet["@base"] = url
                            cache[url] = { contents: snippet, date: new Date() }

                            return JSON.stringify(snippet)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                },
            },
        ])
    }
}

new ServerLdScrape().run()
