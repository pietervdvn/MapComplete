import T from "./TestHelper";
import {OsmObject} from "../Logic/Osm/OsmObject";

export default class OsmObjectSpec extends T {
    constructor() {
        super([
            [
                "Download referencing ways",
                () => {
                    OsmObjectSpec.runTest().then(_ => console.log("Referencing ways test is done (async)"))
                }

            ]


        ]);
    }

    private static async runTest() {
        const ways = await OsmObject.DownloadReferencingWays("node/1124134958")
        if (ways === undefined) {
            throw "Did not get the ways"
        }
        if (ways.length !== 4) {
            throw "Expected 4 ways but got " + ways.length
        }
    }
}