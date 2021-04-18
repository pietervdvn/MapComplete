import State from "../../State";

export interface Relation {
    id: number,
    type: "relation"
    members: {
        type: ("way" | "node" | "relation"),
        ref: number,
        role: string
    }[],
    tags: any,
    // Alias for tags; tags == properties
    properties: any
}

export default class ExtractRelations {

    public static RegisterRelations(overpassJson: any) : void{
        const memberships = ExtractRelations.BuildMembershipTable(ExtractRelations.GetRelationElements(overpassJson))
        console.log("Assigned memberships: ", memberships)
        State.state.knownRelations.setData(memberships)
    }
    
    private static GetRelationElements(overpassJson: any): Relation[] {
        const relations = overpassJson.elements.filter(element => element.type === "relation")
        for (const relation of relations) {
            relation.properties = relation.tags
        }
        return relations
    }

    /**
     * Build a mapping of {memberId --> {role in relation, id of relation} }
     * @param relations
     * @constructor
     */
    private static BuildMembershipTable(relations: Relation[]): Map<string, { role: string, relation: Relation, }[]> {
        const memberships = new Map<string, { role: string, relation: Relation }[]>()

        for (const relation of relations) {
            for (const member of relation.members) {

                const role = {
                    role: member.role,
                    relation: relation
                }
                const key = member.type + "/" + member.ref
                if (!memberships.has(key)) {
                    memberships.set(key, [])
                }
                memberships.get(key).push(role)
            }
        }

        return memberships
    }

}