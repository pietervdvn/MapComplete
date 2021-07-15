export interface ChangeDescription {

    type: "node" | "way" | "relation",
    /**
     * Negative for a new objects
     */
    id: number,
    /*
 v = "" or v = undefined to erase this tag
 */
    tags?: { k: string, v: string }[],

    changes?: {
        lat: number,
        lon: number
    } | {
        // Coordinates are only used for rendering
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