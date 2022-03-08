import escapeHtml from "escape-html";
import UserDetails, {OsmConnection} from "./OsmConnection";
import {UIEventSource} from "../UIEventSource";
import {ElementStorage} from "../ElementStorage";
import Locale from "../../UI/i18n/Locale";
import Constants from "../../Models/Constants";
import {Changes} from "./Changes";
import {Utils} from "../../Utils";

export interface ChangesetTag {
    key: string,
    value: string | number,
    aggregate?: boolean
}

export class ChangesetHandler {

    private readonly allElements: ElementStorage;
    private osmConnection: OsmConnection;
    private readonly changes: Changes;
    private readonly _dryRun: UIEventSource<boolean>;
    private readonly userDetails: UIEventSource<UserDetails>;
    private readonly auth: any;
    private readonly backend: string;

    /**
     * Use 'osmConnection.CreateChangesetHandler' instead
     * @param dryRun
     * @param osmConnection
     * @param allElements
     * @param changes
     * @param auth
     */
    constructor(dryRun: UIEventSource<boolean>,
                osmConnection: OsmConnection,
                allElements: ElementStorage,
                changes: Changes,
                auth) {
        this.osmConnection = osmConnection;
        this.allElements = allElements;
        this.changes = changes;
        this._dryRun = dryRun;
        this.userDetails = osmConnection.userDetails;
        this.backend = osmConnection._oauth_config.url
        this.auth = auth;

        if (dryRun) {
            console.log("DRYRUN ENABLED");
        }

    }

    /**
     * If the metatags contain a special motivation of the format "<change-type>:node/-<number>", this method will rewrite this negative number to the actual ID
     * The key is changed _in place_; true will be returned if a change has been applied
     * @param extraMetaTags
     * @param rewriteIds
     * @private
     */
    private static rewriteMetaTags(extraMetaTags: ChangesetTag[], rewriteIds: Map<string, string>) {
        let hasChange = false;
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
        generateChangeXML: (csid: number) => string,
        extraMetaTags: ChangesetTag[],
        openChangeset: UIEventSource<number>): Promise<void> {

        if (!extraMetaTags.some(tag => tag.key === "comment") || !extraMetaTags.some(tag => tag.key === "theme")) {
            throw "The meta tags should at least contain a `comment` and a `theme`"
        }

        if (this.userDetails.data.csCount == 0) {
            // The user became a contributor!
            this.userDetails.data.csCount = 1;
            this.userDetails.ping();
        }
        if (this._dryRun.data) {
            const changesetXML = generateChangeXML(123456);
            console.log("Metatags are", extraMetaTags)
            console.log(changesetXML);
            return;
        }

        if (openChangeset.data === undefined) {
            // We have to open a new changeset
            try {
                const csId = await this.OpenChangeset(extraMetaTags)
                openChangeset.setData(csId);
                const changeset = generateChangeXML(csId);
                console.trace("Opened a new changeset (openChangeset.data is undefined):", changeset);
                const changes = await this.AddChange(csId, changeset)
                const hasSpecialMotivationChanges = ChangesetHandler.rewriteMetaTags(extraMetaTags, changes)
                if(hasSpecialMotivationChanges){
                    // At this point, 'extraMetaTags' will have changed - we need to set the tags again
                    this.UpdateTags(csId, extraMetaTags)
                }
                
            } catch (e) {
                console.error("Could not open/upload changeset due to ", e)
                openChangeset.setData(undefined)
            }
        } else {
            // There still exists an open changeset (or at least we hope so)
            // Let's check!
            const csId = openChangeset.data;
            try {

                const oldChangesetMeta = await this.GetChangesetMeta(csId)
                if (!oldChangesetMeta.open) {
                    // Mark the CS as closed...
                    console.log("Could not fetch the metadata from the already open changeset")
                    openChangeset.setData(undefined);
                    // ... and try again. As the cs is closed, no recursive loop can exist  
                    await this.UploadChangeset(generateChangeXML, extraMetaTags, openChangeset)
                    return;
                }

                const rewritings = await this.AddChange(
                    csId,
                    generateChangeXML(csId))

                await this.RewriteTagsOf(extraMetaTags, rewritings, oldChangesetMeta)

            } catch (e) {
                console.warn("Could not upload, changeset is probably closed: ", e);
                openChangeset.setData(undefined);
            }
        }
    }

    /**
     * Updates the metatag of a changeset -
     * @param extraMetaTags: new changeset tags to add/fuse with this changeset
     * @param oldChangesetMeta: the metadata-object of the already existing changeset
     * @constructor
     * @private
     */
    private async RewriteTagsOf(extraMetaTags: ChangesetTag[],
                                rewriteIds: Map<string, string>,
                                oldChangesetMeta: {
                                    open: boolean,
                                    id: number
                                    uid: number, // User ID
                                    changes_count: number,
                                    tags: any
                                }) {

        const csId = oldChangesetMeta.id

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
                    value: oldCsTags[key]
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

        await this.UpdateTags(csId, extraMetaTags)


    }

    private handleIdRewrite(node: any, type: string): [string, string] {
        const oldId = parseInt(node.attributes.old_id.value);
        if (node.attributes.new_id === undefined) {
            // We just removed this point!
            const element = this.allElements.getEventSourceById("node/" + oldId);
            element.data._deleted = "yes"
            element.ping();
            return;
        }

        const newId = parseInt(node.attributes.new_id.value);
        const result: [string, string] = [type + "/" + oldId, type + "/" + newId]
        if (!(oldId !== undefined && newId !== undefined &&
            !isNaN(oldId) && !isNaN(newId))) {
            return undefined;
        }
        if (oldId == newId) {
            return undefined;
        }
        const element = this.allElements.getEventSourceById("node/" + oldId);
        if (element === undefined) {
            // Element to rewrite not found, probably a node or relation that is not rendered
            return undefined
        }
        element.data.id = type + "/" + newId;
        this.allElements.addElementById(type + "/" + newId, element);
        this.allElements.ContainingFeatures.set(type + "/" + newId, this.allElements.ContainingFeatures.get(type + "/" + oldId))
        element.ping();
        return result;
    }

    private parseUploadChangesetResponse(response: XMLDocument): Map<string, string> {
        const nodes = response.getElementsByTagName("node");
        const mappings = new Map<string, string>()
        // @ts-ignore
        for (const node of nodes) {
            const mapping = this.handleIdRewrite(node, "node")
            if (mapping !== undefined) {
                mappings.set(mapping[0], mapping[1])
            }
        }

        const ways = response.getElementsByTagName("way");
        // @ts-ignore
        for (const way of ways) {
            const mapping = this.handleIdRewrite(way, "way")
            if (mapping !== undefined) {
                mappings.set(mapping[0], mapping[1])
            }
        }
        this.changes.registerIdRewrites(mappings)
        return mappings

    }

    private async CloseChangeset(changesetId: number = undefined): Promise<void> {
        const self = this
        return new Promise<void>(function (resolve, reject) {
            if (changesetId === undefined) {
                return;
            }
            self.auth.xhr({
                method: 'PUT',
                path: '/api/0.6/changeset/' + changesetId + '/close',
            }, function (err, response) {
                if (response == null) {

                    console.log("err", err);
                }
                console.log("Closed changeset ", changesetId)
                resolve()
            });
        })
    }

    private async GetChangesetMeta(csId: number): Promise<{
        id: number,
        open: boolean,
        uid: number,
        changes_count: number,
        tags: any
    }> {
        const url = `${this.backend}/api/0.6/changeset/${csId}`
        const csData = await Utils.downloadJson(url)
        return csData.elements[0]
    }


    /**
     * Puts the specified tags onto the changesets as they are.
     * This method will erase previously set tags
     */
    private async UpdateTags(
        csId: number,
        tags: ChangesetTag[]) {

        console.trace("Updating tags of " + csId)
        const self = this;
        return new Promise<string>(function (resolve, reject) {

            tags = Utils.NoNull(tags).filter(tag => tag.key !== undefined && tag.value !== undefined && tag.key !== "" && tag.value !== "")
            const metadata = tags.map(kv => `<tag k="${kv.key}" v="${escapeHtml(kv.value)}"/>`)

            self.auth.xhr({
                method: 'PUT',
                path: '/api/0.6/changeset/' + csId,
                options: {header: {'Content-Type': 'text/xml'}},
                content: [`<osm><changeset>`,
                    metadata,
                    `</changeset></osm>`].join("")
            }, function (err, response) {
                if (response === undefined) {
                    console.log("err", err);
                    reject(err)
                } else {
                    resolve(response);
                }
            });
        })
    }

    private OpenChangeset(
        changesetTags: ChangesetTag[]
    ): Promise<number> {
        const self = this;
        return new Promise<number>(function (resolve, reject) {

            const metadata = [
                ["created_by", `MapComplete ${Constants.vNumber}`],
                ["locale", Locale.language.data],
                ["host", `${window.location.origin}${window.location.pathname}`],
                ["source", self.changes.state["currentUserLocation"]?.features?.data?.length > 0 ? "survey" : undefined],
                ["imagery", self.changes.state["backgroundLayer"]?.data?.id],
                ...changesetTags.map(cstag => [cstag.key, cstag.value])
            ]
                .filter(kv => (kv[1] ?? "") !== "")
                .map(kv => `<tag k="${kv[0]}" v="${escapeHtml(kv[1])}"/>`)
                .join("\n")


            self.auth.xhr({
                method: 'PUT',
                path: '/api/0.6/changeset/create',
                options: {header: {'Content-Type': 'text/xml'}},
                content: [`<osm><changeset>`,
                    metadata,
                    `</changeset></osm>`].join("")
            }, function (err, response) {
                if (response === undefined) {
                    console.log("err", err);
                    reject(err)
                } else {
                    resolve(Number(response));
                }
            });
        })

    }

    /**
     * Upload a changesetXML
     */
    private AddChange(changesetId: number,
                      changesetXML: string): Promise<Map<string, string>> {
        const self = this;
        return new Promise(function (resolve, reject) {
            self.auth.xhr({
                method: 'POST',
                options: {header: {'Content-Type': 'text/xml'}},
                path: '/api/0.6/changeset/' + changesetId + '/upload',
                content: changesetXML
            }, function (err, response) {
                if (response == null) {
                    console.log("err", err);
                    reject(err);
                }
                const changes = self.parseUploadChangesetResponse(response);
                console.log("Uploaded changeset ", changesetId);
                resolve(changes);
            });
        })

    }


}
