import { BBox } from "../../src/Logic/BBox"
import { Client } from "pg"

/**
 * Connects with a Postgis database, gives back how much items there are within the given BBOX
 */
export default class TilecountServer {
    private readonly _client: Client
    private isConnected = false

    constructor(connectionString: string) {
        this._client = new Client(connectionString)
    }

    async getCount(layer: string, bbox: BBox = undefined): Promise<number> {
        if (!this.isConnected) {
            await this._client.connect()
            this.isConnected = true
        }

        let query = "SELECT COUNT(*) FROM " + layer

        if(bbox){
            query += ` WHERE ST_MakeEnvelope (${bbox.minLon}, ${bbox.minLat}, ${bbox.maxLon}, ${bbox.maxLat}, 4326) ~ geom`
        }
console.log(query)
        const result = await this._client.query(query)
        return result.rows[0].count
    }

    disconnect() {
        this._client.end()
    }
}

const tcs = new TilecountServer("postgresql://user:none@localhost:5444/osm-poi")
console.log(">>>", await tcs.getCount("drinking_water", new BBox([
    [1.5052013991654007,
        42.57480750272123,
    ], [
        1.6663677350703097,
        42.499856652770745,
    ]])))
tcs.disconnect()
