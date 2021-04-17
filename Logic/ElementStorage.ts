/**
 * Keeps track of a dictionary 'elementID' -> UIEventSource<tags>
 */
import {UIEventSource} from "./UIEventSource";

export class ElementStorage {

    private _elements = new Map<string, UIEventSource<any>>();

    constructor() {

    }

    addElementById(id: string, eventSource: UIEventSource<any>) {
        this._elements.set(id, eventSource);
    }

    /**
     * Creates a UIEventSource for the tags of the given feature.
     * If an UIEventsource has been created previously, the same UIEventSource will be returned
     *
     * Note: it will cleverly merge the tags, if needed
     */
    addOrGetElement(feature: any): UIEventSource<any> {
        const elementId = feature.properties.id;
        if (this._elements.has(elementId)) {
            const es = this._elements.get(elementId);
            if (es.data == feature.properties) {
                // Reference comparison gives the same object! we can just return the event source
                return es;
            }

            const keptKeys = es.data;
            // The element already exists
            // We add all the new keys to the old keys
            let somethingChanged = false;
            for (const k in feature.properties) {
                const v = feature.properties[k];
                if (keptKeys[k] !== v) {
                    keptKeys[k] = v;
                    somethingChanged = true;
                }
            }
            if (somethingChanged) {
                es.ping();
            }

            return es;
        } else {
            const eventSource = new UIEventSource<any>(feature.properties, "tags of " + feature.properties.id);
            this._elements.set(feature.properties.id, eventSource);
            return eventSource;
        }
    }

    getEventSourceById(elementId): UIEventSource<any> {
        if (this._elements.has(elementId)) {
            return this._elements.get(elementId);
        }
        console.error("Can not find eventsource with id ", elementId);
        return undefined;
    }

    has(id) {
        return this._elements.has(id);
    }
}