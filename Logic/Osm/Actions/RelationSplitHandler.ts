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

abstract class AbstractRelationSplitHandler extends OsmChangeAction {
    protected readonly _input: RelationSplitInput;
    protected readonly _theme: string;

    constructor(input: RelationSplitInput, theme: string) {
        super("relation/" + input.relation.id, false)
        this._input = input;
        this._theme = theme;
    }

    /**
     * Returns which node should border the member at the given index
     */
    protected async targetNodeAt(i: number, first: boolean) {
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
}

/**
 * When a way is split and this way is part of a relation, the relation should be updated too to have the new segment if relevant.
 */
export default class RelationSplitHandler extends AbstractRelationSplitHandler {

    constructor(input: RelationSplitInput, theme: string) {
        super(input, theme)
    }

    async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {
        if (this._input.relation.tags["type"] === "restriction") {
            // This is a turn restriction
            return new TurnRestrictionRSH(this._input, this._theme).CreateChangeDescriptions(changes)
        }
        return new InPlaceReplacedmentRTSH(this._input, this._theme).CreateChangeDescriptions(changes)
    }


}

export class TurnRestrictionRSH extends AbstractRelationSplitHandler {

    constructor(input: RelationSplitInput, theme: string) {
        super(input, theme);
    }

    public async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {

        const relation = this._input.relation
        const members = relation.members

        const selfMembers = members.filter(m => m.type === "way" && m.ref === this._input.originalWayId)

        if (selfMembers.length > 1) {
            console.warn("Detected a turn restriction where this way has multiple occurances. This is an error")
        }
        const selfMember = selfMembers[0]

        if (selfMember.role === "via") {
            // A via way can be replaced in place
            return new InPlaceReplacedmentRTSH(this._input, this._theme).CreateChangeDescriptions(changes);
        }


        // We have to keep only the way with a common point with the rest of the relation
        // Let's figure out which member is neighbouring our way

        let commonStartPoint: number = await this.targetNodeAt(members.indexOf(selfMember), true)
        let commonEndPoint: number = await this.targetNodeAt(members.indexOf(selfMember), false)

        // In normal circumstances, only one of those should be defined
        let commonPoint = commonStartPoint ?? commonEndPoint

        // Let's select the way to keep
        const idToKeep: { id: number } = this._input.allWaysNodesInOrder.map((nodes, i) => ({
            nodes: nodes,
            id: this._input.allWayIdsInOrder[i]
        }))
            .filter(nodesId => {
                const nds = nodesId.nodes
                return nds[0] == commonPoint || nds[nds.length - 1] == commonPoint
            })[0]

        if (idToKeep === undefined) {
            console.error("No common point found, this was a broken turn restriction!", relation.id)
            return []
        }

        const originalWayId = this._input.originalWayId
        if (idToKeep.id === originalWayId) {
            console.log("Turn_restriction fixer: the original ID can be kept, nothing to do")
            return []
        }

        const newMembers: {
            ref: number,
            type: "way" | "node" | "relation",
            role: string
        } [] = relation.members.map(m => {
            if (m.type === "way" && m.ref === originalWayId) {
                return {
                    ref: idToKeep.id,
                    type: "way",
                    role: m.role
                }
            }
            return m
        })


        return [
            {
                type: "relation",
                id: relation.id,
                changes: {
                    members: newMembers
                },
                meta: {
                    theme: this._theme,
                    changeType: "relation-fix:turn_restriction"
                }
            }
        ];
    }

}

/**
 * A simple strategy to split relations:
 * -> Download the way members just before and just after the original way
 * -> Make sure they are still aligned
 *
 * Note that the feature might appear multiple times.
 */
export class InPlaceReplacedmentRTSH extends AbstractRelationSplitHandler {

    constructor(input: RelationSplitInput, theme: string) {
        super(input, theme);
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

            const firstNodeMatches = nodeIdBefore === undefined || nodeIdBefore === firstNode
            const lastNodeMatches = nodeIdAfter === undefined || nodeIdAfter === lastNode

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
            const lastNodeMatchesRev = nodeIdAfter === undefined || nodeIdAfter === firstNode
            if (firstNodeMatchesRev || lastNodeMatchesRev) {
                // We (probably) have a reversed situation, backward situation
                for (let i1 = this._input.allWayIdsInOrder.length - 1; i1 >= 0; i1--) {
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
            meta: {
                changeType: "relation-fix",
                theme: this._theme
            }
        }];
    }

}