import { Store, UIEventSource } from "../UIEventSource"
import GeocodingProvider, { GeocodeResult, GeocodingOptions } from "./GeocodingProvider"
import { OsmId } from "../../Models/OsmFeature"
import { Utils } from "../../Utils"
import OsmObjectDownloader from "../Osm/OsmObjectDownloader"

export default class OpenStreetMapIdSearch implements GeocodingProvider {
    private static readonly regex =
        /((https?:\/\/)?(www.)?(osm|openstreetmap).org\/)?(n|node|w|way|r|relation)[/ ]?([0-9]+)/

    private static readonly types: Readonly<Record<string, "node" | "way" | "relation">> = {
        n: "node",
        w: "way",
        r: "relation",
    }
    private readonly _osmObjectDownloader: OsmObjectDownloader

    constructor(osmObjectDownloader: OsmObjectDownloader) {
        this._osmObjectDownloader = osmObjectDownloader
    }

    /**
     *
     * OpenStreetMapIdSearch.extractId("osm.org/node/42") // => "node/42"
     * OpenStreetMapIdSearch.extractId("https://openstreetmap.org/node/42#map=19/51.204245/3.212731") // => "node/42"
     * OpenStreetMapIdSearch.extractId("node/42") // => "node/42"
     * OpenStreetMapIdSearch.extractId("way/42") // => "way/42"
     * OpenStreetMapIdSearch.extractId("n123456789") // => "node/123456789"
     * OpenStreetMapIdSearch.extractId("node123456789") // => "node/123456789"
     * OpenStreetMapIdSearch.extractId("node 123456789") // => "node/123456789"
     * OpenStreetMapIdSearch.extractId("w123456789") // => "way/123456789"
     * OpenStreetMapIdSearch.extractId("way123456789") // => "way/123456789"
     * OpenStreetMapIdSearch.extractId("way 123456789") // => "way/123456789"
     * OpenStreetMapIdSearch.extractId("https://www.openstreetmap.org/node/5212733638") // => "node/5212733638"
     */
    public static extractId(query: string): OsmId | undefined {
        const match = query.match(OpenStreetMapIdSearch.regex)
        if (match) {
            let type = match.at(-2)
            const id = match.at(-1)
            if (type.length === 1) {
                type = OpenStreetMapIdSearch.types[type]
            }
            return <OsmId>(type + "/" + id)
        }
        return undefined
    }

    private async getInfoAbout(id: OsmId): Promise<GeocodeResult> {
        const [osm_type, osm_id] = id.split("/")
        const obj = await this._osmObjectDownloader.DownloadObjectAsync(id)
        if (obj === "deleted") {
            return {
                display_name: id + " was deleted",
                category: "coordinate",
                osm_type: <"node" | "way" | "relation">osm_type,
                osm_id,
                lat: 0,
                lon: 0,
                source: "osmid",
            }
        }
        const [lat, lon] = obj.centerpoint()
        return {
            lat,
            lon,
            display_name:
                obj.tags.name ?? obj.tags.alt_name ?? obj.tags.local_name ?? obj.tags.ref ?? id,
            description: osm_type,
            osm_type: <"node" | "way" | "relation">osm_type,
            osm_id,
            source: "osmid",
        }
    }

    async search(query: string, _: GeocodingOptions): Promise<GeocodeResult[]> {
        if (!isNaN(Number(query))) {
            const n = Number(query)
            return Utils.NoNullInplace(
                await Promise.all([
                    this.getInfoAbout(`node/${n}`).catch(() => undefined),
                    this.getInfoAbout(`way/${n}`).catch(() => undefined),
                    this.getInfoAbout(`relation/${n}`).catch(() => undefined),
                ])
            )
        }

        const id = OpenStreetMapIdSearch.extractId(query)
        if (!id) {
            return []
        }
        return [await this.getInfoAbout(id)]
    }

    suggest?(query: string, options?: GeocodingOptions): Store<GeocodeResult[]> {
        return UIEventSource.FromPromise(this.search(query, options))
    }
}
