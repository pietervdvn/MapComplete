/**
 * Represents a single change to an object
 */
export interface ChangeDescription {

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
        // Coordinates are only used for rendering. They should be lon, lat
        locations: [number, number][]
        nodes: number[],
    } | {
        members: { type: "node" | "way" | "relation", ref: number, role: string }[]
    }

    /*
    Set to delete the object
     */
    doDelete?: boolean


}