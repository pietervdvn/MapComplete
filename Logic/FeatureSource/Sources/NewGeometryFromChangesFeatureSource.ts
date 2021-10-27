import {Changes} from "../../Osm/Changes";
import {OsmNode, OsmRelation, OsmWay} from "../../Osm/OsmObject";
import FeatureSource from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import {ChangeDescription} from "../../Osm/Actions/ChangeDescription";
import State from "../../../State";

export class NewGeometryFromChangesFeatureSource implements FeatureSource {
    // This class name truly puts the 'Java' into 'Javascript'
    
    /**
     * A feature source containing exclusively new elements
     */
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]> = new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name: string = "newFeatures";

    constructor(changes: Changes) {

        const seenChanges = new Set<ChangeDescription>();
        const features = this.features.data;
        const self = this;

        changes.pendingChanges
            .map(changes => changes.filter(ch =>
                // only new objects allowed
                ch.id < 0 &&
                // The change is an update to the object (e.g. tags or geometry) - not the actual create
                ch.changes !== undefined &&
                // If tags is undefined, this is probably a new point that is part of a split road
                ch.tags !== undefined &&
                // Already handled
                !seenChanges.has(ch)))
            .addCallbackAndRunD(changes => {
                if (changes.length === 0) {
                    return;
                }

                const now = new Date();

                function add(feature) {
                    feature.id = feature.properties.id
                    features.push({
                        feature: feature,
                        freshness: now
                    })
                    console.warn("Added a new feature: ", JSON.stringify(feature))
                }

                for (const change of changes) {
                    seenChanges.add(change)
                    try {
                        const tags = {}
                        for (const kv of change.tags) {
                            tags[kv.k] = kv.v
                        }
                        tags["id"] = change.type+"/"+change.id
                        
                        tags["_backend"] = State.state.osmConnection._oauth_config.url
                        
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
                                w.coordinates = change.changes["coordinates"].map(coor => coor.reverse())
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
                
                self.features.ping()
            })
    }

}