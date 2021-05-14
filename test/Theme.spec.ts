import T from "./TestHelper";
import {Utils} from "../Utils";

Utils.runningFromConsole = true;
import TagRenderingQuestion from "../UI/Popup/TagRenderingQuestion";
import {UIEventSource} from "../Logic/UIEventSource";
import TagRenderingConfig from "../Customizations/JSON/TagRenderingConfig";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import {LayoutConfigJson} from "../Customizations/JSON/LayoutConfigJson";
import * as assert from "assert";

export default class ThemeSpec extends T{
    constructor() {
        super("Theme tests",
            [
                ["Nested overrides work", () => {

                    const themeConfigJson : LayoutConfigJson = {
                        description: "Descr",
                        icon: "",
                        language: ["en"],
                        layers: [
                            {
                                builtin: "public_bookcase",
                                override: {
                                    source:{
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
