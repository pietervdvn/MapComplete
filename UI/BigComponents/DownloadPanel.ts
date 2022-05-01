import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import State from "../../State";
import {Utils} from "../../Utils";
import Combine from "../Base/Combine";
import CheckBoxes from "../Input/Checkboxes";
import {GeoOperations} from "../../Logic/GeoOperations";
import Toggle from "../Input/Toggle";
import Title from "../Base/Title";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import {UIEventSource} from "../../Logic/UIEventSource";
import SimpleMetaTagger from "../../Logic/SimpleMetaTagger";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {BBox} from "../../Logic/BBox";
import FilteredLayer, {FilterState} from "../../Models/FilteredLayer";
import geojson2svg from "geojson2svg"
import Constants from "../../Models/Constants";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";

export class DownloadPanel extends Toggle {

    constructor(state: {
        filteredLayers: UIEventSource<FilteredLayer[]>
        featurePipeline: FeaturePipeline,
        layoutToUse: LayoutConfig,
        currentBounds: UIEventSource<BBox>,

    }) {

        const t = Translations.t.general.download
        const name = State.state.layoutToUse.id;

        const includeMetaToggle = new CheckBoxes([t.includeMetaData])
        const metaisIncluded = includeMetaToggle.GetValue().map(selected => selected.length > 0)


        const buttonGeoJson = new SubtleButton(Svg.floppy_ui(),
            new Combine([t.downloadGeojson.SetClass("font-bold"),
                t.downloadGeoJsonHelper]).SetClass("flex flex-col"))
            .OnClickWithLoading(t.exporting, async () => {
                const geojson = DownloadPanel.getCleanGeoJson(state, metaisIncluded.data)
                Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson, null, "  "),
                    `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.geojson`, {
                        mimetype: "application/vnd.geo+json"
                    });
            })


        const buttonCSV = new SubtleButton(Svg.floppy_ui(), new Combine(
            [t.downloadCSV.SetClass("font-bold"),
                t.downloadCSVHelper]).SetClass("flex flex-col"))
            .OnClickWithLoading(t.exporting, async () => {
                const geojson = DownloadPanel.getCleanGeoJson(state, metaisIncluded.data)
                const csv = GeoOperations.toCSV(geojson.features)

                Utils.offerContentsAsDownloadableFile(csv,
                    `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.csv`, {
                        mimetype: "text/csv"
                    });
            })

        const buttonSvg = new SubtleButton(Svg.floppy_ui(), new Combine(
            [t.downloadAsSvg.SetClass("font-bold"),
                t.downloadAsSvgHelper]).SetClass("flex flex-col"))
            .OnClickWithLoading(t.exporting, async () => {
                const geojson = DownloadPanel.getCleanGeoJsonPerLayer(state, metaisIncluded.data)
                const leafletdiv = document.getElementById("leafletDiv")
                const csv = DownloadPanel.asSvg(geojson, 
                    {
                        layers: state.filteredLayers.data.map(l => l.layerDef),
                    mapExtent: state.currentBounds.data,
                    width: leafletdiv.offsetWidth,
                    height: leafletdiv.offsetHeight
                })

                Utils.offerContentsAsDownloadableFile(csv,
                    `MapComplete_${name}_export_${new Date().toISOString().substr(0, 19)}.svg`, {
                        mimetype: "image/svg+xml"
                    });
            })

        const downloadButtons = new Combine(
            [new Title(t.title),
                buttonGeoJson,
                buttonCSV,
                buttonSvg,
                includeMetaToggle,
                t.licenseInfo.SetClass("link-underline")])
            .SetClass("w-full flex flex-col border-4 border-gray-300 rounded-3xl p-4")

        super(
            downloadButtons,
            t.noDataLoaded,
            state.featurePipeline.somethingLoaded)
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
    public static asSvg(perLayer: Map<string, any[]>,
                        options?:
                            {
                                layers?: LayerConfig[],
                                width?: 1000 | number,
                                height?: 1000 | number,
                                mapExtent?: BBox
                                unit?: "px" | "mm" | string
                            }) {
        options = options ?? {}
        const w = options.width ?? 1000
        const h = options.height ?? 1000
        const unit = options.unit ?? "px"
        const mapExtent = {left: -180, bottom: -90, right: 180, top: 90}
        if (options.mapExtent !== undefined) {
            const bbox = options.mapExtent
            mapExtent.left = bbox.minLon
            mapExtent.right = bbox.maxLon
            mapExtent.bottom = bbox.minLat
            mapExtent.top = bbox.maxLat
        }

        const elements: string [] = []

        for (const layer of Array.from(perLayer.keys())) {
            const features = perLayer.get(layer)
            if(features.length === 0){
                continue
            }

            const layerDef = options?.layers?.find(l => l.id === layer)
            const rendering = layerDef?.lineRendering[0]

                const converter = geojson2svg({
                viewportSize: {width: w, height: h},
                mapExtent,
                output: 'svg',
                attributes:[
                    {
                        property: "style",
                        type:'static',
                        value: "fill:none;stroke-width:1"
                    },
                    {
                        property: 'properties.stroke',
                        type:'dynamic',
                        key: 'stroke'
                    }
                ]

            });

            for (const feature of features) {
                const stroke = rendering?.color?.GetRenderValue(feature.properties)?.txt ?? "#ff0000"
                const color = Utils.colorAsHex( Utils.color(stroke))
                feature.properties.stroke = color
            }
            
            
            const groupPaths: string[] = converter.convert({type: "FeatureCollection", features})
            const group = `    <g id="${layer}" inkscape:groupmode="layer" inkscape:label="${layer}">\n` +
                groupPaths.map(p => "        " + p).join("\n")
                + "\n    </g>"
            elements.push(group)
        }


        const header = `<svg width="${w}${unit}" height="${h}${unit}" viewBox="0 0 ${w} ${h}">`
        return header + "\n" + elements.join("\n") + "\n</svg>"
    }

    /**
     * Gets all geojson as geojson feature
     * @param state
     * @param includeMetaData
     * @private
     */
    private static getCleanGeoJson(state: {
        featurePipeline: FeaturePipeline,
        currentBounds: UIEventSource<BBox>,
        filteredLayers: UIEventSource<FilteredLayer[]>
    }, includeMetaData: boolean) {
        const perLayer = DownloadPanel.getCleanGeoJsonPerLayer(state, includeMetaData)
        const features = [].concat(...Array.from(perLayer.values()))
        return {
            type: "FeatureCollection",
            features
        }
    }

    private static getCleanGeoJsonPerLayer(state: {
        featurePipeline: FeaturePipeline,
        currentBounds: UIEventSource<BBox>,
        filteredLayers: UIEventSource<FilteredLayer[]>
    }, includeMetaData: boolean): Map<string, any[]> /*{layerId --> geojsonFeatures[]}*/ {

        const perLayer = new Map<string, any[]>();
        const neededLayers = state.filteredLayers.data.map(l => l.layerDef.id)
        const bbox = state.currentBounds.data
        const featureList = state.featurePipeline.GetAllFeaturesAndMetaWithin(bbox, new Set(neededLayers));
        outer : for (const tile of featureList) {
            
            if(Constants.priviliged_layers.indexOf(tile.layer) >= 0){
                continue
            }
            
            const layer = state.filteredLayers.data.find(fl => fl.layerDef.id === tile.layer)
            if (!perLayer.has(tile.layer)) {
                perLayer.set(tile.layer, [])
            }
            const featureList = perLayer.get(tile.layer)
            const filters = layer.appliedFilters.data
            for (const feature of tile.features) {

                if (!bbox.overlapsWith(BBox.get(feature))) {
                    continue
                }


                if (filters !== undefined) {
                    for (let key of Array.from(filters.keys())) {
                        const filter: FilterState = filters.get(key)
                        if (filter?.currentFilter === undefined) {
                            continue
                        }
                        if (!filter.currentFilter.matchesProperties(feature.properties)) {
                            continue outer;
                        }
                    }
                }

                const cleaned = {
                    type: feature.type,
                    geometry: {...feature.geometry},
                    properties: {...feature.properties}
                }

                if (!includeMetaData) {
                    for (const key in cleaned.properties) {
                        if (key === "_lon" || key === "_lat") {
                            continue;
                        }
                        if (key.startsWith("_")) {
                            delete feature.properties[key]
                        }
                    }
                }

                const datedKeys = [].concat(SimpleMetaTagger.metatags.filter(tagging => tagging.includesDates).map(tagging => tagging.keys))
                for (const key of datedKeys) {
                    delete feature.properties[key]
                }

                featureList.push(feature)
            }
        }

        return perLayer

    }
}