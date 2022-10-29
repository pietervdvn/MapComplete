import {Store, UIEventSource} from "../../Logic/UIEventSource";
import Loc from "../../Models/Loc";
import Minimap from "../Base/Minimap";
import ShowDataMultiLayer from "../ShowDataLayer/ShowDataMultiLayer";
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource";
import {SpecialVisualization} from "../SpecialVisualization";

export class MinimapViz implements SpecialVisualization {
    funcName = "minimap"
    docs = "A small map showing the selected feature."
    args = [
        {
            doc: "The (maximum) zoomlevel: the target zoomlevel after fitting the entire feature. The minimap will fit the entire feature, then zoom out to this zoom level. The higher, the more zoomed in with 1 being the entire world and 19 being really close",
            name: "zoomlevel",
            defaultValue: "18",
        },
        {
            doc: "(Matches all resting arguments) This argument should be the key of a property of the feature. The corresponding value is interpreted as either the id or the a list of ID's. The features with these ID's will be shown on this minimap. (Note: if the key is 'id', list interpration is disabled)",
            name: "idKey",
            defaultValue: "id",
        },
    ]
    example:
        "`{minimap()}`, `{minimap(17, id, _list_of_embedded_feature_ids_calculated_by_calculated_tag):height:10rem; border: 2px solid black}`"

    constr(state, tagSource, args, _) {
        if (state === undefined) {
            return undefined
        }
        const keys = [...args]
        keys.splice(0, 1)
        const featureStore = state.allElements.ContainingFeatures
        const featuresToShow: Store<{ freshness: Date; feature: any }[]> =
            tagSource.map((properties) => {
                const features: { freshness: Date; feature: any }[] = []
                for (const key of keys) {
                    const value = properties[key]
                    if (value === undefined || value === null) {
                        continue
                    }

                    let idList = [value]
                    if (key !== "id" && value.startsWith("[")) {
                        // This is a list of values
                        idList = JSON.parse(value)
                    }

                    for (const id of idList) {
                        const feature = featureStore.get(id)
                        if (feature === undefined) {
                            console.warn("No feature found for id ", id)
                            continue
                        }
                        features.push({
                            freshness: new Date(),
                            feature,
                        })
                    }
                }
                return features
            })
        const properties = tagSource.data
        let zoom = 18
        if (args[0]) {
            const parsed = Number(args[0])
            if (!isNaN(parsed) && parsed > 0 && parsed < 25) {
                zoom = parsed
            }
        }
        const locationSource = new UIEventSource<Loc>({
            lat: Number(properties._lat),
            lon: Number(properties._lon),
            zoom: zoom,
        })
        const minimap = Minimap.createMiniMap({
            background: state.backgroundLayer,
            location: locationSource,
            allowMoving: false,
        })

        locationSource.addCallback((loc) => {
            if (loc.zoom > zoom) {
                // We zoom back
                locationSource.data.zoom = zoom
                locationSource.ping()
            }
        })

        new ShowDataMultiLayer({
            leafletMap: minimap["leafletMap"],
            zoomToFeatures: true,
            layers: state.filteredLayers,
            features: new StaticFeatureSource(featuresToShow),
        })

        minimap.SetStyle("overflow: hidden; pointer-events: none;")
        return minimap
    }
}
