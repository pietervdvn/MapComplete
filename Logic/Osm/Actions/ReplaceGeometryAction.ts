import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";
import {Tag} from "../../Tags/Tag";
import FeatureSource from "../../FeatureSource/FeatureSource";
import {OsmNode, OsmObject, OsmWay} from "../OsmObject";
import {GeoOperations} from "../../GeoOperations";
import StaticFeatureSource from "../../FeatureSource/Sources/StaticFeatureSource";
import CreateNewNodeAction from "./CreateNewNodeAction";
import ChangeTagAction from "./ChangeTagAction";
import {And} from "../../Tags/And";
import {Utils} from "../../../Utils";
import {OsmConnection} from "../OsmConnection";
import {GeoJSONObject} from "@turf/turf";
import FeaturePipeline from "../../FeatureSource/FeaturePipeline";

export default class ReplaceGeometryAction extends OsmChangeAction {
    /**
     * The target feature - mostly used for the metadata
     */
    private readonly feature: any;
    private readonly state: {
        osmConnection: OsmConnection,
        featurePipeline: FeaturePipeline
    };
    private readonly wayToReplaceId: string;
    private readonly theme: string;
    /**
     * The target coordinates that should end up in OpenStreetMap.
     * This is identical to either this.feature.geometry.coordinates or -in case of a polygon- feature.geometry.coordinates[0]
     */
    private readonly targetCoordinates: [number, number][];
    /**
     * If a target coordinate is close to another target coordinate, 'identicalTo' will point to the first index.
     */
    private readonly identicalTo: number[]
    private readonly newTags: Tag[] | undefined;

    constructor(
        state: {
            osmConnection: OsmConnection,
            featurePipeline: FeaturePipeline
        },
        feature: any,
        wayToReplaceId: string,
        options: {
            theme: string,
            newTags?: Tag[]
        }
    ) {
        super(wayToReplaceId, false);
        this.state = state;
        this.feature = feature;
        this.wayToReplaceId = wayToReplaceId;
        this.theme = options.theme;

        const geom = this.feature.geometry
        let coordinates: [number, number][]
        if (geom.type === "LineString") {
            coordinates = geom.coordinates
        } else if (geom.type === "Polygon") {
            coordinates = geom.coordinates[0]
        }
        this.targetCoordinates = coordinates

        this.identicalTo = coordinates.map(_ => undefined)

        for (let i = 0; i < coordinates.length; i++) {
            if (this.identicalTo[i] !== undefined) {
                continue
            }
            for (let j = i + 1; j < coordinates.length; j++) {
                const d = GeoOperations.distanceBetween(coordinates[i], coordinates[j])
                if (d < 0.1) {
                    this.identicalTo[j] = i
                }
            }
        }
        this.newTags = options.newTags
    }

    // noinspection JSUnusedGlobalSymbols
    public async getPreview(): Promise<FeatureSource> {
        const {closestIds, allNodesById, detachedNodeIds} = await this.GetClosestIds();
        console.debug("Generating preview, identicals are ",)
        const preview: GeoJSONObject[] = closestIds.map((newId, i) => {
            if (this.identicalTo[i] !== undefined) {
                return undefined
            }

            if (newId === undefined) {
                return {
                    type: "Feature",
                    properties: {
                        "newpoint": "yes",
                        "id": "replace-geometry-move-" + i
                    },
                    geometry: {
                        type: "Point",
                        coordinates: this.targetCoordinates[i]
                    }
                };
            }
            const origPoint = allNodesById.get(newId).centerpoint()
            return {
                type: "Feature",
                properties: {
                    "move": "yes",
                    "osm-id": newId,
                    "id": "replace-geometry-move-" + i
                },
                geometry: {
                    type: "LineString",
                    coordinates: [[origPoint[1], origPoint[0]], this.targetCoordinates[i]]
                }
            };
        })

        for (const detachedNodeId of detachedNodeIds) {
            const origPoint = allNodesById.get(detachedNodeId).centerpoint()
            const feature = {
                type: "Feature",
                properties: {
                    "detach": "yes",
                    "id": "replace-geometry-detach-" + detachedNodeId
                },
                geometry: {
                    type: "Point",
                    coordinates: [origPoint[1], origPoint[0]]
                }
            };
            preview.push(feature)
        }


        return new StaticFeatureSource(Utils.NoNull(preview), false)

    }

    protected async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {

        const allChanges: ChangeDescription[] = []
        const actualIdsToUse: number[] = []

        const {closestIds, osmWay, detachedNodeIds} = await this.GetClosestIds()

        for (let i = 0; i < closestIds.length; i++) {
            if (this.identicalTo[i] !== undefined) {
                const j = this.identicalTo[i]
                actualIdsToUse.push(actualIdsToUse[j])
                continue
            }
            const closestId = closestIds[i];
            const [lon, lat] = this.targetCoordinates[i]
            if (closestId === undefined) {

                const newNodeAction = new CreateNewNodeAction(
                    [],
                    lat, lon,
                    {
                        allowReuseOfPreviouslyCreatedPoints: true,
                        theme: this.theme, changeType: null
                    })
                const changeDescr = await newNodeAction.CreateChangeDescriptions(changes)
                allChanges.push(...changeDescr)
                actualIdsToUse.push(newNodeAction.newElementIdNumber)

            } else {
                const change = <ChangeDescription>{
                    id: closestId,
                    type: "node",
                    meta: {
                        theme: this.theme,
                        changeType: "move"
                    },
                    changes: {lon, lat}
                }
                actualIdsToUse.push(closestId)
                allChanges.push(change)
            }
        }


        if (this.newTags !== undefined && this.newTags.length > 0) {
            const addExtraTags = new ChangeTagAction(
                this.wayToReplaceId,
                new And(this.newTags),
                osmWay.tags, {
                    theme: this.theme,
                    changeType: "conflation"
                }
            )
            allChanges.push(...await addExtraTags.CreateChangeDescriptions(changes))
        }

        // Actually change the nodes of the way!
        allChanges.push({
            type: "way",
            id: osmWay.id,
            changes: {
                nodes: actualIdsToUse,
                coordinates: this.targetCoordinates
            },
            meta: {
                theme: this.theme,
                changeType: "conflation"
            }
        })


        // Some nodes might need to be deleted
        if (detachedNodeIds.length > 0) {

            const nodeDb = this.state.featurePipeline.fullNodeDatabase;
            if (nodeDb === undefined) {
                throw "PANIC: replaceGeometryAction needs the FullNodeDatabase, which is undefined. This should be initialized by having the 'type_node'-layer enabled in your theme. (NB: the replacebutton has type_node as dependency)"
            }
            for (const nodeId of detachedNodeIds) {
                const osmNode = nodeDb.GetNode(nodeId)
                const parentWayIds: number[] = JSON.parse(osmNode.tags["parent_way_ids"])
                const index = parentWayIds.indexOf(osmWay.id)
                if(index < 0){
                    console.error("ReplaceGeometryAction is trying to detach node "+nodeId+", but it isn't listed as being part of way "+osmWay.id)
                    continue;
                }
                parentWayIds.splice(index, 1)
                osmNode.tags["parent_way_ids"] = JSON.stringify(parentWayIds)
                if(parentWayIds.length == 0){
                    // This point has no other ways anymore - lets clean it!
                    console.log("Removing node "+nodeId, "as it isn't needed anymore by any way")
                    
                    allChanges.push({
                        meta: {
                            theme: this.theme,
                            changeType: "delete"
                        },
                        doDelete: true,
                        type: "node",
                        id: nodeId,
                    })
                    
                }
            }


        }

        return allChanges
    }

    /**
     * For 'this.feature`, gets a corresponding closest node that alreay exsists.
     * 
     * This method contains the main logic for this module, as it decides which node gets moved where.
     * 
     */
    private async GetClosestIds(): Promise<{

        // A list of the same length as targetCoordinates, containing which OSM-point to move. If undefined, a new point will be created
        closestIds: number[],
        allNodesById: Map<number, OsmNode>,
        osmWay: OsmWay,
        detachedNodeIds: number[]
    }> {
        // TODO FIXME: cap move length on points which are embedded into other ways (ev. disconnect them)
        // TODO FIXME: if a new point has to be created, snap to already existing ways


        let parsed: OsmObject[];
        {
            // Gather the needed OsmObjects
            const splitted = this.wayToReplaceId.split("/");
            const type = splitted[0];
            const idN = Number(splitted[1]);
            if (idN < 0 || type !== "way") {
                throw "Invalid ID to conflate: " + this.wayToReplaceId
            }
            const url = `${this.state.osmConnection._oauth_config.url}/api/0.6/${this.wayToReplaceId}/full`;
            const rawData = await Utils.downloadJsonCached(url, 1000)
            parsed = OsmObject.ParseObjects(rawData.elements);
        }
        const allNodes = parsed.filter(o => o.type === "node")

        /**
         * For every already existing OSM-point, we calculate the distance to every target point
         */

        const distances = new Map<number /* osmId*/, number[] /* target coordinate index --> distance (or undefined if a duplicate)*/>();
        for (const node of allNodes) {
            const nodeDistances = this.targetCoordinates.map(_ => undefined)
            for (let i = 0; i < this.targetCoordinates.length; i++) {
                if (this.identicalTo[i] !== undefined) {
                    continue;
                }
                const targetCoordinate = this.targetCoordinates[i];
                const cp = node.centerpoint()
                nodeDistances[i] = GeoOperations.distanceBetween(targetCoordinate, [cp[1], cp[0]])
            }
            distances.set(node.id, nodeDistances)
        }

        /**
         * Then, we search the node that has to move the least distance and add this as mapping.
         * We do this until no points are left
         */
        let candidate: number;
        let moveDistance: number;
        const closestIds = this.targetCoordinates.map(_ => undefined)
        /**
         * The list of nodes that are _not_ used anymore, typically if there are less targetCoordinates then source coordinates
         */
        const unusedIds = []
        do {
            candidate = undefined;
            moveDistance = Infinity;
            distances.forEach((distances, nodeId) => {
                const minDist = Math.min(...Utils.NoNull(distances))
                if (moveDistance > minDist) {
                    // We have found a candidate to move
                    candidate = nodeId
                    moveDistance = minDist
                }
            })

            if (candidate !== undefined) {
                // We found a candidate... Search the corresponding target id:
                let targetId: number = undefined;
                let lowestDistance = Number.MAX_VALUE
                let nodeDistances = distances.get(candidate)
                for (let i = 0; i < nodeDistances.length; i++) {
                    const d = nodeDistances[i]
                    if (d !== undefined && d < lowestDistance) {
                        lowestDistance = d;
                        targetId = i;
                    }
                }

                // This candidates role is done, it can be removed from the distance matrix
                distances.delete(candidate)

                if (targetId !== undefined) {
                    // At this point, we have our target coordinate index: targetId!
                    // Lets map it...
                    closestIds[targetId] = candidate

                    // To indicate that this targetCoordinate is taken, we remove them from the distances matrix
                    distances.forEach(dists => {
                        dists[targetId] = undefined
                    })
                } else {
                    // Seems like all the targetCoordinates have found a source point
                    unusedIds.push(candidate)
                }
            }
        } while (candidate !== undefined)


        // If there are still unused values in 'distances', they are definitively unused
        distances.forEach((_, nodeId) => {
            unusedIds.push(nodeId)
        })

        {
            // Some extra data is included for rendering
            const osmWay = <OsmWay>parsed[parsed.length - 1]
            if (osmWay.type !== "way") {
                throw "WEIRD: expected an OSM-way as last element here!"
            }
            const allNodesById = new Map<number, OsmNode>()
            for (const node of allNodes) {
                allNodesById.set(node.id, <OsmNode>node)
            }
            return {closestIds, allNodesById, osmWay, detachedNodeIds: unusedIds};
        }
    }


}