import { OsmNode, OsmRelation, OsmWay } from "../OsmObject"

/**
 * Represents a single change to an object
 */
export interface ChangeDescription {
    /**
     * Metadata to be included in the changeset
     */
    meta: {
        /*
         * The theme with which this changeset was made
         */
        theme: string
        /**
         * The type of the change
         */
        changeType: "answer" | "create" | "split" | "delete" | "move" | "import" | string | null
        /**
         * THe motivation for the change, e.g. 'deleted because does not exist anymore'
         */
        specialMotivation?: string
        /**
         * Added by Changes.ts
         */
        distanceToObject?: number
    }

    /**
     * Identifier of the object
     */
    type: "node" | "way" | "relation"
    /**
     * Identifier of the object
     * Negative for new objects
     */
    id: number

    /**
     * All changes to tags
     * v = "" or v = undefined to erase this tag
     *
     * Note that this list will only contain the _changes_ to the tags, not the full set of tags
     */
    tags?: { k: string; v: string }[]

    /**
     * A change to the geometry:
     * 1) Change of node location
     * 2) Change of way geometry
     * 3) Change of relation members (untested)
     */
    changes?:
        | {
              lat: number
              lon: number
          }
        | {
              /* Coordinates are only used for rendering. They should be LON, LAT
               * */
              coordinates: [number, number][]
              nodes: number[]
          }
        | {
              members: { type: "node" | "way" | "relation"; ref: number; role: string }[]
          }

    /*
    Set to delete the object
     */
    doDelete?: boolean
}

export class ChangeDescriptionTools {
    /**
     * Rewrites all the ids in a changeDescription
     *
     * // should rewrite the id of the changed object
     * const change = <ChangeDescription> {
     *             id: -1234,
     *             type: "node",
     *             meta:{
     *                 theme:"test",
     *                 changeType: "answer"
     *             },
     *             tags:[
     *                 {
     *                     k: "key",
     *                     v: "value"
     *                 }
     *             ]
     *         }
     * }
     * const mapping = new Map<string, string>([["node/-1234", "node/42"]])
     * const rewritten = ChangeDescriptionTools.rewriteIds(change, mapping)
     * rewritten.id // => 42
     *
     * // should rewrite ids in nodes of a way
     * const change = <ChangeDescription> {
     *     type: "way",
     *     id: 789,
     *     changes: {
     *         nodes: [-1, -2, -3, 68453],
     *         coordinates: []
     *     },
     *     meta:{
     *         theme:"test",
     *         changeType: "create"
     *     }
     * }
     * const mapping = new Map<string, string>([["node/-1", "node/42"],["node/-2", "node/43"],["node/-3", "node/44"]])
     * const rewritten = ChangeDescriptionTools.rewriteIds(change, mapping)
     * rewritten.id // => 789
     * rewritten.changes["nodes"] // => [42,43,44, 68453]
     *
     * // should rewrite ids in relationship members
     * const change = <ChangeDescription> {
     *     type: "way",
     *     id: 789,
     *     changes: {
     *         members: [{type: "way", ref: -1, role: "outer"},{type: "way", ref: 48, role: "outer"}],
     *     },
     *     meta:{
     *         theme:"test",
     *         changeType: "create"
     *     }
     * }
     * const mapping = new Map<string, string>([["way/-1", "way/42"],["node/-2", "node/43"],["node/-3", "node/44"]])
     * const rewritten = ChangeDescriptionTools.rewriteIds(change, mapping)
     * rewritten.id // => 789
     * rewritten.changes["members"] // => [{type: "way", ref: 42, role: "outer"},{type: "way", ref: 48, role: "outer"}]
     *
     */
    public static rewriteIds(
        change: ChangeDescription,
        mappings: Map<string, string>
    ): ChangeDescription {
        const key = change.type + "/" + change.id
        const wayHasChangedNode = ((change.changes ?? {})["nodes"] ?? []).some((id) =>
            mappings.has("node/" + id)
        )
        const relationHasChangedMembers = ((change.changes ?? {})["members"] ?? []).some(
            (obj: { type: string; ref: number }) => mappings.has(obj.type + "/" + obj.ref)
        )

        const hasSomeChange = mappings.has(key) || wayHasChangedNode || relationHasChangedMembers
        if (hasSomeChange) {
            change = { ...change }
        }

        if (mappings.has(key)) {
            const [_, newId] = mappings.get(key).split("/")
            change.id = Number.parseInt(newId)
        }
        if (wayHasChangedNode) {
            change.changes = { ...change.changes }
            change.changes["nodes"] = change.changes["nodes"].map((id) => {
                const key = "node/" + id
                if (!mappings.has(key)) {
                    return id
                }
                const [_, newId] = mappings.get(key).split("/")
                return Number.parseInt(newId)
            })
        }
        if (relationHasChangedMembers) {
            change.changes = { ...change.changes }
            change.changes["members"] = change.changes["members"].map(
                (obj: { type: string; ref: number }) => {
                    const key = obj.type + "/" + obj.ref
                    if (!mappings.has(key)) {
                        return obj
                    }
                    const [_, newId] = mappings.get(key).split("/")
                    return { ...obj, ref: Number.parseInt(newId) }
                }
            )
        }

        return change
    }

    public static getGeojsonGeometry(change: ChangeDescription): any {
        switch (change.type) {
            case "node":
                const n = new OsmNode(change.id)
                n.lat = change.changes["lat"]
                n.lon = change.changes["lon"]
                return n.asGeoJson().geometry
            case "way":
                const w = new OsmWay(change.id)
                w.nodes = change.changes["nodes"]
                w.coordinates = change.changes["coordinates"].map(([lon, lat]) => [lat, lon])
                return w.asGeoJson().geometry
            case "relation":
                const r = new OsmRelation(change.id)
                r.members = change.changes["members"]
                return r.asGeoJson().geometry
        }
    }

    public static rewriteAllIds(
        changes: ChangeDescription[],
        mappings: Map<string, string>
    ): ChangeDescription[] {
        return changes.map((c) => ChangeDescriptionTools.rewriteIds(c, mappings))
    }
}
