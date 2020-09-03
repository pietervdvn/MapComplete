import {LayerConfigJson} from "../../Customizations/JSON/LayerConfigJson";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import {TagRenderingConfigJson} from "../../Customizations/JSON/TagRenderingConfigJson";

export class GenerateEmpty {
    public static createEmptyLayer(): LayerConfigJson {
        return {
            id: undefined,
            name: undefined,
            minzoom: 0,
            overpassTags: {and: [""]},
            title: undefined,
            description: {},
            tagRenderings: [],
        }
    }

    public static createEmptyLayout(): LayoutConfigJson {
        return {
            id: "",
            title: {},
            description: {},
            language: [],
            maintainer: "",
            icon: "./assets/bug.svg",
            version: "0",
            startLat: 0,
            startLon: 0,
            startZoom: 1,
            widenFactor: 0.05,
            socialImage: "",
            
            layers: []
        }
    }

    public static createTestLayout(): LayoutConfigJson {
        return {
            id: "test",
            title: {"en": "Test layout"},
            description: {"en": "A layout for testing"},
            language: ["en"],
            maintainer: "Pieter Vander Vennet",
            icon: "./assets/bug.svg",
            version: "0",
            startLat: 0,
            startLon: 0,
            startZoom: 1,
            widenFactor: 0.05,
            socialImage: "",
            layers: [{
                id: "testlayer",
                name: {en:"Testing layer"},
                minzoom: 15,
                overpassTags: {and: ["highway=residential"]},
                title: {},
                description: {"en": "Some Description"},
                icon: {render: {en: "./assets/pencil.svg"}},
                width: {render: {en: "5"}},
                tagRenderings: [{
                    render: {"en":"Test Rendering"}
                }]
            }]
        }
    }

    public static createEmptyTagRendering(): TagRenderingConfigJson {
        return {};
    }
}