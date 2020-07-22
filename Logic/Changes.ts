/**
 * Handles all changes made to OSM.
 * Needs an authenticator via OsmConnection
 */
import {OsmConnection} from "./OsmConnection";
import {OsmNode, OsmObject} from "./OsmObject";
import {ElementStorage} from "./ElementStorage";
import {UIEventSource} from "../UI/UIEventSource";
import {And, Tag, TagsFilter} from "./TagsFilter";

export class Changes {

    private static _nextId = -1; // New assined ID's are negative

    public readonly login: OsmConnection;
    public readonly _allElements: ElementStorage;

    private _pendingChanges: { elementId: string, key: string, value: string }[] = []; // Gets reset on uploadAll
    private newElements: OsmObject[] = []; // Gets reset on uploadAll

    public readonly pendingChangesES = new UIEventSource<number>(this._pendingChanges.length);
    public readonly isSaving = new UIEventSource(false);
    private readonly _changesetComment: string;

    constructor(
        changesetComment: string,
        login: OsmConnection,
        allElements: ElementStorage) {
        this._changesetComment = changesetComment;
        this.login = login;
        this._allElements = allElements;
    }

    addTag(elementId: string, tagsFilter : TagsFilter){
        if(tagsFilter instanceof  Tag){
            const tag = tagsFilter as Tag;
            this.addChange(elementId, tag.key, tag.value);
            return;
        }
        
        if(tagsFilter instanceof And){
            const and = tagsFilter as And;
            for (const tag of and.and) {
                this.addTag(elementId, tag);
            }
            return;
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
    addChange(elementId: string, key: string, value: string) {
console.log("Received change",key, value)
        if (key === undefined || key === null) {
            console.log("Invalid key");
            return;
        }
        if (value === undefined || value === null) {
            console.log("Invalid value for ",key);
            return;
        }

        const eventSource = this._allElements.getElement(elementId);

        eventSource.data[key] = value;
        eventSource.ping();
        // We get the id from the event source, as that ID might be rewritten
        this._pendingChanges.push({elementId: eventSource.data.id, key: key, value: value});
        this.pendingChangesES.setData(this._pendingChanges.length);


    }

    /**
     * Create a new node element at the given lat/long.
     * An internal OsmObject is created to upload later on, a geojson represention is returned.
     * Note that the geojson version shares the tags (properties) by pointer, but has _no_ id in properties
     */
    createElement(basicTags:Tag[], lat: number, lon: number) {
        const osmNode = new OsmNode(Changes._nextId);
        this.newElements.push(osmNode);
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
        this._allElements.addOrGetElement(geojson);

        // The basictags are COPIED, the id is included in the properties
        // The tags are not yet written into the OsmObject, but this is applied onto a 
        for (const kv of basicTags) {
            this.addChange(id, kv.key, kv.value); // We use the call, to trigger all the other machinery (including updating the geojson itsel
            properties[kv.key] = kv.value;
        }

        return geojson;
    }

    public uploadAll(optionalContinuation: (() => void) = undefined) {
        const self = this;

        this.isSaving.setData(true);
        const optionalContinuationWrapped = function () {
            self.isSaving.setData(false);
            if (optionalContinuation) {
                optionalContinuation();
            }
        }


        const pending: { elementId: string; key: string; value: string }[] = this._pendingChanges;
        this._pendingChanges = [];
        this.pendingChangesES.setData(this._pendingChanges.length);

        const newElements = this.newElements;
        this.newElements = [];


        const knownElements = {}; // maps string --> OsmObject
        function DownloadAndContinue(neededIds, continuation: (() => void)) {
            // local function which downloads all the objects one by one
            // this is one big loop, running one download, then rerunning the entire function
            if (neededIds.length == 0) {
                continuation();
                return;
            }
            const neededId = neededIds.pop();

            if (neededId in knownElements) {
                DownloadAndContinue(neededIds, continuation);
                return;
            }

            console.log("Downloading ", neededId);
            OsmObject.DownloadObject(neededId,
                function (element) {
                    knownElements[neededId] = element; // assign the element for later, continue downloading the next element
                    DownloadAndContinue(neededIds, continuation);
                }
            );
        }

        const neededIds = [];
        for (const change of pending) {
            const id = change.elementId;
            if (parseFloat(id.split("/")[1]) < 0) {
                console.log("Detected a new element! Exciting!")
            } else {
                neededIds.push(id);
            }
        }


        DownloadAndContinue(neededIds, function () {
            // Here, inside the continuation, we know that all 'neededIds' are loaded in 'knownElements'
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
                    console.log(knownElements, change.elementId);
                    knownElements[change.elementId].addTag(change.key, change.value);
                    // note: addTag will flag changes with 'element.changed' internally
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


            const handleMapping = function (idMapping) {
                for (const oldId in idMapping) {
                    const newId = idMapping[oldId];

                    const element = self._allElements.getElement(oldId);
                    element.data.id = newId;
                    self._allElements.addElementById(newId, element);
                    element.ping();
                }
            }

            console.log("Beginning upload...");
            // At last, we build the changeset and upload
            self.login.UploadChangeset(self._changesetComment,
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


                    let changes = "<osmChange version='0.6' generator='Mapcomplete 0.0.1'>";

                    if (creations.length > 0) {
                        changes +=
                            "<create>" +
                            creations +
                            "</create>";
                    }

                    if (modifications.length > 0) {

                        changes +=
                            "<modify>" +
                            modifications +
                            "</modify>";
                    }

                    changes += "</osmChange>";

                    return changes;
                },
                handleMapping,
                optionalContinuationWrapped);
        });
    }
    
    public asQuestions(qs : QuestionDefinition[]){
        let ls = [];
        for (var i in qs){
            ls.push(new Question(this, qs[i]));
        } 
        return ls;
    }
}