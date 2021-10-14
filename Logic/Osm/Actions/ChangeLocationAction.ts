import {ChangeDescription} from "./ChangeDescription";
import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";

export default class ChangeLocationAction extends OsmChangeAction {
    private readonly _id: number;
    private readonly _newLonLat: [number, number];
    private readonly _meta: { theme: string; reason: string };

    constructor(id: string, newLonLat: [number, number], meta: {
        theme: string,
        reason: string
    }) {
        super();
        if (!id.startsWith("node/")) {
            throw "Invalid ID: only 'node/number' is accepted"
        }
        this._id = Number(id.substring("node/".length))
        this._newLonLat = newLonLat;
        this._meta = meta;
    }

    protected async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {

        const d: ChangeDescription = {
            changes: {
                lat: this._newLonLat[1],
                lon: this._newLonLat[0]
            },
            type: "node",
            id: this._id, meta: {
                changeType: "move",
                theme: this._meta.theme,
                specialMotivation: this._meta.reason
            }

        }

        return [d]
    }
}