/**
 * Keeps track of a dictionary 'elementID' -> UIEventSource<tags>
 */
import {UIEventSource} from "./UIEventSource";

export class ElementStorage {

    private _elements = [];

    constructor() {

    }

    addElementById(id: string, eventSource: UIEventSource<any>) {
        this._elements[id] = eventSource;
    }

    addElement(element): UIEventSource<any> {
        const eventSource = new UIEventSource<any>(element.properties);
        this._elements[element.properties.id] = eventSource;
        return eventSource;
    }

    addOrGetElement(element: any) : UIEventSource<any>{
        const elementId = element.properties.id;
        if (elementId in this._elements) {
            const es = this._elements[elementId];
            const keptKeys = es.data;
            // The element already exists
            // We add all the new keys to the old keys
            for (const k in element.properties) {
                const v = element.properties[k];
                if (keptKeys[k] !== v) {
                    keptKeys[k] = v;
                    es.ping();
                }
            }

            return es;
        }else{
            return this.addElement(element);
        }
    }

    getEventSourceById(elementId): UIEventSource<any> {
        if (elementId in this._elements) {
            return this._elements[elementId];
        }
        console.error("Can not find eventsource with id ", elementId);
    }

    getEventSourceFor(feature): UIEventSource<any> {
        return this.getEventSourceById(feature.properties.id);
    }
}