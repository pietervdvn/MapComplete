import { RasterLayerPolygon } from "../../Models/RasterLayers"
import { Polygon } from "geojson"
import { RasterLayerProperties } from "../../Models/RasterLayerProperties"
import { BBox } from "../../Logic/BBox"
import { Utils } from "../../Utils"

export class BingRasterLayerProperties implements Partial<RasterLayerProperties> {
    private static singleton: BingRasterLayerProperties | "error"
    name = "Bing Maps Aerial"
    id = "Bing"
    type = "bing"
    category = "photo"
    min_zoom = 1
    max_zoom = 22
    best = false
    attribution = {
        url: "https://www.bing.com/maps",
    }
    url: string

    private constructor(url: string) {
        this.url = url
    }

    public static async get(): Promise<BingRasterLayerProperties | "error"> {
        if (BingRasterLayerProperties.singleton === undefined) {
            try {
                const url = await this.getEndpoint()
                BingRasterLayerProperties.singleton = new BingRasterLayerProperties(url)
            } catch (e) {
                BingRasterLayerProperties.singleton = "error"
                console.error(e)
            }
        }
        return BingRasterLayerProperties.singleton
    }

    private static async getEndpoint() {
        console.log("Getting bing endpoint")
        // Key by 'pietervdvn@outlook.com' from https://www.bingmapsportal.com/Application
        // Inspired by https://github.com/zlant/parking-lanes/pull/159
        const key = "An0vKZ4r_PZx820sn3seuPKjd1Vyc5WE3s1b-qN4HCgI-Nr6QR83aLOQ-3fbFl08"
        const url = `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/AerialOSM?include=ImageryProviders&uriScheme=https&key=${key}`

        // Get the image tiles template:
        const metadata = await Utils.downloadJson(url)
        // FYI:
        // "imageHeight": 256, "imageWidth": 256,
        // "imageUrlSubdomains": ["t0","t1","t2","t3"],
        // "zoomMax": 21,
        const imageryResource = metadata.resourceSets[0].resources[0]
        const template = new URL(imageryResource.imageUrl)
        // Add tile image strictness param (n=)
        // • n=f -> (Fail) returns a 404
        // • n=z -> (Empty) returns a 200 with 0 bytes (no content)
        // • n=t -> (Transparent) returns a 200 with a transparent (png) tile
        if (!template.searchParams.has("n")) template.searchParams.append("n", "f")

        // FYI: `template` looks like this but partly encoded
        // https://ecn.{subdomain}.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=14107&pr=odbl&n=z
        const subdomains = ["t0", "t1", "t2", "t3"]
        const index = Math.floor(Math.random() * subdomains.length)
        return template.toString().replace("{subdomain}", subdomains[index])
    }
}

export class BingRasterLayer implements RasterLayerPolygon {
    private static singleton: RasterLayerPolygon | "error"
    readonly type: "Feature" = "Feature"
    readonly geometry: Polygon = BBox.global.asGeometry()
    readonly id = "bing"
    readonly properties: RasterLayerProperties

    constructor(properties: RasterLayerProperties) {
        this.properties = properties
    }

    public static async get(): Promise<RasterLayerPolygon | "error"> {
        if (BingRasterLayer.singleton === undefined) {
            const properties = await BingRasterLayerProperties.get()
            if (properties === "error") {
                BingRasterLayer.singleton = "error"
            } else {
                BingRasterLayer.singleton = new BingRasterLayer(properties)
            }
        }
        return BingRasterLayer.singleton
    }
}
