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
import {ImageSearcher} from "../Logic/Actors/ImageSearcher";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import AllKnownLayers from "../Customizations/AllKnownLayers";
import LayerConfig from "../Customizations/JSON/LayerConfig";

export default class ImageAttributionSpec extends T {
    constructor() {
        super(
            "ImageAttribution Tests", [
                [
                    "Should find all the images",
                    () => {
                        const pumps: LayerConfig = AllKnownLayers.sharedLayers["bike_repair_station"]
                        const images = pumps.ExtractImages();
                        const expectedValues = ['./assets/layers/bike_repair_station/repair_station.svg',
                            './assets/layers/bike_repair_station/repair_station_pump.svg',
                            './assets/layers/bike_repair_station/broken_pump_2.svg',
                            './assets/layers/bike_repair_station/pump.svg',
                            './assets/themes/cyclofix/fietsambassade_gent_logo_small.svg',
                            './assets/layers/bike_repair_station/pump_example_manual.jpg',
                            './assets/layers/bike_repair_station/pump_example.png',
                            './assets/layers/bike_repair_station/pump_example_round.jpg',
                            './assets/layers/bike_repair_station/repair_station_example.jpg']
                        for (const expected of expectedValues) {
                            T.isTrue(images.has(expected), expected + " not found")
                        }
                    }
                ],
                [
                    "Test image discovery regex",
                    () => {
                        const tr = new Translation({en: "XYZ <img src='a.svg'/> XYZ <img src=\"some image.svg\"></img> XYZ <img src=b.svg/>"})
                        const images = new Set<string>(tr.ExtractImages(false));
                        equal(3, images.size)
                        T.isTrue(images.has("a.svg"), "a.svg not found")
                        T.isTrue(images.has("b.svg"), "b.svg not found")
                        T.isTrue(images.has("some image.svg"), "some image.svg not found")

                    }
                ]


            ]);
    }
}