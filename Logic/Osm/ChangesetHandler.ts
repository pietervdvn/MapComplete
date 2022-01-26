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

    constructor(layoutName: string,
                dryRun: UIEventSource<boolean>,
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
                await this.AddChange(csId, changeset)
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

                const extraTagsById = new Map<string, ChangesetTag>()
                for (const extraMetaTag of extraMetaTags) {
                    extraTagsById.set(extraMetaTag.key, extraMetaTag)
                }
                const oldCsTags = oldChangesetMeta.tags
                for (const key in oldCsTags) {
                    const newMetaTag = extraTagsById.get(key)
                    if (newMetaTag === undefined) {
                        extraMetaTags.push({
                            key: key,
                            value: oldCsTags[key]
                        })
                    } else if (newMetaTag.aggregate) {
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
                        // The old value is overwritten, thus we drop
                    }
                }

                await this.UpdateTags(csId, extraMetaTags.map(csTag => <[string, string]>[csTag.key, csTag.value]))


                await this.AddChange(
                    csId,
                    generateChangeXML(csId))


            } catch (e) {
                console.warn("Could not upload, changeset is probably closed: ", e);
                openChangeset.setData(undefined);
            }
        }
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
        console.log("Rewriting id: ", type + "/" + oldId, "-->", type + "/" + newId);
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

    private parseUploadChangesetResponse(response: XMLDocument): void {
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

    }

    private async CloseChangeset(changesetId: number = undefined): Promise<void> {
        const self = this
        return new Promise<void>(function (resolve, reject) {
            if (changesetId === undefined) {
                return;
            }
            console.log("closing changeset", changesetId);
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

    private async UpdateTags(
        csId: number,
        tags: [string, string][]) {

        const self = this;
        return new Promise<string>(function (resolve, reject) {

            tags = Utils.NoNull(tags).filter(([k, v]) => k !== undefined && v !== undefined && k !== "" && v !== "")
            const metadata = tags.map(kv => `<tag k="${kv[0]}" v="${escapeHtml(kv[1])}"/>`)

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

            let path = window.location.pathname;
            path = path.substr(1, path.lastIndexOf("/"));
            const metadata = [
                ["created_by", `MapComplete ${Constants.vNumber}`],
                ["language", Locale.language.data],
                ["host", window.location.host],
                ["path", path],
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
                      changesetXML: string): Promise<number> {
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
                self.parseUploadChangesetResponse(response);
                console.log("Uploaded changeset ", changesetId);
                resolve(changesetId);
            });
        })

    }


}