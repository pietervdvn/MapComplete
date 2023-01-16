import { ReadonlyInputElement } from "./InputElement"
import Loc from "../../Models/Loc"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Minimap, { MinimapObj } from "../Base/Minimap"
import BaseLayer from "../../Models/BaseLayer"
import Combine from "../Base/Combine"
import Svg from "../../Svg"
import { GeoOperations } from "../../Logic/GeoOperations"
import ShowDataMultiLayer from "../ShowDataLayer/ShowDataMultiLayer"
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { BBox } from "../../Logic/BBox"
import { FixedUiElement } from "../Base/FixedUiElement"
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer"
import BaseUIElement from "../BaseUIElement"
import Toggle from "./Toggle"
import * as matchpoint from "../../assets/layers/matchpoint/matchpoint.json"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import FilteredLayer from "../../Models/FilteredLayer"
import { ElementStorage } from "../../Logic/ElementStorage"
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers"
import { RelationId, WayId } from "../../Models/OsmFeature"
import { Feature, LineString, Polygon } from "geojson"
import { OsmObject, OsmWay } from "../../Logic/Osm/OsmObject"

export default class LocationInput
    extends BaseUIElement
    implements ReadonlyInputElement<Loc>, MinimapObj
{
    private static readonly matchLayer = new LayerConfig(
        matchpoint,
        "LocationInput.matchpoint",
        true
    )

    public readonly snappedOnto: UIEventSource<Feature & { properties: { id: WayId } }> =
        new UIEventSource(undefined)
    public readonly _matching_layer: LayerConfig
    public readonly leafletMap: UIEventSource<any>
    public readonly bounds
    public readonly location
    private readonly _centerLocation: UIEventSource<Loc>
    private readonly mapBackground: UIEventSource<BaseLayer>
    /**
     * The features to which the input should be snapped
     * @private
     */
    private readonly _snapTo: Store<
        (Feature<LineString | Polygon> & { properties: { id: WayId } })[]
    >
    /**
     * The features to which the input should be snapped without cleanup of relations and memberships
     * Used for rendering
     * @private
     */
    private readonly _snapToRaw: Store<{ feature: Feature }[]>
    private readonly _value: Store<Loc>
    private readonly _snappedPoint: Store<any>
    private readonly _maxSnapDistance: number
    private readonly _snappedPointTags: any
    private readonly _bounds: UIEventSource<BBox>
    private readonly map: BaseUIElement & MinimapObj
    private readonly clickLocation: UIEventSource<Loc>
    private readonly _minZoom: number
    private readonly _state: {
        readonly filteredLayers: Store<FilteredLayer[]>
        readonly backgroundLayer: UIEventSource<BaseLayer>
        readonly layoutToUse: LayoutConfig
        readonly selectedElement: UIEventSource<any>
        readonly allElements: ElementStorage
    }

    /**
     * Given a list of geojson-features, will prepare these features to be snappable:
     * - points are removed
     * - LineStrings are passed as-is
     * - Multipolygons are decomposed into their member ways by downloading them
     *
     * @private
     */
    private static async prepareSnapOnto(
        features: Feature[]
    ): Promise<(Feature<LineString | Polygon> & { properties: { id: WayId } })[]> {
        const linesAndPolygon: Feature<LineString | Polygon>[] = <any>(
            features.filter((f) => f.geometry.type !== "Point")
        )
        // Clean the features: multipolygons are split into their it's members
        const linestrings: (Feature<LineString | Polygon> & { properties: { id: WayId } })[] = []
        for (const feature of linesAndPolygon) {
            if (feature.properties.id.startsWith("way")) {
                // A normal way - we continue
                linestrings.push(<any>feature)
                continue
            }

            // We have a multipolygon, thus: a relation
            // Download the members
            const relation = await OsmObject.DownloadObjectAsync(
                <RelationId>feature.properties.id,
                60 * 60
            )
            const members: OsmWay[] = await Promise.all(
                relation.members
                    .filter((m) => m.type === "way")
                    .map((m) => OsmObject.DownloadObjectAsync(<WayId>("way/" + m.ref), 60 * 60))
            )
            linestrings.push(...members.map((m) => m.asGeoJson()))
        }
        return linestrings
    }

    constructor(options?: {
        minZoom?: number
        mapBackground?: UIEventSource<BaseLayer>
        snapTo?: UIEventSource<{ feature: Feature }[]>
        renderLayerForSnappedPoint?: LayerConfig
        maxSnapDistance?: number
        snappedPointTags?: any
        requiresSnapping?: boolean
        centerLocation?: UIEventSource<Loc>
        bounds?: UIEventSource<BBox>
        state?: {
            readonly filteredLayers: Store<FilteredLayer[]>
            readonly backgroundLayer: UIEventSource<BaseLayer>
            readonly layoutToUse: LayoutConfig
            readonly selectedElement: UIEventSource<any>
            readonly allElements: ElementStorage
        }
    }) {
        super()
        this._snapToRaw = options?.snapTo?.map((feats) =>
            feats.filter((f) => f.feature.geometry.type !== "Point")
        )
        this._snapTo = options?.snapTo
            ?.bind((features) =>
                UIEventSource.FromPromise(
                    LocationInput.prepareSnapOnto(features.map((f) => f.feature))
                )
            )
            ?.map((f) => f ?? [])
        this._maxSnapDistance = options?.maxSnapDistance
        this._centerLocation =
            options?.centerLocation ??
            new UIEventSource<Loc>({
                lat: 0,
                lon: 0,
                zoom: 0,
            })
        this._snappedPointTags = options?.snappedPointTags
        this._bounds = options?.bounds
        this._minZoom = options?.minZoom
        this._state = options?.state
        const self = this
        if (this._snapTo === undefined) {
            this._value = this._centerLocation
        } else {
            this._matching_layer = options?.renderLayerForSnappedPoint ?? LocationInput.matchLayer

            // Calculate the location of the point based by snapping it onto a way
            // As a side-effect, the actual snapped-onto way (if any) is saved into 'snappedOnto'
            this._snappedPoint = this._centerLocation.map(
                (loc) => {
                    if (loc === undefined) {
                        return undefined
                    }

                    // We reproject the location onto every 'snap-to-feature' and select the closest

                    let min = undefined
                    let matchedWay: Feature<LineString | Polygon> & { properties: { id: WayId } } =
                        undefined
                    for (const feature of self._snapTo.data ?? []) {
                        try {
                            const nearestPointOnLine = GeoOperations.nearestPoint(feature, [
                                loc.lon,
                                loc.lat,
                            ])
                            if (min === undefined) {
                                min = nearestPointOnLine
                                matchedWay = feature
                                continue
                            }

                            if (min.properties.dist > nearestPointOnLine.properties.dist) {
                                min = nearestPointOnLine
                                matchedWay = feature
                            }
                        } catch (e) {
                            console.log(
                                "Snapping to a nearest point failed for ",
                                feature,
                                "due to ",
                                e
                            )
                        }
                    }

                    if (min === undefined || min.properties.dist * 1000 > self._maxSnapDistance) {
                        if (options?.requiresSnapping) {
                            return undefined
                        } else {
                            // No match found - the original coordinates are returned as is
                            return {
                                type: "Feature",
                                properties: options?.snappedPointTags ?? min.properties,
                                geometry: { type: "Point", coordinates: [loc.lon, loc.lat] },
                            }
                        }
                    }
                    min.properties = options?.snappedPointTags ?? min.properties
                    self.snappedOnto.setData(<any>matchedWay)
                    return min
                },
                [this._snapTo]
            )

            this._value = this._snappedPoint.map((f) => {
                const [lon, lat] = f.geometry.coordinates
                return {
                    lon: lon,
                    lat: lat,
                    zoom: undefined,
                }
            })
        }
        this.mapBackground =
            options?.mapBackground ??
            this._state?.backgroundLayer ??
            new UIEventSource<BaseLayer>(AvailableBaseLayers.osmCarto)
        this.SetClass("block h-full")

        this.clickLocation = new UIEventSource<Loc>(undefined)
        this.map = Minimap.createMiniMap({
            location: this._centerLocation,
            background: this.mapBackground,
            attribution: this.mapBackground !== this._state?.backgroundLayer,
            lastClickLocation: this.clickLocation,
            bounds: this._bounds,
            addLayerControl: true,
        })
        this.leafletMap = this.map.leafletMap
        this.location = this.map.location
    }

    GetValue(): Store<Loc> {
        return this._value
    }

    IsValid(t: Loc): boolean {
        return t !== undefined
    }

    installBounds(factor: number | BBox, showRange?: boolean): void {
        this.map.installBounds(factor, showRange)
    }

    protected InnerConstructElement(): HTMLElement {
        try {
            const self = this
            const hasMoved = new UIEventSource(false)
            const startLocation = { ...this._centerLocation.data }
            this._centerLocation.addCallbackD((newLocation) => {
                const f = 100000
                const diff =
                    Math.abs(newLocation.lon * f - startLocation.lon * f) +
                    Math.abs(newLocation.lat * f - startLocation.lat * f)
                if (diff < 1) {
                    return
                }
                hasMoved.setData(true)
                return true
            })
            this.clickLocation.addCallbackAndRunD((location) =>
                this._centerLocation.setData(location)
            )
            if (this._snapToRaw !== undefined) {
                // Show the lines to snap to
                new ShowDataMultiLayer({
                    features: StaticFeatureSource.fromDateless(this._snapToRaw),
                    zoomToFeatures: false,
                    leafletMap: this.map.leafletMap,
                    layers: this._state.filteredLayers,
                })
                // Show the central point
                const matchPoint = this._snappedPoint.map((loc) => {
                    if (loc === undefined) {
                        return []
                    }
                    return [{ feature: loc }]
                })

                // The 'matchlayer' is the layer which shows the target location
                new ShowDataLayer({
                    features: StaticFeatureSource.fromDateless(matchPoint),
                    zoomToFeatures: false,
                    leafletMap: this.map.leafletMap,
                    layerToShow: this._matching_layer,
                    state: this._state,
                    selectedElement: this._state.selectedElement,
                })
            }
            this.mapBackground.map(
                (layer) => {
                    const leaflet = this.map.leafletMap.data
                    if (leaflet === undefined || layer === undefined) {
                        return
                    }

                    leaflet.setMaxZoom(layer.max_zoom)
                    leaflet.setMinZoom(self._minZoom ?? layer.max_zoom - 2)
                    leaflet.setZoom(layer.max_zoom - 1)
                },
                [this.map.leafletMap]
            )

            const animatedHand = Svg.hand_ui()
                .SetStyle("width: 2rem; height: unset;")
                .SetClass("hand-drag-animation block pointer-events-none")

            return new Combine([
                new Combine([
                    Svg.move_arrows_ui()
                        .SetClass("block relative pointer-events-none")
                        .SetStyle("left: -2.5rem; top: -2.5rem; width: 5rem; height: 5rem"),
                ])
                    .SetClass("block w-0 h-0 z-10 relative")
                    .SetStyle(
                        "background: rgba(255, 128, 128, 0.21); left: 50%; top: 50%; opacity: 0.5"
                    ),

                new Toggle(undefined, animatedHand, hasMoved)
                    .SetClass("block w-0 h-0 z-10 relative")
                    .SetStyle("left: calc(50% + 3rem); top: calc(50% + 2rem); opacity: 0.7"),

                this.map.SetClass("z-0 relative block w-full h-full bg-gray-100"),
            ]).ConstructElement()
        } catch (e) {
            console.error("Could not generate LocationInputElement:", e)
            return new FixedUiElement("Constructing a locationInput failed due to" + e)
                .SetClass("alert")
                .ConstructElement()
        }
    }

    TakeScreenshot(format: "image"): Promise<string>
    TakeScreenshot(format: "blob"): Promise<Blob>
    TakeScreenshot(format: "image" | "blob"): Promise<string | Blob>
    TakeScreenshot(format: "image" | "blob"): Promise<string | Blob> {
        return this.map.TakeScreenshot(format)
    }
}
