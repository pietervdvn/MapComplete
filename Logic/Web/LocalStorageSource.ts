import {UIEventSource} from "../UIEventSource";

export class LocalStorageSource {

    static Get(key: string, defaultValue: string = undefined): UIEventSource<string> {
        try {
            const saved = localStorage.getItem(key);
            const source = new UIEventSource<string>(saved ?? defaultValue);

            source.addCallback((data) => {
                localStorage.setItem(key, data);
            });
            return source;
        } catch (e) {
            return new UIEventSource<string>(defaultValue);
        }
    }
}
