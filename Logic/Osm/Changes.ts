/**
 * Handles all changes made to OSM.
 * Needs an authenticator via OsmConnection
 */
import {OsmNode, OsmObject} from "./OsmObject";
import {And, Tag, TagsFilter} from "../Tags";
import State from "../../State";
import {Utils} from "../../Utils";
import {UIEventSource} from "../UIEventSource";

export class Changes {

    private static _nextId = -1; // New assined ID's are negative

    addTag(elementId: string, tagsFilter: TagsFilter,
           tags?: UIEventSource<any>) {
        const changes = this.tagToChange(tagsFilter);
        if (changes.length == 0) {
            return;
        }
        const eventSource = tags ?? State.state?.allElements.getEventSourceById(elementId);
        const elementTags = eventSource.data;
        const pending : {elementId:string, key: string, value: string}[] = [];
        for (const change of changes) {
            if (elementTags[change.k] !== change.v) {
                elementTags[change.k] = change.v;
                pending.push({elementId: elementTags.id, key: change.k, value: change.v});
            }
        }
        if(pending.length === 0){
            return;
        }
        console.log("Sending ping",eventSource)
        eventSource.ping();
        this.uploadAll([], pending);
    }


    private tagToChange(tagsFilter: TagsFilter) {
        let changes: { k: string, v: string }[] = [];

        if (tagsFilter instanceof Tag) {
            const tag = tagsFilter as Tag;
            if (typeof tag.value !== "string") {
                throw "Invalid value"
            }
            return [this.checkChange(tag.key, tag.value)];
        }

        if (tagsFilter instanceof And) {
            const and = tagsFilter as And;
            for (const tag of and.and) {
                changes = changes.concat(this.tagToChange(tag));
            }
            return changes;
        }
        console.log("Unsupported tagsfilter element to addTag", tagsFilter);
        throw "Unsupported tagsFilter element";
    }

    /**
     * Adds a change to the pending changes
     * @param elementId
     * @param key
     * @param value
     */
    private checkChange(key: string, value: string): { k: string, v: string } {
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

        key = key.trim();
        value = value.trim();

        return {k: key, v: value};
    }

    /**
     * Create a new node element at the given lat/long.
     * An internal OsmObject is created to upload later on, a geojson represention is returned.
     * Note that the geojson version shares the tags (properties) by pointer, but has _no_ id in properties
     */
    createElement(basicTags:Tag[], lat: number, lon: number) {
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


                let changes = `<osmChange version='0.6' generator='Mapcomplete ${State.vNumber}'>`;

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