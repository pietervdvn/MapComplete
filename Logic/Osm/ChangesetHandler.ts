import escapeHtml from "escape-html";
// @ts-ignore
import {OsmConnection, UserDetails} from "./OsmConnection";
import {UIEventSource} from "../UIEventSource";
import {ElementStorage} from "../ElementStorage";
import State from "../../State";
import Locale from "../../UI/i18n/Locale";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Constants from "../../Models/Constants";

export class ChangesetHandler {

    private readonly _dryRun: boolean;
    private readonly userDetails: UIEventSource<UserDetails>;
    private readonly auth: any;

    public readonly currentChangeset: UIEventSource<string>;

    constructor(layoutName: string, dryRun: boolean, osmConnection: OsmConnection, auth) {
        this._dryRun = dryRun;
        this.userDetails = osmConnection.userDetails;
        this.auth = auth;
        this.currentChangeset = osmConnection.GetPreference("current-open-changeset-" + layoutName);

        if (dryRun) {
            console.log("DRYRUN ENABLED");
        }
    }


    public UploadChangeset(
        layout: LayoutConfig,
        allElements: ElementStorage,
        generateChangeXML: (csid: string) => string,
         continuation: () => void) {
        
        if(this.userDetails.data.csCount == 0){
            // The user became a contributor!
            this.userDetails.data.csCount = 1;
            this.userDetails.ping();
        }

        if (this._dryRun) {
            const changesetXML = generateChangeXML("123456");
            console.log(changesetXML);
            continuation();
            return;
        }

        const self = this;

        if (this.currentChangeset.data === undefined || this.currentChangeset.data === "") {
            // We have to open a new changeset
            this.OpenChangeset(layout,(csId) => {
                this.currentChangeset.setData(csId);
                const changeset = generateChangeXML(csId);
                console.log(changeset);
                self.AddChange(csId, changeset,
                    allElements,
                    () => {
                    },
                    (e) => {
                        console.error("UPLOADING FAILED!", e)
                    }
                )
            })
        } else {
            // There still exists an open changeset (or at least we hope so)
            const csId = this.currentChangeset.data;
            self.AddChange(
                csId,
                generateChangeXML(csId),
                allElements,
                () => {
                },
                (e) => {
                    console.warn("Could not upload, changeset is probably closed: ", e);
                    // Mark the CS as closed...
                    this.currentChangeset.setData("");
                    // ... and try again. As the cs is closed, no recursive loop can exist  
                    self.UploadChangeset(layout, allElements, generateChangeXML, continuation);

                }
            )

        }
    }


    private OpenChangeset(
        layout : LayoutConfig,
        continuation: (changesetId: string) => void) {

        const commentExtra = layout.changesetmessage !== undefined ? " - " + layout.changesetmessage : "";

        let surveySource = "";
        if (State.state.currentGPSLocation.data !== undefined) {
            surveySource = '<tag k="source" v="survey"/>'
        }

        this.auth.xhr({
            method: 'PUT',
            path: '/api/0.6/changeset/create',
            options: {header: {'Content-Type': 'text/xml'}},
            content: [`<osm><changeset>`,
                `<tag k="created_by" v="MapComplete ${Constants.vNumber}" />`,
                `<tag k="comment" v="Adding data with #MapComplete for theme #${layout.id}${commentExtra}"/>`,
                `<tag k="theme" v="${layout.id}"/>`,
                `<tag k="language" v="${Locale.language.data}"/>`,
                `<tag k="host" v="${escapeHtml(window.location.host)}"/>`,
                `<tag k="imagery" v="${State.state.backgroundLayer.data.id}"/>`,
                surveySource,
                (layout.maintainer ?? "") !== "" ? `<tag k="theme-creator" v="${escapeHtml(layout.maintainer)}"/>` : "",
                `</changeset></osm>`].join("")
        }, function (err, response) {
            if (response === undefined) {
                console.log("err", err);
                alert("Could not upload change (opening failed). Please file a bug report")
                return;
            } else {
                continuation(response);
            }
        });
    }

    private AddChange(changesetId: string,
                      changesetXML: string,
                      allElements: ElementStorage,
                      continuation: ((changesetId: string, idMapping: any) => void),
                      onFail: ((changesetId: string) => void) = undefined) {
        this.auth.xhr({
            method: 'POST',
            options: {header: {'Content-Type': 'text/xml'}},
            path: '/api/0.6/changeset/' + changesetId + '/upload',
            content: changesetXML
        }, function (err, response) {
            if (response == null) {
                console.log("err", err);
                if (onFail) {
                    onFail(changesetId);
                }
                return;
            }
            const mapping = ChangesetHandler.parseUploadChangesetResponse(response, allElements);
            console.log("Uploaded changeset ", changesetId);
            continuation(changesetId, mapping);
        });
    }

    public CloseChangeset(changesetId: string = undefined, continuation: (() => void) = () => {
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

    private static parseUploadChangesetResponse(response: XMLDocument, allElements: ElementStorage) {
        const nodes = response.getElementsByTagName("node");
        // @ts-ignore
        for (const node of nodes) {
            const oldId = parseInt(node.attributes.old_id.value);
            const newId = parseInt(node.attributes.new_id.value);
            if (oldId !== undefined && newId !== undefined &&
                !isNaN(oldId) && !isNaN(newId)) {
                if(oldId == newId){
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


}