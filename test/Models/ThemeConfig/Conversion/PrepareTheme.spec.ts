import { LayoutConfigJson } from "../../../../src/Models/ThemeConfig/Json/LayoutConfigJson"
import { LayerConfigJson } from "../../../../src/Models/ThemeConfig/Json/LayerConfigJson"
import { PrepareTheme } from "../../../../src/Models/ThemeConfig/Conversion/PrepareTheme"
import LayoutConfig from "../../../../src/Models/ThemeConfig/LayoutConfig"
import bookcaseLayer from "../../../../src/assets/generated/layers/public_bookcase.json"
import LayerConfig from "../../../../src/Models/ThemeConfig/LayerConfig"
import { ExtractImages } from "../../../../src/Models/ThemeConfig/Conversion/FixImages"
import cyclofix from "../../../../src/assets/generated/themes/cyclofix.json"
import { Tag } from "../../../../src/Logic/Tags/Tag"
import { DesugaringContext } from "../../../../src/Models/ThemeConfig/Conversion/Conversion"
import { And } from "../../../../src/Logic/Tags/And"
import { describe, expect, it } from "vitest"
import { QuestionableTagRenderingConfigJson } from "../../../../src/Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import Constants from "../../../../src/Models/Constants"
import { ConversionContext } from "../../../../src/Models/ThemeConfig/Conversion/ConversionContext"

const themeConfigJson: LayoutConfigJson = {
    description: "Descr",
    icon: "",
    layers: [
        {
            builtin: "public_bookcase",
            override: {
                source: {
                    geoJson: "xyz",
                },
            },
        },
    ],
    startLat: 0,
    startLon: 0,
    startZoom: 0,
    title: {
        en: "Title",
    },
    id: "test",
}

function constructSharedLayers(): Map<string, LayerConfigJson> {
    const sharedLayers = new Map<string, LayerConfigJson>()
    sharedLayers.set("selected_element", <LayerConfigJson>{
        id: "selected_element",
        pointRendering: null,
        tagRenderings: null,
        lineRendering: null,
        title: null,
        source: "special",
    })
    for (const defaultLayer of Constants.added_by_default) {
        sharedLayers.set(defaultLayer, <LayerConfigJson>{
            id: defaultLayer,
            pointRendering: null,
            tagRenderings: null,
            lineRendering: null,
            title: null,
            source: "special",
        })
    }
    return sharedLayers
}

describe("PrepareTheme", () => {
    it("should substitute layers", () => {
        const sharedLayers = constructSharedLayers()
        sharedLayers.set("public_bookcase", <any>bookcaseLayer)
        const theme = { ...themeConfigJson, layers: ["public_bookcase"] }
        const prepareStep = new PrepareTheme({
            tagRenderings: new Map<string, QuestionableTagRenderingConfigJson>(),
            sharedLayers,
            publicLayers: new Set<string>(),
        })
        let themeConfigJsonPrepared = prepareStep.convertStrict(theme, ConversionContext.test())
        const themeConfig = new LayoutConfig(themeConfigJsonPrepared)
        const layerUnderTest = <LayerConfig>(
            themeConfig.layers.find((l) => l.id === "public_bookcase")
        )
        expect(layerUnderTest.source.osmTags).toEqual(
            new And([new Tag("amenity", "public_bookcase")])
        )
    })

    it("should apply override", () => {
        const sharedLayers = constructSharedLayers()
        sharedLayers.set("public_bookcase", <any>bookcaseLayer)
        let themeConfigJsonPrepared = new PrepareTheme({
            tagRenderings: new Map<string, QuestionableTagRenderingConfigJson>(),
            sharedLayers,
            publicLayers: new Set<string>(),
        }).convertStrict(themeConfigJson, ConversionContext.test())
        const themeConfig = new LayoutConfig(themeConfigJsonPrepared)
        const layerUnderTest = <LayerConfig>(
            themeConfig.layers.find((l) => l.id === "public_bookcase")
        )
        expect(layerUnderTest.source.geojsonSource).toBe("xyz")
    })

    it("should apply override", () => {
        const sharedLayers = constructSharedLayers()
        sharedLayers.set("public_bookcase", <any>bookcaseLayer)
        let themeConfigJsonPrepared = new PrepareTheme({
            tagRenderings: new Map<string, QuestionableTagRenderingConfigJson>(),
            sharedLayers,
            publicLayers: new Set<string>(),
        }).convertStrict(
            {
                ...themeConfigJson,
                overrideAll: { source: { geoJson: "https://example.com/data.geojson" } },
            },
            ConversionContext.test()
        )
        const themeConfig = new LayoutConfig(themeConfigJsonPrepared)
        const layerUnderTest = <LayerConfig>(
            themeConfig.layers.find((l) => l.id === "public_bookcase")
        )
        expect(layerUnderTest.source.geojsonSource).toBe("https://example.com/data.geojson")
    })

    it("should remove names which are overriden with null", () => {
        const testLayer: LayerConfigJson = {
            source: {
                osmTags: "x=y",
            },
            id: "layer-example",
            name: {
                en: "Test layer - please ignore",
            },
            titleIcons: [],
            pointRendering: [
                {
                    location: ["point"],
                    label: "xyz",
                    iconBadges: [
                        {
                            if: "_favourite=yes",
                            then: <any>{
                                id: "circlewhiteheartred",
                                render: "circle:white;heart:red",
                            },
                        },
                    ],
                },
            ],
            lineRendering: [{ width: 1 }],
        }
        const sharedLayers = constructSharedLayers()
        sharedLayers.set("layer-example", testLayer)
        const ctx: DesugaringContext = {
            sharedLayers,
            tagRenderings: new Map<string, QuestionableTagRenderingConfigJson>(),
            publicLayers: new Set<string>(),
        }
        const layout: LayoutConfigJson = {
            description: "A testing theme",
            icon: "",
            id: "",
            layers: [
                "layer-example",
                {
                    builtin: "layer-example",
                    override: {
                        name: null,
                        minzoom: 18,
                    },
                },
            ],
            startLat: 0,
            startLon: 0,
            startZoom: 0,
            title: "Test theme",
        }
        const rewritten = new PrepareTheme(ctx, {
            skipDefaultLayers: true,
        }).convertStrict(layout, ConversionContext.test())
        expect(rewritten.layers[0]).toEqual(testLayer)
        expect(rewritten.layers[1]).toEqual({
            _basedOn: "layer-example",
            source: {
                osmTags: "x=y",
            },
            id: "layer-example",
            name: null,
            minzoom: 18,
            pointRendering: [
                {
                    location: ["point"],
                    label: "xyz",
                    iconBadges: [
                        {
                            if: "_favourite=yes",
                            then: {
                                id: "circlewhiteheartred",
                                render: "circle:white;heart:red",
                            },
                        },
                    ],
                },
            ],
            lineRendering: [{ width: 1 }],
            titleIcons: [],
        })
    })
})

describe("ExtractImages", () => {
    it("should find all images in a themefile", () => {
        const images = new Set<string>(
            new ExtractImages(true, new Set<string>())
                .convertStrict(<any>cyclofix, ConversionContext.test())
                .map((x) => x.path)
        )
        const expectedValues = [
            "./assets/layers/bike_repair_station/repair_station.svg",
            "./assets/layers/bike_repair_station/repair_station_pump.svg",
            "./assets/layers/bike_repair_station/broken_pump.svg",
            "./assets/layers/bike_repair_station/pump.svg",
            "./assets/themes/cyclofix/fietsambassade_gent_logo_small.svg",
            "./assets/layers/bike_repair_station/pump_example_manual.jpg",
            "./assets/layers/bike_repair_station/pump_example.png",
            "./assets/layers/bike_repair_station/pump_example_round.jpg",
            "./assets/layers/bike_repair_station/repair_station_example_2.jpg",
            "close",
        ]
        for (const expected of expectedValues) {
            if (!images.has(expected)) {
                expect.fail(
                    "Image " + expected + " not found (has:" + Array.from(images).join(",") + ")"
                )
            }
        }
    })
})
