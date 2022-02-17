import {OsmNode, OsmObject, OsmRelation, OsmWay} from "./OsmObject";
import {UIEventSource} from "../UIEventSource";
import Constants from "../../Models/Constants";
import OsmChangeAction from "./Actions/OsmChangeAction";
import {ChangeDescription} from "./Actions/ChangeDescription";
import {Utils} from "../../Utils";
import {LocalStorageSource} from "../Web/LocalStorageSource";
import SimpleMetaTagger from "../SimpleMetaTagger";
import CreateNewNodeAction from "./Actions/CreateNewNodeAction";
import FeatureSource from "../FeatureSource/FeatureSource";
import {ElementStorage} from "../ElementStorage";
import {GeoLocationPointProperties} from "../Actors/GeoLocationHandler";
import {GeoOperations} from "../GeoOperations";
import {ChangesetHandler, ChangesetTag} from "./ChangesetHandler";
import {OsmConnection} from "./OsmConnection";

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
    public readonly state: { allElements: ElementStorage; osmConnection: OsmConnection }
    public readonly extraComment: UIEventSource<string> = new UIEventSource(undefined)
    
    private historicalUserLocations: FeatureSource
    private _nextId: number = -1; // Newly assigned ID's are negative
    private readonly isUploading = new UIEventSource(false);
    private readonly previouslyCreated: OsmObject[] = []
    private readonly _leftRightSensitive: boolean;
    private _changesetHandler: ChangesetHandler;

    constructor(
        state?: {
            allElements: ElementStorage,
            osmConnection: OsmConnection
        },
        leftRightSensitive: boolean = false) {
        this._leftRightSensitive = leftRightSensitive;
        // We keep track of all changes just as well
        this.allChanges.setData([...this.pendingChanges.data])
        // If a pending change contains a negative ID, we save that
        this._nextId = Math.min(-1, ...this.pendingChanges.data?.map(pch => pch.id) ?? [])
        this.state = state;
        this._changesetHandler = state?.osmConnection?.CreateChangesetHandler(state.allElements, this)

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
    public async flushChanges(flushreason: string = undefined): Promise<void> {
        if (this.pendingChanges.data.length === 0) {
            return;
        }
        if (this.isUploading.data) {
            console.log("Is already uploading... Abort")
            return;
        }


        console.log("Uploading changes due to: ", flushreason)
        this.isUploading.setData(true)
        try {
            const csNumber = await this.flushChangesAsync()
            this.isUploading.setData(false)
            console.log("Changes flushed. Your changeset is " + csNumber);
        } catch (e) {
            this.isUploading.setData(false)
            console.error("Flushing changes failed due to", e);
        }
    }

    public async applyAction(action: OsmChangeAction): Promise<void> {
        const changeDescriptions = await action.Perform(this)
        changeDescriptions[0].meta.distanceToObject = this.calculateDistanceToChanges(action, changeDescriptions)
        this.applyChanges(changeDescriptions)
    }

    public applyChanges(changes: ChangeDescription[]) {
        console.log("Received changes:", changes)
        this.pendingChanges.data.push(...changes);
        this.pendingChanges.ping();
        this.allChanges.data.push(...changes)
        this.allChanges.ping()
    }

    public registerIdRewrites(mappings: Map<string, string>): void {
        CreateNewNodeAction.registerIdRewrites(mappings)
    }

    private calculateDistanceToChanges(change: OsmChangeAction, changeDescriptions: ChangeDescription[]) {

        const locations = this.historicalUserLocations?.features?.data
        if (locations === undefined) {
            // No state loaded or no locations -> we can't calculate...
            return;
        }
        if (!change.trackStatistics) {
            // Probably irrelevant, such as a new helper node
            return;
        }

        const now = new Date()
        const recentLocationPoints = locations.map(ff => ff.feature)
            .filter(feat => feat.geometry.type === "Point")
            .filter(feat => {
                const visitTime = new Date((<GeoLocationPointProperties>feat.properties).date)
                // In seconds
                const diff = (now.getTime() - visitTime.getTime()) / 1000
                return diff < Constants.nearbyVisitTime;
            })
        if (recentLocationPoints.length === 0) {
            // Probably no GPS enabled/no fix 
            return;
        }

        // The applicable points, contain information in their properties about location, time and GPS accuracy
        // They are all GeoLocationPointProperties
        // We walk every change and determine the closest distance possible
        // Only if the change itself does _not_ contain any coordinates, we fall back and search the original feature in the state

        const changedObjectCoordinates: [number, number][] = []

        const feature = this.state.allElements.ContainingFeatures.get(change.mainObjectId)
        if (feature !== undefined) {
            changedObjectCoordinates.push(GeoOperations.centerpointCoordinates(feature))
        }

        for (const changeDescription of changeDescriptions) {
            const chng: { lat: number, lon: number } | { coordinates: [number, number][] } | { members } = changeDescription.changes
            if (chng === undefined) {
                continue
            }
            if (chng["lat"] !== undefined) {
                changedObjectCoordinates.push([chng["lat"], chng["lon"]])
            }
            if (chng["coordinates"] !== undefined) {
                changedObjectCoordinates.push(...chng["coordinates"])
            }
        }

        return Math.min(...changedObjectCoordinates.map(coor =>
            Math.min(...recentLocationPoints.map(gpsPoint => {
                const otherCoor = GeoOperations.centerpointCoordinates(gpsPoint)
                return GeoOperations.distanceBetween(coor, otherCoor)
            }))
        ))
    }

    /**
     * UPload the selected changes to OSM.
     * Returns 'true' if successfull and if they can be removed
     */
    private async flushSelectChanges(pending: ChangeDescription[], openChangeset: UIEventSource<number>): Promise<boolean> {
        const self = this;
        const neededIds = Changes.GetNeededIds(pending)

        const osmObjects = Utils.NoNull(await Promise.all(neededIds.map(async id =>
            OsmObject.DownloadObjectAsync(id).catch(e => {
                console.error("Could not download OSM-object", id, " dropping it from the changes ("+e+")")
                pending = pending.filter(ch => ch.type + "/" + ch.id !== id)
                return undefined;
            }))));

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

        const distances = Utils.NoNull(pending.map(descr => descr.meta.distanceToObject));
        distances.sort((a, b) => a - b)
        const perBinCount = Constants.distanceToChangeObjectBins.map(_ => 0)

        let j = 0;
        const maxDistances = Constants.distanceToChangeObjectBins
        for (let i = 0; i < maxDistances.length; i++) {
            const maxDistance = maxDistances[i];
            // distances is sorted in ascending order, so as soon as one is to big, all the resting elements will be bigger too
            while (j < distances.length && distances[j] < maxDistance) {
                perBinCount[i]++
                j++
            }
        }

        const perBinMessage = Utils.NoNull(perBinCount.map((count, i) => {
            if (count === 0) {
                return undefined
            }
            const maxD = maxDistances[i]
            let key = `change_within_${maxD}m`
            if (maxD === Number.MAX_VALUE) {
                key = `change_over_${maxDistances[i - 1]}m`
            }
            return {
                key,
                value: count,
                aggregate: true
            }
        }))

        // This method is only called with changedescriptions for this theme
        const theme = pending[0].meta.theme
        let comment = "Adding data with #MapComplete for theme #" + theme
        if (this.extraComment.data !== undefined) {
            comment += "\n\n" + this.extraComment.data
        }

        const metatags: ChangesetTag[] = [{
            key: "comment",
            value: comment
        },
            {
                key: "theme",
                value: theme
            },
            ...perType,
            ...motivations,
            ...perBinMessage
        ]

        await this._changesetHandler.UploadChangeset(
            (csId) => Changes.createChangesetFor("" + csId, changes),
            metatags,
            openChangeset
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

            const successes = await Promise.all(Array.from(pendingPerTheme,
                async ([theme, pendingChanges]) => {
                    try {
                        const openChangeset = this.state.osmConnection.GetPreference("current-open-changeset-" + theme).map(
                            str => {
                                const n = Number(str);
                                if (isNaN(n)) {
                                    return undefined
                                }
                                return n
                            }, [], n => "" + n
                        );
                        console.log("Using current-open-changeset-" + theme + " from the preferences, got " + openChangeset.data)

                        return await self.flushSelectChanges(pendingChanges, openChangeset);
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

        for (const change of changes) {
            let changed = false;
            const id = change.type + "/" + change.id
            if (!objects.has(id)) {
                // The object hasn't been seen before, so it doesn't exist yet and is newly created by its very definition
                if (change.id >= 0) {
                    // Might be a failed fetch for simply this object
                    throw "Did not get an object that should be known: " + id
                }
                if (change.changes === undefined) {
                    // This object is a change to a newly created object. However, we have not seen the creation changedescription yet!
                    throw "Not a creation of the object"
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

            if (changed && states.get(id) === "unchanged") {
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

        console.debug("Calculated the pending changes: ", result.newObjects.length, "new; ", result.modifiedObjects.length, "modified;", result.deletedObjects, "deleted")
        return result
    }
    
    public setHistoricalUserLocations(locations: FeatureSource ){
        this.historicalUserLocations = locations
    }
}