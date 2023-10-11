import * as fs from "node:fs"
import * as http from "node:http"
import * as path from "node:path"
import ScriptUtils from "./ScriptUtils"

const PORT = 1235
const CORS = "http://localhost:1234,https://mapcomplete.org,https://dev.mapcomplete.org"

const MIME_TYPES = {
    default: "application/octet-stream",
    html: "text/html; charset=UTF-8",
    js: "application/javascript",
    css: "text/css",
    png: "image/png",
    jpg: "image/jpg",
    gif: "image/gif",
    ico: "image/x-icon",
    svg: "image/svg+xml",
    json: "application/json",
}

const STATIC_PATH = path.join(process.cwd(), "./assets")

async function prepareFile(url: string): Promise<string> {
    const paths = [STATIC_PATH, url]
    if (url.endsWith("/")) paths.push("index.html")
    const filePath = path.join(...paths)
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf8")
    }
    return null
}

http.createServer(async (req, res) => {
    try {
        console.log(req.method + " " + req.url, "from:", req.headers.origin)
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        )
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*")
        if (req.method === "OPTIONS") {
            res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, UPDATE")
            res.writeHead(204, { "Content-Type": MIME_TYPES.html })
            res.end()
            return
        }
        if (req.method === "POST" || req.method === "UPDATE") {
            const paths = req.url.split("/")
            console.log("Got an update to:", paths.join("/"))
            for (let i = 1; i < paths.length; i++) {
                const p = paths.slice(0, i)
                const dir = STATIC_PATH + p.join("/")
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir)
                }
            }
            req.pipe(fs.createWriteStream(STATIC_PATH + paths.join("/")))
            res.writeHead(200, { "Content-Type": MIME_TYPES.html })
            res.write("<html><body>OK</body></html>", "utf8")
            res.end()
            return
        }
        if (req.url.endsWith("/overview")) {
            console.log("Giving overview")
            const allFiles = ScriptUtils.readDirRecSync(STATIC_PATH)
                .filter((p) => p.endsWith(".json") && !p.endsWith("license_info.json"))
                .map((p) => p.substring(STATIC_PATH.length + 1))
            res.writeHead(200, { "Content-Type": MIME_TYPES.json })
            res.write(JSON.stringify({ allFiles }))
            res.end()
            return
        }
        if (!fs.existsSync(STATIC_PATH + req.url)) {
            res.writeHead(404, { "Content-Type": MIME_TYPES.html })
            res.write("<html><body><p>Not found...</p></body></html>")
            res.end()
            return
        }
        const file = await prepareFile(req.url)
        if (file === null) {
            res.writeHead(404, { "Content-Type": MIME_TYPES.html })
            res.write("<html><body><p>Not found...</p></body></html>")
            res.end()
            return
        }
        const statusCode = 200
        const mimeType = MIME_TYPES.json || MIME_TYPES.default
        res.writeHead(statusCode, { "Content-Type": mimeType })
        res.write(file)
        res.end()
    } catch (e) {
        console.error(e)
    }
}).listen(PORT)

console.log(`Server running at http://127.0.0.1:${PORT}/`)
