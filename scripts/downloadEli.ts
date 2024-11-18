import Script from "./Script"
import { Utils } from "../src/Utils"
import { Eli, EliEntry } from "./@types/eli"
import fs from "fs"
import { BingRasterLayer } from "../src/UI/Map/BingRasterLayer"

class DownloadEli extends Script {
    constructor() {
        super("Downloads a fresh copy of the editor layer index, removes all unnecessary data.")
    }

    async main(args: string[]): Promise<void> {
        const url = "https://osmlab.github.io/editor-layer-index/imagery.geojson"
        // Target should use '.json' instead of '.geojson', as the latter cannot be imported by the build systems
        const target = args[0] ?? "public/assets/data/editor-layer-index.json"
        const targetGlobal = args[1] ?? "src/assets/generated/editor-layer-index-global.json"

        const targetBing = args[0] ?? "src/assets/bing.json"

        const eli: Eli = await Utils.downloadJson(url)
        const keptLayers: EliEntry[] = []
        const keptGlobalLayers: EliEntry[] = []

        const droppedLayerCount: { [reason: string]: number } = {}

        function addDropReason(reason: string): void {
            if (droppedLayerCount[reason] === undefined) {
                droppedLayerCount[reason] = 1
            } else {
                droppedLayerCount[reason] += 1
            }
        }

        console.log("Got", eli.features.length, "ELI-entries")
        for (let layer of eli.features) {
            const props = layer.properties

            if (props.type === "bing") {
                // A lot of work to implement - see https://github.com/pietervdvn/MapComplete/issues/648
                try {
                    const bing = await BingRasterLayer.get()
                    if (bing === "error") {
                        addDropReason("bingError")
                        continue
                    }
                    delete props.default
                    props.category = "photo"
                    props.url = bing.properties.url.replace("%7Bquadkey%7D", "{quadkey}")
                } catch (e) {
                    console.error("Could not fetch URL for bing", e)
                    addDropReason("bingUrlError")
                    continue
                }
            }

            if (props.id === "MAPNIK") {
                // Already added by default
                addDropReason("default")
                continue
            }

            // if (props.overlay) {
            //     addDropReason("overlay")
            //     continue
            // }

            if (props.id === "Mapbox") {
                /**
                 * This token is managed by Martin Reifer on the 'OpenStreetMap'-account on MapBox
                 */
                const token =
                    "pk.eyJ1Ijoib3BlbnN0cmVldG1hcCIsImEiOiJjbGZkempiNDkyandvM3lwY3M4MndpdWdzIn0.QnvRv52n3qffVEKmQa9vJA"
                props.url = props.url.replace("{apikey}", token)
            }

            if (props.url.toLowerCase().indexOf("apikey") > 0) {
                addDropReason("needsApiKey")
                continue
            }

            if (props.permission_osm === "no") {
                addDropReason("noOsmPermission")
                continue
            }

            if (props.max_zoom && props.max_zoom < 19) {
                // We want users to zoom to level 19 when adding a point
                // If they are on a layer which hasn't enough precision, they can not zoom far enough. This is confusing, so we don't use this layer
                addDropReason("tooLowZoom")
                continue
            }

            if (props.name === undefined) {
                console.warn("Editor layer index: name not defined on ", props)
                addDropReason("nameMissing")
                continue
            }

            if (props.url.startsWith("http://")) {
                // Mixed content will not work properly, so we don't use this layer
                addDropReason("unsecureContent")
                continue
            }

            // Override the layer, so it contains only the properties we need
            layer.properties = {
                name: props.name,
                id: props.id,
                url: props.url,
                attribution: props.attribution,
                type: props.type,
                category: props.category,
                min_zoom: props.min_zoom,
                max_zoom: props.max_zoom,
                best: props.best ? true : undefined,
                default: props.default ? true : undefined,
                "tile-size": props["tile-size"],
                //@ts-ignore - For compatibility with MC, we rename 'overlay' to 'isOverlay'
                isOverlay: props.overlay ? true : undefined,
            }

            layer = { properties: layer.properties, type: layer.type, geometry: layer.geometry }
            if (layer.geometry === null) {
                keptGlobalLayers.push(layer)
            } else {
                keptLayers.push(layer)
            }
        }

        const contents =
            '{"type":"FeatureCollection",\n  "features": [\n' +
            keptLayers.map((l) => JSON.stringify(l)).join(",\n") +
            "\n]}"

        const contentsGlobal = keptGlobalLayers
            .filter((l) => l.properties.id !== "Bing")
            .map((l) => l.properties)

        const bing = keptGlobalLayers.find((l) => l.properties.id === "Bing")
        if (bing) {
            fs.writeFileSync(targetBing, JSON.stringify(bing), { encoding: "utf8" })
            console.log("Written", targetBing)
        } else {
            console.log("No bing entry found")
        }
        fs.writeFileSync(target, contents, { encoding: "utf8" })
        console.log("Written", keptLayers.length + ", entries to the ELI")
        fs.writeFileSync(targetGlobal, JSON.stringify(contentsGlobal, null, "  "), {
            encoding: "utf8",
        })
        console.log("Written", keptGlobalLayers.length + ", entries to the global ELI")
    }
}

new DownloadEli().run()
