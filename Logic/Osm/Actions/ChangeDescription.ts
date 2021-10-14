import {OsmNode, OsmRelation, OsmWay} from "../OsmObject";

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
        theme: string,
        /**
         * The type of the change
         */
        changeType:  "answer" | "create" | "split" | "delete" | "move" | string
        /**
         * THe motivation for the change, e.g. 'deleted because does not exist anymore'
         */
        specialMotivation?: string
    },
    
    /**
     * Identifier of the object
     */
    type: "node" | "way" | "relation",
    /**
     * Identifier of the object
     * Negative for new objects
     */
    id: number,
    
    /**
     * All changes to tags
     * v = "" or v = undefined to erase this tag
     * 
     * Note that this list will only contain the _changes_ to the tags, not the full set of tags
     */
    tags?: { k: string, v: string }[],

    /**
     * A change to the geometry:
     * 1) Change of node location
     * 2) Change of way geometry
     * 3) Change of relation members (untested)
     */
    changes?: {
        lat: number,
        lon: number
    } | {
        // Coordinates are only used for rendering. They should be LAT, LON
        coordinates: [number, number][]
        nodes: number[],
    } | {
        members: { type: "node" | "way" | "relation", ref: number, role: string }[]
    }

    /*
    Set to delete the object
     */
    doDelete?: boolean
}

export class ChangeDescriptionTools{
    
    public static getGeojsonGeometry(change: ChangeDescription): any{
        switch (change.type) {
            case "node":
                const n = new OsmNode(change.id)
                n.lat = change.changes["lat"]
                n.lon = change.changes["lon"]
                return n.asGeoJson().geometry
            case "way":
                const w = new OsmWay(change.id)
                w.nodes = change.changes["nodes"]
                w.coordinates = change.changes["coordinates"].map(coor => coor.reverse())
                return w.asGeoJson().geometry
            case "relation":
                const r = new OsmRelation(change.id)
                r.members = change.changes["members"]
                return r.asGeoJson().geometry
        }
    }
}