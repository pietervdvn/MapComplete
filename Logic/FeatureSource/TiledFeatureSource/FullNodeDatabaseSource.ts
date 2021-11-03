import TileHierarchy from "./TileHierarchy";
import FeatureSource, {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {OsmNode, OsmObject, OsmWay} from "../../Osm/OsmObject";
import SimpleFeatureSource from "../Sources/SimpleFeatureSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {TagsFilter} from "../../Tags/TagsFilter";
import OsmChangeAction from "../../Osm/Actions/OsmChangeAction";
import StaticFeatureSource from "../Sources/StaticFeatureSource";
import {OsmConnection} from "../../Osm/OsmConnection";
import {GeoOperations} from "../../GeoOperations";
import {Utils} from "../../../Utils";
import {UIEventSource} from "../../UIEventSource";
import {BBox} from "../../BBox";
import FeaturePipeline from "../FeaturePipeline";
import {Tag} from "../../Tags/Tag";
import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig";
import {ChangeDescription} from "../../Osm/Actions/ChangeDescription";
import CreateNewNodeAction from "../../Osm/Actions/CreateNewNodeAction";
import ChangeTagAction from "../../Osm/Actions/ChangeTagAction";
import {And} from "../../Tags/And";


export default class FullNodeDatabaseSource implements TileHierarchy<FeatureSource & Tiled> {
    public readonly loadedTiles = new Map<number, FeatureSource & Tiled>()
    private readonly onTileLoaded: (tile: (Tiled & FeatureSourceForLayer)) => void;
    private readonly layer: FilteredLayer

    constructor(
        layer: FilteredLayer,
        onTileLoaded: ((tile: Tiled & FeatureSourceForLayer) => void)) {
        this.onTileLoaded = onTileLoaded
        this.layer = layer;
        if (this.layer === undefined) {
            throw "Layer is undefined"
        }
    }

    /**
     * Given a list of coordinates, will search already existing OSM-points to snap onto.
     * Either the geometry will be moved OR the existing point will be moved, depending on configuration and tags.
     * This requires the 'type_node'-layer to be activated
     */
    public static MergePoints(
        state: {
            filteredLayers: UIEventSource<FilteredLayer[]>,
            featurePipeline: FeaturePipeline,
            layoutToUse: LayoutConfig
        },
        newGeometryLngLats: [number, number][],
        configs: ConflationConfig[],
    ) {
        const typeNode = state.filteredLayers.data.filter(l => l.layerDef.id === "type_node")[0]
        if (typeNode === undefined) {
            throw "Type Node layer is not defined. Add 'type_node' as layer to your layerconfig to use this feature"
        }

        const bbox = new BBox(newGeometryLngLats)
        const bbox_padded = bbox.pad(1.2)
        const allNodes: any[] = [].concat(...state.featurePipeline.GetFeaturesWithin("type_node", bbox).map(tile => tile.filter(
            feature => bbox_padded.contains(GeoOperations.centerpointCoordinates(feature))
        )))
        // The strategy: for every point of the new geometry, we search a point that is closeby and matches
        // If multiple options match, we choose the most optimal (aka closest)

        const maxDistance = Math.max(...configs.map(c => c.withinRangeOfM))
        for (const coordinate of newGeometryLngLats) {

            let closestNode = undefined;
            let closestNodeDistance = undefined
            for (const node of allNodes) {
                const d = GeoOperations.distanceBetween(GeoOperations.centerpointCoordinates(node), coordinate)
                if (d > maxDistance) {
                    continue
                }
                let matchesSomeConfig = false
                for (const config of configs) {
                    if (d > config.withinRangeOfM) {
                        continue
                    }
                    if (!config.ifMatches.matchesProperties(node.properties)) {
                        continue
                    }
                    matchesSomeConfig = true;
                }
                if (!matchesSomeConfig) {
                    continue
                }
                if (closestNode === undefined || closestNodeDistance > d) {
                    closestNode = node;
                    closestNodeDistance = d;
                }
            }


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
            feature: osmNode.asGeoJson(), freshness: now
        }))

        const featureSource = new SimpleFeatureSource(this.layer, tileId)
        featureSource.features.setData(asGeojsonFeatures)
        this.loadedTiles.set(tileId, featureSource)
        this.onTileLoaded(featureSource)

    }


}

export interface ConflationConfig {
    withinRangeOfM: number,
    ifMatches: TagsFilter,
    mode: "reuse_osm_point" | "move_osm_point"
}