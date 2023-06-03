import {SpecialVisualizationState} from "../SpecialVisualization";
import {Feature, FeatureCollection} from "geojson";
import {BBox} from "../../Logic/BBox";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {Utils} from "../../Utils";
import SimpleMetaTagger from "../../Logic/SimpleMetaTagger"
import geojson2svg from "geojson2svg"

/**
 * Exposes the download-functionality
 */
export default class DownloadHelper {
    private readonly _state: SpecialVisualizationState;

    constructor(state: SpecialVisualizationState) {
        this._state = state;

    }

    /**
     * Returns a new feature of which all the metatags are deleted
     */
    private static cleanFeature(f: Feature): Feature {
        f = {
            type: f.type,
            geometry: { ...f.geometry },
            properties: { ...f.properties },
        }

        for (const key in f.properties) {
            if (key === "_lon" || key === "_lat") {
                continue
            }
            if (key.startsWith("_")) {
                delete f.properties[key]
            }
        }
        const datedKeys = [].concat(
            SimpleMetaTagger.metatags
                .filter((tagging) => tagging.includesDates)
                .map((tagging) => tagging.keys)
        )
        for (const key of datedKeys) {
            delete f.properties[key]
        }
        return f
    }

    public getCleanGeoJson(
        includeMetaData: boolean
    ): FeatureCollection {
        const state = this._state
        const featuresPerLayer = this.getCleanGeoJsonPerLayer(includeMetaData)
        const features = [].concat(...Array.from(featuresPerLayer.values()))
        return {
            type: "FeatureCollection",
            features,
        }
    }

    /**
     * Converts a geojson to an SVG
     *
     * const feature = {
     *       "type": "Feature",
     *       "properties": {},
     *       "geometry": {
     *         "type": "LineString",
     *         "coordinates": [
     *           [-180, 80],
     *           [180, -80]
     *         ]
     *       }
     * }
     * const perLayer = new Map<string, any[]>([["testlayer", [feature]]])
     * DownloadHelper.asSvg(perLayer).replace(/\n/g, "") // => `<svg width="1000px" height="1000px" viewBox="0 0 1000 1000">    <g id="testlayer" inkscape:groupmode="layer" inkscape:label="testlayer">        <path d="M0,27.77777777777778 1000,472.22222222222223" style="fill:none;stroke-width:1" stroke="#ff0000"/>    </g></svg>`
     */
    public asSvg(
        options?: {
            layers?: LayerConfig[]
            width?: 1000 | number
            height?: 1000 | number
            mapExtent?: BBox
            unit?: "px" | "mm" | string
        }
    ) {
        const perLayer = this._state.perLayer
        options = options ?? {}
        const width = options.width ?? 1000
        const height = options.height ?? 1000
        if (width <= 0 || height <= 0) {
            throw "Invalid width of height, they should be > 0"
        }
        const unit = options.unit ?? "px"
        const mapExtent = { left: -180, bottom: -90, right: 180, top: 90 }
        if (options.mapExtent !== undefined) {
            const bbox = options.mapExtent
            mapExtent.left = bbox.minLon
            mapExtent.right = bbox.maxLon
            mapExtent.bottom = bbox.minLat
            mapExtent.top = bbox.maxLat
        }
        console.log("Generateing svg, extent:", { mapExtent, width, height })
        const elements: string[] = []

        for (const layer of Array.from(perLayer.keys())) {
            const features = perLayer.get(layer).features.data
            if (features.length === 0) {
                continue
            }

            const layerDef = options?.layers?.find((l) => l.id === layer)
            const rendering = layerDef?.lineRendering[0]

            const converter = geojson2svg({
                viewportSize: { width, height },
                mapExtent,
                output: "svg",
                attributes: [
                    {
                        property: "style",
                        type: "static",
                        value: "fill:none;stroke-width:1",
                    },
                    {
                        property: "properties.stroke",
                        type: "dynamic",
                        key: "stroke",
                    },
                ],
            })

            for (const feature of features) {
                const stroke =
                    rendering?.color?.GetRenderValue(feature.properties)?.txt ?? "#ff0000"
                const color = Utils.colorAsHex(Utils.color(stroke))
                feature.properties.stroke = color
            }

            const groupPaths: string[] = converter.convert({ type: "FeatureCollection", features })
            const group =
                `    <g id="${layer}" inkscape:groupmode="layer" inkscape:label="${layer}">\n` +
                groupPaths.map((p) => "        " + p).join("\n") +
                "\n    </g>"
            elements.push(group)
        }

        const w = width
        const h = height
        const header = `<svg width="${w}${unit}" height="${h}${unit}" viewBox="0 0 ${w} ${h}">`
        return header + "\n" + elements.join("\n") + "\n</svg>"
    }



    public getCleanGeoJsonPerLayer(
        includeMetaData: boolean
    ): Map<string, Feature[]> {
        const state = this._state
        const featuresPerLayer = new Map<string, any[]>()
        const neededLayers = state.layout.layers.filter((l) => l.source !== null).map((l) => l.id)
        const bbox = state.mapProperties.bounds.data

        for (const neededLayer of neededLayers) {
            const indexedFeatureSource = state.perLayer.get(neededLayer)
            let features = indexedFeatureSource.GetFeaturesWithin(bbox)
            // The 'indexedFeatureSources' contains _all_ features, they are not filtered yet
            const filter = state.layerState.filteredLayers.get(neededLayer)
            features = features.filter((f) =>
                filter.isShown(f.properties, state.layerState.globalFilters.data)
            )
            if (!includeMetaData) {
                features = features.map((f) => DownloadHelper.cleanFeature(f))
            }
            featuresPerLayer.set(neededLayer, features)
        }

        return featuresPerLayer
    }

}
