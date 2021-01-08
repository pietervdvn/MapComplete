import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../../UI/UIElement";

export default class HistoryHandling {

    constructor(hash: UIEventSource<string>, fullscreenMessage: UIEventSource<{ content: UIElement, hashText: string }>) {
        hash.addCallback(h => {
            if (h === undefined || h === "") {
                fullscreenMessage.setData(undefined);
            }
        })
        
        fullscreenMessage.addCallback(fs => {
            hash.setData(fs?.hashText);
        })
        
    }

}