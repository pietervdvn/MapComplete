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


new T("ImageAttribution Tests", [
    [
        "Should find all the images",
        () => {
            const pumps = AllKnownLayers.sharedLayers["bike_repair_station"]
            const expected = "./assets/layers/bike_repair_station/pump_example_manual.jpg"
            const images = pumps.ExtractImages();

            equal(images.length, 5, "The pump example was not found")
        }
    ]


])