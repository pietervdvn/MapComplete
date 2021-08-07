import {UIEventSource} from "./Logic/UIEventSource";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import State from "./State";
import LocationInput from "./UI/Input/LocationInput";
import Loc from "./Models/Loc";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
import LayoutConfig from "./Models/ThemeConfig/LayoutConfig";

const layout = new UIEventSource<LayoutConfig>(AllKnownLayouts.allKnownLayouts.get("cycle_infra"))
State.state = new State(layout.data)

const features = new UIEventSource<{ feature: any }[]>([
    {
        feature: {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        3.219616413116455,
                        51.215315026941276
                    ],
                    [
                        3.221080899238586,
                        51.21564432998662
                    ]
                ]
            }
        }
    },
    {
        feature: {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        3.220340609550476,
                        51.21547967875836
                    ],
                    [
                        3.2198095321655273,
                        51.216390293480515
                    ]
                ]
            }
        }
    }
])

features.data.map(f => State.state.allElements.addOrGetElement(f.feature))
const loc = new UIEventSource<Loc>({
    zoom: 19,
    lat: 51.21547967875836,
    lon: 3.220340609550476
})
const li = new LocationInput(
    {
        mapBackground: AvailableBaseLayers.SelectBestLayerAccordingTo(loc, new UIEventSource<string | string[]>("map")),
        snapTo: features,
        snappedPointTags: {
            "barrier": "cycle_barrier"
        },
        maxSnapDistance: 15,
        requiresSnapping: false,
        centerLocation: loc
    }
)
li.SetStyle("height: 30rem").AttachTo("maindiv")
new VariableUiElement(li.GetValue().map(JSON.stringify)).AttachTo("extradiv")
