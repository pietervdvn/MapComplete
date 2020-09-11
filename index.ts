import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {Layout} from "./Customizations/Layout";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {InitUiElements} from "./InitUiElements";
import {QueryParameters} from "./Logic/Web/QueryParameters";
import {UIEventSource} from "./Logic/UIEventSource";
import * as $ from "jquery";
import {FromJSON} from "./Customizations/JSON/FromJSON";
import {TagRendering} from "./UI/TagRendering";

TagRendering.injectFunction();


// --------------------- Special actions based on the parameters -----------------
// @ts-ignore
if (location.href.startsWith("http://buurtnatuur.be")) {
    // Reload the https version. This is important for the 'locate me' button
    window.location.replace("https://buurtnatuur.be");
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

let defaultLayout = "bookcases"
let hash = window.location.hash;

const path = window.location.pathname.split("/").slice(-1)[0];
if (path !== "index.html" && path !== "") {
    defaultLayout = path.substr(0, path.length - 5);
    console.log("Using layout", defaultLayout);
}

// Run over all questsets. If a part of the URL matches a searched-for part in the layout, it'll take that as the default
for (const k in AllKnownLayouts.allSets) {
    const layout = AllKnownLayouts.allSets[k];
    const possibleParts = (layout.locationContains ?? []);
    for (const locationMatch of possibleParts) {
        if (locationMatch === "") {
            continue
        }
        if (window.location.href.toLowerCase().indexOf(locationMatch.toLowerCase()) >= 0) {
            defaultLayout = layout.name;
        }
    }
}

defaultLayout = QueryParameters.GetQueryParameter("layout", defaultLayout).data;

let layoutToUse: Layout = AllKnownLayouts.allSets[defaultLayout.toLowerCase()] ?? AllKnownLayouts["all"];


const userLayoutParam = QueryParameters.GetQueryParameter("userlayout", "false");
const layoutFromBase64 = decodeURIComponent(userLayoutParam.data);
if (layoutFromBase64.startsWith("wiki:")) {
    console.log("Downloading map theme from the wiki");
    const themeName = layoutFromBase64.substr("wiki:".length);
    new FixedUiElement(`Downloading ${themeName} from the wiki...`)
        .AttachTo("centermessage");
    const  cleanUrl = `https://wiki.openstreetmap.org/wiki/${themeName}`;
    const url = `https://cors-anywhere.herokuapp.com/` + cleanUrl; // VERY SAFE AND HACKER-PROOF!

    $.ajax({
        url: url,
        dataType: 'xml',
        success: function (data) {
            const layoutJson = data.querySelector('[id="bodyContent"]')
                .querySelector('[class="mw-parser-output"]')
                .children[0]
                .firstChild.textContent;
            try {
                console.log("DOWNLOADED:",layoutJson);
                const layout = FromJSON.LayoutFromJSON(JSON.parse(layoutJson));
                InitUiElements.InitAll(layout, layoutFromBase64, testing, layoutFromBase64);
            } catch (e) {
                new FixedUiElement(`<a href="${cleanUrl}">${themeName}</a> is invalid:<br/>${e}`)
                    .SetClass("clickable")
                    .AttachTo("centermessage");
                throw e;
            }
        },
    }).fail(e => {
        new FixedUiElement(`<a href="${cleanUrl}">${themeName}</a> is invalid:<br/>Could not download - wrong URL?`)
            .SetClass("clickable")
            .AttachTo("centermessage");
    });

} else {
    if (layoutFromBase64 !== "false") {
        layoutToUse = InitUiElements.LoadLayoutFromHash(userLayoutParam);
    }
    InitUiElements.InitAll(layoutToUse, layoutFromBase64, testing, defaultLayout);
}
