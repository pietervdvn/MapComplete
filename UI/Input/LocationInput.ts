import {InputElement} from "./InputElement";
import Loc from "../../Models/Loc";
import {UIEventSource} from "../../Logic/UIEventSource";
import Minimap from "../Base/Minimap";
import BaseLayer from "../../Models/BaseLayer";
import Combine from "../Base/Combine";
import Svg from "../../Svg";
import State from "../../State";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import {GeoOperations} from "../../Logic/GeoOperations";
import ShowDataLayer from "../ShowDataLayer";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";

export default class LocationInput extends InputElement<Loc> {

    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private _centerLocation: UIEventSource<Loc>;
    private readonly mapBackground: UIEventSource<BaseLayer>;
    private readonly _snapTo: UIEventSource<{ feature: any }[]>
    private readonly _value: UIEventSource<Loc>
    private readonly _snappedPoint: UIEventSource<any>
    private readonly _maxSnapDistance: number
    private readonly _snappedPointTags: any;
    public readonly snappedOnto: UIEventSource<any> = new UIEventSource<any>(undefined)

    constructor(options: {
        mapBackground?: UIEventSource<BaseLayer>,
        snapTo?: UIEventSource<{ feature: any }[]>,
        maxSnapDistance?: number,
        snappedPointTags?: any,
        requiresSnapping?: boolean,
        centerLocation: UIEventSource<Loc>,
    }) {
        super();
        this._snapTo = options.snapTo?.map(features => features?.filter(feat => feat.feature.geometry.type !== "Point"))
        this._maxSnapDistance = options.maxSnapDistance
        this._centerLocation = options.centerLocation;
        this._snappedPointTags = options.snappedPointTags
        if (this._snapTo === undefined) {
            this._value = this._centerLocation;
        } else {
            const self = this;

            let matching_layer: UIEventSource<string>

            if (self._snappedPointTags !== undefined) {
                matching_layer = State.state.layoutToUse.map(layout => {

                    for (const layer of layout.layers) {
                        if (layer.source.osmTags.matchesProperties(self._snappedPointTags)) {
                            return layer.id
                        }
                    }
                    console.error("No matching layer found for tags ", self._snappedPointTags)
                    return "matchpoint"
                })
            } else {
                matching_layer = new UIEventSource<string>("matchpoint")
            }

            this._snappedPoint = options.centerLocation.map(loc => {
                if (loc === undefined) {
                    return undefined;
                }

                // We reproject the location onto every 'snap-to-feature' and select the closest

                let min = undefined;
                let matchedWay = undefined;
                for (const feature of self._snapTo.data) {
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

                if (min.properties.dist * 1000 > self._maxSnapDistance) {
                    if (options.requiresSnapping) {
                        return undefined
                    } else {
                        return {
                            "type": "Feature",
                            "_matching_layer_id": matching_layer.data,
                            "properties": options.snappedPointTags ?? min.properties,
                            "geometry": {"type": "Point", "coordinates": [loc.lon, loc.lat]}
                        }
                    }
                }
                min._matching_layer_id = matching_layer?.data ?? "matchpoint"
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
        this.mapBackground = options.mapBackground ?? State.state.backgroundLayer ?? new UIEventSource(AvailableBaseLayers.osmCarto)
        this.SetClass("block h-full")
    }

    GetValue(): UIEventSource<Loc> {
        return this._value;
    }

    IsValid(t: Loc): boolean {
        return t !== undefined;
    }

    protected InnerConstructElement(): HTMLElement {
        try {
            const map = new Minimap(
                {
                    location: this._centerLocation,
                    background: this.mapBackground
                }
            )
            map.leafletMap.addCallbackAndRunD(leaflet => {
                leaflet.setMaxBounds(
                    leaflet.getBounds().pad(0.15)
                )
            })

            if (this._snapTo !== undefined) {
                new ShowDataLayer(this._snapTo, map.leafletMap, State.state.layoutToUse, false, false)

                const matchPoint = this._snappedPoint.map(loc => {
                    if (loc === undefined) {
                        return []
                    }
                    return [{feature: loc}];
                })
                if (this._snapTo) {
                    let layout = LocationInput.matchLayout
                    if (this._snappedPointTags !== undefined) {
                        layout = State.state.layoutToUse
                    }
                    new ShowDataLayer(
                        matchPoint,
                        map.leafletMap,
                        layout,
                        false, false
                    )
                }
            }

            this.mapBackground.map(layer => {
                const leaflet = map.leafletMap.data
                if (leaflet === undefined || layer === undefined) {
                    return;
                }

                leaflet.setMaxZoom(layer.max_zoom)
                leaflet.setMinZoom(layer.max_zoom - 3)
                leaflet.setZoom(layer.max_zoom - 1)

            }, [map.leafletMap])
            return new Combine([
                new Combine([
                    Svg.crosshair_empty_ui()
                        .SetClass("block relative")
                        .SetStyle("left: -1.25rem; top: -1.25rem; width: 2.5rem; height: 2.5rem")
                ]).SetClass("block w-0 h-0 z-10 relative")
                    .SetStyle("background: rgba(255, 128, 128, 0.21); left: 50%; top: 50%"),
                map
                    .SetClass("z-0 relative block w-full h-full bg-gray-100")

            ]).ConstructElement();
        } catch (e) {
            console.error("Could not generate LocationInputElement:", e)
            return undefined;
        }
    }

    private static readonly matchLayout = new UIEventSource(new LayoutConfig({
        description: "Matchpoint style",
        icon: "./assets/svg/crosshair-empty.svg",
        id: "matchpoint",
        language: ["en"],
        layers: [{
            id: "matchpoint", source: {
                osmTags: {and: []}
            },
            icon: "./assets/svg/crosshair-empty.svg"
        }],
        maintainer: "MapComplete",
        startLat: 0,
        startLon: 0,
        startZoom: 0,
        title: "Location input",
        version: "0"

    }));

}