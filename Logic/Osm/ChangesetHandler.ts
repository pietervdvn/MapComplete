import {State} from "../../State";
import {OsmConnection, UserDetails} from "./OsmConnection";
import {UIEventSource} from "../UIEventSource";

export class ChangesetHandler {

    private _dryRun: boolean;
    private userDetails: UIEventSource<UserDetails>;
    private auth: any;

    public currentChangeset: UIEventSource<string>;

    constructor(layoutName: string, dryRun: boolean, osmConnection: OsmConnection, auth) {
        this._dryRun = dryRun;
        this.userDetails = osmConnection.userDetails;
        this.auth = auth;
        this.currentChangeset = osmConnection.GetPreference("current-open-changeset-" + layoutName);

        if (dryRun) {
            console.log("DRYRUN ENABLED");
        }
    }


    public UploadChangeset(generateChangeXML: (csid: string) => string,
                           continuation: () => void) {

        if (this._dryRun) {
            var changesetXML = generateChangeXML("123456");
            console.log(changesetXML);
            continuation();
            return;
        }

        const self = this;


        if (this.currentChangeset.data === undefined || this.currentChangeset.data === "") {
            // We have to open a new changeset
            this.OpenChangeset((csId) => {
                this.currentChangeset.setData(csId);
                const changeset = generateChangeXML(csId);
                console.log(changeset);
                self.AddChange(csId, changeset,
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
                () => {
                },
                (e) => {
                    console.warn("Could not upload, changeset is probably closed: ", e);
                    // Mark the CS as closed...
                    this.currentChangeset.setData("");
                    // ... and try again. As the cs is closed, no recursive loop can exist  
                    self.UploadChangeset(generateChangeXML, continuation);

                }
            )

        }
    }


    private OpenChangeset(continuation: (changesetId: string) => void) {

        const layout = State.state.layoutToUse.data;
        const commentExtra = layout.changesetMessage !== undefined? " - "+layout.changesetMessage : "";
        this.auth.xhr({
            method: 'PUT',
            path: '/api/0.6/changeset/create',
            options: {header: {'Content-Type': 'text/xml'}},
            content: [`<osm><changeset>`,
                `<tag k="created_by" v="MapComplete ${State.vNumber}" />`,
                `<tag k="comment" v="Adding data with #MapComplete for theme #${layout.name}${commentExtra}"/>`,
                `<tag k="theme" v="${layout.name}"/>`,
                layout.maintainer !== undefined ? `<tag k="theme-creator" v="${layout.maintainer}"/>` : "",
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
            const mapping = ChangesetHandler.parseUploadChangesetResponse(response);
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

    public static parseUploadChangesetResponse(response: XMLDocument) {
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
                const element = State.state.allElements.getElement("node/" + oldId);
                element.data.id = "node/" + newId;
                State.state.allElements.addElementById("node/" + newId, element);
                element.ping();

            }
        }
    }


}