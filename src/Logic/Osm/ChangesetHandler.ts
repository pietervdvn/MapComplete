import escapeHtml from "escape-html"
import UserDetails, { OsmConnection } from "./OsmConnection"
import { Store, UIEventSource } from "../UIEventSource"
import Locale from "../../UI/i18n/Locale"
import Constants from "../../Models/Constants"
import { Changes } from "./Changes"
import { Utils } from "../../Utils"
import FeaturePropertiesStore from "../FeatureSource/Actors/FeaturePropertiesStore"

export interface ChangesetTag {
    key: string
    value: string | number
    aggregate?: boolean
}

export type ChangesetMetadata = {
    id: number
    created_at: string
    open: boolean
    closed_at?: string
    uid: number
    user: string
    changes_count: number
    tags: Record<string, string>
    minlat: number
    minlon: number
    maxlat: number
    maxlon: number
    comments_count: number
}

export class ChangesetHandler {
    private readonly allElements: FeaturePropertiesStore
    private osmConnection: OsmConnection
    private readonly changes: Changes
    private readonly _dryRun: Store<boolean>
    private readonly userDetails: UIEventSource<UserDetails>
    private readonly backend: string

    /**
     * Contains previously rewritten IDs
     * @private
     */
    public readonly _remappings = new Map<string, string>()
    private readonly _reportError: (e: string | Error, extramsg: string) => void

    constructor(
        dryRun: Store<boolean>,
        osmConnection: OsmConnection,
        allElements:
            | FeaturePropertiesStore
            | { addAlias: (id0: string, id1: string) => void }
            | undefined,
        changes: Changes,
        reportError: (e: string | Error, extramessage: string) => void
    ) {
        this.osmConnection = osmConnection
        this._reportError = reportError
        this.allElements = <FeaturePropertiesStore>allElements
        this.changes = changes
        this._dryRun = dryRun
        this.userDetails = osmConnection.userDetails
        this.backend = osmConnection._oauth_config.url

        if (dryRun.data) {
            console.log("DRYRUN ENABLED")
        }
    }

    /**
     * Creates a new list which contains every key at most once
     *
     * ChangesetHandler.removeDuplicateMetaTags([{key: "k", value: "v"}, {key: "k0", value: "v0"}, {key: "k", value:"v"}] // => [{key: "k", value: "v"}, {key: "k0", value: "v0"}]
     */
    private static removeDuplicateMetaTags(extraMetaTags: ChangesetTag[]): ChangesetTag[] {
        const r: ChangesetTag[] = []
        const seen = new Set<string>()
        for (const extraMetaTag of extraMetaTags) {
            if (seen.has(extraMetaTag.key)) {
                continue
            }
            r.push(extraMetaTag)
            seen.add(extraMetaTag.key)
        }
        return r
    }

    /**
     * Inplace rewrite of extraMetaTags
     * If the metatags contain a special motivation of the format "<change-type>:node/-<number>", this method will rewrite this negative number to the actual ID
     * The key is changed _in place_; true will be returned if a change has been applied
     * @param extraMetaTags
     * @param rewriteIds
     * @public for testing purposes
     */
    public static rewriteMetaTags(extraMetaTags: ChangesetTag[], rewriteIds: Map<string, string>) {
        let hasChange = false
        for (const tag of extraMetaTags) {
            const match = tag.key.match(/^([a-zA-Z0-9_]+):(node\/-[0-9])$/)
            if (match == null) {
                continue
            }
            // This is a special motivation which has a negative ID -> we check for rewrites
            const [_, reason, id] = match
            if (rewriteIds.has(id)) {
                tag.key = reason + ":" + rewriteIds.get(id)
                hasChange = true
            }
        }
        return hasChange
    }

    private async UploadWithNew(
        generateChangeXML: (csid: number, remappings: Map<string, string>) => string,
        openChangeset: UIEventSource<number>,
        extraMetaTags: ChangesetTag[]
    ) {
        const csId = await this.OpenChangeset(extraMetaTags)
        openChangeset.setData(csId)
        const changeset = generateChangeXML(csId, this._remappings)
        console.log(
            "Opened a new changeset (openChangeset.data is undefined):",
            changeset,
            extraMetaTags
        )
        const changes = await this.UploadChange(csId, changeset)
        const hasSpecialMotivationChanges = ChangesetHandler.rewriteMetaTags(extraMetaTags, changes)
        if (hasSpecialMotivationChanges) {
            // At this point, 'extraMetaTags' will have changed - we need to set the tags again
            await this.UpdateTags(csId, extraMetaTags)
        }
    }

    /**
     * The full logic to upload a change to one or more elements.
     *
     * This method will attempt to reuse an existing, open changeset for this theme (or open one if none available).
     * Then, it will upload a changes-xml within this changeset (and leave the changeset open)
     * When upload is successfull, eventual id-rewriting will be handled (aka: don't worry about that)
     *
     * If 'dryrun' is specified, the changeset XML will be printed to console instead of being uploaded
     *
     */
    public async UploadChangeset(
        generateChangeXML: (csid: number, remappings: Map<string, string>) => string,
        extraMetaTags: ChangesetTag[],
        openChangeset: UIEventSource<number>
    ): Promise<void> {
        if (
            !extraMetaTags.some((tag) => tag.key === "comment") ||
            !extraMetaTags.some((tag) => tag.key === "theme")
        ) {
            throw "The meta tags should at least contain a `comment` and a `theme`"
        }

        extraMetaTags = [...extraMetaTags, ...this.defaultChangesetTags()]
        extraMetaTags = ChangesetHandler.removeDuplicateMetaTags(extraMetaTags)
        if (this.userDetails.data.csCount == 0) {
            // The user became a contributor!
            this.userDetails.data.csCount = 1
            this.userDetails.ping()
        }
        if (this._dryRun.data) {
            const changesetXML = generateChangeXML(123456, this._remappings)
            console.log("Metatags are", extraMetaTags)
            console.log(changesetXML)
            return
        }

        console.log("Trying to reuse changeset", openChangeset.data)
        if (openChangeset.data) {
            try {
                const csId = openChangeset.data
                const oldChangesetMeta = await this.GetChangesetMeta(csId)
                console.log("Got metadata:", oldChangesetMeta, "isopen", oldChangesetMeta?.open)
                if (oldChangesetMeta.open) {
                    // We can hopefully reuse the changeset

                    try {
                        const rewritings = await this.UploadChange(
                            csId,
                            generateChangeXML(csId, this._remappings)
                        )

                        const rewrittenTags = this.RewriteTagsOf(
                            extraMetaTags,
                            rewritings,
                            oldChangesetMeta
                        )
                        await this.UpdateTags(csId, rewrittenTags)
                        return // We are done!
                    } catch (e) {
                        this._reportError(e, "While reusing a changeset " + openChangeset.data)
                    }
                }
            } catch (e) {
                this._reportError(
                    e,
                    "While getting metadata from a changeset " + openChangeset.data
                )
            }
        }

        // We have to open a new changeset
        try {
            return await this.UploadWithNew(generateChangeXML, openChangeset, extraMetaTags)
        } catch (e) {
            if (this._reportError) {
                this._reportError(e, "While opening a new changeset")
            }
            if ((<XMLHttpRequest>e).status === 400) {
                // This request is invalid. We simply drop the changes and hope that someone will analyze what went wrong with it in the upload; we pretend everything went fine
                return
            }
            console.warn(
                "Could not open/upload changeset due to ",
                e,
                "trying again with a another fresh changeset "
            )
            openChangeset.setData(undefined)

            throw e
        }
    }

    /**
     * Given an existing changeset with metadata and extraMetaTags to add, will fuse them to a new set of metatags
     * Does not yet send data
     * @param extraMetaTags: new changeset tags to add/fuse with this changeset
     * @param rewriteIds: the mapping of ids
     * @param oldChangesetMeta: the metadata-object of the already existing changeset
     *
     * @public for testing purposes
     */
    public RewriteTagsOf(
        extraMetaTags: ChangesetTag[],
        rewriteIds: Map<string, string>,
        oldChangesetMeta: {
            open: boolean
            id: number
            uid: number // User ID
            changes_count: number
            tags: any
        }
    ): ChangesetTag[] {
        // Note: extraMetaTags is where all the tags are collected into

        // same as 'extraMetaTag', but indexed
        // Note that updates to 'extraTagsById.get(<key>).value = XYZ' is shared with extraMetatags
        const extraTagsById = new Map<string, ChangesetTag>()
        for (const extraMetaTag of extraMetaTags) {
            extraTagsById.set(extraMetaTag.key, extraMetaTag)
        }

        const oldCsTags = oldChangesetMeta.tags
        for (const key in oldCsTags) {
            const newMetaTag = extraTagsById.get(key)
            const existingValue = oldCsTags[key]

            if (newMetaTag !== undefined && newMetaTag.value === existingValue) {
                continue
            }
            if (newMetaTag === undefined) {
                extraMetaTags.push({
                    key: key,
                    value: oldCsTags[key],
                })
                continue
            }

            if (newMetaTag.aggregate) {
                let n = Number(newMetaTag.value)
                if (isNaN(n)) {
                    n = 0
                }
                let o = Number(oldCsTags[key])
                if (isNaN(o)) {
                    o = 0
                }
                // We _update_ the tag itself, as it'll be updated in 'extraMetaTags' straight away
                newMetaTag.value = "" + (n + o)
            } else {
                // The old value is overwritten, thus we drop this old key
            }
        }

        ChangesetHandler.rewriteMetaTags(extraMetaTags, rewriteIds)
        return extraMetaTags
    }

    /**
     * Updates the id in the AllElements store, returns the new ID
     * @param node: the XML-element, e.g.  <node old_id="-1" new_id="9650458521" new_version="1"/>
     * @param type
     * @private
     */
    private static parseIdRewrite(node: any, type: string): [string, string] {
        const oldId = parseInt(node.attributes.old_id.value)
        if (node.attributes.new_id === undefined) {
            return [type + "/" + oldId, undefined]
        }

        const newId = parseInt(node.attributes.new_id.value)
        // The actual mapping
        const result: [string, string] = [type + "/" + oldId, type + "/" + newId]
        if (oldId === newId) {
            return undefined
        }
        return result
    }

    /**
     * Given a diff-result XML of the form
     * <diffResult version="0.6">
     *  <node old_id="-1" new_id="9650458521" new_version="1"/>
     *  <way old_id="-2" new_id="1050127772" new_version="1"/>
     * </diffResult>,
     * will:
     *
     * - create a mapping `{'node/-1' --> "node/9650458521", 'way/-2' --> "way/9650458521"}
     * - Call this.changes.registerIdRewrites
     * - Call handleIdRewrites as needed
     * @param response
     * @private
     */
    private parseUploadChangesetResponse(response: XMLDocument): Map<string, string> {
        const nodes = response.getElementsByTagName("node")
        const mappings: [string, string][] = []

        for (const node of Array.from(nodes)) {
            const mapping = ChangesetHandler.parseIdRewrite(node, "node")
            if (mapping !== undefined) {
                mappings.push(mapping)
            }
        }

        const ways = response.getElementsByTagName("way")
        for (const way of Array.from(ways)) {
            const mapping = ChangesetHandler.parseIdRewrite(way, "way")
            if (mapping !== undefined) {
                mappings.push(mapping)
            }
        }
        for (const mapping of mappings) {
            const [oldId, newId] = mapping
            this.allElements?.addAlias(oldId, newId)
            if (newId !== undefined) {
                this._remappings.set(mapping[0], mapping[1])
            }
        }
        return new Map<string, string>(mappings)
    }

    // noinspection JSUnusedLocalSymbols
    private async CloseChangeset(changesetId: number = undefined): Promise<void> {
        if (changesetId === undefined) {
            return
        }
        await this.osmConnection.put("changeset/" + changesetId + "/close")
        console.log("Closed changeset ", changesetId)
    }

    private async GetChangesetMeta(csId: number): Promise<ChangesetMetadata> {
        const url = `${this.backend}/api/0.6/changeset/${csId}`
        const csData = await Utils.downloadJson<{ changeset: ChangesetMetadata }>(url)
        return csData.changeset
    }

    /**
     * Puts the specified tags onto the changesets as they are.
     * This method will erase previously set tags
     */
    private async UpdateTags(csId: number, tags: ChangesetTag[]) {
        tags = ChangesetHandler.removeDuplicateMetaTags(tags)

        tags = Utils.NoNull(tags).filter(
            (tag) =>
                tag.key !== undefined &&
                tag.value !== undefined &&
                tag.key !== "" &&
                tag.value !== ""
        )
        const metadata = tags.map((kv) => `<tag k="${kv.key}" v="${escapeHtml(kv.value)}"/>`)
        const content = [`<osm><changeset>`, metadata, `</changeset></osm>`].join("")
        return this.osmConnection.put("changeset/" + csId, content, { "Content-Type": "text/xml" })
    }

    private defaultChangesetTags(): ChangesetTag[] {
        const usedGps = this.changes.state["currentUserLocation"]?.features?.data?.length > 0
        const hasMorePrivacy = !!this.changes.state?.featureSwitches?.featureSwitchMorePrivacy?.data
        const setSourceAsSurvey = !hasMorePrivacy && usedGps
        return [
            ["created_by", `MapComplete ${Constants.vNumber}`],
            ["locale", Locale.language.data],
            ["host", `${window.location.origin}${window.location.pathname}`],
            ["source", setSourceAsSurvey ? "survey" : undefined],
            ["imagery", this.changes.state["backgroundLayer"]?.data?.id],
        ].map(([key, value]) => ({
            key,
            value,
            aggregate: false,
        }))
    }

    /**
     * Opens a changeset with the specified tags
     * @param changesetTags
     * @constructor
     * @private
     */
    private async OpenChangeset(changesetTags: ChangesetTag[]): Promise<number> {
        const metadata = changesetTags
            .map((cstag) => [cstag.key, cstag.value])
            .filter((kv) => (kv[1] ?? "") !== "")
            .map((kv) => `<tag k="${kv[0]}" v="${escapeHtml(kv[1])}"/>`)
            .join("\n")

        const csId = await this.osmConnection.put(
            "changeset/create",
            [`<osm><changeset>`, metadata, `</changeset></osm>`].join(""),
            { "Content-Type": "text/xml" }
        )
        return Number(csId)
    }

    /**
     * Upload a changesetXML
     */
    private async UploadChange(
        changesetId: number,
        changesetXML: string
    ): Promise<Map<string, string>> {
        const response = await this.osmConnection.post<XMLDocument>(
            "changeset/" + changesetId + "/upload",
            changesetXML,
            { "Content-Type": "text/xml" }
        )
        const changes = this.parseUploadChangesetResponse(response)
        console.log("Uploaded changeset ", changesetId)
        return changes
    }
}
