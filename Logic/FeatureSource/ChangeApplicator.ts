import FeatureSource from "./FeatureSource";
import {UIEventSource} from "../UIEventSource";
import {Changes} from "../Osm/Changes";
import {ChangeDescription} from "../Osm/Actions/ChangeDescription";
import {Utils} from "../../Utils";
import {OsmNode, OsmRelation, OsmWay} from "../Osm/OsmObject";

/**
 * Applies changes from 'Changes' onto a featureSource
 */
export default class ChangeApplicator implements FeatureSource {
    public readonly features: UIEventSource<{ feature: any; freshness: Date }[]>;
    public readonly name: string;

    constructor(source: FeatureSource, changes: Changes) {

        this.name = "ChangesApplied(" + source.name + ")"
        this.features = source.features

        source.features.addCallbackAndRunD(features => {
            ChangeApplicator.ApplyChanges(features, changes.pendingChanges.data)
        })

        changes.pendingChanges.addCallbackAndRunD(changes => {
            ChangeApplicator.ApplyChanges(source.features.data, changes)
            source.features.ping()
        })


    }


    private static ApplyChanges(features: { feature: any, freshness: Date }[], cs: ChangeDescription[]) {
        if (cs.length === 0 || features === undefined) {
            return features;
        }

        const changesPerId: Map<string, ChangeDescription[]> = new Map<string, ChangeDescription[]>()
        for (const c of cs) {
            const id = c.type + "/" + c.id
            if (!changesPerId.has(id)) {
                changesPerId.set(id, [])
            }
            changesPerId.get(id).push(c)
        }


        const now = new Date()

        function add(feature) {
            features.push({
                feature: feature,
                freshness: now
            })
        }

        // First, create the new features - they have a negative ID
        // We don't set the properties yet though
        changesPerId.forEach(cs => {
            cs.forEach(change => {
                if (change.id >= 0) {
                    return; // Nothing to do here, already created
                }


                try {

                    switch (change.type) {
                        case "node":
                            const n = new OsmNode(change.id)
                            n.lat = change.changes["lat"]
                            n.lon = change.changes["lon"]
                            const geojson = n.asGeoJson()
                            add(geojson)
                            break;
                        case "way":
                            const w = new OsmWay(change.id)
                            w.nodes = change.changes["nodes"]
                            add(w.asGeoJson())
                            break;
                        case "relation":
                            const r = new OsmRelation(change.id)
                            r.members = change.changes["members"]
                            add(r.asGeoJson())
                            break;
                    }

                } catch (e) {
                    console.error(e)
                }
            })
        })


        for (const feature of features) {
            const id = feature.feature.properties.id;
            const f = feature.feature;
            if (!changesPerId.has(id)) {
                continue;
            }


            const changed = {}
            // Copy all the properties
            Utils.Merge(f, changed)
            // play the changes onto the copied object

            for (const change of changesPerId.get(id)) {
                for (const kv of change.tags ?? []) {
                    // Apply tag changes and ping the consumers
                    const k = kv.k
                    let v = kv.v
                    if (v === "") {
                        v = undefined;
                    }
                    f.properties[k] = v;
                }

                // Apply other changes to the object
                if (change.changes !== undefined) {
                    switch (change.type) {
                        case "node":
                            // @ts-ignore
                            const coor: { lat, lon } = change.changes;
                            f.geometry.coordinates = [[coor.lon, coor.lat]]
                            break;
                        case "way":
                            f.geometry.coordinates = change.changes["locations"]
                            break;
                        case "relation":
                            console.error("Changes to relations are not yet supported")
                            break;
                    }
                }
            }
        }
    }
}