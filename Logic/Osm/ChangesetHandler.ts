import escapeHtml from "escape-html";
// @ts-ignore
import {OsmConnection, UserDetails} from "./OsmConnection";
import {UIEventSource} from "../UIEventSource";
import {ElementStorage} from "../ElementStorage";
import State from "../../State";
import Locale from "../../UI/i18n/Locale";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Constants from "../../Models/Constants";
import {OsmObject} from "./OsmObject";

export class ChangesetHandler {

    public readonly currentChangeset: UIEventSource<string>;
    private readonly _dryRun: boolean;
    private readonly userDetails: UIEventSource<UserDetails>;
    private readonly auth: any;

    constructor(layoutName: string, dryRun: boolean, osmConnection: OsmConnection, auth) {
        this._dryRun = dryRun;
        this.userDetails = osmConnection.userDetails;
        this.auth = auth;
        this.currentChangeset = osmConnection.GetPreference("current-open-changeset-" + layoutName);

        if (dryRun) {
            console.log("DRYRUN ENABLED");
        }
    }

    private static parseUploadChangesetResponse(response: XMLDocument, allElements: ElementStorage): void {
        const nodes = response.getElementsByTagName("node");
        // @ts-ignore
        for (const node of nodes) {
            const oldId = parseInt(node.attributes.old_id.value);
            if (node.attributes.new_id === undefined) {
                // We just removed this point!
                const element = allElements.getEventSourceById("node/" + oldId);
                element.data._deleted = "yes"
                element.ping();
                continue;
            }

            const newId = parseInt(node.attributes.new_id.value);
            if (oldId !== undefined && newId !== undefined &&
                !isNaN(oldId) && !isNaN(newId)) {
                if (oldId == newId) {
                    continue;
                }
                console.log("Rewriting id: ", oldId, "-->", newId);
                const element = allElements.getEventSourceById("node/" + oldId);
                element.data.id = "node/" + newId;
                allElements.addElementById("node/" + newId, element);
                element.ping();

            }


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
    public UploadChangeset(
        layout: LayoutConfig,
        allElements: ElementStorage,
        generateChangeXML: (csid: string) => string,
        whenDone: (csId: string) => void,
        onFail: () => void) {

        if (this.userDetails.data.csCount == 0) {
            // The user became a contributor!
            this.userDetails.data.csCount = 1;
            this.userDetails.ping();
        }

        if (this._dryRun) {
            const changesetXML = generateChangeXML("123456");
            console.log(changesetXML);
            whenDone("123456")
            return;
        }

        const self = this;

        if (this.currentChangeset.data === undefined || this.currentChangeset.data === "") {
            // We have to open a new changeset
            this.OpenChangeset(layout, (csId) => {
                this.currentChangeset.setData(csId);
                const changeset = generateChangeXML(csId);
                console.log(changeset);
                self.AddChange(csId, changeset,
                    allElements,
                    whenDone,
                    (e) => {
                        console.error("UPLOADING FAILED!", e)
                        onFail()
                    }
                )
            }, {
                onFail: onFail
            })
        } else {
            // There still exists an open changeset (or at least we hope so)
            const csId = this.currentChangeset.data;
            self.AddChange(
                csId,
                generateChangeXML(csId),
                allElements,
                whenDone,
                (e) => {
                    console.warn("Could not upload, changeset is probably closed: ", e);
                    // Mark the CS as closed...
                    this.currentChangeset.setData("");
                    // ... and try again. As the cs is closed, no recursive loop can exist  
                    self.UploadChangeset(layout, allElements, generateChangeXML, whenDone, onFail);
                }
            )

        }
    }


    /**
     * Deletes the element with the given ID from the OSM database.
     * DOES NOT PERFORM ANY SAFETY CHECKS!
     *
     * For the deletion of an element, a new, seperate changeset is created with a slightly changed comment and some extra flags set.
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

        function generateChangeXML(csId: string) {
            let [lat, lon] = object.centerpoint();

            let changes = `<osmChange version='0.6' generator='Mapcomplete ${Constants.vNumber}'>`;
            changes +=
                `<delete><${object.type} id="${object.id}" version="${object.version}" changeset="${csId}" lat="${lat}" lon="${lon}" /></delete>`;
            changes += "</osmChange>";
            continuation()
            return changes;

        }


        if (this._dryRun) {
            const changesetXML = generateChangeXML("123456");
            console.log(changesetXML);
            return;
        }

        const self = this;
        this.OpenChangeset(layout, (csId: string) => {

                // The cs is open - let us actually upload!
                const changes = generateChangeXML(csId)

                self.AddChange(csId, changes, allElements, (csId) => {
                    console.log("Successfully deleted ", object.id)
                    self.CloseChangeset(csId, continuation)
                }, (csId) => {
                    alert("Deletion failed... Should not happend")
                    // FAILED
                    self.CloseChangeset(csId, continuation)
                })
            }, {
                isDeletionCS: true,
                deletionReason: reason
            }
        )
    }

    private CloseChangeset(changesetId: string = undefined, continuation: (() => void) = () => {
    }) {
        if (changesetId === undefined) {
            changesetId = this.currentChangeset.data;
        }
        if (changesetId === undefined) {
            return;
        }
        console.log("closing changeset", changesetId);
        this.currentChangeset.setData("");
        this.auth.xhr({
            method: 'PUT',
            path: '/api/0.6/changeset/' + changesetId + '/close',
        }, function (err, response) {
            if (response == null) {

                console.log("err", err);
            }
            console.log("Closed changeset ", changesetId)

            if (continuation !== undefined) {
                continuation();
            }
        });
    }

    private OpenChangeset(
        layout: LayoutConfig,
        continuation: (changesetId: string) => void,
        options?: {
            isDeletionCS?: boolean,
            deletionReason?: string,
            onFail?: () => void
        }
    ) {
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

        this.auth.xhr({
            method: 'PUT',
            path: '/api/0.6/changeset/create',
            options: {header: {'Content-Type': 'text/xml'}},
            content: [`<osm><changeset>`,
                metadata,
                `</changeset></osm>`].join("")
        }, function (err, response) {
            if (response === undefined) {
                console.log("err", err);
                if(options.onFail){
                    options.onFail()
                }
                return;
            } else {
                continuation(response);
            }
        });
    }

    /**
     * Upload a changesetXML
     * @param changesetId
     * @param changesetXML
     * @param allElements
     * @param continuation
     * @param onFail
     * @constructor
     * @private
     */
    private AddChange(changesetId: string,
                      changesetXML: string,
                      allElements: ElementStorage,
                      continuation: ((changesetId: string) => void),
                      onFail: ((changesetId: string, reason: string) => void) = undefined) {
        this.auth.xhr({
            method: 'POST',
            options: {header: {'Content-Type': 'text/xml'}},
            path: '/api/0.6/changeset/' + changesetId + '/upload',
            content: changesetXML
        }, function (err, response) {
            if (response == null) {
                console.log("err", err);
                if (onFail) {
                    onFail(changesetId, err);
                }
                return;
            }
            ChangesetHandler.parseUploadChangesetResponse(response, allElements);
            console.log("Uploaded changeset ", changesetId);
            continuation(changesetId);
        });
    }


}