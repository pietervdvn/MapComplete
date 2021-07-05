import T from "./TestHelper";
import UserDetails, {OsmConnection} from "../Logic/Osm/OsmConnection";
import {UIEventSource} from "../Logic/UIEventSource";
import ScriptUtils from "../scripts/ScriptUtils";


export default class OsmConnectionSpec extends T {

    /*
    This token gives access to the TESTING-instance of OSM. No real harm can be done with it, so it can be commited to the repo
     */
    private static _osm_token = "LJFmv2nUicSNmBNsFeyCHx5KKx6Aiesx8pXPbX4n"

    constructor() {
        super("OsmConnectionSpec-test", [
            ["login on dev",
                () => {
                   const osmConn = new OsmConnection(false,
                        new UIEventSource<string>(undefined),
                        "Unit test",
                        true,
                        "osm-test"
                    )
                    
                    osmConn.userDetails.map((userdetails : UserDetails) => {
                       if(userdetails.loggedIn){
                           console.log("Logged in with the testing account. Writing some random data to test preferences")
                           const data = Math.random().toString()
                           osmConn.GetPreference("test").setData(data)
                           
                           osmConn.GetPreference("https://raw.githubusercontent.com/AgusQui/MapCompleteRailway/main/railway")
                               .setData(data)
                           
                       }
                    });
                    
                    ScriptUtils.sleep(1000)

                }
            ]


        ]);
    }

}