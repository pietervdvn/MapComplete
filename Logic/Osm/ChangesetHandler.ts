import {State} from "../../State";
import {UserDetails} from "./OsmConnection";
import {UIEventSource} from "../UIEventSource";

export class ChangesetHandler {

    private _dryRun: boolean;
    private userDetails: UIEventSource<UserDetails>;
    private auth: any;

    constructor(dryRun: boolean, userDetails: UIEventSource<UserDetails>, auth) {
        this._dryRun = dryRun;
        this.userDetails = userDetails;
        this.auth = auth;

        if (dryRun) {
            console.log("DRYRUN ENABLED");
        }
    }


    public UploadChangeset(generateChangeXML: (csid: string) => string,
                           handleMapping: (idMapping: any) => void,
                           continuation: () => void) {

        if (this._dryRun) {
            console.log("NOT UPLOADING as dryrun is true");
            var changesetXML = generateChangeXML("123456");
            console.log(changesetXML);
            continuation();
            return;
        }

        const self = this;
        this.OpenChangeset(
            function (csId) {
                var changesetXML = generateChangeXML(csId);
                self.AddChange(csId, changesetXML,
                    function (csId, mapping) {
                        self.CloseChangeset(csId, continuation);
                        handleMapping(mapping);
                    }
                );

            }
        );

        this.userDetails.data.csCount++;
        this.userDetails.ping();
    }


    private OpenChangeset(continuation: (changesetId: string) => void) {

        const layout = State.state.layoutToUse.data;

        this.auth.xhr({
            method: 'PUT',
            path: '/api/0.6/changeset/create',
            options: {header: {'Content-Type': 'text/xml'}},
            content: [`<osm><changeset>`,
                `<tag k="created_by" v="MapComplete ${State.vNumber}" />`,
                `<tag k="comment" v="Adding data with #MapComplete"/>`,
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
                      continuation: ((changesetId: string, idMapping: any) => void)) {
        this.auth.xhr({
            method: 'POST',
            options: {header: {'Content-Type': 'text/xml'}},
            path: '/api/0.6/changeset/' + changesetId + '/upload',
            content: changesetXML
        }, function (err, response) {
            if (response == null) {
                console.log("err", err);
                return;
            }
            const mapping = ChangesetHandler.parseUploadChangesetResponse(response);
            console.log("Uploaded changeset ", changesetId);
            continuation(changesetId, mapping);
        });
    }

    private CloseChangeset(changesetId: string, continuation: (() => void)) {
        console.log("closing");
        this.auth.xhr({
            method: 'PUT',
            path: '/api/0.6/changeset/' + changesetId + '/close',
        }, function (err, response) {
            if (response == null) {

                console.log("err", err);
            }
            console.log("Closed changeset ", changesetId);

            if (continuation !== undefined) {
                continuation();
            }
        });
    }

    private static parseUploadChangesetResponse(response: XMLDocument) {
        const nodes = response.getElementsByTagName("node");
        const mapping = {};
        // @ts-ignore
        for (const node of nodes) {
            const oldId = parseInt(node.attributes.old_id.value);
            const newId = parseInt(node.attributes.new_id.value);
            if (oldId !== undefined && newId !== undefined &&
                !isNaN(oldId) && !isNaN(newId)) {
                mapping["node/" + oldId] = "node/" + newId;
            }
        }
        return mapping;
    }


}