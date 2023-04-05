import { Store } from "../../UIEventSource"
import DynamicTileSource from "./DynamicTileSource"
import { Utils } from "../../../Utils"
import GeoJsonSource from "../Sources/GeoJsonSource"
import { BBox } from "../../BBox"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"

export default class DynamicGeoJsonTileSource extends DynamicTileSource {
    private static whitelistCache = new Map<string, any>()

    constructor(
        layer: LayerConfig,
        mapProperties: {
            zoom: Store<number>
            bounds: Store<BBox>
        },
        options?: {
            isActive?: Store<boolean>
        }
    ) {
        const source = layer.source
        if (source.geojsonZoomLevel === undefined) {
            throw "Invalid layer: geojsonZoomLevel expected"
        }
        if (source.geojsonSource === undefined) {
            throw "Invalid layer: geojsonSource expected"
        }

        let whitelist = undefined
        if (source.geojsonSource.indexOf("{x}_{y}.geojson") > 0) {
            const whitelistUrl = source.geojsonSource
                .replace("{z}", "" + source.geojsonZoomLevel)
                .replace("{x}_{y}.geojson", "overview.json")
                .replace("{layer}", layer.id)

            if (DynamicGeoJsonTileSource.whitelistCache.has(whitelistUrl)) {
                whitelist = DynamicGeoJsonTileSource.whitelistCache.get(whitelistUrl)
            } else {
                Utils.downloadJsonCached(whitelistUrl, 1000 * 60 * 60)
                    .then((json) => {
                        const data = new Map<number, Set<number>>()
                        for (const x in json) {
                            if (x === "zoom") {
                                continue
                            }
                            data.set(Number(x), new Set(json[x]))
                        }
                        console.log(
                            "The whitelist is",
                            data,
                            "based on ",
                            json,
                            "from",
                            whitelistUrl
                        )
                        whitelist = data
                        DynamicGeoJsonTileSource.whitelistCache.set(whitelistUrl, whitelist)
                    })
                    .catch((err) => {
                        console.warn("No whitelist found for ", layer.id, err)
                    })
            }
        }

        const blackList = new Set<string>()
        super(
            source.geojsonZoomLevel,
            (zxy) => {
                if (whitelist !== undefined) {
                    const isWhiteListed = whitelist.get(zxy[1])?.has(zxy[2])
                    if (!isWhiteListed) {
                        console.debug(
                            "Not downloading tile",
                            ...zxy,
                            "as it is not on the whitelist"
                        )
                        return undefined
                    }
                }

                return new GeoJsonSource(layer, {
                    zxy,
                    featureIdBlacklist: blackList,
                    isActive: options?.isActive,
                })
            },
            mapProperties,
            {
                isActive: options?.isActive,
            }
        )
    }
}
