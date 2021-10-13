import {ChangeDescription} from "./ChangeDescription";
import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";

export default class ChangeLocationAction extends OsmChangeAction {
    constructor(id: string, newLonLat: [number, number], meta: {
        theme: string,
        reason: string
    }) {
        super();
        throw "TODO"
    }

    protected CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {
        return Promise.resolve([]);
    }
}