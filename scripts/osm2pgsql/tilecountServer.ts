import { Tiles } from "../../src/Models/TileRange"
import { Server } from "../server"
import Script from "../Script"
import { OsmPoiDatabase } from "./osmPoiDatabase"

class CachedSqlCount {
    private readonly _cache: Record<
        string,
        Record<
            number,
            {
                date: Date
                entry: { count: number; lat: number; lon: number }
            }
        >
    > = {}

    private readonly _poiDatabase: OsmPoiDatabase
    private readonly _maxAge: number

    constructor(poiDatabase: OsmPoiDatabase, maxAge: number) {
        this._poiDatabase = poiDatabase
        this._maxAge = maxAge
    }

    public async getCount(
        layer: string,
        tileId: number
    ): Promise<{ count: number; lat: number; lon: number }> {
        const cachedEntry = this._cache[layer]?.[tileId]
        if (cachedEntry) {
            const age = (new Date().getTime() - cachedEntry.date.getTime()) / 1000
            if (age < this._maxAge) {
                return cachedEntry.entry
            }
        }
        const bbox = Tiles.tile_bounds_lon_lat(...Tiles.tile_from_index(tileId))
        const count = await this._poiDatabase.getCount(layer, bbox)
        if (!this._cache[layer]) {
            this._cache[layer] = {}
        }
        this._cache[layer][tileId] = { entry: count, date: new Date() }
        return count
    }
}

class TileCountServer extends Script {
    constructor() {
        super(
            "Starts the tilecount server which calculates summary for a given tile, based on the database. Usage: [db-connection-string] [port=2345]"
        )
    }

    async main(args: string[]): Promise<void> {
        const connectionString = args[0] ?? "postgresql://user:password@localhost:5444"
        const port = Number(args[1] ?? 2345)
        console.log("Connecting to database", connectionString)
        const tcs = new OsmPoiDatabase(connectionString)
        const withCache = new CachedSqlCount(tcs, 14 * 60 * 60 * 24)
        new Server(port, { ignorePathPrefix: ["summary"] }, [
            {
                mustMatch: "status.json",
                mimetype: "application/json",
                handle: async () => {
                    const layers = await tcs.getLayers()
                    const meta = await tcs.getMeta()
                    return JSON.stringify({ meta, layers: Array.from(layers) })
                },
            },
            {
                mustMatch: /[a-zA-Z0-9+_-]+\/[0-9]+\/[0-9]+\/[0-9]+\.json/,
                mimetype: "application/json", // "application/vnd.geo+json",
                async handle(path) {
                    const [layers, z, x, y] = path.split(".")[0].split("/")

                    let sum = 0
                    const properties: Record<string, number> = {}
                    const availableLayers = await tcs.getLayers()
                    let latSum = 0
                    let lonSum = 0
                    for (const layer of layers.split("+")) {
                        if (!availableLayers.has(layer)) {
                            continue
                        }
                        const count = await withCache.getCount(
                            layer,
                            Tiles.tile_index(Number(z), Number(x), Number(y))
                        )

                        properties[layer] = count.count
                        if (count.count !== 0) {
                            latSum += count.lat * count.count
                            lonSum += count.lon * count.count
                            sum += count.count
                        }
                    }

                    properties["lon"] = lonSum / sum
                    properties["lat"] = latSum / sum

                    return JSON.stringify({ ...properties, total: sum })
                },
            },
        ])
        console.log("Started server on port", port)
        console.log(
            ">>>",
            await tcs.getCount("drinking_water", [
                [3.194358020772171, 51.228073636083394],
                [3.2839964396059145, 51.172701162680994],
            ])
        )
    }
}

new TileCountServer().run()
