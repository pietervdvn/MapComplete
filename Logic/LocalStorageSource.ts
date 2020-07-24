import {UIEventSource} from "../UI/UIEventSource";

export class LocalStorageSource {

    static Get(key: string, defaultValue: string = undefined): UIEventSource<string> {
        const saved = localStorage.getItem(key);
        const source = new UIEventSource<string>(saved ?? defaultValue);

        source.addCallback((data) => {
            localStorage.setItem(key, data);
            console.log("Wriging ", key, data)
        });
        return source;
    }
}