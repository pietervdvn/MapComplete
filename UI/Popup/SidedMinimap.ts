import { UIEventSource } from "../../Logic/UIEventSource"
import Loc from "../../Models/Loc"
import Minimap from "../Base/Minimap"
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import left_right_style_json from "../../assets/layers/left_right_style/left_right_style.json"
import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"
import { SpecialVisualization } from "../SpecialVisualization"

export class SidedMinimap implements SpecialVisualization {
    funcName = "sided_minimap"
    docs =
        "A small map showing _only one side_ the selected feature. *This features requires to have linerenderings with offset* as only linerenderings with a postive or negative offset will be shown. Note: in most cases, this map will be automatically introduced"
    args = [
        {
            doc: "The side to show, either `left` or `right`",
            name: "side",
            required: true,
        },
    ]
    example = "`{sided_minimap(left)}`"

    public constr(state, tagSource, args) {
        const properties = tagSource.data
        const locationSource = new UIEventSource<Loc>({
            lat: Number(properties._lat),
            lon: Number(properties._lon),
            zoom: 18,
        })
        const minimap = Minimap.createMiniMap({
            background: state.backgroundLayer,
            location: locationSource,
            allowMoving: false,
        })
        const side = args[0]
        const feature = state.allElements.ContainingFeatures.get(tagSource.data.id)
        const copy = { ...feature }
        copy.properties = {
            id: side,
        }
        new ShowDataLayer({
            leafletMap: minimap["leafletMap"],
            zoomToFeatures: true,
            layerToShow: new LayerConfig(left_right_style_json, "all_known_layers", true),
            features: StaticFeatureSource.fromGeojson([copy]),
            state,
        })

        minimap.SetStyle("overflow: hidden; pointer-events: none;")
        return minimap
    }
}
