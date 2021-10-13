import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";
import {OsmObject, OsmRelation, OsmWay} from "../OsmObject";

export interface RelationSplitInput {
    relation: OsmRelation,
    originalWayId: number,
    allWayIdsInOrder: number[],
    originalNodes: number[],
    allWaysNodesInOrder: number[][]
}

/**
 * When a way is split and this way is part of a relation, the relation should be updated too to have the new segment if relevant.
 */
export default class RelationSplitHandler extends OsmChangeAction {
    private readonly _input: RelationSplitInput;
    private readonly _theme: string;

    constructor(input: RelationSplitInput, theme: string) {
        super()
        this._input = input;
        this._theme = theme;
    }

    async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {
       return new InPlaceReplacedmentRTSH(this._input, this._theme).CreateChangeDescriptions(changes)
    }


}


/**
 * A simple strategy to split relations:
 * -> Download the way members just before and just after the original way
 * -> Make sure they are still aligned
 *
 * Note that the feature might appear multiple times.
 */
export class InPlaceReplacedmentRTSH extends OsmChangeAction {
    private readonly _input: RelationSplitInput;
    private readonly _theme: string;

    constructor(input: RelationSplitInput, theme: string) {
        super();
        this._input = input;
        this._theme = theme;
    }

    /**
     * Returns which node should border the member at the given index
     */
    private async targetNodeAt(i: number, first: boolean) {
        const member = this._input.relation.members[i]
        if (member === undefined) {
            return undefined
        }
        if (member.type === "node") {
            return member.ref
        }
        if (member.type === "way") {
            const osmWay = <OsmWay>await OsmObject.DownloadObjectAsync("way/" + member.ref)
            const nodes = osmWay.nodes
            if (first) {
                return nodes[0]
            } else {
                return nodes[nodes.length - 1]
            }
        }
        if (member.type === "relation") {
            return undefined
        }
        return undefined;
    }

    async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {

        const wayId = this._input.originalWayId
        const relation = this._input.relation
        const members = relation.members
        const originalNodes = this._input.originalNodes;
        const firstNode = originalNodes[0]
        const lastNode = originalNodes[originalNodes.length - 1]
        const newMembers: { type: "node" | "way" | "relation", ref: number, role: string }[] = []

        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            if (member.type !== "way" || member.ref !== wayId) {
                newMembers.push(member)
                continue;
            }

            const nodeIdBefore = await this.targetNodeAt(i - 1, false)
            const nodeIdAfter = await this.targetNodeAt(i + 1, true)

            const firstNodeMatches = nodeIdBefore === undefined ||  nodeIdBefore === firstNode
            const lastNodeMatches =nodeIdAfter === undefined ||  nodeIdAfter === lastNode

            if (firstNodeMatches && lastNodeMatches) {
                // We have a classic situation, forward situation
                for (const wId of this._input.allWayIdsInOrder) {
                    newMembers.push({
                        ref: wId,
                        type: "way",
                        role: member.role
                    })
                }
                continue;
            }

            const firstNodeMatchesRev = nodeIdBefore === undefined || nodeIdBefore === lastNode
            const lastNodeMatchesRev =nodeIdAfter === undefined || nodeIdAfter === firstNode
            if (firstNodeMatchesRev || lastNodeMatchesRev) {
                // We (probably) have a reversed situation, backward situation
                for (let i1 =  this._input.allWayIdsInOrder.length - 1; i1 >= 0; i1--){
                    // Iterate BACKWARDS
                    const wId = this._input.allWayIdsInOrder[i1];
                    newMembers.push({
                        ref: wId,
                        type: "way",
                        role: member.role
                    })
                }
                continue;
            }
            
            // Euhm, allright... Something weird is going on, but let's not care too much
            // Lets pretend this is forward going
            for (const wId of this._input.allWayIdsInOrder) {
                newMembers.push({
                    ref: wId,
                    type: "way",
                    role: member.role
                })
            }

        }

        return [{
            id: relation.id,
            type: "relation",
            changes: {members: newMembers},
            meta:{
                changeType: "relation-fix",
                theme: this._theme
            }
        }];
    }

}