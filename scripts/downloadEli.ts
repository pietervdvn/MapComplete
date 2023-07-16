import Script from "./Script"
import { Utils } from "../src/Utils"
import { FeatureCollection } from "geojson"
import fs from "fs"

class DownloadEli extends Script {
    constructor() {
        super("Downloads a fresh copy of the editor layer index, removes all unnecessary data.")
    }
    async main(args: string[]): Promise<void> {
        const url = "https://osmlab.github.io/editor-layer-index/imagery.geojson"
        // Target should use '.json' instead of '.geojson', as the latter cannot be imported by the build systems
        const target = args[0] ?? "src/assets/editor-layer-index.json"

        const eli = <FeatureCollection>await Utils.downloadJson(url)
        const keptLayers = []
        console.log("Got", eli.features.length, "ELI-entries")
        for (let layer of eli.features) {
            const props = layer.properties

            if (props.type === "bing") {
                // A lot of work to implement - see https://github.com/pietervdvn/MapComplete/issues/648
                continue
            }

            if (props.id === "MAPNIK") {
                // Already added by default
                continue
            }

            if (props.overlay) {
                continue
            }

            if (props.id === "Mapbox") {
                /**
                 * This token is managed by Martin Reifer on the 'OpenStreetMap'-account on MapBox
                 */
                const token =
                    "pk.eyJ1Ijoib3BlbnN0cmVldG1hcCIsImEiOiJjbGZkempiNDkyandvM3lwY3M4MndpdWdzIn0.QnvRv52n3qffVEKmQa9vJA"
                props.url = props.url.replace("{apikey}", token)
            }

            if (props.url.toLowerCase().indexOf("apikey") > 0) {
                continue
            }

            if (props.permission_url === "no") {
                continue
            }

            if (props.max_zoom < 19) {
                // We want users to zoom to level 19 when adding a point
                // If they are on a layer which hasn't enough precision, they can not zoom far enough. This is confusing, so we don't use this layer
                continue
            }

            if (props.name === undefined) {
                console.warn("Editor layer index: name not defined on ", props)
                continue
            }

            const keptKeys = [
                "name",
                "id",
                "url",
                "attribution",
                "type",
                "category",
                "min_zoom",
                "max_zoom",
                "best",
                "default",
                "tile-size",
            ]
            layer.properties = {}
            for (const keptKey of keptKeys) {
                if (props[keptKey]) {
                    layer.properties[keptKey] = props[keptKey]
                }
            }

            layer = { properties: layer.properties, type: layer.type, geometry: layer.geometry }
            keptLayers.push(layer)
        }

        const contents =
            '{"type":"FeatureCollection",\n  "features": [\n' +
            keptLayers.map((l) => JSON.stringify(l)).join(",\n") +
            "\n]}"
        fs.writeFileSync(target, contents, { encoding: "utf8" })
        console.log("Written", keptLayers.length + ", entries to the ELI")
    }
}

new DownloadEli().run()
