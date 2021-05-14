import {Utils} from "../Utils";

Utils.runningFromConsole = true;
import {equal} from "assert";
import T from "./TestHelper";
import {FromJSON} from "../Customizations/JSON/FromJSON";
import Locale from "../UI/i18n/Locale";
import Translations from "../UI/i18n/Translations";
import {UIEventSource} from "../Logic/UIEventSource";
import TagRenderingConfig from "../Customizations/JSON/TagRenderingConfig";
import EditableTagRendering from "../UI/Popup/EditableTagRendering";
import {Translation} from "../UI/i18n/Translation";
import {OH, OpeningHour} from "../UI/OpeningHours/OpeningHours";
import PublicHolidayInput from "../UI/OpeningHours/PublicHolidayInput";
import {SubstitutedTranslation} from "../UI/SubstitutedTranslation";
import {Tag} from "../Logic/Tags/Tag";
import {And} from "../Logic/Tags/And";
import * as Assert from "assert";
import {GeoOperations} from "../Logic/GeoOperations";

export default class GeoOperationsSpec extends T {

    private static polygon = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [
                        1.8017578124999998,
                        50.401515322782366
                    ],
                    [
                        -3.1640625,
                        46.255846818480315
                    ],
                    [
                        5.185546875,
                        44.74673324024678
                    ],
                    [
                        1.8017578124999998,
                        50.401515322782366
                    ]
                ]
            ]
        }
    };
    private static multiPolygon = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[
                [
                    [
                        1.8017578124999998,
                        50.401515322782366
                    ],
                    [
                        -3.1640625,
                        46.255846818480315
                    ],
                    [
                        5.185546875,
                        44.74673324024678
                    ],
                    [
                        1.8017578124999998,
                        50.401515322782366
                    ]
                ],
                [
                    [
                        1.0107421875,
                        48.821332549646634
                    ],
                    [
                        1.329345703125,
                        48.25394114463431
                    ],
                    [
                        1.988525390625,
                        48.71271258145237
                    ],
                    [
                        0.999755859375,
                        48.86471476180277
                    ],
                    [
                        1.0107421875,
                        48.821332549646634
                    ]
                ]
            ]]
        }
    };

    private static inHole = [1.42822265625, 48.61838518688487]
    private static inMultiPolygon = [2.515869140625, 47.37603463349758]
    private static outsidePolygon = [4.02099609375, 47.81315451752768]

    constructor() {
        super(
            "GeoOperationsSpec", [
                ["Point out of polygon", () => {
                    GeoOperationsSpec.isFalse(GeoOperations.inside([
                        3.779296875,
                        48.777912755501845
                    ], GeoOperationsSpec.polygon), "Point is outside of the polygon");
                }

                ],
                ["Point inside of polygon", () => {

                    GeoOperationsSpec.isTrue(GeoOperations.inside([
                        1.23046875,
                        47.60616304386874
                    ], GeoOperationsSpec.polygon), "Point is inside of the polygon");
                }
                ],
                ["MultiPolygonTest", () => {

                    const isTrue = GeoOperationsSpec.isTrue;
                    const isFalse = GeoOperationsSpec.isFalse;
                    
                    isFalse(GeoOperations.inside(GeoOperationsSpec.inHole, GeoOperationsSpec.multiPolygon), "InHole was detected as true");
                    isTrue(GeoOperations.inside(GeoOperationsSpec.inMultiPolygon, GeoOperationsSpec.multiPolygon), "InMultiPolgyon was not detected as true");
                    isFalse(GeoOperations.inside(GeoOperationsSpec.outsidePolygon, GeoOperationsSpec.multiPolygon), "OutsideOfPolygon was detected as true");

                }],
            ["Intersection between a line and a polygon", () => {
                const line = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [
                                3.779296875,
                                48.777912755501845
                            ],
                            [
                                1.23046875,
                                47.60616304386874
                            ]
                        ]
                    }
                };

                const overlap = GeoOperations.calculateOverlap(line, [GeoOperationsSpec.polygon]);
                Assert.equal(1, overlap.length)
            }],
            ["Fully enclosed", () => {
                const line = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [
                                0.0439453125,
                                47.31648293428332
                            ],
                            [
                                0.6591796875,
                                46.77749276376827
                            ]
                        ]
                    }
                };

                const overlap = GeoOperations.calculateOverlap(line, [GeoOperationsSpec.polygon]);
                Assert.equal(1, overlap.length)
            }],
            ["overlapWith matches points too", () => {
                const point = {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            2.274169921875,
                            46.76244305208004
                        ]
                    }
                };

                const overlap = GeoOperations.calculateOverlap(point, [GeoOperationsSpec.polygon]);
                Assert.equal(1, overlap.length)
            }]
    ]
    )
        
    }
}
