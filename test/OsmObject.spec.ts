import T from "./TestHelper";
import {OsmObject} from "../Logic/Osm/OsmObject";
import ScriptUtils from "../scripts/ScriptUtils";

export default class OsmObjectSpec extends T {
    constructor() {
        super("OsmObject", [
            [
                "Download referencing ways",
                () => {
                    let downloaded = false;
                    OsmObject.DownloadReferencingWays("node/1124134958").addCallbackAndRunD(ways => {
                        downloaded = true;
                        console.log(ways)
                    })
                    let timeout = 10
                    while (!downloaded && timeout >= 0) {
                        ScriptUtils.sleep(1000)

                        timeout--;
                    }
                    if(!downloaded){
                        throw "Timeout: referencing ways not found"
                    }
                }

            ]


        ]);
    }
}