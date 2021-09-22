import T from "./TestHelper";
import {InPlaceReplacedmentRTSH} from "../Logic/Osm/Actions/RelationSplitHandler";
import {OsmObject, OsmRelation} from "../Logic/Osm/OsmObject";
import {Changes} from "../Logic/Osm/Changes";
import {equal} from "assert";

export default class RelationSplitHandlerSpec extends T {

    private static async split(): Promise<void> {
        // Lets mimick a split action of https://www.openstreetmap.org/way/295132739

        const relation: OsmRelation = <OsmRelation>await OsmObject.DownloadObjectAsync("relation/9572808")
        const originalNodeIds = [5273988967,
            170497153,
            1507524582,
            4524321710,
            170497155,
            170497157,
            170497158,
            3208166179,
            1507524610,
            170497160,
            3208166178,
            1507524573,
            1575932830,
            6448669326]

        const withSplit = [[5273988967,
            170497153,
            1507524582,
            4524321710,
            170497155,
            170497157,
            170497158],
            [
                3208166179,
                1507524610,
                170497160,
                3208166178,
                1507524573,
                1575932830,
                6448669326]]

        const splitter = new InPlaceReplacedmentRTSH(
            {
                relation: relation,
                originalWayId: 295132739,
                allWayIdsInOrder: [295132739, -1],
                originalNodes: originalNodeIds,
                allWaysNodesInOrder: withSplit
            })
        const changeDescription = await splitter.CreateChangeDescriptions(new Changes())
        const allIds = changeDescription[0].changes["members"].map(m => m.ref).join(",")
        const expected = "687866206,295132739,-1,690497698"
        if (allIds.indexOf(expected) < 0) {
            throw "Invalid order or the split ways. If this suddenly breaks, the parent relation at https://osm.org/relation/9572808 has probably changed and the test must be updated"
        }
    }
    
    constructor() {
        super("relationsplithandler", [
            ["split 295132739",
                () => RelationSplitHandlerSpec.split().then(_ => console.log("OK"))]
        ]);
    }
}