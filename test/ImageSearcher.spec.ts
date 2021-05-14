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
export default class ImageSearcherSpec extends T {

    constructor() {
        super("ImageSearcher", [
            [
                "Should find images",
                () => {
                    const tags = new UIEventSource({
                        "mapillary": "https://www.mapillary.com/app/?pKey=bYH6FFl8LXAPapz4PNSh3Q"
                    });
                    const searcher = ImageSearcher.construct(tags)
                    const result = searcher.data[0];
                    equal(result.url, "https://www.mapillary.com/map/im/bYH6FFl8LXAPapz4PNSh3Q");
                }
            ]


        ]);
        
    }


}
