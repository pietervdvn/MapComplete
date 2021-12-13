import T from "./TestHelper";
import {Utils} from "../Utils";
import * as assert from "assert";
import {LayoutConfigJson} from "../Models/ThemeConfig/Json/LayoutConfigJson";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";

export default class ThemeSpec extends T {
    constructor() {
        super("theme",
            [
                ["Nested overrides work", () => {

                    const themeConfigJson: LayoutConfigJson = {
                        description: "Descr",
                        icon: "",
                        language: ["en"],
                        layers: [
                            {
                                builtin: "public_bookcase",
                                override: {
                                    source: {
                                        geoJson: "xyz"
                                    }
                                }
                            }
                        ],
                        maintainer: "",
                        startLat: 0,
                        startLon: 0,
                        startZoom: 0,
                        title: {
                            en: "Title"
                        },
                        version: "",
                        id: "test"
                    }

                    const themeConfig = new LayoutConfig(themeConfigJson);
                    assert.equal("xyz", themeConfig.layers[0].source.geojsonSource)


                }]
            ]);
    }
}
