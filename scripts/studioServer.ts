import * as fs from "node:fs"
import * as http from "node:http"
import * as path from "node:path"
import ScriptUtils from "./ScriptUtils"
import * as meta from "../package.json"
import { ServerResponse } from "http"

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
    while (url.startsWith("/")) {
        url = url.slice(1)
    }
    const sliced = url.split("/").slice(1)
    if (!sliced) {
        return
    }
    const backupFile = path.join(STATIC_PATH, ...sliced)
    console.log("Using backup path", backupFile)
    if (fs.existsSync(backupFile)) {
        return fs.readFileSync(backupFile, "utf8")
    }
    return null
}
async function handleDelete(req: http.IncomingMessage, res: ServerResponse) {
    let body = ""
    req.on("data", (chunk) => {
        body = body + chunk
    })
    const paths = req.url.split("/")
    console.log("Got a valid delete to:", paths.join("/"))
    for (let i = 1; i < paths.length; i++) {
        const p = paths.slice(0, i)
        const dir = STATIC_PATH + p.join("/")
        if (!fs.existsSync(dir)) {
            res.writeHead(304, { "Content-Type": MIME_TYPES.html })
            res.write("<html><body>No parent directory, nothing deleted</body></html>", "utf8")
            res.end()
            return
        }
    }
    const path = STATIC_PATH + paths.join("/")
    if (!fs.existsSync(path)) {
        res.writeHead(304, { "Content-Type": MIME_TYPES.html })
        res.write("<html><body>File not found</body></html>", "utf8")
        res.end()
        return
    }

    fs.renameSync(path, path + ".bak")
    res.writeHead(200, { "Content-Type": MIME_TYPES.html })
    res.write("<html><body>File moved to backup</body></html>", "utf8")
    res.end()
}

async function handlePost(req: http.IncomingMessage, res: ServerResponse) {
    let body = ""
    req.on("data", (chunk) => {
        body = body + chunk
    })

    await new Promise((resolve) => req.on("end", resolve))

    console.log(new Date().toISOString())
    let parsed: any
    try {
        parsed = JSON.parse(body)
    } catch (e) {
        console.error("ERROR: probably did not receive the full JSON", e)
        res.writeHead(400, { "Content-Type": MIME_TYPES.html })
        res.write("<html><body>Invalid JSON:" + e + "</body></html>", "utf8")
        res.end()
        return
    }

    const paths = req.url.split("/")
    console.log("Got a valid update to:", paths.join("/"))
    for (let i = 1; i < paths.length; i++) {
        const p = paths.slice(0, i)
        const dir = STATIC_PATH + p.join("/")
        if (!fs.existsSync(dir)) {
            console.log("Creating new directory", dir)
            fs.mkdirSync(dir)
        }
    }
    const path = STATIC_PATH + paths.join("/")
    fs.writeFileSync(path, JSON.stringify(parsed, null, "  "))
    res.writeHead(200, { "Content-Type": MIME_TYPES.html })
    res.write("<html><body>OK</body></html>", "utf8")
    res.end()
    return
}

http.createServer(async (req: http.IncomingMessage, res) => {
    try {
        console.log(
            req.method + " " + req.url,
            "from:",
            req.headers.origin,
            new Date().toISOString()
        )
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
            await handlePost(req, res)
            return
        }

        if (req.method === "DELETE") {
            console.log("Got a DELETE", new Date())
            await handleDelete(req, res)
            return
        }

        const url = new URL(`http://127.0.0.1/` + req.url)
        console.log("URL pathname is")
        if (url.pathname.endsWith("overview")) {
            console.log("Giving overview")
            let userId = url.searchParams.get("userId")
            const allFiles = ScriptUtils.readDirRecSync(STATIC_PATH)
                .filter(
                    (p) =>
                        p.endsWith(".json") &&
                        !p.endsWith("license_info.json") &&
                        (p.startsWith("layers") ||
                            p.startsWith("themes") ||
                            userId !== undefined ||
                            p.startsWith(userId))
                )
                .map((p) => p.substring(STATIC_PATH.length + 1))
            res.writeHead(200, { "Content-Type": MIME_TYPES.json })
            res.write(JSON.stringify({ allFiles }))
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

console.log(
    `Server started at http://127.0.0.1:${PORT}/, the time is ${new Date().toISOString()}, version from package.json is ${
        meta.version
    }`
)
