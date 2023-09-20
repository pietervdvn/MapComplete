import { OsmNode, OsmObject, OsmWay } from "../../Osm/OsmObject"
import { UIEventSource } from "../../UIEventSource"
import { BBox } from "../../BBox"
import { Tiles } from "../../../Models/TileRange"

export default class FullNodeDatabaseSource {
    private readonly loadedTiles = new Map<number, Map<number, OsmNode>>()
    private readonly nodeByIds = new Map<number, OsmNode>()
    private readonly parentWays = new Map<number, UIEventSource<OsmWay[]>>()

    private smallestZoom = 99
    private largestZoom = 0

    public handleOsmJson(osmJson: any, z: number, x: number, y: number): void {
        const allObjects = OsmObject.ParseObjects(osmJson.elements)
        const nodesById = new Map<number, OsmNode>()

        this.smallestZoom = Math.min(this.smallestZoom, z)
        this.largestZoom = Math.max(this.largestZoom, z)

        for (const osmObj of allObjects) {
            if (osmObj.type !== "node") {
                continue
            }
            const osmNode = <OsmNode>osmObj
            nodesById.set(osmNode.id, osmNode)
            this.nodeByIds.set(osmNode.id, osmNode)
        }

        for (const osmObj of allObjects) {
            if (osmObj.type !== "way") {
                continue
            }
            const osmWay = <OsmWay>osmObj
            for (const nodeId of osmWay.nodes) {
                if (!this.parentWays.has(nodeId)) {
                    const src = new UIEventSource<OsmWay[]>([])
                    this.parentWays.set(nodeId, src)
                    src.addCallback((parentWays) => {
                        const tgs = nodesById.get(nodeId).tags
                        tgs["parent_ways"] = JSON.stringify(parentWays.map((w) => w.tags))
                        tgs["parent_way_ids"] = JSON.stringify(parentWays.map((w) => w.id))
                    })
                }
                const src = this.parentWays.get(nodeId)
                src.data.push(osmWay)
                src.ping()
            }
        }

        const tileId = Tiles.tile_index(z, x, y)
        this.loadedTiles.set(tileId, nodesById)
    }

    /**
     * Returns the OsmNode with the corresponding id (undefined if not found)
     * Note that this OsmNode will have a calculated tag 'parent_ways' and 'parent_way_ids', which are resp. stringified lists of parent way tags and ids
     * @param id
     * @constructor
     */
    public GetNode(id: number): OsmNode {
        return this.nodeByIds.get(id)
    }

    /**
     * Gets all the ways that the given node is a part of
     * @param nodeId
     * @constructor
     */
    public GetParentWays(nodeId: number): UIEventSource<OsmWay[]> {
        return this.parentWays.get(nodeId)
    }

    /**
     * Gets (at least) all nodes which are part of this BBOX; might also return some nodes that fall outside of the bbox but are closeby
     * @param bbox
     */
    getNodesWithin(bbox: BBox): Map<number, OsmNode> {
        const allById = new Map<number, OsmNode>()
        for (let z = this.smallestZoom; z < this.largestZoom; z++) {
            const range = Tiles.tileRangeFrom(bbox, z)
            Tiles.MapRange(range, (x, y) => {
                const tileId = Tiles.tile_index(z, x, y)
                const nodesById = this.loadedTiles.get(tileId)
                nodesById?.forEach((v, k) => allById.set(k, v))
            })
        }
        return allById
    }
}
