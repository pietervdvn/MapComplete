import {LayerConfigJson} from "../../Customizations/JSON/LayerConfigJson";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import {TagRenderingConfigJson} from "../../Customizations/JSON/TagRenderingConfigJson";

export class GenerateEmpty {
    public static createEmptyLayer(): LayerConfigJson {
        return {
            id: "yourlayer",
            name: {},
            minzoom: 12,
            overpassTags: {and: [""]},
            title: {},
            description: {},
            tagRenderings: [],
            hideUnderlayingFeaturesMinPercentage: 0,
            icon: {
                render: "./assets/svg/bug.svg"
            },
            width: {
                render: "8"
            },
            iconSize: {
                render: "40,40,center"
            },
            color:{
                render: "#00f"
            }
        }
    }

    public static createEmptyLayout(): LayoutConfigJson {
        return {
            id: "id",
            title: {},
            shortDescription: {},
            description: {},
            language: [],
            maintainer: "",
            icon: "./assets/svg/bug.svg",
            version: "0",
            startLat: 0,
            startLon: 0,
            startZoom: 1,
            widenFactor: 0.05,
            socialImage: "",
            
            layers: [
                GenerateEmpty.createEmptyLayer()
            ]
        }
    }

    public static createTestLayout(): LayoutConfigJson {
        return {
            id: "test",
            title: {"en": "Test layout"},
            shortDescription: {},
            description: {"en": "A layout for testing"},
            language: ["en"],
            maintainer: "Pieter Vander Vennet",
            icon: "./assets/svg/bug.svg",
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
                icon: {render: {en: "./assets/svg/pencil.svg"}},
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