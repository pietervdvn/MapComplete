import {OsmNode, OsmObject, OsmRelation, OsmWay} from "./OsmObject";
import State from "../../State";
import {UIEventSource} from "../UIEventSource";
import Constants from "../../Models/Constants";
import OsmChangeAction from "./Actions/OsmChangeAction";
import {ChangeDescription} from "./Actions/ChangeDescription";
import {Utils} from "../../Utils";
import {LocalStorageSource} from "../Web/LocalStorageSource";
import SimpleMetaTagger from "../SimpleMetaTagger";
import CreateNewNodeAction from "./Actions/CreateNewNodeAction";

/**
 * Handles all changes made to OSM.
 * Needs an authenticator via OsmConnection
 */
export class Changes {

    public readonly name = "Newly added features"
    /**
     * All the newly created features as featureSource + all the modified features
     */
    public features = new UIEventSource<{ feature: any, freshness: Date }[]>([]);
    public readonly pendingChanges: UIEventSource<ChangeDescription[]> = LocalStorageSource.GetParsed<ChangeDescription[]>("pending-changes", [])
    public readonly allChanges = new UIEventSource<ChangeDescription[]>(undefined)
    private _nextId: number = -1; // Newly assigned ID's are negative
    private readonly isUploading = new UIEventSource(false);

    private readonly previouslyCreated: OsmObject[] = []
    private readonly _leftRightSensitive: boolean;

    constructor(leftRightSensitive: boolean = false) {
        this._leftRightSensitive = leftRightSensitive;
        // We keep track of all changes just as well
        this.allChanges.setData([...this.pendingChanges.data])
        // If a pending change contains a negative ID, we save that
        this._nextId = Math.min(-1, ...this.pendingChanges.data?.map(pch => pch.id) ?? [])

        // Note: a changeset might be reused which was opened just before and might have already used some ids
        // This doesn't matter however, as the '-1' is per piecewise upload, not global per changeset
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
                "\n<delete>\n" +
                deletedElements.map(e => e.ChangesetXML(csId)).join("\n") +
                "\n</delete>"
        }

        changes += "</osmChange>";
        return changes;
    }

    private static GetNeededIds(changes: ChangeDescription[]) {
        return Utils.Dedup(changes.filter(c => c.id >= 0)
            .map(c => c.type + "/" + c.id))
    }

    /**
     * Returns a new ID and updates the value for the next ID
     */
    public getNewID() {
        return this._nextId--;
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
        console.log("Uploading changes due to: ", flushreason)
        this.isUploading.setData(true)

        this.flushChangesAsync()
            .then(_ => {
                this.isUploading.setData(false)
                console.log("Changes flushed!");
            })
            .catch(e => {
                this.isUploading.setData(false)
                console.error("Flushing changes failed due to", e);
            })
    }

    public async applyAction(action: OsmChangeAction): Promise<void> {
        const changes = await action.Perform(this)
        console.log("Received changes:", changes)
        this.pendingChanges.data.push(...changes);
        this.pendingChanges.ping();
        this.allChanges.data.push(...changes)
        this.allChanges.ping()
    }

    public registerIdRewrites(mappings: Map<string, string>): void {
        CreateNewNodeAction.registerIdRewrites(mappings)
    }

    /**
     * UPload the selected changes to OSM.
     * Returns 'true' if successfull and if they can be removed
     * @param pending
     * @private
     */
    private async flushSelectChanges(pending: ChangeDescription[]): Promise<boolean> {
        const self = this;
        const neededIds = Changes.GetNeededIds(pending)
        const osmObjects = await Promise.all(neededIds.map(id => OsmObject.DownloadObjectAsync(id)));

        if (this._leftRightSensitive) {
            osmObjects.forEach(obj => SimpleMetaTagger.removeBothTagging(obj.tags))
        }

        console.log("Got the fresh objects!", osmObjects, "pending: ", pending)
        const changes: {
            newObjects: OsmObject[],
            modifiedObjects: OsmObject[]
            deletedObjects: OsmObject[]
        } = self.CreateChangesetObjects(pending, osmObjects)
        if (changes.newObjects.length + changes.deletedObjects.length + changes.modifiedObjects.length === 0) {
            console.log("No changes to be made")
            return true
        }

        const meta = pending[0].meta

        const perType = Array.from(
            Utils.Hist(pending.filter(descr => descr.meta.changeType !== undefined && descr.meta.changeType !== null)
                .map(descr => descr.meta.changeType)), ([key, count]) => (
                {
                    key: key,
                    value: count,
                    aggregate: true
                }))
        const motivations = pending.filter(descr => descr.meta.specialMotivation !== undefined)
            .map(descr => ({
                key: descr.meta.changeType + ":" + descr.type + "/" + descr.id,
                value: descr.meta.specialMotivation
            }))
        const metatags = [{
            key: "comment",
            value: "Adding data with #MapComplete for theme #" + meta.theme
        },
            {
                key: "theme",
                value: meta.theme
            },
            ...perType,
            ...motivations
        ]

        await State.state.osmConnection.changesetHandler.UploadChangeset(
            (csId) => Changes.createChangesetFor("" + csId, changes),
            metatags
        )

        console.log("Upload successfull!")
        return true;
    }

    private async flushChangesAsync(): Promise<void> {
        const self = this;
        try {
            // At last, we build the changeset and upload
            const pending = self.pendingChanges.data;

            const pendingPerTheme = new Map<string, ChangeDescription[]>()
            for (const changeDescription of pending) {
                const theme = changeDescription.meta.theme
                if (!pendingPerTheme.has(theme)) {
                    pendingPerTheme.set(theme, [])
                }
                pendingPerTheme.get(theme).push(changeDescription)
            }

            const successes = await Promise.all(Array.from(pendingPerTheme, ([key, value]) => value)
                .map(async pendingChanges => {
                    try {
                        return await self.flushSelectChanges(pendingChanges);
                    } catch (e) {
                        console.error("Could not upload some changes:", e)
                        return false
                    }
                }))

            if (!successes.some(s => s == false)) {
                // All changes successfull, we clear the data!
                this.pendingChanges.setData([]);
            }

        } catch (e) {
            console.error("Could not handle changes - probably an old, pending changeset in localstorage with an invalid format; erasing those", e)
            self.pendingChanges.setData([])
        } finally {
            self.isUploading.setData(false)
        }


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
                if (change.id >= 0) {
                    throw "Did not get an object that should be known: " + id
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

                const oldV = obj.tags[k]
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
}