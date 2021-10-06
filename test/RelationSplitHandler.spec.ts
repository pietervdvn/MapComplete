import T from "./TestHelper";
import {InPlaceReplacedmentRTSH} from "../Logic/Osm/Actions/RelationSplitHandler";
import {OsmObject, OsmRelation} from "../Logic/Osm/OsmObject";
import {Changes} from "../Logic/Osm/Changes";
import {Utils} from "../Utils";

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
            },"no-theme")
        const changeDescription = await splitter.CreateChangeDescriptions(new Changes())
        const allIds = changeDescription[0].changes["members"].map(m => m.ref).join(",")
        const expected = "687866206,295132739,-1,690497698"
        if (allIds.indexOf(expected) < 0) {
            throw "Invalid order or the split ways. If this suddenly breaks, the parent relation at https://osm.org/relation/9572808 has probably changed and the test must be updated"
        }
    }
    
    constructor() {
        
        Utils.injectJsonDownloadForTests(
            "https://www.openstreetmap.org/api/0.6/node/1124134958/ways",
            {"version":"0.6","generator":"CGImap 0.8.5 (2937646 spike-07.openstreetmap.org)","copyright":"OpenStreetMap and contributors","attribution":"http://www.openstreetmap.org/copyright","license":"http://opendatacommons.org/licenses/odbl/1-0/","elements":[{"type":"way","id":97038428,"timestamp":"2019-06-19T12:26:24Z","version":6,"changeset":71399984,"user":"Pieter Vander Vennet","uid":3818858,"nodes":[1124134958,323729212,323729351,2542460408,187073405],"tags":{"highway":"residential","name":"Brugs-Kerkhofstraat","sett:pattern":"arc","surface":"sett"}},{"type":"way","id":97038434,"timestamp":"2019-06-19T12:26:24Z","version":5,"changeset":71399984,"user":"Pieter Vander Vennet","uid":3818858,"nodes":[1124134958,1124135024,187058607],"tags":{"bicycle":"use_sidepath","highway":"residential","name":"Kerkhofblommenstraat","sett:pattern":"arc","surface":"sett"}},{"type":"way","id":97038435,"timestamp":"2017-12-21T21:41:08Z","version":4,"changeset":54826837,"user":"Jakka","uid":2403313,"nodes":[1124134958,2576628889,1124135035,5298371485,5298371495],"tags":{"bicycle":"use_sidepath","highway":"residential","name":"Kerkhofblommenstraat"}},{"type":"way","id":251446313,"timestamp":"2019-01-07T19:22:47Z","version":4,"changeset":66106872,"user":"M!dgard","uid":763799,"nodes":[1124134958,5243143198,4555715455],"tags":{"foot":"yes","highway":"service"}}]}
        )
        
        Utils.injectJsonDownloadForTests(
            "https://www.openstreetmap.org/api/0.6/relation/9572808",
            {"version":"0.6","generator":"CGImap 0.8.5 (3128319 spike-07.openstreetmap.org)","copyright":"OpenStreetMap and contributors","attribution":"http://www.openstreetmap.org/copyright","license":"http://opendatacommons.org/licenses/odbl/1-0/","elements":[{"type":"relation","id":9572808,"timestamp":"2021-08-12T12:44:06Z","version":11,"changeset":109573204,"user":"A67-A67","uid":553736,"members":[{"type":"way","ref":173662702,"role":""},{"type":"way","ref":467606230,"role":""},{"type":"way","ref":126267167,"role":""},{"type":"way","ref":301897426,"role":""},{"type":"way","ref":687866206,"role":""},{"type":"way","ref":295132739,"role":""},{"type":"way","ref":690497698,"role":""},{"type":"way","ref":627893684,"role":""},{"type":"way","ref":295132741,"role":""},{"type":"way","ref":301903120,"role":""},{"type":"way","ref":672541156,"role":""},{"type":"way","ref":126264330,"role":""},{"type":"way","ref":280440853,"role":""},{"type":"way","ref":838499667,"role":""},{"type":"way","ref":838499663,"role":""},{"type":"way","ref":690497623,"role":""},{"type":"way","ref":301902946,"role":""},{"type":"way","ref":280460715,"role":""},{"type":"way","ref":972534369,"role":""},{"type":"way","ref":695680702,"role":""},{"type":"way","ref":690497860,"role":""},{"type":"way","ref":295410363,"role":""},{"type":"way","ref":823864063,"role":""},{"type":"way","ref":663172088,"role":""},{"type":"way","ref":659950322,"role":""},{"type":"way","ref":659950323,"role":""},{"type":"way","ref":230180094,"role":""},{"type":"way","ref":690497912,"role":""},{"type":"way","ref":39588765,"role":""}],"tags":{"distance":"13 km","name":"Abdijenroute","network":"lcn","old_name":"Spoorlijn 58","operator":"Toerisme West-Vlaanderen","railway":"abandoned","route":"bicycle","type":"route","wikipedia":"nl:Spoorlijn 58"}}]}
        )
        
       Utils.injectJsonDownloadForTests(
            "https://www.openstreetmap.org/api/0.6/way/687866206/full",
           {"version":"0.6","generator":"CGImap 0.8.5 (2601512 spike-07.openstreetmap.org)","copyright":"OpenStreetMap and contributors","attribution":"http://www.openstreetmap.org/copyright","license":"http://opendatacommons.org/licenses/odbl/1-0/","elements":[{"type":"node","id":5273988959,"lat":51.1811406,"lon":3.2427712,"timestamp":"2021-07-29T21:14:53Z","version":6,"changeset":108847202,"user":"kaart_fietser","uid":11022240,"tags":{"network:type":"node_network","rwn_ref":"32"}},{"type":"node","id":6448669326,"lat":51.1811346,"lon":3.242891,"timestamp":"2019-05-04T22:44:12Z","version":1,"changeset":69891295,"user":"Pieter Vander Vennet","uid":3818858,"tags":{"barrier":"bollard"}},{"type":"way","id":687866206,"timestamp":"2019-05-06T20:52:20Z","version":2,"changeset":69951497,"user":"noelbov","uid":8054928,"nodes":[6448669326,5273988959],"tags":{"highway":"cycleway","name":"Abdijenroute","railway":"abandoned","surface":"asphalt"}}]}
       )

        Utils.injectJsonDownloadForTests(
            "https://www.openstreetmap.org/api/0.6/way/690497698/full" ,
            {"version":"0.6","generator":"CGImap 0.8.5 (3023311 spike-07.openstreetmap.org)","copyright":"OpenStreetMap and contributors","attribution":"http://www.openstreetmap.org/copyright","license":"http://opendatacommons.org/licenses/odbl/1-0/","elements":[{"type":"node","id":170497152,"lat":51.1832353,"lon":3.2498759,"timestamp":"2018-04-24T00:29:37Z","version":7,"changeset":58357376,"user":"Pieter Vander Vennet","uid":3818858},{"type":"node","id":2988218625,"lat":51.1835053,"lon":3.2503067,"timestamp":"2018-09-24T21:48:46Z","version":2,"changeset":62895918,"user":"A67-A67","uid":553736},{"type":"node","id":5273988967,"lat":51.182659,"lon":3.249004,"timestamp":"2017-12-09T18:40:21Z","version":1,"changeset":54493533,"user":"CacherB","uid":1999108},{"type":"way","id":690497698,"timestamp":"2021-07-29T21:14:53Z","version":3,"changeset":108847202,"user":"kaart_fietser","uid":11022240,"nodes":[2988218625,170497152,5273988967],"tags":{"highway":"cycleway","lit":"no","name":"Abdijenroute","oneway":"no","railway":"abandoned","surface":"compacted"}}]}
        )


        super("relationsplithandler", [
            ["split 295132739",
                () => RelationSplitHandlerSpec.split().then(_ => console.log("OK"))]
        ]);
    }
}