import {Tag} from "../../Tags/Tag";
import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";
import {And} from "../../Tags/And";

export default class CreateNewNodeAction extends OsmChangeAction {

    private readonly _basicTags: Tag[];
    private readonly _lat: number;
    private readonly _lon: number;

    public newElementId : string = undefined
    
    constructor(basicTags: Tag[], lat: number, lon: number) {
        super()
        this._basicTags = basicTags;
        this._lat = lat;
        this._lon = lon;
    }

    CreateChangeDescriptions(changes: Changes): ChangeDescription[] {
        const id = changes.getNewID()
        const properties = {
            id: "node/" + id
        }
        this.newElementId = "node/"+id
        for (const kv of this._basicTags) {
            if (typeof kv.value !== "string") {
                throw "Invalid value: don't use a regex in a preset"
            }
            properties[kv.key] = kv.value;
        }

        return [{
            tags: new And(this._basicTags).asChange(properties),
            type: "node",
            id: id,
            changes:{
                lat: this._lat,
                lon: this._lon
            }
        }]

    }


}