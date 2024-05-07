import Script from "../scripts/Script"
import { Server } from "./server"
import parse from "node-html-parser"
import ScriptUtils from "./ScriptUtils"

class ServerLdScrape extends Script {

    constructor() {
        super("Starts a server which fetches a webpage and returns embedded LD+JSON")
    }

    private static async attemptDownload(url: string) {
        const host = new URL(url).host
        const random = Math.floor(Math.random()*100)
        const random1 = Math.floor(Math.random()*100)

        const headers = [
            {
                "User-Agent":
                    `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.${random}.${random1} Safari/537.36`,
                "accept": "application/html"
            }
           /* {
                "User-Agent": "MapComplete/openstreetmap scraper; pietervdvn@posteo.net; https://github.com/pietervdvn/MapComplete",
                "accept": "application/html"
            },
            {
                Host: host,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:122.0) Gecko/20100101 Firefox/122.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,* /*;q=0.8", TODO remove space in * /*
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                "Alt-Used": host,
                DNT: 1,
                "Sec-GPC": 1,
                "Upgrade-Insecure-Requests": 1,
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "cross-site",
                "Sec-Fetch-User":"?1",
                "TE": "trailers",
                Connection: "keep-alive"
            }*/
        ]
        for (let i = 0; i < headers.length; i++) {
            try {

                return await ScriptUtils.Download(
                    url,
                    headers[i],
                    10
                )
            } catch (e) {
                console.error("Could not download", url, "with headers", headers[i], "due to", e)
            }
        }
    }

    async main(args: string[]): Promise<void> {
        const port = Number(args[0] ?? 2346)
        const cache: Record<string, { date: Date; contents: any }> = {}
        new Server(port, {}, [
            {
                mustMatch: "extractgraph",
                mimetype: "application/ld+json",
                addHeaders: {
                    "Cache-control": "max-age=3600, public"
                },
                async handle(content, searchParams: URLSearchParams) {
                    const url = searchParams.get("url")
                    console.log("URL", url)
                    if (cache[url] !== undefined) {
                        const { date, contents } = cache[url]
                        // In seconds
                        const tdiff = (new Date().getTime() - (date?.getTime() ?? 0)) / 1000
                        if (tdiff < 31 * 24 * 60 * 60) {
                            return JSON.stringify(contents)
                        }
                    }
                    let dloaded: { content: string } | { redirect: string } | "timeout" = {
                        redirect: url
                    }

                    do {
                        dloaded = await ServerLdScrape.attemptDownload(dloaded["redirect"])
                        if (dloaded === "timeout") {
                            return "{\"#\":\"timout reached\"}"
                        }
                        if(dloaded === undefined){
                            return undefined
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
                }
            }
        ])
    }
}

new ServerLdScrape().run()
