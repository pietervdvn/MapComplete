import {Utils} from "./Utils";
import AllThemesGui from "./UI/AllThemesGui";
import {QueryParameters} from "./Logic/Web/QueryParameters";
import StatisticsGUI from "./UI/StatisticsGUI";
import {FixedUiElement} from "./UI/Base/FixedUiElement";


const layout = QueryParameters.GetQueryParameter("layout", undefined).data ?? ""
const customLayout = QueryParameters.GetQueryParameter("userlayout", undefined).data ?? ""
const l = window.location;
if (layout !== "") {
    if (window.location.host.startsWith("127.0.0.1")) {
        window.location.replace(l.protocol + "//" + window.location.host + "/theme.html" + l.search + "&layout=" + layout + l.hash);
    } else {
        window.location.replace(l.protocol + "//" + window.location.host + "/" + layout + ".html" + l.search + l.hash);
    }
} else if (customLayout !== "") {
    window.location.replace(l.protocol + "//" + window.location.host + "/theme.html" + l.search + l.hash);
}


Utils.DisableLongPresses()
document.getElementById("decoration-desktop").remove();
const mode = QueryParameters.GetQueryParameter("mode", "map", "The mode the application starts in, e.g. 'statistics'")

if (mode.data === "statistics") {
    console.log("Statistics mode!")
    new FixedUiElement("").AttachTo("centermessage")
    new StatisticsGUI().SetClass("w-full h-full").AttachTo("topleft-tools")
} else{
    new AllThemesGui().setup();
}
