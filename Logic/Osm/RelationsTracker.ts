import {UIEventSource} from "../UIEventSource";

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

export default class RelationsTracker {

    public knownRelations = new UIEventSource<Map<string, { role: string; relation: Relation }[]>>(new Map(), "Relation memberships");

    constructor() {
    }

    /**
     * Gets an overview of the relations - except for multipolygons. We don't care about those
     * @param overpassJson
     * @constructor
     */
    private static GetRelationElements(overpassJson: any): Relation[] {
        const relations = overpassJson.elements
            .filter(element => element.type === "relation" && element.tags.type !== "multipolygon")
        for (const relation of relations) {
            relation.properties = relation.tags
        }
        return relations
    }

    public RegisterRelations(overpassJson: any): void {
        this.UpdateMembershipTable(RelationsTracker.GetRelationElements(overpassJson))
    }

    /**
     * Build a mapping of {memberId --> {role in relation, id of relation} }
     * @param relations
     * @constructor
     */
    private UpdateMembershipTable(relations: Relation[]): void {
        const memberships = this.knownRelations.data
        let changed = false;
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
                const knownRelations = memberships.get(key)

                const alreadyExists = knownRelations.some(knownRole => {
                    return knownRole.role === role.role && knownRole.relation === role.relation
                })
                if (!alreadyExists) {
                    knownRelations.push(role)
                    changed = true;
                }
            }
        }
        if (changed) {
            this.knownRelations.ping()
        }

    }

}