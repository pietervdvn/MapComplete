import { Client } from "pg"
import http from "node:http"
import { Tiles } from "../../src/Models/TileRange"

/**
 * Just the OSM2PGSL default database
 */
interface PoiDatabaseMeta {
    attributes
    current_timestamp
    db_format
    flat_node_file
    import_timestamp
    output
    prefix
    replication_base_url
    replication_sequence_number
    replication_timestamp
    style
    updatable
    version
}

/**
 * Connects with a Postgis database, gives back how much items there are within the given BBOX
 */
class OsmPoiDatabase {
    private static readonly prefixes: ReadonlyArray<string> = ["pois", "lines", "polygons"]
    private readonly _client: Client
    private isConnected = false
    private supportedLayers: Set<string> = undefined
    private metaCache: PoiDatabaseMeta = undefined
    private metaCacheDate: Date = undefined

    constructor(connectionString: string) {
        this._client = new Client(connectionString)
    }

    async getCount(
        layer: string,
        bbox: [[number, number], [number, number]] = undefined
    ): Promise<number> {
        if (!this.isConnected) {
            await this._client.connect()
            this.isConnected = true
        }

        let total = 0

        for (const prefix of OsmPoiDatabase.prefixes) {
            let query = "SELECT COUNT(*) FROM " + prefix + "_" + layer

            if (bbox) {
                query += ` WHERE ST_MakeEnvelope (${bbox[0][0]}, ${bbox[0][1]}, ${bbox[1][0]}, ${bbox[1][1]}, 4326) ~ geom`
            }
            console.log("Query:", query)
            const result = await this._client.query(query)
            total += Number(result.rows[0].count)
        }
        return total
    }

    disconnect() {
        this._client.end()
    }

    async getLayers(): Promise<Set<string>> {
        if (this.supportedLayers !== undefined) {
            return this.supportedLayers
        }
        const result = await this._client.query(
            "SELECT table_name \n" +
                "FROM information_schema.tables \n" +
                "WHERE table_schema = 'public' AND table_name LIKE 'lines_%';"
        )
        const layers = result.rows.map((r) => r.table_name.substring("lines_".length))
        this.supportedLayers = new Set(layers)
        return this.supportedLayers
    }

    async getMeta(): Promise<PoiDatabaseMeta> {
        const now = new Date()
        if (this.metaCache !== undefined) {
            const diffSec = (this.metaCacheDate.getTime() - now.getTime()) / 1000
            if (diffSec < 120) {
                return this.metaCache
            }
        }
        const result = await this._client.query("SELECT * FROM public.osm2pgsql_properties")
        const meta = {}
        for (const { property, value } of result.rows) {
            meta[property] = value
        }
        this.metaCacheDate = now
        this.metaCache = <any>meta
        return this.metaCache
    }
}

class Server {
    constructor(
        port: number,
        handle: {
            mustMatch: string | RegExp
            mimetype: string
            handle: (path: string) => Promise<string>
        }[]
    ) {
        handle.push({
            mustMatch: "",
            mimetype: "text/html",
            handle: async () => {
                return `<html><body>Supported endpoints are <ul>${handle
                    .filter((h) => h.mustMatch !== "")
                    .map((h) => {
                        let l = h.mustMatch
                        if (typeof h.mustMatch === "string") {
                            l = `<a href='${l}'>${l}</a>`
                        }
                        return "<li>" + l + "</li>"
                    })
                    .join("")}</ul></body></html>`
            },
        })
        http.createServer(async (req: http.IncomingMessage, res) => {
            try {
                console.log(
                    req.method + " " + req.url,
                    "from:",
                    req.headers.origin,
                    new Date().toISOString()
                )

                const url = new URL(`http://127.0.0.1/` + req.url)
                let path = url.pathname
                console.log("Handling ", path)
                while (path.startsWith("/")) {
                    path = path.substring(1)
                }
                const handler = handle.find((h) => {
                    if (typeof h.mustMatch === "string") {
                        return h.mustMatch === path
                    }
                    if (path.match(h.mustMatch)) {
                        return true
                    }
                })

                if (handler === undefined || handler === null) {
                    res.writeHead(404, { "Content-Type": "text/html" })
                    res.write("<html><body><p>Not found...</p></body></html>")
                    res.end()
                    return
                }

                res.setHeader(
                    "Access-Control-Allow-Headers",
                    "Origin, X-Requested-With, Content-Type, Accept"
                )
                res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*")
                if (req.method === "OPTIONS") {
                    res.setHeader(
                        "Access-Control-Allow-Methods",
                        "POST, GET, OPTIONS, DELETE, UPDATE"
                    )
                    res.writeHead(204, { "Content-Type": handler.mimetype })
                    res.end()
                    return
                }
                if (req.method === "POST" || req.method === "UPDATE") {
                    return
                }

                if (req.method === "DELETE") {
                    return
                }

                try {
                    const result = await handler.handle(path)
                    res.writeHead(200, { "Content-Type": handler.mimetype })
                    res.write(result)
                    res.end()
                } catch (e) {
                    console.error("Could not handle request:", e)
                    res.writeHead(500)
                    res.write(e)
                    res.end()
                }
            } catch (e) {
                console.error("FATAL:", e)
                res.end()
            }
        }).listen(port)
        console.log(
            "Server is running on port " + port,
            ". Supported endpoints are: " + handle.map((h) => h.mustMatch).join(", ")
        )
    }
}

const connectionString = "postgresql://user:password@localhost:5444/osm-poi"
const tcs = new OsmPoiDatabase(connectionString)
const server = new Server(2345, [
    {
        mustMatch: "summary/status.json",
        mimetype: "application/json",
        handle: async (path: string) => {
            const layers = await tcs.getLayers()
            const meta = await tcs.getMeta()
            return JSON.stringify({ meta, layers })
        },
    },
    {
        mustMatch: /summary\/[a-zA-Z0-9+]+\/[0-9]+\/[0-9]+\/[0-9]+\.json/,
        mimetype: "application/json", // "application/vnd.geo+json",
        async handle(path) {
            console.log("Path is:", path, path.split(".")[0])
            const [layers, z, x, y] = path.split(".")[0].split("/")

            let sum = 0
            let properties: Record<string, number> = {}
            const availableLayers = await tcs.getLayers()
            for (const layer of layers.split("+")) {
                console.log("Getting layer", layer)
                if (!availableLayers.has(layer)) {
                    continue
                }
                const count = await tcs.getCount(
                    layer,
                    Tiles.tile_bounds_lon_lat(Number(z), Number(x), Number(y))
                )
                properties[layer] = count
                sum += count
            }

            return JSON.stringify({ ...properties, total: sum })
        },
    },
])
console.log(
    ">>>",
    await tcs.getCount("drinking_water", [
        [3.194358020772171, 51.228073636083394],
        [3.2839964396059145, 51.172701162680994],
    ])
)
