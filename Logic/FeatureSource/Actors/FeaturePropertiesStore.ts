import { FeatureSource, IndexedFeatureSource } from "../FeatureSource"
import { UIEventSource } from "../../UIEventSource"

/**
 * Constructs a UIEventStore for the properties of every Feature, indexed by id
 */
export default class FeaturePropertiesStore {
    private readonly _elements = new Map<string, UIEventSource<Record<string, string>>>()

    constructor(...sources: FeatureSource[]) {
        for (const source of sources) {
            this.trackFeatureSource(source)
        }
    }

    public getStore(id: string): UIEventSource<Record<string, string>> {
        return this._elements.get(id)
    }

    public trackFeatureSource(source: FeatureSource) {
        const self = this
        source.features.addCallbackAndRunD((features) => {
            console.log("Re-indexing features")
            for (const feature of features) {
                const id = feature.properties.id
                if (id === undefined) {
                    console.trace("Error: feature without ID:", feature)
                    throw "Error: feature without ID"
                }

                const source = self._elements.get(id)
                if (source === undefined) {
                    console.log("Adding feature store for", id)
                    self._elements.set(id, new UIEventSource<any>(feature.properties))
                    continue
                }

                if (source.data === feature.properties) {
                    continue
                }

                // Update the tags in the old store and link them
                const changeMade = FeaturePropertiesStore.mergeTags(source.data, feature.properties)
                feature.properties = source.data
                if (changeMade) {
                    source.ping()
                }
            }
        })
    }

    /**
     * Overwrites the tags of the old properties object, returns true if a change was made.
     * Metatags are overriden if they are in the new properties, but not removed
     * @param oldProperties
     * @param newProperties
     * @private
     */
    private static mergeTags(
        oldProperties: Record<string, any>,
        newProperties: Record<string, any>
    ): boolean {
        let changeMade = false

        for (const oldPropertiesKey in oldProperties) {
            // Delete properties from the old record if it is not in the new store anymore
            if (oldPropertiesKey.startsWith("_")) {
                continue
            }
            if (newProperties[oldPropertiesKey] === undefined) {
                changeMade = true
                delete oldProperties[oldPropertiesKey]
            }
        }

        // Copy all properties from the new record into the old
        for (const newPropertiesKey in newProperties) {
            const v = newProperties[newPropertiesKey]
            if (oldProperties[newPropertiesKey] !== v) {
                oldProperties[newPropertiesKey] = v
                changeMade = true
            }
        }

        return changeMade
    }

    // noinspection JSUnusedGlobalSymbols
    public addAlias(oldId: string, newId: string): void {
        if (newId === undefined) {
            // We removed the node/way/relation with type 'type' and id 'oldId' on openstreetmap!
            const element = this._elements.get(oldId)
            element.data._deleted = "yes"
            element.ping()
            return
        }

        if (oldId == newId) {
            return
        }
        const element = this._elements.get(oldId)
        if (element === undefined) {
            // Element to rewrite not found, probably a node or relation that is not rendered
            return
        }
        element.data.id = newId
        this._elements.set(newId, element)
        element.ping()
    }

    has(id: string) {
        return this._elements.has(id)
    }
}
