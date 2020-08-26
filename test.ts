import {OsmConnection} from "./Logic/Osm/OsmConnection";
import {UIEventSource} from "./Logic/UIEventSource";

const conn = new OsmConnection(true, new UIEventSource<string>(undefined));
conn.AttemptLogin();

conn.userDetails.addCallback(userDetails => {
    if (!userDetails.loggedIn) {
        return;
    }
    const str = "01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";
    console.log(str.length);
    conn.GetLongPreference("test").setData(str);
// console.log(got.length)
});
