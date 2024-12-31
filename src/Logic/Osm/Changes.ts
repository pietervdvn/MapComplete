import { OsmNode, OsmObject, OsmRelation, OsmWay } from "./OsmObject"
import { ImmutableStore, Store, UIEventSource } from "../UIEventSource"
import Constants from "../../Models/Constants"
import OsmChangeAction from "./Actions/OsmChangeAction"
import { ChangeDescription, ChangeDescriptionTools } from "./Actions/ChangeDescription"
import { Utils } from "../../Utils"
import { LocalStorageSource } from "../Web/LocalStorageSource"
import SimpleMetaTagger from "../SimpleMetaTagger"
import { FeatureSource, IndexedFeatureSource } from "../FeatureSource/FeatureSource"
import { GeoLocationPointProperties } from "../State/GeoLocationState"
import { GeoOperations } from "../GeoOperations"
import { ChangesetHandler, ChangesetTag } from "./ChangesetHandler"
import { OsmConnection } from "./OsmConnection"
import OsmObjectDownloader from "./OsmObjectDownloader"
import ChangeLocationAction from "./Actions/ChangeLocationAction"
import ChangeTagAction from "./Actions/ChangeTagAction"
import DeleteAction from "./Actions/DeleteAction"
import MarkdownUtils from "../../Utils/MarkdownUtils"
import FeaturePropertiesStore from "../FeatureSource/Actors/FeaturePropertiesStore"

/**
 * Handles all changes made to OSM.
 * Needs an authenticator via OsmConnection
 */
export class Changes {
    public readonly pendingChanges: UIEventSource<ChangeDescription[]> =
        LocalStorageSource.getParsed<ChangeDescription[]>("pending-changes", [])
    public readonly allChanges = new UIEventSource<ChangeDescription[]>(undefined)
    public readonly state: {
        allElements?: IndexedFeatureSource
        osmConnection: OsmConnection
        featureSwitches?: {
            featureSwitchMorePrivacy?: Store<boolean>
        }
    }
    public readonly extraComment: UIEventSource<string> = new UIEventSource(undefined)
    public readonly backend: string
    public readonly isUploading = new UIEventSource(false)
    public readonly errors = new UIEventSource<string[]>([], "upload-errors")
    private readonly historicalUserLocations?: FeatureSource
    private _nextId: number = 0 // Newly assigned ID's are negative
    private readonly previouslyCreated: OsmObject[] = []
    private readonly _leftRightSensitive: boolean
    public readonly _changesetHandler: ChangesetHandler
    private readonly _reportError?: (string: string | Error, extramessage?: string) => void

    constructor(
        state: {
            featureSwitches: {
                featureSwitchMorePrivacy?: Store<boolean>
                featureSwitchIsTesting?: Store<boolean>
            }
            osmConnection: OsmConnection
            reportError?: (error: string) => void
            featureProperties?: FeaturePropertiesStore
            historicalUserLocations?: FeatureSource
            allElements?: IndexedFeatureSource
        },
        leftRightSensitive: boolean = false,
        reportError?: (string: string | Error, extramessage?: string) => void
    ) {
        this._leftRightSensitive = leftRightSensitive
        // We keep track of all changes just as well
        this.allChanges.setData([...this.pendingChanges.data])
        // If a pending change contains a negative ID, we save that
        this._nextId = Math.min(-1, ...(this.pendingChanges.data?.map((pch) => pch.id ?? 0) ?? []))
        if (isNaN(this._nextId) && state.reportError !== undefined) {
            state.reportError(
                "Got a NaN as nextID. Pending changes IDs are:" +
                    this.pendingChanges.data?.map((pch) => pch?.id).join(".")
            )
            this._nextId = -100
        }
        this.state = state
        this.backend = state.osmConnection.Backend()
        this._reportError = reportError
        this._changesetHandler = new ChangesetHandler(
            state.featureSwitches?.featureSwitchIsTesting ?? new ImmutableStore(false),
            state.osmConnection,
            state.featureProperties,
            this,
            (e, extramessage: string) => this._reportError(e, extramessage)
        )
        this.historicalUserLocations = state.historicalUserLocations

        // Note: a changeset might be reused which was opened just before and might have already used some ids
        // This doesn't matter however, as the '-1' is per piecewise upload, not global per changeset
    }

    public static createTestObject(): Changes {
        return new Changes({
            osmConnection: new OsmConnection(),
            featureSwitches: {
                featureSwitchIsTesting: new ImmutableStore(true),
            },
        })
    }

    static buildChangesetXML(
        csId: string,
        allChanges: {
            modifiedObjects: OsmObject[]
            newObjects: OsmObject[]
            deletedObjects: OsmObject[]
        }
    ): string {
        const changedElements = allChanges.modifiedObjects ?? []
        const newElements = allChanges.newObjects ?? []
        const deletedElements = allChanges.deletedObjects ?? []

        let changes = `<osmChange version='0.6' generator='Mapcomplete ${Constants.vNumber}'>`
        if (newElements.length > 0) {
            changes +=
                "\n<create>\n" +
                newElements.map((e) => e.ChangesetXML(csId)).join("\n") +
                "</create>"
        }
        if (changedElements.length > 0) {
            changes +=
                "\n<modify>\n" +
                changedElements.map((e) => e.ChangesetXML(csId)).join("\n") +
                "\n</modify>"
        }

        if (deletedElements.length > 0) {
            changes +=
                "\n<delete>\n" +
                deletedElements.map((e) => e.ChangesetXML(csId)).join("\n") +
                "\n</delete>"
        }

        changes += "</osmChange>"
        return changes
    }

    public static getDocs(): string {
        function addSource(items: any[], src: string) {
            items.forEach((i) => {
                i["source"] = src
            })
            return items
        }

        const metatagsDocs: {
            key?: string
            value?: string
            docs: string
            changeType?: string[]
            specialMotivation?: boolean
            source?: string
        }[] = [
            ...addSource(
                [
                    {
                        key: "comment",
                        docs: "The changeset comment. Will be a fixed string, mentioning the theme",
                    },
                    {
                        key: "theme",
                        docs: "The name of the theme that was used to create this change. ",
                    },
                    {
                        key: "source",
                        value: "survey",
                        docs: "The contributor had their geolocation enabled while making changes",
                    },
                    {
                        key: "change_within_{distance}",
                        docs: "If the contributor enabled their geolocation, this will hint how far away they were from the objects they edited. This gives an indication of proximity and if they truly surveyed or were armchair-mapping",
                    },
                    {
                        key: "change_over_{distance}",
                        docs: "If the contributor enabled their geolocation, this will hint how far away they were from the objects they edited. If they were over 5000m away, the might have been armchair-mapping",
                    },
                    {
                        key: "created_by",
                        value: "MapComplete <version>",
                        docs: "The piece of software used to create this changeset; will always start with MapComplete, followed by the version number",
                    },
                    {
                        key: "locale",
                        value: "en|nl|de|...",
                        docs: "The code of the language that the contributor used MapComplete in. Hints what language the user speaks.",
                    },
                    {
                        key: "host",
                        value: "https://mapcomplete.org/<theme>",
                        docs: "The URL that the contributor used to make changes. One can see the used instance with this",
                    },
                    {
                        key: "imagery",
                        docs: "The identifier of the used background layer, this will probably be an identifier from the [editor layer index](https://github.com/osmlab/editor-layer-index)",
                    },
                ],
                "default"
            ),
            ...addSource(ChangeTagAction.metatags, "ChangeTag"),
            ...addSource(ChangeLocationAction.metatags, "ChangeLocation"),
            ...addSource(DeleteAction.metatags, "DeleteAction"),
            // TODO
            /*
            ...DeleteAction.metatags,
            ...LinkImageAction.metatags,
            ...OsmChangeAction.metatags,
            ...RelationSplitHandler.metatags,
            ...ReplaceGeometryAction.metatags,
            ...SplitAction.metatags,*/
        ]
        return [
            "# Metatags on a changeset",
            "You might encounter the following metatags on a changeset:",
            MarkdownUtils.table(
                ["key", "value", "explanation", "source"],
                metatagsDocs.map(({ key, value, docs, source, changeType, specialMotivation }) => [
                    key ?? changeType?.join(", ") ?? "",
                    value,
                    [
                        docs,
                        specialMotivation
                            ? "This might give a reason per modified node or way"
                            : "",
                    ].join("\n"),
                    source,
                ])
            ),
        ].join("\n\n")
    }

    public static GetNeededIds(changes: ChangeDescription[]) {
        return Utils.Dedup(changes.filter((c) => c.id >= 0).map((c) => c.type + "/" + c.id))
    }

    /**
     * Returns a new ID and updates the value for the next ID
     */
    public getNewID() {
        // See #2082. We check for previous rewritings, as a remapping might be from a previous session
        do {
            this._nextId--
        } while (
            this._changesetHandler._remappings.has("node/" + this._nextId) ||
            this._changesetHandler._remappings.has("way/" + this._nextId) ||
            this._changesetHandler._remappings.has("relation/" + this._nextId)
        )
        return this._nextId
    }

    /**
     * Uploads all the pending changes in one go.
     * Triggered by the 'PendingChangeUploader'-actor in Actors
     */
    public async flushChanges(flushreason: string = undefined): Promise<void> {
        if (this.pendingChanges.data.length === 0) {
            return
        }
        if (this.isUploading.data) {
            console.log("Is already uploading... Abort")
            return
        }

        console.log("Uploading changes due to: ", flushreason)
        this.isUploading.setData(true)
        try {
            await this.flushChangesAsync()
            this.isUploading.setData(false)
            console.log("Changes flushed")
            this.errors.setData([])
        } catch (e) {
            this._reportError(e)
            this.isUploading.setData(false)
            this.errors.data.push(e)
            this.errors.ping()
            console.error("Flushing changes failed due to", e)
        }
    }

    public async applyAction(action: OsmChangeAction): Promise<void> {
        const changeDescriptions = await action.Perform(this)
        const remapped = ChangeDescriptionTools.rewriteAllIds(
            changeDescriptions,
            this._changesetHandler._remappings
        )

        remapped[0].meta.distanceToObject = this.calculateDistanceToChanges(action, remapped)
        this.applyChanges(remapped)
    }

    public applyChanges(changes: ChangeDescription[]) {
        this.pendingChanges.data.push(...changes)
        this.pendingChanges.ping()
        this.allChanges.data.push(...changes)
        this.allChanges.ping()
    }

    public CreateChangesetObjects(
        changes: ChangeDescription[],
        downloadedOsmObjects: OsmObject[],
        ignoreNoCreate: boolean = false
    ): {
        newObjects: OsmObject[]
        modifiedObjects: OsmObject[]
        deletedObjects: OsmObject[]
    } {
        return Changes.createChangesetObjectsStatic(
            changes,
            downloadedOsmObjects,
            ignoreNoCreate,
            this.previouslyCreated
        )
    }
    public static createChangesetObjectsStatic(
        changes: ChangeDescription[],
        downloadedOsmObjects: OsmObject[],
        ignoreNoCreate: boolean = false,
        previouslyCreated: OsmObject[]
    ): {
        newObjects: OsmObject[]
        modifiedObjects: OsmObject[]
        deletedObjects: OsmObject[]
    } {
        /**
         * This is a rather complicated method which does a lot of stuff.
         *
         * Our main important data is `state` and `objects` which will determine what is returned.
         * First init all those states, then we actually apply the changes.
         * At last, we sort them for easy handling, which is rather boring
         */

        // ------------------ INIT -------------------------

        /**
         * Keeps track of every object what actually happened with it
         */
        const states: Map<string, "unchanged" | "created" | "modified" | "deleted"> = new Map()
        /**
         * Keeps track of the _new_ state of the objects, how they should end up on the database
         */
        const objects: Map<string, OsmObject> = new Map<string, OsmObject>()

        for (const o of downloadedOsmObjects) {
            objects.set(o.type + "/" + o.id, o)
            states.set(o.type + "/" + o.id, "unchanged")
        }

        for (const o of previouslyCreated) {
            objects.set(o.type + "/" + o.id, o)
            states.set(o.type + "/" + o.id, "unchanged")
        }

        // -------------- APPLY INTERMEDIATE CHANGES -----------------

        for (const change of changes) {
            let changed = false
            const id = change.type + "/" + change.id
            if (!objects.has(id)) {
                // The object hasn't been seen before, so it doesn't exist yet and is newly created by its very definition
                if (change.id >= 0) {
                    // Might be a failed fetch for simply this object
                    throw "Did not get an object that should be known: " + id
                }
                if (change.changes === undefined) {
                    // This object is a change to a newly created object. However, we have not seen the creation changedescription yet!
                    if (ignoreNoCreate) {
                        continue
                    }
                    throw "Not a creation of the object: " + JSON.stringify(change)
                }
                // This is a new object that should be created
                states.set(id, "created")
                let osmObj: OsmObject = undefined
                switch (change.type) {
                    case "node":
                        const n = new OsmNode(change.id)
                        n.lat = change.changes["lat"]
                        n.lon = change.changes["lon"]
                        osmObj = n
                        break
                    case "way":
                        const w = new OsmWay(change.id)
                        w.nodes = change.changes["nodes"]
                        osmObj = w
                        break
                    case "relation":
                        const r = new OsmRelation(change.id)
                        r.members = change.changes["members"]
                        osmObj = r
                        break
                    default:
                        throw "Got an invalid change.type: " + change.type
                }
                if (osmObj === undefined) {
                    throw "Hmm? This is a bug"
                }
                objects.set(id, osmObj)
                previouslyCreated.push(osmObj)
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
                    v = undefined
                }

                const oldV = obj.tags[k]
                if (oldV === v) {
                    continue
                }

                obj.tags[k] = v
                changed = true
            }

            if (change.changes !== undefined) {
                switch (change.type) {
                    case "node":
                        // @ts-ignore
                        const nlat = Utils.Round7(change.changes.lat)
                        // @ts-ignore
                        const nlon = Utils.Round7(change.changes.lon)
                        const n = <OsmNode>obj
                        if (n.lat !== nlat || n.lon !== nlon) {
                            n.lat = nlat
                            n.lon = nlon
                            changed = true
                        }
                        break
                    case "way":
                        const nnodes = change.changes["nodes"]
                        const w = <OsmWay>obj
                        if (!Utils.Identical(nnodes, w.nodes)) {
                            w.nodes = nnodes
                            changed = true
                        }
                        break
                    case "relation":
                        const nmembers: {
                            type: "node" | "way" | "relation"
                            ref: number
                            role: string
                        }[] = change.changes["members"]
                        const r = <OsmRelation>obj
                        if (
                            !Utils.Identical(nmembers, r.members, (a, b) => {
                                return a.role === b.role && a.type === b.type && a.ref === b.ref
                            })
                        ) {
                            r.members = nmembers
                            changed = true
                        }
                        break
                }
            }

            if (changed && states.get(id) === "unchanged") {
                states.set(id, "modified")
            }
        }

        // ----------------- SORT OBJECTS -------------------
        const result = {
            newObjects: [],
            modifiedObjects: [],
            deletedObjects: [],
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

        if (
            !(
                result.newObjects.length === 0 &&
                result.modifiedObjects.length === 0 &&
                result.deletedObjects.length === 0
            )
        ) {
            console.debug(
                "Calculated the pending changes: ",
                result.newObjects.length,
                "new; ",
                result.modifiedObjects.length,
                "modified;",
                result.deletedObjects.length,
                "deleted"
            )
        }
        return result
    }

    private calculateDistanceToChanges(
        change: OsmChangeAction,
        changeDescriptions: ChangeDescription[]
    ) {
        const locations = this.historicalUserLocations?.features?.data
        if (locations === undefined) {
            // No state loaded or no locations -> we can't calculate...
            return
        }
        if (!change.trackStatistics) {
            // Probably irrelevant, such as a new helper node
            return
        }
        if (this.state.featureSwitches.featureSwitchMorePrivacy?.data) {
            return
        }

        const now = new Date()
        const recentLocationPoints = locations
            .filter((feat) => feat.geometry.type === "Point")
            .filter((feat) => {
                const visitTime = new Date(
                    (<GeoLocationPointProperties>(<any>feat.properties)).date
                )
                // In seconds
                const diff = (now.getTime() - visitTime.getTime()) / 1000
                return diff < Constants.nearbyVisitTime
            })
        if (recentLocationPoints.length === 0) {
            // Probably no GPS enabled/no fix
            return
        }

        // The applicable points, contain information in their properties about location, time and GPS accuracy
        // They are all GeoLocationPointProperties
        // We walk every change and determine the closest distance possible
        // Only if the change itself does _not_ contain any coordinates, we fall back and search the original feature in the state

        const changedObjectCoordinates: [number, number][] = []

        {
            const feature = this.state.allElements?.featuresById?.data.get(change.mainObjectId)
            if (feature !== undefined) {
                changedObjectCoordinates.push(GeoOperations.centerpointCoordinates(feature))
            }
        }

        for (const changeDescription of changeDescriptions) {
            const chng:
                | { lat: number; lon: number }
                | { coordinates: [number, number][] }
                | { members } = changeDescription.changes
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

        return Math.min(
            ...changedObjectCoordinates.map((coor) =>
                Math.min(
                    ...recentLocationPoints.map((gpsPoint) => {
                        const otherCoor = GeoOperations.centerpointCoordinates(gpsPoint)
                        return GeoOperations.distanceBetween(coor, otherCoor)
                    })
                )
            )
        )
    }

    /**
     * Gets a single, fresh version of the requested osmObject with some error handling
     */
    private async getOsmObject(id: string, downloader: OsmObjectDownloader) {
        try {
            try {
                // Important: we do **not** cache this request, we _always_ need a fresh version!
                const osmObj = await downloader.DownloadObjectAsync(id, 0)
                return { id, osmObj }
            } catch (e) {
                const msg =
                    "Could not download OSM-object " +
                    id +
                    " trying again before dropping it from the changes (" +
                    e +
                    ")"
                // this._reportError(msg) // We don't report this yet, might be a temporary fluke
                const osmObj = await downloader.DownloadObjectAsync(id, 0)
                return { id, osmObj }
            }
        } catch (e) {
            const msg =
                "Could not download OSM-object " + id + " dropping it from the changes (" + e + ")"
            this._reportError(msg)
            this.errors.data.push(e)
            this.errors.ping()
            return undefined
        }
    }

    public fragmentChanges(
        pending: ChangeDescription[],
        objects: OsmObject[]
    ): {
        refused: ChangeDescription[]
        toUpload: ChangeDescription[]
    } {
        const refused: ChangeDescription[] = []
        const toUpload: ChangeDescription[] = []

        // All ids which have an 'update'
        const createdIds = new Set(
            pending.filter((cd) => cd.changes !== undefined).map((cd) => cd.id)
        )
        pending.forEach((c) => {
            if (c.id < 0) {
                if (createdIds.has(c.id)) {
                    toUpload.push(c)
                } else {
                    this._reportError(
                        `Got an orphaned change. The 'creation'-change description for ${c.type}/${c.id} got lost. Permanently dropping this change:` +
                            JSON.stringify(c)
                    )
                }
                return
            }
            const matchFound = !!objects.find((o) => o.id === c.id && o.type === c.type)
            if (matchFound) {
                toUpload.push(c)
            } else {
                console.log(
                    "Refusing change about " +
                        c.type +
                        "/" +
                        c.id +
                        " as not in the objects. No internet?"
                )
                refused.push(c)
            }
        })

        return { refused, toUpload }
    }

    /**
     * Upload the selected changes to OSM. This is typically called with changes for a single theme
     * @return pending changes which could not be uploaded for some reason; undefined or empty array if successful
     */
    private async flushSelectChanges(
        pending: ChangeDescription[],
        openChangeset: UIEventSource<number>
    ): Promise<ChangeDescription[]> {
        const neededIds = Changes.GetNeededIds(pending)
        /* Download the latest version of the OSM-objects
         *  We _do not_ pass in the Changes object itself - we want the data from OSM directly in order to apply the changes
         */
        const downloader = new OsmObjectDownloader(this.backend, undefined)
        const osmObjects = Utils.NoNull(
            await Promise.all<{ id: string; osmObj: OsmObject | "deleted" }>(
                neededIds.map((id) => this.getOsmObject(id, downloader))
            )
        )

        // Drop changes to deleted items
        for (const { osmObj, id } of osmObjects) {
            if (osmObj === "deleted") {
                pending = pending.filter((ch) => ch.type + "/" + ch.id !== id)
            }
        }

        const objects = osmObjects
            .filter((obj) => obj.osmObj !== "deleted")
            .map((obj) => <OsmObject>obj.osmObj)

        if (this._leftRightSensitive) {
            objects.forEach((obj) => SimpleMetaTagger.removeBothTagging(obj.tags))
        }

        if (pending.length == 0) {
            console.log("No pending changes...")
            return undefined
        }

        const metatags = this.buildChangesetTags(pending)

        let { toUpload, refused } = this.fragmentChanges(pending, objects)

        if (toUpload.length === 0) {
            return refused
        }
        await this._changesetHandler.UploadChangeset(
            (csId, remappings) => {
                if (remappings.size > 0) {
                    toUpload = toUpload.map((ch) =>
                        ChangeDescriptionTools.rewriteIds(ch, remappings)
                    )
                }

                const changes: {
                    newObjects: OsmObject[]
                    modifiedObjects: OsmObject[]
                    deletedObjects: OsmObject[]
                } = this.CreateChangesetObjects(toUpload, objects)

                return Changes.buildChangesetXML("" + csId, changes)
            },
            metatags,
            openChangeset
        )

        console.log("Upload successful! Refused changes are", refused)
        return refused
    }

    /**
     * Builds all the changeset tags, such as `theme=cyclofix; answer=42; add-image: 5`, ...
     */
    private buildChangesetTags(pending: ChangeDescription[]) {
        // Build statistics for the changeset tags
        const perType = Array.from(
            Utils.Hist(
                pending
                    .filter(
                        (descr) =>
                            descr.meta.changeType !== undefined && descr.meta.changeType !== null
                    )
                    .map((descr) => descr.meta.changeType)
            ),
            ([key, count]) => ({
                key: key,
                value: count,
                aggregate: true,
            })
        )
        const motivations = pending
            .filter((descr) => descr.meta.specialMotivation !== undefined)
            .map((descr) => ({
                key: descr.meta.changeType + ":" + descr.type + "/" + descr.id,
                value: descr.meta.specialMotivation,
            }))

        const distances = Utils.NoNull(pending.map((descr) => descr.meta.distanceToObject))
        distances.sort((a, b) => a - b)
        const perBinCount = Constants.distanceToChangeObjectBins.map(() => 0)

        let j = 0
        const maxDistances = Constants.distanceToChangeObjectBins
        for (let i = 0; i < maxDistances.length; i++) {
            const maxDistance = maxDistances[i]
            // distances is sorted in ascending order, so as soon as one is to big, all the resting elements will be bigger too
            while (j < distances.length && distances[j] < maxDistance) {
                perBinCount[i]++
                j++
            }
        }

        const perBinMessage = Utils.NoNull(
            perBinCount.map((count, i) => {
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
                    aggregate: true,
                }
            })
        )

        // This method is only called with changedescriptions for this theme
        const theme = pending[0].meta.theme
        let comment = "Adding data with #MapComplete for theme #" + theme
        if (this.extraComment.data !== undefined) {
            comment += "\n\n" + this.extraComment.data
        }

        const metatags: ChangesetTag[] = [
            {
                key: "comment",
                value: comment,
            },
            {
                key: "theme",
                value: theme,
            },
            ...perType,
            ...motivations,
            ...perBinMessage,
        ]
        return metatags
    }

    private async flushChangesAsync(): Promise<void> {
        const self = this
        try {
            // At last, we build the changeset and upload
            const pending = self.pendingChanges.data

            const pendingPerTheme = new Map<string, ChangeDescription[]>()
            for (const changeDescription of pending) {
                const theme = changeDescription.meta.theme
                if (!pendingPerTheme.has(theme)) {
                    pendingPerTheme.set(theme, [])
                }
                pendingPerTheme.get(theme).push(changeDescription)
            }

            const refusedChanges: ChangeDescription[][] = await Promise.all(
                Array.from(pendingPerTheme, async ([theme, pendingChanges]) => {
                    try {
                        const openChangeset = UIEventSource.asInt(
                            this.state.osmConnection.GetPreference(
                                "current-open-changeset-" + theme
                            )
                        )
                        console.log(
                            "Using current-open-changeset-" +
                                theme +
                                " from the preferences, got " +
                                openChangeset.data
                        )

                        const refused = await self.flushSelectChanges(pendingChanges, openChangeset)
                        if (!refused) {
                            this.errors.setData([])
                        }
                        return refused
                    } catch (e) {
                        this._reportError(e)
                        console.error("Could not upload some changes:", e)
                        this.errors.data.push(e)
                        this.errors.ping()
                        return pendingChanges
                    }
                })
            )

            // We keep all the refused changes to try them again
            this.pendingChanges.setData(
                refusedChanges
                    .flatMap((c) => c)
                    .filter((c) => {
                        if (c.id === null || c.id === undefined) {
                            return false
                        }
                        return true
                    })
            )
        } catch (e) {
            console.error(
                "Could not handle changes - probably an old, pending changeset in localstorage with an invalid format; erasing those",
                e
            )
            this.errors.data.push(e)
            this.errors.ping()
            self.pendingChanges.setData([])
        } finally {
            self.isUploading.setData(false)
        }
    }
}
