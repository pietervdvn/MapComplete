import escapeHtml from "escape-html";
// @ts-ignore
import {OsmConnection, UserDetails} from "./OsmConnection";
import {UIEventSource} from "../UIEventSource";
import {ElementStorage} from "../ElementStorage";
import State from "../../State";
import Locale from "../../UI/i18n/Locale";
import Constants from "../../Models/Constants";
import {OsmObject} from "./OsmObject";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {Changes} from "./Changes";

export class ChangesetHandler {

    public readonly currentChangeset: UIEventSource<string>;
    private readonly allElements: ElementStorage;
    private readonly changes: Changes;
    private readonly _dryRun: boolean;
    private readonly userDetails: UIEventSource<UserDetails>;
    private readonly auth: any;

    constructor(layoutName: string, dryRun: boolean, osmConnection: OsmConnection,
                allElements: ElementStorage,
                changes: Changes,
                auth) {
        this.allElements = allElements;
        this.changes = changes;
        this._dryRun = dryRun;
        this.userDetails = osmConnection.userDetails;
        this.auth = auth;
        this.currentChangeset = osmConnection.GetPreference("current-open-changeset-" + layoutName);

        if (dryRun) {
            console.log("DRYRUN ENABLED");
        }
    }

    private handleIdRewrite(node: any, type: string): [string, string] {
        const oldId = parseInt(node.attributes.old_id.value);
        if (node.attributes.new_id === undefined) {
            // We just removed this point!
            const element =this. allElements.getEventSourceById("node/" + oldId);
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
        layout: LayoutConfig,
        generateChangeXML: (csid: string) => string): Promise<void> {
        if (this.userDetails.data.csCount == 0) {
            // The user became a contributor!
            this.userDetails.data.csCount = 1;
            this.userDetails.ping();
        }

        if (this._dryRun) {
            const changesetXML = generateChangeXML("123456");
            console.log(changesetXML);
            return;
        }

        if (this.currentChangeset.data === undefined || this.currentChangeset.data === "") {
            // We have to open a new changeset
            try {
                const csId = await this.OpenChangeset(layout)
                this.currentChangeset.setData(csId);
                const changeset = generateChangeXML(csId);
                console.log("Current changeset is:", changeset);
                await this.AddChange(csId, changeset)
            } catch (e) {
                console.error("Could not open/upload changeset due to ", e)
                this.currentChangeset.setData("")
            }
        } else {
            // There still exists an open changeset (or at least we hope so)
            const csId = this.currentChangeset.data;
            try {

                await this.AddChange(
                    csId,
                    generateChangeXML(csId))
            } catch (e) {
                console.warn("Could not upload, changeset is probably closed: ", e);
                // Mark the CS as closed...
                this.currentChangeset.setData("");
                // ... and try again. As the cs is closed, no recursive loop can exist  
                await this.UploadChangeset(layout, generateChangeXML)
            }
        }
    }


    /**
     * Deletes the element with the given ID from the OSM database.
     * DOES NOT PERFORM ANY SAFETY CHECKS!
     *
     * For the deletion of an element, a new, separate changeset is created with a slightly changed comment and some extra flags set.
     * The CS will be closed afterwards.
     *
     * If dryrun is specified, will not actually delete the point but print the CS-XML to console instead
     *
     */
    public DeleteElement(object: OsmObject,
                         layout: LayoutConfig,
                         reason: string,
                         allElements: ElementStorage,
                         continuation: () => void) {
        return this.DeleteElementAsync(object, layout, reason, allElements).then(continuation)
    }

    public async DeleteElementAsync(object: OsmObject,
                                    layout: LayoutConfig,
                                    reason: string,
                                    allElements: ElementStorage): Promise<void> {

        function generateChangeXML(csId: string) {
            let [lat, lon] = object.centerpoint();

            let changes = `<osmChange version='0.6' generator='Mapcomplete ${Constants.vNumber}'>`;
            changes +=
                `<delete><${object.type} id="${object.id}" version="${object.version}" changeset="${csId}" lat="${lat}" lon="${lon}" /></delete>`;
            changes += "</osmChange>";
            return changes;
        }


        if (this._dryRun) {
            const changesetXML = generateChangeXML("123456");
            console.log(changesetXML);
            return;
        }

        const csId = await this.OpenChangeset(layout, {
            isDeletionCS: true,
            deletionReason: reason
        })
        // The cs is open - let us actually upload!
        const changes = generateChangeXML(csId)
        await this.AddChange(csId, changes)
        await this.CloseChangeset(csId)
    }

    private async CloseChangeset(changesetId: string = undefined): Promise<void> {
        const self = this
        return new Promise<void>(function (resolve, reject) {
            if (changesetId === undefined) {
                changesetId = self.currentChangeset.data;
            }
            if (changesetId === undefined) {
                return;
            }
            console.log("closing changeset", changesetId);
            self.currentChangeset.setData("");
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

    private OpenChangeset(
        layout: LayoutConfig,
        options?: {
            isDeletionCS?: boolean,
            deletionReason?: string,
        }
    ): Promise<string> {
        const self = this;
        return new Promise<string>(function (resolve, reject) {
            options = options ?? {}
            options.isDeletionCS = options.isDeletionCS ?? false
            const commentExtra = layout.changesetmessage !== undefined ? " - " + layout.changesetmessage : "";
            let comment = `Adding data with #MapComplete for theme #${layout.id}${commentExtra}`
            if (options.isDeletionCS) {
                comment = `Deleting a point with #MapComplete for theme #${layout.id}${commentExtra}`
                if (options.deletionReason) {
                    comment += ": " + options.deletionReason;
                }
            }

            let path = window.location.pathname;
            path = path.substr(1, path.lastIndexOf("/"));
            const metadata = [
                ["created_by", `MapComplete ${Constants.vNumber}`],
                ["comment", comment],
                ["deletion", options.isDeletionCS ? "yes" : undefined],
                ["theme", layout.id],
                ["language", Locale.language.data],
                ["host", window.location.host],
                ["path", path],
                ["source", State.state.currentGPSLocation.data !== undefined ? "survey" : undefined],
                ["imagery", State.state.backgroundLayer.data.id],
                ["theme-creator", layout.maintainer]
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
                    resolve(response);
                }
            });
        })

    }

    /**
     * Upload a changesetXML
     */
    private AddChange(changesetId: string,
                      changesetXML: string): Promise<string> {
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