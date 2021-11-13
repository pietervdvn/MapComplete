import T from "./TestHelper";
import {Utils} from "../Utils";

export default class ReplaceGeometrySpec extends T {
    constructor() {
        super("ReplaceGeometry", [
            ["Simple house replacement", async () => {
                const coordinates = <[number, number][]>[[
                    3.216690793633461,
                    51.21474084112525
                ],
                    [
                        3.2167256623506546,
                        51.214696737309964
                    ],
                    [
                        3.2169999182224274,
                        51.214768983537674
                    ],
                    [
                        3.2169650495052338,
                        51.21480720678671
                    ],
                    [
                        3.2169368863105774,
                        51.21480090625335
                    ],
                    [
                        3.2169489562511444,
                        51.21478074454077
                    ],
                    [
                        3.216886594891548,
                        51.214765203214625
                    ],
                    [
                        3.2168812304735184,
                        51.21477192378873
                    ],
                    [
                        3.2168644666671753,
                        51.214768983537674
                    ],
                    [
                        3.2168537378311157,
                        51.21478746511261
                    ],
                    [
                        3.216690793633461,
                        51.21474084112525
                    ]
                ]

                Utils.injectJsonDownloadForTests(
                    "https://www.openstreetmap.org/api/0.6/way/160909312/full",
                    {
                        "version": "0.6",
                        "generator": "CGImap 0.8.5 (920083 spike-06.openstreetmap.org)",
                        "copyright": "OpenStreetMap and contributors",
                        "attribution": "http://www.openstreetmap.org/copyright",
                        "license": "http://opendatacommons.org/licenses/odbl/1-0/",
                        "elements": [{
                            "type": "node",
                            "id": 1728823481,
                            "lat": 51.2146969,
                            "lon": 3.2167247,
                            "timestamp": "2017-07-18T22:52:45Z",
                            "version": 2,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 1728823483,
                            "lat": 51.2147409,
                            "lon": 3.216693,
                            "timestamp": "2017-07-18T22:52:45Z",
                            "version": 2,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 1728823514,
                            "lat": 51.2147863,
                            "lon": 3.2168551,
                            "timestamp": "2017-07-18T22:52:45Z",
                            "version": 2,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 1728823549,
                            "lat": 51.2147399,
                            "lon": 3.2168871,
                            "timestamp": "2017-07-18T22:52:46Z",
                            "version": 2,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 4978288381,
                            "lat": 51.2147638,
                            "lon": 3.2168856,
                            "timestamp": "2017-07-18T22:52:21Z",
                            "version": 1,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 4978289383,
                            "lat": 51.2147676,
                            "lon": 3.2169973,
                            "timestamp": "2017-07-18T22:52:21Z",
                            "version": 1,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 4978289384,
                            "lat": 51.2147683,
                            "lon": 3.2168674,
                            "timestamp": "2017-07-18T22:52:21Z",
                            "version": 1,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 4978289386,
                            "lat": 51.2147718,
                            "lon": 3.2168815,
                            "timestamp": "2017-07-18T22:52:21Z",
                            "version": 1,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "node",
                            "id": 4978289388,
                            "lat": 51.2147884,
                            "lon": 3.2169829,
                            "timestamp": "2017-07-18T22:52:21Z",
                            "version": 1,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209
                        }, {
                            "type": "way",
                            "id": 160909312,
                            "timestamp": "2017-07-18T22:52:30Z",
                            "version": 2,
                            "changeset": 50391526,
                            "user": "catweazle67",
                            "uid": 1976209,
                            "nodes": [1728823483, 1728823514, 4978289384, 4978289386, 4978288381, 4978289388, 4978289383, 1728823549, 1728823481, 1728823483],
                            "tags": {
                                "addr:city": "Brugge",
                                "addr:country": "BE",
                                "addr:housenumber": "108",
                                "addr:postcode": "8000",
                                "addr:street": "Ezelstraat",
                                "building": "yes"
                            }
                        }]
                    }
                )


                const wayId = "way/160909312"
                const url = `https://www.openstreetmap.org/api/0.6/${wayId}/full`;
                const rawData = await Utils.downloadJsonCached(url, 1000)


            }]
        ]);
    }
}