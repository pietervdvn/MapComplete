import T from "./TestHelper";
import State from "../State";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import SelectedElementTagsUpdater from "../Logic/Actors/SelectedElementTagsUpdater";
import UserRelatedState from "../Logic/State/UserRelatedState";
import {Utils} from "../Utils";
import ScriptUtils from "../scripts/ScriptUtils";

export default class ActorsSpec extends T {

    constructor() {
        
        const latestTags = {
            "amenity": "public_bookcase",
            "books": "children;adults",
            "capacity": "25",
            "description": "Deze boekenruilkast vindt je recht tegenover de Pim Pam Poem",
            "image:0": "https://i.imgur.com/Z8a69UG.jpg",
            "name": "Stubbekwartier-buurtbibliotheek",
            "nobrand": "yes",
            "opening_hours": "24/7",
            "operator": "Huisbewoner",
            "public_bookcase:type": "reading_box"
        }
        
        Utils.injectJsonDownloadForTests(
            "https://www.openstreetmap.org/api/0.6/node/5568693115",
            {
                "version": "0.6",
                "generator": "CGImap 0.8.5 (1815943 spike-06.openstreetmap.org)",
                "copyright": "OpenStreetMap and contributors",
                "attribution": "http://www.openstreetmap.org/copyright",
                "license": "http://opendatacommons.org/licenses/odbl/1-0/",
                "elements": [{
                    "type": "node",
                    "id": 5568693115,
                    "lat": 51.2179199,
                    "lon": 3.2154662,
                    "timestamp": "2021-08-21T16:22:55Z",
                    "version": 6,
                    "changeset": 110034454,
                    "user": "Pieter Vander Vennet",
                    "uid": 3818858,
                    "tags": latestTags
                }]
            }
        )

        super("Actors", [
            [
                "download latest version",
                () => {
                    const state = new UserRelatedState(AllKnownLayouts.allKnownLayouts.get("bookcases"))
                    const feature = {
                        "type": "Feature",
                        "id": "node/5568693115",
                        "properties": {
                            "amenity": "public_bookcase",
                            "books": "children;adults",
                            "capacity": "25",
                            "description": "Deze boekenruilkast vindt je recht tegenover de Pim Pam Poem",
                            "image:0": "https://i.imgur.com/Z8a69UG.jpg",
                            "name": "OUTDATED NAME",
                            "nobrand": "yes",
                            "opening_hours": "24/7",
                            "operator": "Huisbewoner",
                            "public_bookcase:type": "reading_box",
                            "id": "node/5568693115",
                            "_lat": "51.2179199",
                            "_lon": "3.2154662",
                            "fixme": "SOME FIXME"
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                3.2154662,
                                51.2179199
                            ]
                        },
                        "bbox": {
                            "maxLat": 51.2179199,
                            "maxLon": 3.2154662,
                            "minLat": 51.2179199,
                            "minLon": 3.2154662
                        },
                        "_lon": 3.2154662,
                        "_lat": 51.2179199
                    }
                    state.allElements.addOrGetElement(feature)
                    SelectedElementTagsUpdater.installCallback(state)

                    // THis should trigger a download of the latest feaures and update the tags
                    // However, this doesn't work with ts-node for some reason
                    state.selectedElement.setData(feature)
                    
                    SelectedElementTagsUpdater.applyUpdate(state, latestTags, feature.properties.id)

                    // The name should be updated
                    T.equals("Stubbekwartier-buurtbibliotheek", feature.properties.name)
                    // The fixme should be removed
                    T.equals(undefined, feature.properties.fixme)

                }]


        ]);

    }


}