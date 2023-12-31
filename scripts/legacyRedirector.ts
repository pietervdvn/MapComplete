import * as http from "node:http"

/**
 * Redirect people from
 * "mapcomplete.osm.be/path?query=parameter#id" to "mapcomplete.org/path?query=parameter#id"
 */
const PORT = 1236
const CORS = "http://localhost:1234,https://mapcomplete.org,https://dev.mapcomplete.org"

async function redirect(req: http.IncomingMessage, res: http.ServerResponse) {
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
            res.writeHead(204, { "Content-Type": "text/html" })
            res.end()
            return
        }

        console.log("Request url:", req.url)
        const oldUrl = new URL("https://127.0.0.1:8080" + req.url)
        const newUrl = "https://mapcomplete.org" + oldUrl.pathname + oldUrl.search + oldUrl.hash
        res.writeHead(301, { "Content-Type": "text/html", Location: newUrl })
        res.write("Moved permantently")
        res.end()
    } catch (e) {
        console.error(e)
    }
}

http.createServer(redirect).listen(PORT)

console.log(
    `Server started at http://127.0.0.1:${PORT}/, the time is ${new Date().toISOString()}, version from package.json is`
)
