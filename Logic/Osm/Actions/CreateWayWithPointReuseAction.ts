import OsmChangeAction from "./OsmChangeAction";
import {Tag} from "../../Tags/Tag";
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";
import FeaturePipelineState from "../../State/FeaturePipelineState";
import {BBox} from "../../BBox";
import {TagsFilter} from "../../Tags/TagsFilter";
import {GeoOperations} from "../../GeoOperations";
import FeatureSource from "../../FeatureSource/FeatureSource";
import StaticFeatureSource from "../../FeatureSource/Sources/StaticFeatureSource";
import CreateNewNodeAction from "./CreateNewNodeAction";
import CreateNewWayAction from "./CreateNewWayAction";


export interface MergePointConfig {
    withinRangeOfM: number,
    ifMatches: TagsFilter,
    mode: "reuse_osm_point" | "move_osm_point"
}

interface CoordinateInfo {
    lngLat: [number, number],
    identicalTo?: number,
    closebyNodes?: {
        d: number,
        node: any,
        config: MergePointConfig
    }[]
}

/**
 * More or less the same as 'CreateNewWay', except that it'll try to reuse already existing points
 */
export default class CreateWayWithPointReuseAction extends OsmChangeAction {
    private readonly _tags: Tag[];
    /**
     * lngLat-coordinates
     * @private
     */
    private _coordinateInfo: CoordinateInfo[];
    private _state: FeaturePipelineState;
    private _config: MergePointConfig[];

    constructor(tags: Tag[],
                coordinates: [number, number][],
                state: FeaturePipelineState,
                config: MergePointConfig[]
    ) {
        super(null,true);
        this._tags = tags;
        this._state = state;
        this._config = config;
        this._coordinateInfo = this.CalculateClosebyNodes(coordinates);

    }

    public async getPreview(): Promise<FeatureSource> {

        const features = []
        let geometryMoved = false;
        for (let i = 0; i < this._coordinateInfo.length; i++) {
            const coordinateInfo = this._coordinateInfo[i];
            if (coordinateInfo.identicalTo !== undefined) {
                continue
            }
            if (coordinateInfo.closebyNodes === undefined || coordinateInfo.closebyNodes.length === 0) {

                const newPoint = {
                    type: "Feature",
                    properties: {
                        "newpoint": "yes",
                        id: "new-geometry-with-reuse-" + i
                    },
                    geometry: {
                        type: "Point",
                        coordinates: coordinateInfo.lngLat
                    }
                };
                features.push(newPoint)
                continue
            }

            const reusedPoint = coordinateInfo.closebyNodes[0]
            if (reusedPoint.config.mode === "move_osm_point") {
                const moveDescription = {
                    type: "Feature",
                    properties: {
                        "move": "yes",
                        "osm-id": reusedPoint.node.properties.id,
                        "id": "new-geometry-move-existing" + i
                    },
                    geometry: {
                        type: "LineString",
                        coordinates: [reusedPoint.node.geometry.coordinates, coordinateInfo.lngLat]
                    }
                }
                features.push(moveDescription)

            } else {
                // The geometry is moved
                geometryMoved = true
            }
        }

        if (geometryMoved) {

            const coords: [number, number][] = []
            for (const info of this._coordinateInfo) {
                if (info.identicalTo !== undefined) {
                    coords.push(coords[info.identicalTo])
                    continue
                }

                if (info.closebyNodes === undefined || info.closebyNodes.length === 0) {
                    coords.push(coords[info.identicalTo])
                    continue
                }

                const closest = info.closebyNodes[0]
                if (closest.config.mode === "reuse_osm_point") {
                    coords.push(closest.node.geometry.coordinates)
                } else {
                    coords.push(info.lngLat)
                }

            }
            const newGeometry = {
                type: "Feature",
                properties: {
                    "resulting-geometry": "yes",
                    "id": "new-geometry"
                },
                geometry: {
                    type: "LineString",
                    coordinates: coords
                }
            }
            features.push(newGeometry)

        }
        console.log("Preview:", features)
        return new StaticFeatureSource(features, false)
    }

    protected async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {
        const theme = this._state.layoutToUse.id
        const allChanges: ChangeDescription[] = []
        const nodeIdsToUse: { lat: number, lon: number, nodeId?: number }[] = []
        for (let i = 0; i < this._coordinateInfo.length; i++) {
            const info = this._coordinateInfo[i]
            const lat = info.lngLat[1]
            const lon = info.lngLat[0]

            if (info.identicalTo !== undefined) {
                nodeIdsToUse.push(nodeIdsToUse[info.identicalTo])
                continue
            }
            if (info.closebyNodes === undefined || info.closebyNodes[0] === undefined) {
                const newNodeAction = new CreateNewNodeAction([], lat, lon, {
                    allowReuseOfPreviouslyCreatedPoints: true,
                    changeType: null,
                    theme
                })

                allChanges.push(...(await newNodeAction.CreateChangeDescriptions(changes)))

                nodeIdsToUse.push({
                    lat, lon,
                    nodeId: newNodeAction.newElementIdNumber
                })
                continue

            }

            const closestPoint = info.closebyNodes[0]
            const id = Number(closestPoint.node.properties.id.split("/")[1])
            if (closestPoint.config.mode === "move_osm_point") {
                allChanges.push({
                    type: "node",
                    id,
                    changes: {
                        lat, lon
                    },
                    meta: {
                        theme,
                        changeType: null
                    }
                })
            }
            nodeIdsToUse.push({lat, lon, nodeId: id})
        }


        const newWay = new CreateNewWayAction(this._tags, nodeIdsToUse, {
            theme
        })
        
        allChanges.push(...(await newWay.CreateChangeDescriptions(changes)))
        return allChanges
    }

    private CalculateClosebyNodes(coordinates: [number, number][]): CoordinateInfo[] {

        const bbox = new BBox(coordinates)
        const state = this._state
        const allNodes = [].concat(...state.featurePipeline.GetFeaturesWithin("type_node", bbox.pad(1.2)))
        const maxDistance = Math.max(...this._config.map(c => c.withinRangeOfM))

        const coordinateInfo: {
            lngLat: [number, number],
            identicalTo?: number,
            closebyNodes?: {
                d: number,
                node: any,
                config: MergePointConfig
            }[]
        }[] = coordinates.map(_ => undefined)

        for (let i = 0; i < coordinates.length; i++) {

            if (coordinateInfo[i] !== undefined) {
                // Already seen, probably a duplicate coordinate
                continue
            }
            const coor = coordinates[i]
            // Check closeby (and probably identical) point further in the coordinate list, mark them as duplicate
            for (let j = i + 1; j < coordinates.length; j++) {
                if (GeoOperations.distanceBetween(coor, coordinates[j]) < 0.1) {
                    coordinateInfo[j] = {
                        lngLat: coor,
                        identicalTo: i
                    }
                    break;
                }
            }

            // Gather the actual info for this point

            // Lets search applicable points and determine the merge mode
            const closebyNodes: {
                d: number,
                node: any,
                config: MergePointConfig
            }[] = []
            for (const node of allNodes) {
                const center = node.geometry.coordinates
                const d = GeoOperations.distanceBetween(coor, center)
                if (d > maxDistance) {
                    continue
                }

                for (const config of this._config) {
                    if (d > config.withinRangeOfM) {
                        continue
                    }
                    if (!config.ifMatches.matchesProperties(node.properties)) {
                        continue
                    }
                    closebyNodes.push({node, d, config})
                }
            }

            closebyNodes.sort((n0, n1) => {
                return n0.d - n1.d
            })

            coordinateInfo[i] = {
                identicalTo: undefined,
                lngLat: coor,
                closebyNodes
            }

        }

        let conflictFree = true;

        do {
            conflictFree = true;
            for (let i = 0; i < coordinateInfo.length; i++) {

                const coorInfo = coordinateInfo[i]
                if (coorInfo.identicalTo !== undefined) {
                    continue
                }
                if (coorInfo.closebyNodes === undefined || coorInfo.closebyNodes[0] === undefined) {
                    continue
                }

                for (let j = i + 1; j < coordinates.length; j++) {
                    const other = coordinateInfo[j]
                    if (other.closebyNodes === undefined || other.closebyNodes[0] === undefined) {
                        continue
                    }

                    if (other.closebyNodes[0].node === coorInfo.closebyNodes[0].node) {
                        conflictFree = false
                        // We have found a conflict!
                        // We only keep the closest point
                        if (other.closebyNodes[0].d > coorInfo.closebyNodes[0].d) {
                            other.closebyNodes.shift()
                        } else {
                            coorInfo.closebyNodes.shift()
                        }
                    }
                }
            }
        } while (!conflictFree)


        return coordinateInfo
    }

}