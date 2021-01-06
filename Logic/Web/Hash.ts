import {UIEventSource} from "../UIEventSource";
import Constants from "../../Models/Constants";
import {Utils} from "../../Utils";

export default class Hash {
    
    public static hash : UIEventSource<string> = Hash.Get();
    
    private static Get() : UIEventSource<string>{
        if(Utils.runningFromConsole){
            return new UIEventSource<string>(undefined);
        }
        const hash = new UIEventSource<string>(window.location.hash.substr(1));
        hash.addCallback(h => {
            if(h === undefined || h === ""){
                window.location.hash = "";
                return;
            }
            h = h.replace(/\//g, "_");
            window.location.hash = "#" + h;
        });
        window.onhashchange = () => {
            hash.setData(window.location.hash.substr(1))
        }
        
        return hash;
    }
    
}