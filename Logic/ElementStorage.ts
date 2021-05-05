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
        const newProperties = feature.properties;

        const es = this.addOrGetById(elementId, newProperties)

        // At last, we overwrite the tag of the new feature to use the tags in the already existing event source
        feature.properties = es.data
        return es;
    }

    addOrGetById(elementId: string, newProperties: any): UIEventSource<any> {
        if (!this._elements.has(elementId)) {
            const eventSource = new UIEventSource<any>(newProperties, "tags of " + elementId);
            this._elements.set(elementId, eventSource);
            return eventSource;
        }


        const es = this._elements.get(elementId);
        if (es.data == newProperties) {
            // Reference comparison gives the same object! we can just return the event source
            return es;
        }
        const keptKeys = es.data;
        // The element already exists
        // We use the new feature to overwrite all the properties in the already existing eventsource
        console.log("Merging multiple instances of ", elementId)
        let somethingChanged = false;
        for (const k in newProperties) {
            const v = newProperties[k];
            if (keptKeys[k] !== v) {
                keptKeys[k] = v;
                somethingChanged = true;
            }
        }
        if (somethingChanged) {
            es.ping();
        }
        return es;
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