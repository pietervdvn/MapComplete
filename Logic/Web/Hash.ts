import {UIEventSource} from "../UIEventSource";

export default class Hash {
    
    public static hash : UIEventSource<string> = Hash.Get();
    
    private static Get() : UIEventSource<string>{
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