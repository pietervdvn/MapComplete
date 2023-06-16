import { OsmConnection } from "../../Logic/Osm/OsmConnection"

export default class EditLayerState {
    public readonly osmConnection: OsmConnection
    constructor() {
        this.osmConnection = new OsmConnection({})
    }
}
