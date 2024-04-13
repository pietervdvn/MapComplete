import { FeatureSource } from "../FeatureSource"
import { UIEventSource } from "../../UIEventSource"
import { OsmTags } from "../../../Models/OsmFeature"

/**
 * Constructs a UIEventStore for the properties of every Feature, indexed by id
 */
export default class FeaturePropertiesStore {
    private readonly _elements = new Map<string, UIEventSource<Record<string, string>>>()
    public readonly aliases = new Map<string, string>()
    constructor(...sources: FeatureSource[]) {
        for (const source of sources) {
            this.trackFeatureSource(source)
        }
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
                //  delete oldProperties[oldPropertiesKey]
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

    public getStore(id: string): UIEventSource<Record<string, string>> {
        const store = this._elements.get(id)
        if (store === undefined) {
            console.error("PANIC: no store for", id)
        }
        return store
    }

    public trackFeature(feature: { properties: OsmTags }) {
        const id = feature.properties.id
        if (id === undefined) {
            console.trace("Error: feature without ID:", feature)
            throw "Error: feature without ID"
        }

        const source = this._elements.get(id)
        if (source === undefined) {
            this._elements.set(id, new UIEventSource<any>(feature.properties))
            return
        }

        if (source.data === feature.properties) {
            return
        }

        // Update the tags in the old store and link them
        const changeMade = FeaturePropertiesStore.mergeTags(source.data, feature.properties)
        feature.properties = <any>source.data
        if (changeMade) {
            source.ping()
        }
    }

    public trackFeatureSource(source: FeatureSource) {
        const self = this
        source.features.addCallbackAndRunD((features) => {
            for (const feature of features) {
                self.trackFeature(<any>feature)
            }
        })
    }

    public addAlias(oldId: string, newId: string): void {
        if (newId === undefined) {
            // We removed the node/way/relation with type 'type' and id 'oldId' on openstreetmap!
            const element = this._elements.get(oldId)
            if (!element || element.data === undefined) {
                return
            }
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
        this.aliases.set(newId, oldId)
        element.ping()
    }

    has(id: string) {
        return this._elements.has(id)
    }
}
