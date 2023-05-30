import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import Translations from "../i18n/Translations"
import { Utils } from "../../Utils"
import Combine from "../Base/Combine"
import CheckBoxes from "../Input/Checkboxes"
import { GeoOperations } from "../../Logic/GeoOperations"
import Toggle from "../Input/Toggle"
import Title from "../Base/Title"
import { Store } from "../../Logic/UIEventSource"
import SimpleMetaTagger from "../../Logic/SimpleMetaTagger"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { BBox } from "../../Logic/BBox"
import geojson2svg from "geojson2svg"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { SpecialVisualizationState } from "../SpecialVisualization"
import { Feature, FeatureCollection } from "geojson"
import { GeoIndexedStoreForLayer } from "../../Logic/FeatureSource/Actors/GeoIndexedStore"
import LayerState from "../../Logic/State/LayerState"
import { PriviligedLayerType } from "../../Models/Constants"

export class DownloadPanel extends Toggle {
    constructor(state: SpecialVisualizationState) {
        const t = Translations.t.general.download
        const name = state.layout.id

        const includeMetaToggle = new CheckBoxes([t.includeMetaData])
        const metaisIncluded = includeMetaToggle.GetValue().map((selected) => selected.length > 0)

        const buttonGeoJson = new SubtleButton(
            Svg.floppy_svg(),
            new Combine([
                t.downloadGeojson.SetClass("font-bold"),
                t.downloadGeoJsonHelper,
            ]).SetClass("flex flex-col")
        ).OnClickWithLoading(t.exporting, async () => {
            const geojson = DownloadPanel.getCleanGeoJson(state, metaisIncluded.data)
            Utils.offerContentsAsDownloadableFile(
                JSON.stringify(geojson, null, "  "),
                `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.geojson`,
                {
                    mimetype: "application/vnd.geo+json",
                }
            )
        })

        const buttonCSV = new SubtleButton(
            Svg.floppy_svg(),
            new Combine([t.downloadCSV.SetClass("font-bold"), t.downloadCSVHelper]).SetClass(
                "flex flex-col"
            )
        ).OnClickWithLoading(t.exporting, async () => {
            const geojson = DownloadPanel.getCleanGeoJson(state, metaisIncluded.data)
            const csv = GeoOperations.toCSV(geojson.features)

            Utils.offerContentsAsDownloadableFile(
                csv,
                `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.csv`,
                {
                    mimetype: "text/csv",
                }
            )
        })

        const buttonSvg = new SubtleButton(
            Svg.floppy_svg(),
            new Combine([t.downloadAsSvg.SetClass("font-bold"), t.downloadAsSvgHelper]).SetClass(
                "flex flex-col"
            )
        ).OnClickWithLoading(t.exporting, async () => {
            const geojson = DownloadPanel.getCleanGeoJsonPerLayer(state, metaisIncluded.data)
            const maindiv = document.getElementById("maindiv")
            const layers = state.layout.layers.filter((l) => l.source !== null)
            const csv = DownloadPanel.asSvg(geojson, {
                layers,
                mapExtent: state.mapProperties.bounds.data,
                width: maindiv.offsetWidth,
                height: maindiv.offsetHeight,
            })

            Utils.offerContentsAsDownloadableFile(
                csv,
                `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.svg`,
                {
                    mimetype: "image/svg+xml",
                }
            )
        })

        const buttonPng = new SubtleButton(
            Svg.floppy_svg(),
            new Combine([t.downloadAsPng.SetClass("font-bold"), t.downloadAsPngHelper])
        ).OnClickWithLoading(t.exporting, async () => {
            const gpsLayer = state.layerState.filteredLayers.get(
                <PriviligedLayerType>"gps_location"
            )
            const gpsIsDisplayed = gpsLayer.isDisplayed.data
            try {
                gpsLayer.isDisplayed.setData(false)
                const png = await state.mapProperties.exportAsPng()
                Utils.offerContentsAsDownloadableFile(
                    png,
                    `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.png`,
                    {
                        mimetype: "image/png",
                    }
                )
            } catch (e) {
                console.error(e)
            } finally {
                gpsLayer.isDisplayed.setData(gpsIsDisplayed)
            }
        })

        const downloadButtons = new Combine([
            new Title(t.title),
            buttonGeoJson,
            buttonCSV,
            buttonSvg,
            buttonPng,
            includeMetaToggle,
            t.licenseInfo.SetClass("link-underline"),
        ]).SetClass("w-full flex flex-col")

        super(
            downloadButtons,
            t.noDataLoaded,
            state.dataIsLoading.map((x) => !x)
        )
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
     * DownloadPanel.asSvg(perLayer).replace(/\n/g, "") // => `<svg width="1000px" height="1000px" viewBox="0 0 1000 1000">    <g id="testlayer" inkscape:groupmode="layer" inkscape:label="testlayer">        <path d="M0,27.77777777777778 1000,472.22222222222223" style="fill:none;stroke-width:1" stroke="#ff0000"/>    </g></svg>`
     */
    public static asSvg(
        perLayer: Map<string, Feature[]>,
        options?: {
            layers?: LayerConfig[]
            width?: 1000 | number
            height?: 1000 | number
            mapExtent?: BBox
            unit?: "px" | "mm" | string
        }
    ) {
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
            const features = perLayer.get(layer)
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

    private static getCleanGeoJson(
        state: {
            layout: LayoutConfig
            mapProperties: { bounds: Store<BBox> }
            perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
            layerState: LayerState
        },
        includeMetaData: boolean
    ): FeatureCollection {
        const featuresPerLayer = DownloadPanel.getCleanGeoJsonPerLayer(state, includeMetaData)
        const features = [].concat(...Array.from(featuresPerLayer.values()))
        return {
            type: "FeatureCollection",
            features,
        }
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

    private static getCleanGeoJsonPerLayer(
        state: {
            layout: LayoutConfig
            mapProperties: { bounds: Store<BBox> }
            perLayer: ReadonlyMap<string, GeoIndexedStoreForLayer>
            layerState: LayerState
        },
        includeMetaData: boolean
    ): Map<string, Feature[]> {
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
                features = features.map((f) => DownloadPanel.cleanFeature(f))
            }
            featuresPerLayer.set(neededLayer, features)
        }

        return featuresPerLayer
    }
}
