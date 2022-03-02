import {Changes} from "../../Osm/Changes";
import {OsmNode, OsmObject, OsmRelation, OsmWay} from "../../Osm/OsmObject";
import FeatureSource from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import {ChangeDescription} from "../../Osm/Actions/ChangeDescription";
import {ElementStorage} from "../../ElementStorage";

export class NewGeometryFromChangesFeatureSource implements FeatureSource {
    // This class name truly puts the 'Java' into 'Javascript'

    /**
     * A feature source containing exclusively new elements
     */
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name: string = "newFeatures";

    constructor(changes: Changes, allElementStorage: ElementStorage, backendUrl: string) {

        const seenChanges = new Set<ChangeDescription>();
        const features = this.features.data;
        const self = this;

        changes.pendingChanges.stabilized(100).addCallbackAndRunD(changes => {
            if (changes.length === 0) {
                return;
            }

            const now = new Date();
            let somethingChanged = false;

            function add(feature) {
                feature.id = feature.properties.id
                features.push({
                    feature: feature,
                    freshness: now
                })
                somethingChanged = true;
            }

            for (const change of changes) {
                if (seenChanges.has(change)) {
                    // Already handled
                    continue;
                }
                seenChanges.add(change)

                if (change.tags === undefined) {
                    // If tags is undefined, this is probably a new point that is part of a split road
                    continue
                }

                if (change.id > 0) {
                    // This is an already existing object
                    // In _most_ of the cases, this means that this _isn't_ a new object
                    // However, when a point is snapped to an already existing point, we have to create a representation for this point!
                    // For this, we introspect the change
                    if (allElementStorage.has(change.type + "/" + change.id)) {
                        // The current point already exists, we don't have to do anything here
                        continue;
                    }
                    console.debug("Detected a reused point")
                    // The 'allElementsStore' does _not_ have this point yet, so we have to create it
                    OsmObject.DownloadObjectAsync(change.type + "/" + change.id).then(feat => {
                        console.log("Got the reused point:", feat)
                        for (const kv of change.tags) {
                            feat.tags[kv.k] = kv.v
                        }
                        const geojson = feat.asGeoJson();
                        allElementStorage.addOrGetElement(geojson)
                        self.features.data.push({feature: geojson, freshness: new Date()})
                        self.features.ping()
                    })
                    continue


                } else if (change.id < 0 && change.changes === undefined) {
                    // The geometry is not described - not a new point
                    if (change.id < 0) {
                        console.error("WARNING: got a new point without geometry!")
                    }
                    continue;
                }


                try {
                    const tags = {}
                    for (const kv of change.tags) {
                        tags[kv.k] = kv.v
                    }
                    tags["id"] = change.type + "/" + change.id

                    tags["_backend"] = backendUrl

                    switch (change.type) {
                        case "node":
                            const n = new OsmNode(change.id)
                            n.tags = tags
                            n.lat = change.changes["lat"]
                            n.lon = change.changes["lon"]
                            const geojson = n.asGeoJson()
                            add(geojson)
                            break;
                        case "way":
                            const w = new OsmWay(change.id)
                            w.tags = tags
                            w.nodes = change.changes["nodes"]
                            w.coordinates = change.changes["coordinates"].map(([lon, lat]) => [lat, lon])
                            add(w.asGeoJson())
                            break;
                        case "relation":
                            const r = new OsmRelation(change.id)
                            r.tags = tags
                            r.members = change.changes["members"]
                            add(r.asGeoJson())
                            break;
                    }
                } catch (e) {
                    console.error("Could not generate a new geometry to render on screen for:", e)
                }

            }
            if (somethingChanged) {
                self.features.ping()
            }
        })
    }

}