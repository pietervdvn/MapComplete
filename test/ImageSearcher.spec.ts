import {Utils} from "../Utils";
import {equal} from "assert";
import T from "./TestHelper";
import {UIEventSource} from "../Logic/UIEventSource";
import {ImageSearcher} from "../Logic/Actors/ImageSearcher";

Utils.runningFromConsole = true;
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
