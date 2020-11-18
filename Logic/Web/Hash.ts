import {UIEventSource} from "../UIEventSource";

export default class Hash {
    
    public static Get() : UIEventSource<string>{
        const hash = new UIEventSource<string>(window.location.hash.substr(1));
        hash.addCallback(h => {
            h = h.replace(/\//g, "_");
            return window.location.hash = "#" + h;
        });
        window.onhashchange = () => {
            hash.setData(window.location.hash.substr(1))
        }
        
        return hash;
    }
    
}