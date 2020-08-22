import {OsmConnection, UserDetails} from "./Logic/Osm/OsmConnection";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {UIEventSource} from "./Logic/UIEventSource";
import {ThemeGenerator} from "./UI/CustomThemeGenerator/ThemeGenerator";
import {Preview} from "./UI/CustomThemeGenerator/Preview";
import {LocalStorageSource} from "./Logic/Web/LocalStorageSource";
import {createHash} from "crypto";
import Combine from "./UI/Base/Combine";
import {Button} from "./UI/Base/Button";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {State} from "./State";

const connection = new OsmConnection(true, new UIEventSource<string>(undefined), false);
connection.AttemptLogin();

let hash = window.location.hash?.substr(1);
const localStorage = LocalStorageSource.Get("last-custom-save");
console.log("hash", hash)
console.log("Saved: ", localStorage.data)

if (hash === undefined || hash === "" && localStorage.data !== undefined) {
    const previous = localStorage.data.split("#");
    hash = previous[1];
    console.log("Using previously saved data ", hash)
}

const themeGenerator = new ThemeGenerator(connection, hash);
themeGenerator.AttachTo("layoutCreator");
themeGenerator.url.syncWith(localStorage);

new Combine([
    new Preview(themeGenerator.url, themeGenerator.themeObject),
    "<h2>Danger zone</h2>",
    new Button("Clear theme", () => {
        themeGenerator.themeObject.data.title = undefined;
        themeGenerator.themeObject.data.description = undefined;
        themeGenerator.themeObject.data.icon = undefined;
        themeGenerator.themeObject.data.language = ["en"];
        themeGenerator.themeObject.data.name = undefined;
        themeGenerator.themeObject.data.startLat = 0;
        themeGenerator.themeObject.data.startLon = 0;
        themeGenerator.themeObject.data.startZoom = 12;
        themeGenerator.themeObject.data.maintainer = connection.userDetails.data.name;
        themeGenerator.themeObject.data.layers = [];
        themeGenerator.themeObject.ping();
    }),
    "<br/>",
    "Version: ",
    State.vNumber

]).AttachTo("preview");
