import SplitRoadWizard from "./UI/Popup/SplitRoadWizard";
import State from "./State";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import MinimapImplementation from "./UI/Base/MinimapImplementation";
import {UIEventSource} from "./Logic/UIEventSource";
import FilteredLayer from "./Models/FilteredLayer";
import {And} from "./Logic/Tags/And";

const layout = AllKnownLayouts.allKnownLayouts.get("cyclestreets")
State.state = new State(layout)
MinimapImplementation.initialize()
const feature = {
    "type": "Feature",
    "properties": {
        id: "way/1234",
        "highway":"residential",
        "cyclestreet":"yes"
    },
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [
                3.2207107543945312,
                51.21978729870313
            ],
            [
                3.2198524475097656,
                51.21899435057332
            ],
            [
                3.2155394554138184,
                51.21617188199714
            ]
        ]
    }
}

State.state.allElements.addOrGetElement(feature)
State.state.filteredLayers = new UIEventSource<FilteredLayer[]>(
    layout.layers.map( l => ({
        layerDef :l,
        appliedFilters: new UIEventSource<And>(undefined),
        isDisplayed: new UIEventSource<boolean>(undefined)
    }))
)

const splitroad = new SplitRoadWizard("way/1234")
    splitroad.AttachTo("maindiv")

splitroad.dialogIsOpened.setData(true)
