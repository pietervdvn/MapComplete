import {UIEventSource} from "../UI/UIEventSource";
import {UIElement} from "../UI/UIElement";

export class LocalStorageSource {

    static Get(key: string, defaultValue: string = undefined): UIEventSource<string> {

        if (UIElement.runningFromConsole) {

            // ignore when running from the console
            return new UIEventSource<string>(defaultValue);
        }
        

        const saved = localStorage.getItem(key);
        const source = new UIEventSource<string>(saved ?? defaultValue);

        source.addCallback((data) => {
            localStorage.setItem(key, data);
            console.log("Wriging ", key, data)
        });
        return source;
    }
}