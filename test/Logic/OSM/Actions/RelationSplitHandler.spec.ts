import { Utils } from "../../../../src/Utils"
import { OsmRelation } from "../../../../src/Logic/Osm/OsmObject"
import {
    InPlaceReplacedmentRTSH,
    TurnRestrictionRSH,
} from "../../../../src/Logic/Osm/Actions/RelationSplitHandler"
import { Changes } from "../../../../src/Logic/Osm/Changes"
import { describe, expect, it } from "vitest"
import OsmObjectDownloader from "../../../../src/Logic/Osm/OsmObjectDownloader"
import { ImmutableStore } from "../../../../src/Logic/UIEventSource"
import { OsmConnection } from "../../../../src/Logic/Osm/OsmConnection"

describe("RelationSplitHandler", () => {
    Utils.injectJsonDownloadForTests("https://api.openstreetmap.org/api/0.6/node/1124134958/ways", {
        version: "0.6",
        generator: "CGImap 0.8.5 (2937646 spike-07.openstreetmap.org)",
        copyright: "OpenStreetMap and contributors",
        attribution: "http://www.openstreetmap.org/copyright",
        license: "http://opendatacommons.org/licenses/odbl/1-0/",
        elements: [
            {
                type: "way",
                id: 97038428,
                timestamp: "2019-06-19T12:26:24Z",
                version: 6,
                changeset: 71399984,
                user: "Pieter Vander Vennet",
                uid: 3818858,
                nodes: [1124134958, 323729212, 323729351, 2542460408, 187073405],
                tags: {
                    highway: "residential",
                    name: "Brugs-Kerkhofstraat",
                    "sett:pattern": "arc",
                    surface: "sett",
                },
            },
            {
                type: "way",
                id: 97038434,
                timestamp: "2019-06-19T12:26:24Z",
                version: 5,
                changeset: 71399984,
                user: "Pieter Vander Vennet",
                uid: 3818858,
                nodes: [1124134958, 1124135024, 187058607],
                tags: {
                    bicycle: "use_sidepath",
                    highway: "residential",
                    name: "Kerkhofblommenstraat",
                    "sett:pattern": "arc",
                    surface: "sett",
                },
            },
            {
                type: "way",
                id: 97038435,
                timestamp: "2017-12-21T21:41:08Z",
                version: 4,
                changeset: 54826837,
                user: "Jakka",
                uid: 2403313,
                nodes: [1124134958, 2576628889, 1124135035, 5298371485, 5298371495],
                tags: {
                    bicycle: "use_sidepath",
                    highway: "residential",
                    name: "Kerkhofblommenstraat",
                },
            },
            {
                type: "way",
                id: 251446313,
                timestamp: "2019-01-07T19:22:47Z",
                version: 4,
                changeset: 66106872,
                user: "M!dgard",
                uid: 763799,
                nodes: [1124134958, 5243143198, 4555715455],
                tags: { foot: "yes", highway: "service" },
            },
        ],
    })

    Utils.injectJsonDownloadForTests(
        "https://api.openstreetmap.org/api/0.6/relation/9572808/full",
        {
            version: "0.6",
            generator: "CGImap 0.8.5 (3128319 spike-07.openstreetmap.org)",
            copyright: "OpenStreetMap and contributors",
            attribution: "http://www.openstreetmap.org/copyright",
            license: "http://opendatacommons.org/licenses/odbl/1-0/",
            elements: [
                {
                    type: "relation",
                    id: 9572808,
                    timestamp: "2021-08-12T12:44:06Z",
                    version: 11,
                    changeset: 109573204,
                    user: "A67-A67",
                    uid: 553736,
                    members: [
                        { type: "way", ref: 173662702, role: "" },
                        {
                            type: "way",
                            ref: 467606230,
                            role: "",
                        },
                        { type: "way", ref: 126267167, role: "" },
                        {
                            type: "way",
                            ref: 301897426,
                            role: "",
                        },
                        { type: "way", ref: 687866206, role: "" },
                        {
                            type: "way",
                            ref: 295132739,
                            role: "",
                        },
                        { type: "way", ref: 690497698, role: "" },
                        {
                            type: "way",
                            ref: 627893684,
                            role: "",
                        },
                        { type: "way", ref: 295132741, role: "" },
                        {
                            type: "way",
                            ref: 301903120,
                            role: "",
                        },
                        { type: "way", ref: 672541156, role: "" },
                        {
                            type: "way",
                            ref: 126264330,
                            role: "",
                        },
                        { type: "way", ref: 280440853, role: "" },
                        {
                            type: "way",
                            ref: 838499667,
                            role: "",
                        },
                        { type: "way", ref: 838499663, role: "" },
                        {
                            type: "way",
                            ref: 690497623,
                            role: "",
                        },
                        { type: "way", ref: 301902946, role: "" },
                        {
                            type: "way",
                            ref: 280460715,
                            role: "",
                        },
                        { type: "way", ref: 972534369, role: "" },
                        {
                            type: "way",
                            ref: 695680702,
                            role: "",
                        },
                        { type: "way", ref: 690497860, role: "" },
                        {
                            type: "way",
                            ref: 295410363,
                            role: "",
                        },
                        { type: "way", ref: 823864063, role: "" },
                        {
                            type: "way",
                            ref: 663172088,
                            role: "",
                        },
                        { type: "way", ref: 659950322, role: "" },
                        {
                            type: "way",
                            ref: 659950323,
                            role: "",
                        },
                        { type: "way", ref: 230180094, role: "" },
                        {
                            type: "way",
                            ref: 690497912,
                            role: "",
                        },
                        { type: "way", ref: 39588765, role: "" },
                    ],
                    tags: {
                        distance: "13 km",
                        name: "Abdijenroute",
                        network: "lcn",
                        old_name: "Spoorlijn 58",
                        operator: "Toerisme West-Vlaanderen",
                        railway: "abandoned",
                        route: "bicycle",
                        type: "route",
                        wikipedia: "nl:Spoorlijn 58",
                    },
                },
            ],
        }
    )

    Utils.injectJsonDownloadForTests("https://api.openstreetmap.org/api/0.6/way/687866206/full", {
        version: "0.6",
        generator: "CGImap 0.8.5 (2601512 spike-07.openstreetmap.org)",
        copyright: "OpenStreetMap and contributors",
        attribution: "http://www.openstreetmap.org/copyright",
        license: "http://opendatacommons.org/licenses/odbl/1-0/",
        elements: [
            {
                type: "node",
                id: 5273988959,
                lat: 51.1811406,
                lon: 3.2427712,
                timestamp: "2021-07-29T21:14:53Z",
                version: 6,
                changeset: 108847202,
                user: "kaart_fietser",
                uid: 11022240,
                tags: { "network:type": "node_network", rwn_ref: "32" },
            },
            {
                type: "node",
                id: 6448669326,
                lat: 51.1811346,
                lon: 3.242891,
                timestamp: "2019-05-04T22:44:12Z",
                version: 1,
                changeset: 69891295,
                user: "Pieter Vander Vennet",
                uid: 3818858,
                tags: { barrier: "bollard" },
            },
            {
                type: "way",
                id: 687866206,
                timestamp: "2019-05-06T20:52:20Z",
                version: 2,
                changeset: 69951497,
                user: "noelbov",
                uid: 8054928,
                nodes: [6448669326, 5273988959],
                tags: {
                    highway: "cycleway",
                    name: "Abdijenroute",
                    railway: "abandoned",
                    surface: "asphalt",
                },
            },
        ],
    })

    Utils.injectJsonDownloadForTests("https://api.openstreetmap.org/api/0.6/way/690497698/full", {
        version: "0.6",
        generator: "CGImap 0.8.5 (3023311 spike-07.openstreetmap.org)",
        copyright: "OpenStreetMap and contributors",
        attribution: "http://www.openstreetmap.org/copyright",
        license: "http://opendatacommons.org/licenses/odbl/1-0/",
        elements: [
            {
                type: "node",
                id: 170497152,
                lat: 51.1832353,
                lon: 3.2498759,
                timestamp: "2018-04-24T00:29:37Z",
                version: 7,
                changeset: 58357376,
                user: "Pieter Vander Vennet",
                uid: 3818858,
            },
            {
                type: "node",
                id: 2988218625,
                lat: 51.1835053,
                lon: 3.2503067,
                timestamp: "2018-09-24T21:48:46Z",
                version: 2,
                changeset: 62895918,
                user: "A67-A67",
                uid: 553736,
            },
            {
                type: "node",
                id: 5273988967,
                lat: 51.182659,
                lon: 3.249004,
                timestamp: "2017-12-09T18:40:21Z",
                version: 1,
                changeset: 54493533,
                user: "CacherB",
                uid: 1999108,
            },
            {
                type: "way",
                id: 690497698,
                timestamp: "2021-07-29T21:14:53Z",
                version: 3,
                changeset: 108847202,
                user: "kaart_fietser",
                uid: 11022240,
                nodes: [2988218625, 170497152, 5273988967],
                tags: {
                    highway: "cycleway",
                    lit: "no",
                    name: "Abdijenroute",
                    oneway: "no",
                    railway: "abandoned",
                    surface: "compacted",
                },
            },
        ],
    })
    Utils.injectJsonDownloadForTests(
        "https://api.openstreetmap.org/api/0.6/relation/4374576/full",
        {
            version: "0.6",
            generator: "CGImap 0.8.5 (1266692 spike-06.openstreetmap.org)",
            copyright: "OpenStreetMap and contributors",
            attribution: "http://www.openstreetmap.org/copyright",
            license: "http://opendatacommons.org/licenses/odbl/1-0/",
            elements: [
                {
                    type: "relation",
                    id: 4374576,
                    timestamp: "2014-12-23T21:42:27Z",
                    version: 2,
                    changeset: 27660623,
                    user: "escada",
                    uid: 436365,
                    members: [
                        { type: "way", ref: 318616190, role: "from" },
                        {
                            type: "node",
                            ref: 1407529979,
                            role: "via",
                        },
                        { type: "way", ref: 143298912, role: "to" },
                    ],
                    tags: { restriction: "no_right_turn", type: "restriction" },
                },
            ],
        }
    )

    Utils.injectJsonDownloadForTests("https://api.openstreetmap.org/api/0.6/way/143298912/full", {
        version: "0.6",
        generator: "CGImap 0.8.5 (4046166 spike-07.openstreetmap.org)",
        copyright: "OpenStreetMap and contributors",
        attribution: "http://www.openstreetmap.org/copyright",
        license: "http://opendatacommons.org/licenses/odbl/1-0/",
        elements: [
            {
                type: "node",
                id: 26343912,
                lat: 51.2146847,
                lon: 3.2397007,
                timestamp: "2015-04-11T10:40:56Z",
                version: 5,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 26343913,
                lat: 51.2161912,
                lon: 3.2386907,
                timestamp: "2015-04-11T10:40:56Z",
                version: 6,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 26343914,
                lat: 51.2193456,
                lon: 3.2360696,
                timestamp: "2015-04-11T10:40:56Z",
                version: 5,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 26343915,
                lat: 51.2202816,
                lon: 3.2352429,
                timestamp: "2015-04-11T10:40:56Z",
                version: 5,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 875668688,
                lat: 51.2131868,
                lon: 3.2406009,
                timestamp: "2015-04-11T10:40:56Z",
                version: 4,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 1109632153,
                lat: 51.2207068,
                lon: 3.234882,
                timestamp: "2015-04-11T10:40:55Z",
                version: 3,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 1109632154,
                lat: 51.220784,
                lon: 3.2348394,
                timestamp: "2021-05-30T08:01:17Z",
                version: 4,
                changeset: 105557550,
                user: "albertino",
                uid: 499281,
            },
            {
                type: "node",
                id: 1109632177,
                lat: 51.2205082,
                lon: 3.2350441,
                timestamp: "2015-04-11T10:40:55Z",
                version: 3,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 1407529961,
                lat: 51.2168476,
                lon: 3.2381772,
                timestamp: "2015-04-11T10:40:55Z",
                version: 2,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 1407529969,
                lat: 51.2155155,
                lon: 3.23917,
                timestamp: "2011-08-21T20:08:27Z",
                version: 1,
                changeset: 9088257,
                user: "toeklk",
                uid: 219908,
            },
            {
                type: "node",
                id: 1407529979,
                lat: 51.212694,
                lon: 3.2409595,
                timestamp: "2015-04-11T10:40:55Z",
                version: 6,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
                tags: { highway: "traffic_signals" },
            },
            {
                type: "node",
                id: 1634435395,
                lat: 51.2129189,
                lon: 3.2408257,
                timestamp: "2012-02-15T19:37:51Z",
                version: 1,
                changeset: 10695640,
                user: "Eimai",
                uid: 6072,
            },
            {
                type: "node",
                id: 1634435396,
                lat: 51.2132508,
                lon: 3.2405417,
                timestamp: "2012-02-15T19:37:51Z",
                version: 1,
                changeset: 10695640,
                user: "Eimai",
                uid: 6072,
            },
            {
                type: "node",
                id: 1634435397,
                lat: 51.2133918,
                lon: 3.2404416,
                timestamp: "2015-04-11T10:40:55Z",
                version: 2,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 1974988033,
                lat: 51.2127459,
                lon: 3.240928,
                timestamp: "2012-10-20T12:24:13Z",
                version: 1,
                changeset: 13566903,
                user: "skyman81",
                uid: 955688,
            },
            {
                type: "node",
                id: 3250129361,
                lat: 51.2127906,
                lon: 3.2409016,
                timestamp: "2018-12-19T00:00:33Z",
                version: 2,
                changeset: 65596519,
                user: "beardhatcode",
                uid: 5439560,
                tags: { crossing: "traffic_signals", highway: "crossing" },
            },
            {
                type: "node",
                id: 3250129363,
                lat: 51.2149189,
                lon: 3.2395571,
                timestamp: "2015-04-11T10:40:56Z",
                version: 2,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 3450326133,
                lat: 51.2139571,
                lon: 3.2401205,
                timestamp: "2015-04-11T10:40:26Z",
                version: 1,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 3450326135,
                lat: 51.2181385,
                lon: 3.2370893,
                timestamp: "2015-04-11T10:40:26Z",
                version: 1,
                changeset: 30139621,
                user: "M!dgard",
                uid: 763799,
            },
            {
                type: "node",
                id: 4794847239,
                lat: 51.2191224,
                lon: 3.2362584,
                timestamp: "2019-08-27T23:07:05Z",
                version: 2,
                changeset: 73816461,
                user: "Pieter Vander Vennet",
                uid: 3818858,
            },
            {
                type: "node",
                id: 8493044168,
                lat: 51.2130348,
                lon: 3.2407284,
                timestamp: "2021-03-06T21:52:51Z",
                version: 1,
                changeset: 100555232,
                user: "kaart_fietser",
                uid: 11022240,
                tags: { highway: "traffic_signals", traffic_signals: "traffic_lights" },
            },
            {
                type: "node",
                id: 8792687918,
                lat: 51.2207505,
                lon: 3.2348579,
                timestamp: "2021-06-02T18:27:15Z",
                version: 1,
                changeset: 105735092,
                user: "albertino",
                uid: 499281,
            },
            {
                type: "way",
                id: 143298912,
                timestamp: "2021-06-02T18:27:15Z",
                version: 15,
                changeset: 105735092,
                user: "albertino",
                uid: 499281,
                nodes: [
                    1407529979, 1974988033, 3250129361, 1634435395, 8493044168, 875668688,
                    1634435396, 1634435397, 3450326133, 26343912, 3250129363, 1407529969, 26343913,
                    1407529961, 3450326135, 4794847239, 26343914, 26343915, 1109632177, 1109632153,
                    8792687918, 1109632154,
                ],
                tags: {
                    "cycleway:right": "track",
                    highway: "primary",
                    lanes: "2",
                    lit: "yes",
                    maxspeed: "70",
                    name: "Buiten Kruisvest",
                    oneway: "yes",
                    ref: "R30",
                    surface: "asphalt",
                    wikipedia: "nl:Buiten Kruisvest",
                },
            },
        ],
    })

    it("should split all cycling relation (split 295132739)", async () => {
        // Lets mimic a split action of https://www.openstreetmap.org/way/295132739

        const downloader = new OsmObjectDownloader()
        const relation: OsmRelation = <OsmRelation>(
            await downloader.DownloadObjectAsync("relation/9572808")
        )
        const originalNodeIds = [
            5273988967, 170497153, 1507524582, 4524321710, 170497155, 170497157, 170497158,
            3208166179, 1507524610, 170497160, 3208166178, 1507524573, 1575932830, 6448669326,
        ]

        const withSplit = [
            [5273988967, 170497153, 1507524582, 4524321710, 170497155, 170497157, 170497158],
            [3208166179, 1507524610, 170497160, 3208166178, 1507524573, 1575932830, 6448669326],
        ]

        const splitter = new InPlaceReplacedmentRTSH(
            {
                relation: relation,
                originalWayId: 295132739,
                allWayIdsInOrder: [295132739, -1],
                originalNodes: originalNodeIds,
                allWaysNodesInOrder: withSplit,
            },
            "no-theme",
            downloader
        )
        const changeDescription = await splitter.CreateChangeDescriptions(
            new Changes({
                dryRun: new ImmutableStore(false),
                osmConnection: new OsmConnection(),
            })
        )
        const allIds = changeDescription[0].changes["members"].map((m) => m.ref).join(",")
        const expected = "687866206,295132739,-1,690497698"
        // "didn't find the expected order of ids in the relation to test"
        expect(allIds.indexOf(expected) >= 0).toBe(true)
    })

    it("should split turn restrictions (split of https://www.openstreetmap.org/way/143298912)", async () => {
        const downloader = new OsmObjectDownloader()
        const relation: OsmRelation = <OsmRelation>(
            await downloader.DownloadObjectAsync("relation/4374576")
        )
        const originalNodeIds = [
            1407529979, 1974988033, 3250129361, 1634435395, 8493044168, 875668688, 1634435396,
            1634435397, 3450326133, 26343912, 3250129363, 1407529969, 26343913, 1407529961,
            3450326135, 4794847239, 26343914, 26343915, 1109632177, 1109632153, 8792687918,
            1109632154,
        ]

        const withSplit = [
            [
                1407529979, // The via point
                1974988033,
                3250129361,
                1634435395,
                8493044168,
                875668688,
                1634435396,
                1634435397,
                3450326133,
                26343912,
                3250129363,
                1407529969,
                26343913,
            ],
            [
                1407529961, 3450326135, 4794847239, 26343914, 26343915, 1109632177, 1109632153,
                8792687918, 1109632154,
            ],
        ]

        const splitter = new TurnRestrictionRSH(
            {
                relation: relation,
                originalWayId: 143298912,
                allWayIdsInOrder: [-1, 143298912],
                originalNodes: originalNodeIds,
                allWaysNodesInOrder: withSplit,
            },
            "no-theme",
            downloader
        )
        const changeDescription = await splitter.CreateChangeDescriptions(
            new Changes({
                dryRun: new ImmutableStore(false),
                osmConnection: new OsmConnection(),
            })
        )
        const allIds = changeDescription[0].changes["members"]
            .map((m) => m.type + "/" + m.ref + "-->" + m.role)
            .join(",")
        const expected = "way/318616190-->from,node/1407529979-->via,way/-1-->to"
        expect(allIds).toEqual(expected)

        // Reversing the ids has no effect
        const splitterReverse = new TurnRestrictionRSH(
            {
                relation: relation,
                originalWayId: 143298912,
                allWayIdsInOrder: [143298912, -1],
                originalNodes: originalNodeIds,
                allWaysNodesInOrder: withSplit,
            },
            "no-theme",
            downloader
        )
        const changesReverse = await splitterReverse.CreateChangeDescriptions(
            new Changes({
                dryRun: new ImmutableStore(false),
                osmConnection: new OsmConnection(),
            })
        )
        expect(changesReverse.length).toEqual(0)
    })
})
