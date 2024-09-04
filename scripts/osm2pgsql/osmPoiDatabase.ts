import { Client } from "pg"

/**
 * Just the OSM2PGSL default database
 */
export interface PoiDatabaseMeta {
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
export class OsmPoiDatabase {
    private static readonly prefixes: ReadonlyArray<string> = ["pois", "lines", "polygons"]
    private _client: Client
    private isConnected = false
    private supportedLayers: Set<string> = undefined
    private supportedLayersDate: Date = undefined
    private metaCache: PoiDatabaseMeta = undefined
    private metaCacheDate: Date = undefined
    private readonly _connectionString: string

    private static readonly _prefix = "osm-poi" as const

    constructor(connectionString: string) {
        this._connectionString = connectionString
    }

    private getMetaClient() {
        return new Client(this._connectionString + "/postgres")
    }

    private async connectIfNeeded() {
        if (this.isConnected) {
            return
        }
        this.metaCache = undefined
        await this.connectToLatest()
        this._client.once("end", () => {
            this.isConnected = false
        })
        this._client.once("error", () => {
            if (this.isConnected) {
                this.isConnected = false
                try {
                    this._client.end()
                } catch (e) {
                    console.error("Could not disconnect")
                }
            }
        })
        this.isConnected = true
    }

    async findSuitableDatabases(): Promise<string[]> {
        const metaclient = this.getMetaClient()
        await metaclient.connect()
        try {
            const meta = await metaclient.query("SELECT datname FROM pg_database")
            let latest: string = undefined
            let latestDate: Date = new Date(0)
            const dbs: string[] = []
            for (const row of meta.rows) {
                const name: string = row["datname"]
                if (!name.startsWith(OsmPoiDatabase._prefix)) {
                    continue
                }
                const nm = name.substring(OsmPoiDatabase._prefix.length + 1)
                dbs.push(nm)
            }
            dbs.sort()
            return dbs
        } finally {
            await metaclient.end()
        }
    }

    async searchLatest() {
        const dbs = await this.findSuitableDatabases()
        let latest: string = undefined
        let latestDate: Date = undefined
        for (const name of dbs) {
            const date = new Date(name)
            if (latestDate === undefined || latestDate.getTime() < date.getTime()) {
                latest = name
                latestDate = date
            }
        }
        if (latest === undefined) {
            throw "No suitable database found"
        }

        console.log("Latest database is:", latest)
        return "osm-poi." + latest
    }

    async createNew(date: string) {
        const dbname = `${OsmPoiDatabase._prefix}.${date}`
        console.log("Attempting to create a new database with name", dbname)
        const metaclient = this.getMetaClient()
        await metaclient.connect()
        try {
            await metaclient.query(`CREATE DATABASE "${dbname}"`)
            console.log("Database created - installing extensions")
            const client = new Client(this._connectionString + "/" + dbname)
            try {
                await client.connect()
                await client.query(`CREATE EXTENSION IF NOT EXISTS postgis`)
                console.log("Created database", dbname, "with postgis")
            } finally {
                await client.end()
            }
        } finally {
            await metaclient.end()
        }
    }

    async deleteAllButLatest() {
        const dbs = await this.findSuitableDatabases()
        for (let i = 0; i < dbs.length - 1; i++) {
            await this.deleteDatabase(dbs[i])
        }
    }

    /**
     * DANGEROUS
     * Drops de database with the given name
     * @param date
     */
    async deleteDatabase(date: string) {
        const metaclient = this.getMetaClient()
        await metaclient.connect()
        try {
            await metaclient.query(`DROP DATABASE "${OsmPoiDatabase._prefix}.${date}"`)
            console.log(`Dropped database ${OsmPoiDatabase._prefix}.${date}`)
        } finally {
            await metaclient.end()
        }
    }

    async connectToLatest() {
        const latest = await this.searchLatest()
        this._client = new Client(this._connectionString + "/" + latest)
        await this._client.connect()
    }

    async getCount(
        layer: string,
        bbox: [[number, number], [number, number]] = undefined
    ): Promise<{ count: number; lat: number; lon: number }> {
        await this.connectIfNeeded()

        let total: number = 0
        let latSum = 0
        let lonSum = 0
        for (const prefix of OsmPoiDatabase.prefixes) {
            let query =
                "SELECT COUNT(*), ST_AsText(ST_Centroid(ST_Collect(geom))) FROM " +
                prefix +
                "_" +
                layer

            if (bbox) {
                query += ` WHERE ST_MakeEnvelope (${bbox[0][0]}, ${bbox[0][1]}, ${bbox[1][0]}, ${bbox[1][1]}, 4326) ~ geom`
            }
            const result = await this._client.query(query)
            const count = Number(result.rows[0].count)
            let point = result.rows[0].st_astext
            if (count === 0) {
                continue
            }
            total += count
            if (!point) {
                continue
            }
            point = point.substring(6, point.length - 1)
            const [lon, lat] = point.split(" ")
            latSum += lat * count
            lonSum += lon * count
        }

        return { count: total, lat: latSum / total, lon: lonSum / total }
    }

    disconnect() {
        this._client.end()
    }

    async getLayers(): Promise<Set<string>> {
        if (
            this.supportedLayers !== undefined &&
            new Date().getTime() - this.supportedLayersDate.getTime() < 1000 * 60 * 60 * 24
        ) {
            return this.supportedLayers
        }
        const q =
            "SELECT table_name \n" +
            "FROM information_schema.tables \n" +
            "WHERE table_schema = 'public' AND table_name LIKE 'lines_%';"
        const result = await this._client.query(q)
        const layers = result.rows.map((r) => r.table_name.substring("lines_".length))
        this.supportedLayers = new Set(layers)
        this.supportedLayersDate = new Date()
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
        await this.connectIfNeeded()
        const result = await this._client.query("SELECT * FROM public.osm2pgsql_properties")
        const meta = {}
        for (const { property, value } of result.rows) {
            meta[property] = value
        }
        this.metaCacheDate = now
        this.metaCache = <PoiDatabaseMeta>meta
        return this.metaCache
    }
}
