import {UIEventSource} from "../UIEventSource";

/**
 * UIEventsource-wrapper around localStorage
 */
export class LocalStorageSource {

    static Get(key: string, defaultValue: string = undefined): UIEventSource<string> {
        try {
            const saved = localStorage.getItem(key);
            const source = new UIEventSource<string>(saved ?? defaultValue, "localstorage:"+key);

            source.addCallback((data) => {
                try{
                    localStorage.setItem(key, data);
                }catch(e){
                    // Probably exceeded the quota with this item!
                    // Lets nuke everything
                    localStorage.clear()
                }
                
            });
            return source;
        } catch (e) {
            return new UIEventSource<string>(defaultValue);
        }
    }
}
