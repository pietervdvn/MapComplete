import { Changes } from "../../Osm/Changes"
import { OsmNode, OsmRelation, OsmWay } from "../../Osm/OsmObject"
import { IndexedFeatureSource, WritableFeatureSource } from "../FeatureSource"
import { UIEventSource } from "../../UIEventSource"
import { ChangeDescription } from "../../Osm/Actions/ChangeDescription"
import { OsmId, OsmTags } from "../../../Models/OsmFeature"
import { Feature, Point } from "geojson"
import { TagUtils } from "../../Tags/TagUtils"
import FeaturePropertiesStore from "../Actors/FeaturePropertiesStore"

export class NewGeometryFromChangesFeatureSource implements WritableFeatureSource {
    // This class name truly puts the 'Java' into 'Javascript'

    /**
     * A feature source containing exclusively new elements.
     *
     * These elements are probably created by the 'SimpleAddUi' which generates a new point, but the import functionality might create a line or polygon too.
     * Other sources of new points are e.g. imports from nodes
     *
     * Alternatively, an already existing point might suddenly match the layer, especially if a point in a wall is reused
     *
     * Note that the FeaturePropertiesStore will track a featuresource, such as this one
     */
    public readonly features: UIEventSource<Feature[]> = new UIEventSource<Feature[]>([])
    private readonly _seenChanges: Set<ChangeDescription>
    private readonly _features: Feature[]
    private readonly _backend: string
    private readonly _allElementStorage: IndexedFeatureSource
    private _featureProperties: FeaturePropertiesStore

    constructor(
        changes: Changes,
        allElementStorage: IndexedFeatureSource,
        featureProperties: FeaturePropertiesStore
    ) {
        this._allElementStorage = allElementStorage
        this._featureProperties = featureProperties
        this._seenChanges = new Set<ChangeDescription>()
        this._features = this.features.data
        this._backend = changes.backend
        const self = this
        changes.pendingChanges.addCallbackAndRunD((changes) => self.handleChanges(changes))
    }

    private addNewFeature(feature: Feature) {
        const features = this._features
        feature.id = feature.properties.id
        features.push(feature)
    }

    /**
     * Handles a single pending change
     * @returns true if something changed
     * @param change
     * @private
     */
    private handleChange(change: ChangeDescription): boolean {
        if (change.changes === undefined) {
            // The geometry is not described - not a new point or geometry change, but probably a tagchange to a newly created point
            // Not something that should be handled here
            return false
        }

        const allElementStorage = this._allElementStorage
        if (change.id > 0) {
            // This is an already existing object
            // In _most_ of the cases, this means that this _isn't_ a new object
            // However, when a point is snapped to an already existing point, we have to create a representation for this point!
            // For this, we introspect the change
            if (allElementStorage.featuresById.data.has(change.type + "/" + change.id)) {
                // The current point already exists, we don't have to do anything here
                return false
            }
            console.debug("Detected a reused point, for", change)
            // The 'allElementsStore' does _not_ have this point yet, so we have to create it
            // However, we already create a store for it
            const { lon, lat } = <{ lon: number; lat: number }>change.changes
            const feature = <Feature<Point, OsmTags>>{
                type: "Feature",
                properties: {
                    id: <OsmId>change.type + "/" + change.id,
                    ...TagUtils.changeAsProperties(change.tags),
                },
                geometry: {
                    type: "Point",
                    coordinates: [lon, lat],
                },
            }
            this._featureProperties.trackFeature(feature)
            this.addNewFeature(feature)
            return true
        }

        try {
            const tags: OsmTags & { id: OsmId & string } = {
                id: <OsmId & string>(change.type + "/" + change.id),
            }
            for (const kv of change.tags) {
                tags[kv.k] = kv.v
            }

            tags["_backend"] = this._backend

            switch (change.type) {
                case "node":
                    const n = new OsmNode(change.id)
                    n.tags = tags
                    n.lat = change.changes["lat"]
                    n.lon = change.changes["lon"]
                    const geojson = n.asGeoJson()
                    this.addNewFeature(geojson)
                    break
                case "way":
                    const w = new OsmWay(change.id)
                    w.tags = tags
                    w.nodes = change.changes["nodes"]
                    w.coordinates = change.changes["coordinates"].map(([lon, lat]) => [lat, lon])
                    this.addNewFeature(w.asGeoJson())
                    break
                case "relation":
                    const r = new OsmRelation(change.id)
                    r.tags = tags
                    r.members = change.changes["members"]
                    this.addNewFeature(r.asGeoJson())
                    break
            }
            return true
        } catch (e) {
            console.error("Could not generate a new geometry to render on screen for:", e)
        }
    }

    private handleChanges(changes: ChangeDescription[]) {
        const seenChanges = this._seenChanges
        if (changes.length === 0) {
            return
        }

        let somethingChanged = false

        for (const change of changes) {
            if (seenChanges.has(change)) {
                // Already handled
                continue
            }
            seenChanges.add(change)

            if (change.tags === undefined) {
                // If tags is undefined, this is probably a new point that is part of a split road
                continue
            }

            somethingChanged = this.handleChange(change) || somethingChanged // important: _first_ evaluate the method, to avoid shortcutting
        }
        if (somethingChanged) {
            this.features.ping()
        }
    }
}
