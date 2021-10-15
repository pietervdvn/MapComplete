import {InputElement} from "./InputElement";
import Loc from "../../Models/Loc";
import {UIEventSource} from "../../Logic/UIEventSource";
import Minimap, {MinimapObj} from "../Base/Minimap";
import BaseLayer from "../../Models/BaseLayer";
import Combine from "../Base/Combine";
import Svg from "../../Svg";
import State from "../../State";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import {GeoOperations} from "../../Logic/GeoOperations";
import ShowDataMultiLayer from "../ShowDataLayer/ShowDataMultiLayer";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {BBox} from "../../Logic/BBox";
import {FixedUiElement} from "../Base/FixedUiElement";
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer";
import BaseUIElement from "../BaseUIElement";
import Toggle from "./Toggle";
import {start} from "repl";

export default class LocationInput extends InputElement<Loc> implements MinimapObj {

    private static readonly matchLayer = new LayerConfig(
        {
            id: "matchpoint", source: {
                osmTags: {and: []}
            },
            icon: "./assets/svg/crosshair-empty.svg"
        }, "matchpoint icon", true
    )
    
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    public readonly snappedOnto: UIEventSource<any> = new UIEventSource<any>(undefined)
    private _centerLocation: UIEventSource<Loc>;
    private readonly mapBackground: UIEventSource<BaseLayer>;
    /**
     * The features to which the input should be snapped
     * @private
     */
    private readonly _snapTo: UIEventSource<{ feature: any }[]>
    private readonly _value: UIEventSource<Loc>
    private readonly _snappedPoint: UIEventSource<any>
    private readonly _maxSnapDistance: number
    private readonly _snappedPointTags: any;
    private readonly _bounds: UIEventSource<BBox>;
    public readonly _matching_layer: LayerConfig;
    private readonly map: BaseUIElement & MinimapObj;
    public readonly leafletMap: UIEventSource<any>

    private readonly clickLocation: UIEventSource<Loc>;
    private readonly _minZoom: number;

    constructor(options: {
        minZoom?: number,
        mapBackground?: UIEventSource<BaseLayer>,
        snapTo?: UIEventSource<{ feature: any }[]>,
        maxSnapDistance?: number,
        snappedPointTags?: any,
        requiresSnapping?: boolean,
        centerLocation: UIEventSource<Loc>,
        bounds?: UIEventSource<BBox>
    }) {
        super();
        this._snapTo = options.snapTo?.map(features => features?.filter(feat => feat.feature.geometry.type !== "Point"))
        this._maxSnapDistance = options.maxSnapDistance
        this._centerLocation = options.centerLocation;
        this._snappedPointTags = options.snappedPointTags
        this._bounds = options.bounds;
        this._minZoom = options.minZoom
        if (this._snapTo === undefined) {
            this._value = this._centerLocation;
        } else {
            const self = this;

            if (self._snappedPointTags !== undefined) {
                const layout = State.state.layoutToUse

                let matchingLayer = LocationInput.matchLayer
                for (const layer of layout.layers) {
                    if (layer.source.osmTags.matchesProperties(self._snappedPointTags)) {
                        matchingLayer = layer
                    }
                }
                this._matching_layer = matchingLayer;
            } else {
               this._matching_layer = LocationInput.matchLayer
            }

            this._snappedPoint = options.centerLocation.map(loc => {
                if (loc === undefined) {
                    return undefined;
                }

                // We reproject the location onto every 'snap-to-feature' and select the closest

                let min = undefined;
                let matchedWay = undefined;
                for (const feature of self._snapTo.data ?? []) {
                    const nearestPointOnLine = GeoOperations.nearestPoint(feature.feature, [loc.lon, loc.lat])
                    if (min === undefined) {
                        min = nearestPointOnLine
                        matchedWay = feature.feature;
                        continue;
                    }

                    if (min.properties.dist > nearestPointOnLine.properties.dist) {
                        min = nearestPointOnLine
                        matchedWay = feature.feature;

                    }
                }

                if (min === undefined || min.properties.dist * 1000 > self._maxSnapDistance) {
                    if (options.requiresSnapping) {
                        return undefined
                    } else {
                        return {
                            "type": "Feature",
                            "properties": options.snappedPointTags ?? min.properties,
                            "geometry": {"type": "Point", "coordinates": [loc.lon, loc.lat]}
                        }
                    }
                }
                min.properties = options.snappedPointTags ?? min.properties
                self.snappedOnto.setData(matchedWay)
                return min
            }, [this._snapTo])

            this._value = this._snappedPoint.map(f => {
                const [lon, lat] = f.geometry.coordinates;
                return {
                    lon: lon, lat: lat, zoom: undefined
                }
            })

        }
        this.mapBackground = options.mapBackground ?? State.state?.backgroundLayer
        this.SetClass("block h-full")


        this.clickLocation = new UIEventSource<Loc>(undefined);
        this.map = Minimap.createMiniMap(
            {
                location: this._centerLocation,
                background: this.mapBackground,
                attribution: this.mapBackground !== State.state?.backgroundLayer,
                lastClickLocation: this.clickLocation,
                bounds: this._bounds
            }
        )
        this.leafletMap = this.map.leafletMap
    }

    GetValue(): UIEventSource<Loc> {
        return this._value;
    }

    IsValid(t: Loc): boolean {
        return t !== undefined;
    }
    
    protected InnerConstructElement(): HTMLElement {
        try {
            const self = this;
            const hasMoved = new UIEventSource(false)
            const startLocation = {                ...this._centerLocation.data            }
            this._centerLocation. addCallbackD(newLocation => {
                const f = 100000
                console.log(newLocation.lon, startLocation.lon)
                const diff = (Math.abs(newLocation.lon * f - startLocation.lon* f ) + Math.abs(newLocation.lat* f  - startLocation.lat* f ))
                if(diff < 1){
                    return;
                }
                hasMoved.setData(true)
                return true;
            })
            this.clickLocation.addCallbackAndRunD(location => this._centerLocation.setData(location))
             if (this._snapTo !== undefined) {
                
                // Show the lines to snap to
                new ShowDataMultiLayer({
                        features: new StaticFeatureSource(this._snapTo, true),
                        enablePopups: false,
                        zoomToFeatures: false,
                        leafletMap: this.map.leafletMap,
                        layers: State.state.filteredLayers,
                    allElements: State.state.allElements
                    }
                )
                // Show the central point
                const matchPoint = this._snappedPoint.map(loc => {
                    if (loc === undefined) {
                        return []
                    }
                    return [{feature: loc}];
                })
                    new ShowDataLayer({
                        features: new StaticFeatureSource(matchPoint, true),
                        enablePopups: false,
                        zoomToFeatures: false,
                        leafletMap: this.map.leafletMap,
                        layerToShow: this._matching_layer,
                        allElements: State.state.allElements,
                        selectedElement: State.state.selectedElement
                    })
                    
            }
            this.mapBackground.map(layer => {
                const leaflet = this.map.leafletMap.data
                if (leaflet === undefined || layer === undefined) {
                    return;
                }

                leaflet.setMaxZoom(layer.max_zoom)
                leaflet.setMinZoom(self._minZoom ?? layer.max_zoom - 2)
                leaflet.setZoom(layer.max_zoom - 1)

            }, [this.map.leafletMap])
            
            const animatedHand = Svg.hand_ui()
                .SetStyle("width: 2rem; height: unset;")
                .SetClass("hand-drag-animation block pointer-events-none")
            
            return new Combine([
                new Combine([
                    Svg.move_arrows_ui()
                        .SetClass("block relative pointer-events-none")
                        .SetStyle("left: -2.5rem; top: -2.5rem; width: 5rem; height: 5rem")
                    ]).SetClass("block w-0 h-0 z-10 relative")
                    .SetStyle("background: rgba(255, 128, 128, 0.21); left: 50%; top: 50%; opacity: 0.5"),
                
                new Toggle(undefined,
                    animatedHand, hasMoved)
                    .SetClass("block w-0 h-0 z-10 relative")
                    .SetStyle("left: calc(50% + 3rem); top: calc(50% + 2rem); opacity: 0.7"),

                this.map
                    .SetClass("z-0 relative block w-full h-full bg-gray-100")

            ]).ConstructElement();
        } catch (e) {
            console.error("Could not generate LocationInputElement:", e)
            return new FixedUiElement("Constructing a locationInput failed due to" + e).SetClass("alert").ConstructElement();
        }
    }

   
    installBounds(factor: number | BBox, showRange?: boolean): void {
        this.map.installBounds(factor, showRange)
    }

}