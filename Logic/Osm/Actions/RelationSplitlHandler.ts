/**
 * The logic to handle relations after a way within 
 */
import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";
import {OsmRelation, OsmWay} from "../OsmObject";

export default class RelationSplitlHandler extends OsmChangeAction{

    constructor(partOf: OsmRelation[], newWayIds: number[], originalNodes: number[]) {
        super()
    }

    CreateChangeDescriptions(changes: Changes): ChangeDescription[] {
        return [];
    }


}