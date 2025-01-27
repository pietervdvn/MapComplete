import Script from "./Script"
import { CommunityResource } from "../src/Logic/Web/CommunityIndex"
import { Utils } from "../src/Utils"
import { FeatureCollection, MultiPolygon, Polygon } from "geojson"
import { writeFileSync } from "fs"
import { GeoOperations } from "../src/Logic/GeoOperations"
import { Tiles } from "../src/Models/TileRange"
import ScriptUtils from "./ScriptUtils"

class DownloadCommunityIndex extends Script {

    constructor() {
        super("Updates the community index")
    }

    printHelp() {
        console.log("Arguments are:\noutputdirectory")
    }

    private static targetZoomlevel: number = 6
    private static upstreamUrl: string = "https://raw.githubusercontent.com/osmlab/osm-community-index/main/dist/"

    /**
     * Prunes away unnecessary fields from a CommunityResource
     * @private
     */
    private static stripResource(r: Readonly<CommunityResource>): CommunityResource {
        return {
            id: r.id,
            languageCodes: r.languageCodes,
            account: r.account,
            type: r.type,
            resolved: {
                name: r.resolved.name,
                description: r.resolved.description,
                url: r.resolved.url
            }
        }
    }

    private static stripResourcesObj(resources: Readonly<Record<string, Readonly<CommunityResource>>>) {
        const stripped: Record<string, CommunityResource> = {}
        for (const k in resources) {
            stripped[k] = DownloadCommunityIndex.stripResource(resources[k])
        }
        return stripped
    }

    public static async update(targetDirectory: string) {
        const data = await Utils.downloadJson<FeatureCollection<Polygon | MultiPolygon, {
            resources: Record<string, CommunityResource>,
            nameEn: string,
            id: string
        }>>(DownloadCommunityIndex.upstreamUrl + "completeFeatureCollection.json"
        )
        const features = data.features
        const global = features.find(
            f => f.id === "Q2"
        )
        const globalProperties = DownloadCommunityIndex.stripResourcesObj(global.properties.resources)
        writeFileSync(targetDirectory + "/global.json", JSON.stringify(globalProperties), "utf8")
        console.log("Written global properties")

        const types = new Set<string>()
        for (const f of features) {
            const res = f.properties.resources
            for (const k in res) {
                types.add(res[k].type)
            }
        }
        for (const type of types) {
            const url = `${DownloadCommunityIndex.upstreamUrl}img/${type}.svg`
            await ScriptUtils.DownloadFileTo(url, `${targetDirectory}/${type}.svg`)
        }
        const local = features.filter(f => f.id !== "Q2")
        const spread = GeoOperations.spreadIntoBboxes(local, DownloadCommunityIndex.targetZoomlevel)
        let written = 0
        let skipped = 0
        writeFileSync(targetDirectory + "local.geojson", JSON.stringify({ type: "FeatureCollection", features: local }))
        for (const tileIndex of spread.keys()) {
            const features = spread.get(tileIndex)
            const clipped = GeoOperations.clipAllInBox(features, tileIndex)
            if (clipped.length === 0) {
                skipped++
                features.push(Tiles.asGeojson(tileIndex))
                writeFileSync(`${targetDirectory + tileIndex}_skipped.geojson`, JSON.stringify({
                    type: "FeatureCollection", features
                }))
                continue
            }
            const [z, x, y] = Tiles.tile_from_index(tileIndex)
            const path = `${targetDirectory}/tile_${z}_${x}_${y}.geojson`
            clipped.forEach((f) => {
                delete f.bbox
            })
            writeFileSync(path, JSON.stringify({ type: "FeatureCollection", features: clipped }), "utf8")
            written++
            console.log(`Written tile ${path}`)
        }
        console.log(`Created ${written} tiles, skipped ${skipped}`)
    }


    async main(args: string[]): Promise<void> {
        const path = args[0]
        if (!path) {
            this.printHelp()
            return
        }

        await DownloadCommunityIndex.update(path)

    }
}

new DownloadCommunityIndex().run()
