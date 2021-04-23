import {OsmNode, OsmObject} from "./OsmObject";
import State from "../../State";
import {Utils} from "../../Utils";
import {UIEventSource} from "../UIEventSource";
import Constants from "../../Models/Constants";
import FeatureSource from "../FeatureSource/FeatureSource";
import {TagsFilter} from "../Tags/TagsFilter";
import {Tag} from "../Tags/Tag";

/**
 * Handles all changes made to OSM.
 * Needs an authenticator via OsmConnection
 */
export class Changes implements FeatureSource{

    
    public readonly name = "Newly added features"
    /**
     * The newly created points, as a FeatureSource
     */
    public features = new UIEventSource<{feature: any, freshness: Date}[]>([]);
    
    private static _nextId = -1; // Newly assigned ID's are negative
    /**
     * All the pending changes
     */
    public readonly pending: UIEventSource<{ elementId: string, key: string, value: string }[]> = 
        new UIEventSource<{elementId: string; key: string; value: string}[]>([]);

    /**
     * Adds a change to the pending changes
     */
    private static checkChange(kv: {k: string, v: string}): { k: string, v: string } {
        const key = kv.k;
        const value = kv.v;
        if (key === undefined || key === null) {
            console.log("Invalid key");
            return undefined;
        }
        if (value === undefined || value === null) {
            console.log("Invalid value for ", key);
            return undefined;
        }

        if (key.startsWith(" ") || value.startsWith(" ") || value.endsWith(" ") || key.endsWith(" ")) {
            console.warn("Tag starts with or ends with a space - trimming anyway")
        }

        return {k: key.trim(), v: value.trim()};
    }

    
    
    addTag(elementId: string, tagsFilter: TagsFilter,
           tags?: UIEventSource<any>) {
        const eventSource = tags ?? State.state?.allElements.getEventSourceById(elementId);
        const elementTags = eventSource.data;
        const changes = tagsFilter.asChange(elementTags).map(Changes.checkChange)
        if (changes.length == 0) {
            return;
        }
      
        for (const change of changes) {
            if (elementTags[change.k] !== change.v) {
                elementTags[change.k] = change.v;
                console.log("Applied ", change.k, "=", change.v)
                this.pending.data.push({elementId: elementTags.id, key: change.k, value: change.v});
            }
        }
        this.pending.ping();
        eventSource.ping();
    }

    /**
     * Uploads all the pending changes in one go.
     * Triggered by the 'PendingChangeUploader'-actor in Actors
     */
    public flushChanges(flushreason: string = undefined){
        if(this.pending.data.length === 0){
            return;
        }
        if(flushreason !== undefined){
            console.log(flushreason)
        }
        this.uploadAll([], this.pending.data);
        this.pending.setData([]);
    }
    /**
     * Create a new node element at the given lat/long.
     * An internal OsmObject is created to upload later on, a geojson represention is returned.
     * Note that the geojson version shares the tags (properties) by pointer, but has _no_ id in properties
     */
    public createElement(basicTags: Tag[], lat: number, lon: number) {
        console.log("Creating a new element with ", basicTags)
        const osmNode = new OsmNode(Changes._nextId);
        Changes._nextId--;

        const id = "node/" + osmNode.id;
        osmNode.lat = lat;
        osmNode.lon = lon;
        const properties = {id: id};

        const geojson = {
            "type": "Feature",
            "properties": properties,
            "id": id,
            "geometry": {
                "type": "Point",
                "coordinates": [
                    lon,
                    lat
                ]
            }
        }

        // The basictags are COPIED, the id is included in the properties
        // The tags are not yet written into the OsmObject, but this is applied onto a 
        const changes = [];
        for (const kv of basicTags) {
            properties[kv.key] = kv.value;
            if (typeof kv.value !== "string") {
                throw "Invalid value: don't use a regex in a preset"
            }
            changes.push({elementId: id, key: kv.key, value: kv.value})
        }
       
        console.log("New feature added and pinged")
        this.features.data.push({feature:geojson, freshness: new Date()});
        this.features.ping();
        
        State.state.allElements.addOrGetElement(geojson).ping();

        this.uploadAll([osmNode], changes);
        return geojson;
    }

    private uploadChangesWithLatestVersions(
        knownElements, newElements: OsmObject[], pending: { elementId: string; key: string; value: string }[]) {
        // Here, inside the continuation, we know that all 'neededIds' are loaded in 'knownElements', which maps the ids onto the elements
        // We apply the changes on them
        for (const change of pending) {
            if (parseInt(change.elementId.split("/")[1]) < 0) {
                // This is a new element - we should apply this on one of the new elements
                for (const newElement of newElements) {
                    if (newElement.type + "/" + newElement.id === change.elementId) {
                        newElement.addTag(change.key, change.value);
                    }
                }

            } else {
                knownElements[change.elementId].addTag(change.key, change.value);
            }
        }

        // Small sanity check for duplicate information
        let changedElements = [];
        for (const elementId in knownElements) {
            const element = knownElements[elementId];
            if (element.changed) {
                changedElements.push(element);
            }
        }
        if (changedElements.length == 0 && newElements.length == 0) {
            console.log("No changes in any object");
            return;
        }

        console.log("Beginning upload...");
        // At last, we build the changeset and upload
        State.state.osmConnection.UploadChangeset(
            State.state.layoutToUse.data,
            State.state.allElements,
            function (csId) {

                let modifications = "";
                for (const element of changedElements) {
                    if (!element.changed) {
                        continue;
                    }
                    modifications += element.ChangesetXML(csId) + "\n";
                }


                let creations = "";
                for (const newElement of newElements) {
                    creations += newElement.ChangesetXML(csId);
                }


                let changes = `<osmChange version='0.6' generator='Mapcomplete ${Constants.vNumber}'>`;

                if (creations.length > 0) {
                    changes +=
                        "<create>" +
                        creations +
                        "</create>";
                }

                if (modifications.length > 0) {
                    changes +=
                        "<modify>\n" +
                        modifications +
                        "\n</modify>";
                }

                changes += "</osmChange>";

                return changes;
            });
    };


    private uploadAll(
        newElements: OsmObject[],
        pending: { elementId: string; key: string; value: string }[]
    ) {
        const self = this;


        let neededIds: string[] = [];
        for (const change of pending) {
            const id = change.elementId;
            if (parseFloat(id.split("/")[1]) < 0) {
                // New element - we don't have to download this
            } else {
                neededIds.push(id);
            }
        }

        neededIds = Utils.Dedup(neededIds);
        OsmObject.DownloadAll(neededIds, {}, (knownElements) => {
            self.uploadChangesWithLatestVersions(knownElements, newElements, pending)
        });
    }

}