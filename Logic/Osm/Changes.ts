import {OsmNode, OsmObject, OsmRelation, OsmWay} from "./OsmObject";
import State from "../../State";
import {UIEventSource} from "../UIEventSource";
import Constants from "../../Models/Constants";
import OsmChangeAction from "./Actions/OsmChangeAction";
import {ChangeDescription} from "./Actions/ChangeDescription";
import {Utils} from "../../Utils";
import {LocalStorageSource} from "../Web/LocalStorageSource";

/**
 * Handles all changes made to OSM.
 * Needs an authenticator via OsmConnection
 */
export class Changes {


    private static _nextId = -1; // Newly assigned ID's are negative
    public readonly name = "Newly added features"
    /**
     * All the newly created features as featureSource + all the modified features
     */
    public features = new UIEventSource<{ feature: any, freshness: Date }[]>([]);

    public readonly pendingChanges = LocalStorageSource.GetParsed<ChangeDescription[]>("pending-changes", [])
    private readonly isUploading = new UIEventSource(false);
    
    private readonly previouslyCreated : OsmObject[] = []

    constructor() {
       this.isUploading.addCallbackAndRun(uploading => {
           console.trace("Is uploading changed:", uploading)
       })
    }

    private static createChangesetFor(csId: string,
                                     allChanges: {
                                         modifiedObjects: OsmObject[],
                                         newObjects: OsmObject[],
                                         deletedObjects: OsmObject[]
                                     }): string {

        const changedElements = allChanges.modifiedObjects ?? []
        const newElements = allChanges.newObjects ?? []
        const deletedElements = allChanges.deletedObjects ?? []

        let changes = `<osmChange version='0.6' generator='Mapcomplete ${Constants.vNumber}'>`;
        if (newElements.length > 0) {
            changes +=
                "\n<create>\n" +
                newElements.map(e => e.ChangesetXML(csId)).join("\n") +
                "</create>";
        }
        if (changedElements.length > 0) {
            changes +=
                "\n<modify>\n" +
                changedElements.map(e => e.ChangesetXML(csId)).join("\n") +
                "\n</modify>";
        }

        if (deletedElements.length > 0) {
            changes +=
                "\n<deleted>\n" +
                deletedElements.map(e => e.ChangesetXML(csId)).join("\n") +
                "\n</deleted>"
        }

        changes += "</osmChange>";
        return changes;
    }

    private static GetNeededIds(changes: ChangeDescription[]) {
        return Utils.Dedup(changes.filter(c => c.id >= 0)
            .map(c => c.type + "/" + c.id))
    }

    private CreateChangesetObjects(changes: ChangeDescription[], downloadedOsmObjects: OsmObject[]): {
        newObjects: OsmObject[],
        modifiedObjects: OsmObject[]
        deletedObjects: OsmObject[]

    } {
        const objects: Map<string, OsmObject> = new Map<string, OsmObject>()
        const states: Map<string, "unchanged" | "created" | "modified" | "deleted"> = new Map();

        for (const o of downloadedOsmObjects) {
            objects.set(o.type + "/" + o.id, o)
            states.set(o.type + "/" + o.id, "unchanged")
        }

        for (const o of this.previouslyCreated) {
            objects.set(o.type + "/" + o.id, o) 
            states.set(o.type + "/" + o.id, "unchanged")
        }

        let changed = false;
        for (const change of changes) {
            const id = change.type + "/" + change.id
            if (!objects.has(id)) {
                if(change.id >= 0){
                    throw "Did not get an object that should be known: "+id
                }
                // This is a new object that should be created
                states.set(id, "created")
                console.log("Creating object for changeDescription", change)
                let osmObj: OsmObject = undefined;
                switch (change.type) {
                    case "node":
                        const n = new OsmNode(change.id)
                        n.lat = change.changes["lat"]
                        n.lon = change.changes["lon"]
                        osmObj = n
                        break;
                    case "way":
                        const w = new OsmWay(change.id)
                        w.nodes = change.changes["nodes"]
                        osmObj = w
                        break;
                    case "relation":
                        const r = new OsmRelation(change.id)
                        r.members = change.changes["members"]
                        osmObj = r
                        break;
                }
                if (osmObj === undefined) {
                    throw "Hmm? This is a bug"
                }
                objects.set(id, osmObj)
                this.previouslyCreated.push(osmObj)
            }

            const state = states.get(id)
            if (change.doDelete) {
                if (state === "created") {
                    states.set(id, "unchanged")
                } else {
                    states.set(id, "deleted")
                }
            }

            const obj = objects.get(id)
            // Apply tag changes
            for (const kv of change.tags ?? []) {
                const k = kv.k
                let v = kv.v

                if (v === "") {
                    v = undefined;
                }

                const oldV = obj.type[k]
                if (oldV === v) {
                    continue;
                }

                obj.tags[k] = v;
                changed = true;


            }

            if (change.changes !== undefined) {
                switch (change.type) {
                    case "node":
                        // @ts-ignore
                        const nlat = change.changes.lat;
                        // @ts-ignore
                        const nlon = change.changes.lon;
                        const n = <OsmNode>obj
                        if (n.lat !== nlat || n.lon !== nlon) {
                            n.lat = nlat;
                            n.lon = nlon;
                            changed = true;
                        }
                        break;
                    case "way":
                        const nnodes = change.changes["nodes"]
                        const w = <OsmWay>obj
                        if (!Utils.Identical(nnodes, w.nodes)) {
                            w.nodes = nnodes
                            changed = true;
                        }
                        break;
                    case "relation":
                        const nmembers: { type: "node" | "way" | "relation", ref: number, role: string }[] = change.changes["members"]
                        const r = <OsmRelation>obj
                        if (!Utils.Identical(nmembers, r.members, (a, b) => {
                            return a.role === b.role && a.type === b.type && a.ref === b.ref
                        })) {
                            r.members = nmembers;
                            changed = true;
                        }
                        break;

                }
               
            }

            if (changed && state === "unchanged") {
                states.set(id, "modified")
            }
        }


        const result = {
            newObjects: [],
            modifiedObjects: [],
            deletedObjects: []
        }
        
        objects.forEach((v, id) => {

            const state = states.get(id)
            if (state === "created") {
                result.newObjects.push(v)
            }
            if (state === "modified") {
                result.modifiedObjects.push(v)
            }
            if (state === "deleted") {
                result.deletedObjects.push(v)
            }

        })

        return result
    }

    /**
     * Returns a new ID and updates the value for the next ID
     */
    public getNewID() {
        return Changes._nextId--;
    }

    /**
     * Uploads all the pending changes in one go.
     * Triggered by the 'PendingChangeUploader'-actor in Actors
     */
    public flushChanges(flushreason: string = undefined) {
        if (this.pendingChanges.data.length === 0) {
            return;
        }
        
        if (this.isUploading.data) {
            console.log("Is already uploading... Abort")
            return;
        }
        
      
        this.isUploading.setData(true)
       
        console.log("Beginning upload... "+flushreason ?? "");
        // At last, we build the changeset and upload
        const self = this;
        const pending = self.pendingChanges.data;
        const neededIds =  Changes.GetNeededIds(pending)
        console.log("Needed ids", neededIds)
        OsmObject.DownloadAll(neededIds, true).addCallbackAndRunD(osmObjects => {
            console.log("Got the fresh objects!", osmObjects, "pending: ", pending)
            try{
                
        
            const changes: {
                newObjects: OsmObject[],
                modifiedObjects: OsmObject[]
                deletedObjects: OsmObject[]

            }  = self.CreateChangesetObjects(pending, osmObjects)
            if (changes.newObjects.length + changes.deletedObjects.length + changes.modifiedObjects.length === 0) {
                console.log("No changes to be made")
                self.pendingChanges.setData([])
                self.isUploading.setData(false)
                return true; // Unregister the callback
            }


            State.state.osmConnection.UploadChangeset(
                State.state.layoutToUse.data,
                State.state.allElements,
                (csId) => Changes.createChangesetFor(csId, changes),
                () => {
                    console.log("Upload successfull!")
                    self.pendingChanges.setData([]);
                    self.isUploading.setData(false)
                },
                () => {
                    console.log("Upload failed - trying again later")
                    return self.isUploading.setData(false);
                } // Failed - mark to try again
            )
            }catch(e){
                console.error("Could not handle changes - probably an old, pending changeset in localstorage with an invalid format; erasing those", e)
                self.pendingChanges.setData([])
                self.isUploading.setData(false)
            }
            return true;

        });


    }

    public applyAction(action: OsmChangeAction) {
        const changes = action.Perform(this)
        console.log("Received changes:", changes)
        this.pendingChanges.data.push(...changes);
        this.pendingChanges.ping();
    }
}