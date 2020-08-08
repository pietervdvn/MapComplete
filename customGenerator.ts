import {OsmConnection, UserDetails} from "./Logic/Osm/OsmConnection";
import {UIEventSource} from "./UI/UIEventSource";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {Preview, ThemeGenerator} from "./themeGenerator";

const connection = new OsmConnection(true, new UIEventSource<string>(undefined), false);
connection.AttemptLogin();

new VariableUiElement(connection.userDetails.map<string>((userdetails : UserDetails) => {
    if(userdetails.loggedIn){
        return "Logged in as "+userdetails.name
    }else{
        return "Not logged in"
    }
})).AttachTo("loggedIn").onClick(() => connection.LogOut());

const themeGenerator = new ThemeGenerator(connection, window.location.hash?.substr(1));
themeGenerator.AttachTo("layoutCreator")

new Preview(themeGenerator.url, themeGenerator.themeObject).AttachTo("preview");