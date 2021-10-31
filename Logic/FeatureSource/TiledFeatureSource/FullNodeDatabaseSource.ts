import TileHierarchy from "./TileHierarchy";
import FeatureSource, {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {OsmNode, OsmObject, OsmWay} from "../../Osm/OsmObject";
import SimpleFeatureSource from "../Sources/SimpleFeatureSource";
import {UIEventSource} from "../../UIEventSource";
import FilteredLayer from "../../../Models/FilteredLayer";


export default class FullNodeDatabaseSource implements TileHierarchy<FeatureSource & Tiled> {
    public readonly loadedTiles = new Map<number, FeatureSource & Tiled>()
    private readonly onTileLoaded: (tile: (Tiled & FeatureSourceForLayer)) => void;
    private readonly layer : FilteredLayer
    
    constructor(
        state: {
            readonly filteredLayers: UIEventSource<FilteredLayer[]>},
            osmFeatureSource: { rawDataHandlers: ((data: any, tileId: number) => void)[] }, 
        onTileLoaded: ((tile: Tiled & FeatureSourceForLayer) => void)) {
        this.onTileLoaded = onTileLoaded
        this.layer = state.filteredLayers.data.filter(l => l.layerDef.id === "type_node")[0]
        if(this.layer === undefined){
            throw "Weird: tracking all nodes, but layer 'type_node' is not defined"
        }
        const self = this
        osmFeatureSource.rawDataHandlers.push((osmJson, tileId) => self.handleOsmXml(osmJson, tileId))
    }

    private handleOsmXml(osmJson: any, tileId: number) {

        const allObjects = OsmObject.ParseObjects(osmJson.elements)
        const nodesById = new Map<number, OsmNode>()

        for (const osmObj of allObjects) {
            if (osmObj.type !== "node") {
                continue
            }
            const osmNode = <OsmNode>osmObj;
            nodesById.set(osmNode.id, osmNode)
        }

        const parentWaysByNodeId = new Map<number, OsmWay[]>()
        for (const osmObj of allObjects) {
            if (osmObj.type !== "way") {
                continue
            }
            const osmWay = <OsmWay>osmObj;
            for (const nodeId of osmWay.nodes) {

                if (!parentWaysByNodeId.has(nodeId)) {
                    parentWaysByNodeId.set(nodeId, [])
                }
                parentWaysByNodeId.get(nodeId).push(osmWay)
            }
        }
        parentWaysByNodeId.forEach((allWays, nodeId) => {
            nodesById.get(nodeId).tags["parent_ways"] = JSON.stringify(allWays.map(w => w.tags))
        })
        const now = new Date()
        const asGeojsonFeatures = Array.from(nodesById.values()).map(osmNode => ({
            feature: osmNode.asGeoJson(),freshness: now
        }))

        const featureSource = new SimpleFeatureSource(this.layer, tileId)
        featureSource.features.setData(asGeojsonFeatures)
        this.loadedTiles.set(tileId, featureSource)
        this.onTileLoaded(featureSource)

    }
    
}