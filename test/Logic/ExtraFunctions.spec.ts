import {describe} from 'mocha'
import {expect} from 'chai'
import {ExtraFuncParams, ExtraFunctions} from "../../Logic/ExtraFunctions";
import {OsmFeature} from "../../Models/OsmFeature";


describe("OverlapFunc", () => {

    it("should give doors on the edge", () => {
        const door: OsmFeature = {
            "type": "Feature",
            "id": "node/9909268725",
            "properties": {
                "automatic_door": "no",
                "door": "hinged",
                "indoor": "door",
                "kerb:height": "0 cm",
                "width": "1",
                "id": "node/9909268725",
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    4.3494436,
                    50.8657928
                ]
            },
        }

        const hermanTeirlinck = {
            "type": "Feature",
            "id": "way/444059131",
            "properties": {
                "timestamp": "2022-07-27T15:15:01Z",
                "version": 27,
                "changeset": 124146283,
                "user": "Pieter Vander Vennet",
                "uid": 3818858,
                "addr:city": "Bruxelles - Brussel",
                "addr:housenumber": "88",
                "addr:postcode": "1000",
                "addr:street": "Avenue du Port - Havenlaan",
                "building": "government",
                "building:levels": "5",
                "name": "Herman Teirlinckgebouw",
                "operator": "Vlaamse overheid",
                "wikidata": "Q47457146",
                "wikipedia": "nl:Herman Teirlinckgebouw",
                "id": "way/444059131",
                "_backend": "https://www.openstreetmap.org",
                "_lat": "50.86622355",
                "_lon": "4.3501212",
                "_layer": "walls_and_buildings",
                "_length": "380.5933566256343",
                "_length:km": "0.4",
                "_now:date": "2022-07-29",
                "_now:datetime": "2022-07-29 14:19:25",
                "_loaded:date": "2022-07-29",
                "_loaded:datetime": "2022-07-29 14:19:25",
                "_last_edit:contributor": "Pieter Vander Vennet",
                "_last_edit:contributor:uid": 3818858,
                "_last_edit:changeset": 124146283,
                "_last_edit:timestamp": "2022-07-27T15:15:01Z",
                "_version_number": 27,
                "_geometry:type": "Polygon",
                "_surface": "7461.252251355437",
                "_surface:ha": "0.7",
                "_country": "be"
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            4.3493369,
                            50.8658274
                        ],
                        [
                            4.3493393,
                            50.8658266
                        ],
                        [
                            4.3494436,
                            50.8657928
                        ],
                        [
                            4.3495272,
                            50.8657658
                        ],
                        [
                            4.349623,
                            50.8657348
                        ],
                        [
                            4.3497442,
                            50.8656956
                        ],
                        [
                            4.3498441,
                            50.8656632
                        ],
                        [
                            4.3500768,
                            50.8655878
                        ],
                        [
                            4.3501619,
                            50.8656934
                        ],
                        [
                            4.3502113,
                            50.8657551
                        ],
                        [
                            4.3502729,
                            50.8658321
                        ],
                        [
                            4.3503063,
                            50.8658737
                        ],
                        [
                            4.3503397,
                            50.8659153
                        ],
                        [
                            4.3504159,
                            50.8660101
                        ],
                        [
                            4.3504177,
                            50.8660123
                        ],
                        [
                            4.3504354,
                            50.8660345
                        ],
                        [
                            4.3505348,
                            50.8661584
                        ],
                        [
                            4.3504935,
                            50.866172
                        ],
                        [
                            4.3506286,
                            50.8663405
                        ],
                        [
                            4.3506701,
                            50.8663271
                        ],
                        [
                            4.3508563,
                            50.8665592
                        ],
                        [
                            4.3509055,
                            50.8666206
                        ],
                        [
                            4.3506278,
                            50.8667104
                        ],
                        [
                            4.3504502,
                            50.8667675
                        ],
                        [
                            4.3503132,
                            50.8668115
                        ],
                        [
                            4.3502162,
                            50.8668427
                        ],
                        [
                            4.3501645,
                            50.8668593
                        ],
                        [
                            4.3499296,
                            50.8665664
                        ],
                        [
                            4.3498821,
                            50.8665073
                        ],
                        [
                            4.3498383,
                            50.8664527
                        ],
                        [
                            4.3498126,
                            50.8664207
                        ],
                        [
                            4.3497459,
                            50.8663376
                        ],
                        [
                            4.3497227,
                            50.8663086
                        ],
                        [
                            4.3496517,
                            50.8662201
                        ],
                        [
                            4.3495158,
                            50.8660507
                        ],
                        [
                            4.3493369,
                            50.8658274
                        ]
                    ]
                ]
            },
            "bbox": {
                "maxLat": 50.8668593,
                "maxLon": 4.3509055,
                "minLat": 50.8655878,
                "minLon": 4.3493369
            }
        }

        const params: ExtraFuncParams = {
            getFeatureById: id => undefined,
            getFeaturesWithin: () => [[door]],
            memberships: undefined
        }


        ExtraFunctions.FullPatchFeature(params, hermanTeirlinck)
        const overlap = (<any>hermanTeirlinck).overlapWith("*")
        console.log(JSON.stringify(overlap))
        expect(overlap[0].feat == door).true

    })

})