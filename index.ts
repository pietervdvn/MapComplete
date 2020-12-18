import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {InitUiElements} from "./InitUiElements";
import {QueryParameters} from "./Logic/Web/QueryParameters";
import {UIEventSource} from "./Logic/UIEventSource";
import * as $ from "jquery";
import LayoutConfig from "./Customizations/JSON/LayoutConfig";
import {Utils} from "./Utils";

let defaultLayout = "bookcases"
// --------------------- Special actions based on the parameters -----------------
// @ts-ignore
if (location.href.startsWith("http://buurtnatuur.be")) {
    // Reload the https version. This is important for the 'locate me' button
    window.location.replace("https://buurtnatuur.be");
}


if (location.href.indexOf("buurtnatuur.be") >= 0) {
    // Reload the https version. This is important for the 'locate me' button
    defaultLayout = "buurtnatuur"
}


if (location.href.indexOf("buurtnatuur.be") >= 0) {
    defaultLayout = "buurtnatuur"
}

if(location.href.indexOf("pietervdvn.github.io") >= 0){
    defaultLayout = "bookcases"
}

const customCssQP = QueryParameters.GetQueryParameter("custom-css", "", "If specified, the custom css from the given link will be loaded additionaly");
if(customCssQP.data !== undefined && customCssQP.data !== ""){
    Utils.LoadCustomCss(customCssQP.data);
}


let testing: UIEventSource<string>;
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    testing = QueryParameters.GetQueryParameter("test", "true");
    // Set to true if testing and changes should NOT be saved
    testing.setData(testing.data ?? "true")
    // If you have a testfile somewhere, enable this to spoof overpass
    // This should be hosted independantly, e.g. with `cd assets; webfsd -p 8080` + a CORS plugin to disable cors rules
    //Overpass.testUrl = "http://127.0.0.1:8080/streetwidths.geojson";
} else {
    testing = QueryParameters.GetQueryParameter("test", "false");
}


// ----------------- SELECT THE RIGHT QUESTSET -----------------



const path = window.location.pathname.split("/").slice(-1)[0];
if (path !== "index.html" && path !== "") {
    defaultLayout = path;
    if(path.endsWith(".html")){
        defaultLayout = path.substr(0, path.length - 5);
    }
    console.log("Using layout", defaultLayout);
}
defaultLayout = QueryParameters.GetQueryParameter("layout", defaultLayout,"The layout to load into MapComplete").data;
let layoutToUse: LayoutConfig = AllKnownLayouts.allSets[defaultLayout.toLowerCase()] ?? AllKnownLayouts["all"];


const userLayoutParam = QueryParameters.GetQueryParameter("userlayout", "false");
const layoutFromBase64 = decodeURIComponent(userLayoutParam.data);
if (layoutFromBase64.startsWith("wiki:")) {
    console.log("Downloading map theme from the wiki");
    const themeName = layoutFromBase64.substr("wiki:".length);
    new FixedUiElement(`Downloading ${themeName} from the wiki...`)
        .AttachTo("centermessage");
    const cleanUrl = `https://wiki.openstreetmap.org/wiki/${themeName}`;
    const url = `https://cors-anywhere.herokuapp.com/` + cleanUrl; // VERY SAFE AND HACKER-PROOF!

    $.ajax({
        url: url,
        success: function (data) {
            // Hacky McHackFace has been working here. This probably break in the future
            const startTrigger = "<div class=\"mw-parser-output\">";
            const start = data.indexOf(startTrigger);
            data = data.substr(start, 
                data.indexOf("<div class=\"printfooter\">") - start)
            data = data.substr(0, data.lastIndexOf("</p>"))
            data = data.substr(startTrigger.length + 3);
            
            try {
                const parsed = JSON.parse(data);
                parsed["id"] = layoutFromBase64
                const layout = new LayoutConfig(parsed);
                InitUiElements.InitAll(layout, layoutFromBase64, testing, layoutFromBase64, btoa(data));
            } catch (e) {
                new FixedUiElement(`<a href="${cleanUrl}">${themeName}</a> is invalid:<br/>${e}`)
                    .SetClass("clickable")
                    .AttachTo("centermessage");
                throw e;
            }
        },
    }).fail(() => {
        new FixedUiElement(`<a href="${cleanUrl}">${themeName}</a> is invalid:<br/>Could not download - wrong URL?`)
            .SetClass("clickable")
            .AttachTo("centermessage");
    });

} else if (layoutFromBase64 !== "false") {
    layoutToUse = InitUiElements.LoadLayoutFromHash(userLayoutParam);
    InitUiElements.InitAll(layoutToUse, layoutFromBase64, testing, defaultLayout, location.hash.substr(1));
} else {
    InitUiElements.InitAll(layoutToUse, layoutFromBase64, testing, defaultLayout);
}
window.addEventListener('contextmenu', function (e) { // Not compatible with IE < 9
    e.preventDefault();
}, false);
// console.log(QueryParameters.GenerateQueryParameterDocs())
