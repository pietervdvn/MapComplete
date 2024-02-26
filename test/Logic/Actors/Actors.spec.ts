import { Utils } from "../../../src/Utils"
import LayoutConfig from "../../../src/Models/ThemeConfig/LayoutConfig"

import * as bookcaseJson from "../../../src/assets/generated/themes/bookcases.json"
import { OsmTags } from "../../../src/Models/OsmFeature"
import { Feature, Geometry } from "geojson"
import { expect, it } from "vitest"
import ThemeViewState from "../../../src/Models/ThemeViewState"
import ScriptUtils from "../../../scripts/ScriptUtils"

const latestTags = {
    amenity: "public_bookcase",
    books: "children;adults",
    capacity: "25",
    description: "Deze boekenruilkast vindt je recht tegenover de Pim Pam Poem",
    "image:0": "https://i.imgur.com/Z8a69UG.jpg",
    name: "Stubbekwartier-buurtbibliotheek",
    nobrand: "yes",
    opening_hours: "24/7",
    operator: "Huisbewoner",
    "public_bookcase:type": "reading_box",
}

Utils.injectJsonDownloadForTests("https://www.openstreetmap.org/api/0.6/node/5568693115", {
    version: "0.6",
    generator: "CGImap 0.8.5 (1815943 spike-06.openstreetmap.org)",
    copyright: "OpenStreetMap and contributors",
    attribution: "http://www.openstreetmap.org/copyright",
    license: "http://opendatacommons.org/licenses/odbl/1-0/",
    elements: [
        {
            type: "node",
            id: 5568693115,
            lat: 51.2179199,
            lon: 3.2154662,
            timestamp: "2021-08-21T16:22:55Z",
            version: 6,
            changeset: 110034454,
            user: "Pieter Vander Vennet",
            uid: 3818858,
            tags: latestTags,
        },
    ],
})

it("should download the latest version", async () => {
    const state = new ThemeViewState(new LayoutConfig(<any>bookcaseJson, true), new Set<string>())
    const feature: Feature<Geometry, OsmTags> = {
        type: "Feature",
        id: "node/5568693115",
        properties: {
            amenity: "public_bookcase",
            books: "children;adults",
            capacity: "25",
            description: "Deze boekenruilkast vindt je recht tegenover de Pim Pam Poem",
            "image:0": "https://i.imgur.com/Z8a69UG.jpg",
            name: "OUTDATED NAME",
            nobrand: "yes",
            opening_hours: "24/7",
            operator: "Huisbewoner",
            "public_bookcase:type": "reading_box",
            id: "node/5568693115",
            _lat: "51.2179199",
            _lon: "3.2154662",
            fixme: "SOME FIXME",
        },
        geometry: {
            type: "Point",
            coordinates: [3.2154662, 51.2179199],
        },
    }
    state.newFeatures.features.data.push(feature)
    state.newFeatures.features.ping()
    // The 'selectedElementsTagsUpdater' is the functionality which is tested here
    // However, one is initialized in the 'ThemeViewState' as well; and I'm to lazy to partially construct one here
    // new SelectedElementTagsUpdater()

    // THis should trigger a download of the latest feaures and update the tags
    // However, this doesn't work with ts-node for some reason
    state.selectedElement.setData(feature)

    await ScriptUtils.sleep(50)

    // The name should be updated
    expect(feature.properties.name).toEqual("Stubbekwartier-buurtbibliotheek")
    // The fixme should be removed
    expect(feature.properties.fixme).toBeUndefined()
})
