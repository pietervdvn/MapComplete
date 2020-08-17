import {OsmConnection, UserDetails} from "./Logic/Osm/OsmConnection";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {UIEventSource} from "./Logic/UIEventSource";
import {ThemeGenerator} from "./UI/CustomThemeGenerator/ThemeGenerator";
import {Preview} from "./UI/CustomThemeGenerator/Preview";

const connection = new OsmConnection(true, new UIEventSource<string>(undefined), false);
connection.AttemptLogin();


const themeGenerator = new ThemeGenerator(connection, window.location.hash?.substr(1));
themeGenerator.AttachTo("layoutCreator")

new Preview(themeGenerator.url, themeGenerator.themeObject).AttachTo("preview");