import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import TagRenderingQuestion from "./UI/Popup/TagRenderingQuestion";
import {UIEventSource} from "./Logic/UIEventSource";
import {VariableUiElement} from "./UI/Base/VariableUIElement";

const theme = AllKnownLayouts.allKnownLayouts.get("charging_stations")

const tagRendering = theme.layers[0].tagRenderings.filter(tr => tr.id === "Available_charging_stations (generated)")[0]
const tag = new UIEventSource({
    id: "node/42",
    amenity:"charging_station",
    bicycle:"yes",
    car:"no",
    "motorcar":"no",
    "hgv":"no",
    bus:"no"
})
window.tags = tag

//const q =
new VariableUiElement(tag.map(_ => new  TagRenderingQuestion(tag, tagRendering) ))
   .SetStyle("width: 100px")
    .AttachTo("maindiv")


window.setTimeout(_ => {
    tag.data.bicycle="no"
    tag.data.car = "yes"
    tag.ping()
    console.log("Pinged")
}, 2500)