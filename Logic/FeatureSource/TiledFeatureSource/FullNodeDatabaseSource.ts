import TileHierarchy from "./TileHierarchy";
import FeatureSource, {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {OsmNode, OsmObject, OsmWay} from "../../Osm/OsmObject";
import SimpleFeatureSource from "../Sources/SimpleFeatureSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {UIEventSource} from "../../UIEventSource";


export default class FullNodeDatabaseSource implements TileHierarchy<FeatureSource & Tiled> {
    public readonly loadedTiles = new Map<number, FeatureSource & Tiled>()
    private readonly onTileLoaded: (tile: (Tiled & FeatureSourceForLayer)) => void;
    private readonly layer: FilteredLayer
    private readonly nodeByIds = new Map<number, OsmNode>();
    private readonly parentWays = new Map<number, UIEventSource<OsmWay[]>>()

    constructor(
        layer: FilteredLayer,
        onTileLoaded: ((tile: Tiled & FeatureSourceForLayer) => void)) {
        this.onTileLoaded = onTileLoaded
        this.layer = layer;
        if (this.layer === undefined) {
            throw "Layer is undefined"
        }
    }

    public handleOsmJson(osmJson: any, tileId: number) {

        const allObjects = OsmObject.ParseObjects(osmJson.elements)
        const nodesById = new Map<number, OsmNode>()

        for (const osmObj of allObjects) {
            if (osmObj.type !== "node") {
                continue
            }
            const osmNode = <OsmNode>osmObj;
            nodesById.set(osmNode.id, osmNode)
            this.nodeByIds.set(osmNode.id, osmNode)
        }

        for (const osmObj of allObjects) {
            if (osmObj.type !== "way") {
                continue
            }
            const osmWay = <OsmWay>osmObj;
            for (const nodeId of osmWay.nodes) {

                if (!this.parentWays.has(nodeId)) {
                    const src = new UIEventSource<OsmWay[]>([])
                    this.parentWays.set(nodeId, src)
                    src.addCallback(parentWays => {
                        const tgs = nodesById.get(nodeId).tags
                        tgs    ["parent_ways"] = JSON.stringify(parentWays.map(w => w.tags))
                        tgs["parent_way_ids"] = JSON.stringify(parentWays.map(w => w.id))
                    })
                }
                const src = this.parentWays.get(nodeId)
                src.data.push(osmWay)
                src.ping();
            }
        }
        const now = new Date()
        const asGeojsonFeatures = Array.from(nodesById.values()).map(osmNode => ({
            feature: osmNode.asGeoJson(), freshness: now
        }))

        const featureSource = new SimpleFeatureSource(this.layer, tileId)
        featureSource.features.setData(asGeojsonFeatures)
        this.loadedTiles.set(tileId, featureSource)
        this.onTileLoaded(featureSource)

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
     * Gets the parent way list
     * @param nodeId
     * @constructor
     */
    public GetParentWays(nodeId: number): UIEventSource<OsmWay[]> {
        return this.parentWays.get(nodeId)
    }

}

