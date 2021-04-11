import {UIEventSource} from "./Logic/UIEventSource";
import {GenerateEmpty} from "./UI/CustomGenerator/GenerateEmpty";
import {LayoutConfigJson} from "./Customizations/JSON/LayoutConfigJson";
import {OsmConnection} from "./Logic/Osm/OsmConnection";
import CustomGeneratorPanel from "./UI/CustomGenerator/CustomGeneratorPanel";
import {LocalStorageSource} from "./Logic/Web/LocalStorageSource";

let layout = GenerateEmpty.createEmptyLayout();
if (window.location.hash.length > 10) {
    try{
        layout = JSON.parse(atob(window.location.hash.substr(1))) as LayoutConfigJson;
    }catch(e){
        console.log("Initial load of theme failed, attempt nr 2 with decompression", e)
        layout = JSON.parse(atob(window.location.hash.substr(1))) as LayoutConfigJson;
    }
    
} else {
    const hash = LocalStorageSource.Get("last-custom-theme").data
    if (hash !== undefined) {
        console.log("Using theme from local storage")
        layout = JSON.parse(atob(hash)) as LayoutConfigJson;
    }
}

const connection = new OsmConnection(false, new UIEventSource<string>(undefined), "customGenerator", false);

new CustomGeneratorPanel(connection, layout)
    .AttachTo("maindiv");

