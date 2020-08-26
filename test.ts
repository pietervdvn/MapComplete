import {OsmConnection} from "./Logic/Osm/OsmConnection";
import {UIEventSource} from "./Logic/UIEventSource";


const conn = new OsmConnection(false, new UIEventSource<string>(""), false); 
conn.AttemptLogin();


const csHandler = conn.changesetHandler;

conn.OnLoggedIn((ud) => {
    
    
});