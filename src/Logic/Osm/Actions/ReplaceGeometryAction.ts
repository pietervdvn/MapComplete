import OsmChangeAction, { PreviewableAction } from "./OsmChangeAction"
import { Changes } from "../Changes"
import { ChangeDescription } from "./ChangeDescription"
import { Tag } from "../../Tags/Tag"
import { FeatureSource } from "../../FeatureSource/FeatureSource"
import { OsmNode, OsmObject, OsmWay } from "../OsmObject"
import { GeoOperations } from "../../GeoOperations"
import StaticFeatureSource from "../../FeatureSource/Sources/StaticFeatureSource"
import CreateNewNodeAction from "./CreateNewNodeAction"
import ChangeTagAction from "./ChangeTagAction"
import { And } from "../../Tags/And"
import { Utils } from "../../../Utils"
import { OsmConnection } from "../OsmConnection"
import { Feature } from "@turf/turf"
import { Geometry, LineString, Point } from "geojson"
import FullNodeDatabaseSource from "../../FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"

export default class ReplaceGeometryAction extends OsmChangeAction implements PreviewableAction {
    /**
     * The target feature - mostly used for the metadata
     */
    private readonly feature: any
    private readonly state: {
        osmConnection: OsmConnection
        fullNodeDatabase?: FullNodeDatabaseSource
    }
    private readonly wayToReplaceId: string
    private readonly theme: string
    /**
     * The target coordinates that should end up in OpenStreetMap.
     * This is identical to either this.feature.geometry.coordinates or -in case of a polygon- feature.geometry.coordinates[0]
     * Format: [lon, lat]
     */
    private readonly targetCoordinates: [number, number][]
    /**
     * If a target coordinate is close to another target coordinate, 'identicalTo' will point to the first index.
     */
    private readonly identicalTo: number[]
    private readonly newTags: Tag[] | undefined

    /**
     * Not really the 'new' element, but the target that has been applied.
     * Added for compatibility with other systems
     */
    public readonly newElementId: string
    constructor(
        state: {
            osmConnection: OsmConnection
            fullNodeDatabase?: FullNodeDatabaseSource
        },
        feature: any,
        wayToReplaceId: string,
        options: {
            theme: string
            newTags?: Tag[]
        }
    ) {
        super(wayToReplaceId, false)
        this.state = state
        this.feature = feature
        this.wayToReplaceId = wayToReplaceId
        this.theme = options.theme
        this.newElementId = wayToReplaceId

        const geom = this.feature.geometry
        let coordinates: [number, number][]
        if (geom.type === "LineString") {
            coordinates = geom.coordinates
        } else if (geom.type === "Polygon") {
            coordinates = geom.coordinates[0]
        }
        this.targetCoordinates = coordinates

        this.identicalTo = coordinates.map((_) => undefined)

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

    public async getPreview(): Promise<FeatureSource> {
        const { closestIds, allNodesById, detachedNodes, reprojectedNodes } =
            await this.GetClosestIds()
        const preview: Feature<Geometry>[] = closestIds.map((newId, i) => {
            if (this.identicalTo[i] !== undefined) {
                return undefined
            }

            if (newId === undefined) {
                return {
                    type: "Feature",
                    properties: {
                        newpoint: "yes",
                        id: "replace-geometry-move-" + i,
                    },
                    geometry: {
                        type: "Point",
                        coordinates: this.targetCoordinates[i],
                    },
                }
            }

            const origNode = allNodesById.get(newId)
            return {
                type: "Feature",
                properties: {
                    move: "yes",
                    "osm-id": newId,
                    id: "replace-geometry-move-" + i,
                    "original-node-tags": JSON.stringify(origNode.tags),
                },
                geometry: {
                    type: "LineString",
                    coordinates: [[origNode.lon, origNode.lat], this.targetCoordinates[i]],
                },
            }
        })

        reprojectedNodes.forEach(({ newLat, newLon, nodeId }) => {
            const origNode = allNodesById.get(nodeId)
            const feature: Feature<LineString> = {
                type: "Feature",
                properties: {
                    move: "yes",
                    reprojection: "yes",
                    "osm-id": nodeId,
                    id: "replace-geometry-reproject-" + nodeId,
                    "original-node-tags": JSON.stringify(origNode.tags),
                },
                geometry: {
                    type: "LineString",
                    coordinates: [
                        [origNode.lon, origNode.lat],
                        [newLon, newLat],
                    ],
                },
            }
            preview.push(feature)
        })

        detachedNodes.forEach(({ reason }, id) => {
            const origNode = allNodesById.get(id)
            const feature: Feature<Point> = {
                type: "Feature",
                properties: {
                    detach: "yes",
                    id: "replace-geometry-detach-" + id,
                    "detach-reason": reason,
                    "original-node-tags": JSON.stringify(origNode.tags),
                },
                geometry: {
                    type: "Point",
                    coordinates: [origNode.lon, origNode.lat],
                },
            }
            preview.push(feature)
        })

        return StaticFeatureSource.fromGeojson(Utils.NoNull(preview))
    }

    /**
     * For 'this.feature`, gets a corresponding closest node that alreay exsists.
     *
     * This method contains the main logic for this module, as it decides which node gets moved where.
     *
     */
    public async GetClosestIds(): Promise<{
        // A list of the same length as targetCoordinates, containing which OSM-point to move. If undefined, a new point will be created
        closestIds: number[]
        allNodesById: Map<number, OsmNode>
        osmWay: OsmWay
        detachedNodes: Map<
            number,
            {
                reason: string
                hasTags: boolean
            }
        >
        reprojectedNodes: Map<
            number,
            {
                /*Move the node with this ID into the way as extra node, as it has some relation with the original object*/
                projectAfterIndex: number
                distance: number
                newLat: number
                newLon: number
                nodeId: number
            }
        >
    }> {
        // TODO FIXME: if a new point has to be created, snap to already existing ways

        const nodeDb = this.state.fullNodeDatabase
        if (nodeDb === undefined) {
            throw "PANIC: replaceGeometryAction needs the FullNodeDatabase, which is undefined. This should be initialized by having the 'type_node'-layer enabled in your theme. (NB: the replacebutton has type_node as dependency)"
        }
        const self = this
        let parsed: OsmObject[]
        {
            // Gather the needed OsmObjects
            const splitted = this.wayToReplaceId.split("/")
            const type = splitted[0]
            const idN = Number(splitted[1])
            if (idN < 0 || type !== "way") {
                throw "Invalid ID to conflate: " + this.wayToReplaceId
            }
            const url = `${
                this.state.osmConnection?._oauth_config?.url ?? "https://api.openstreetmap.org"
            }/api/0.6/${this.wayToReplaceId}/full`
            const rawData = await Utils.downloadJsonCached(url, 1000)
            parsed = OsmObject.ParseObjects(rawData.elements)
        }
        const allNodes = parsed.filter((o) => o.type === "node")
        const osmWay = <OsmWay>parsed[parsed.length - 1]
        if (osmWay.type !== "way") {
            throw "WEIRD: expected an OSM-way as last element here!"
        }
        const allNodesById = new Map<number, OsmNode>()
        for (const node of allNodes) {
            allNodesById.set(node.id, <OsmNode>node)
        }
        /**
         * For every already existing OSM-point, we calculate:
         *
         * - the distance to every target point.
         * - Wether this node has (other) parent ways, which might restrict movement
         * - Wether this node has tags set
         *
         * Having tags and/or being connected to another way indicate that there is some _relation_ with objects in the neighbourhood.
         *
         * The Replace-geometry action should try its best to honour these. Some 'wiggling' is allowed (e.g. moving an entrance a bit), but these relations should not be broken.l
         */
        const distances = new Map<
            number /* osmId*/,
            /** target coordinate index --> distance (or undefined if a duplicate)*/
            number[]
        >()

        const nodeInfo = new Map<
            number /* osmId*/,
            {
                distances: number[]
                // Part of some other way then the one that should be replaced
                partOfWay: boolean
                hasTags: boolean
            }
        >()

        for (const node of allNodes) {
            const parentWays = nodeDb.GetParentWays(node.id)
            if (parentWays === undefined) {
                throw "PANIC: the way to replace has a node which has no parents at all. Is it deleted in the meantime?"
            }
            const parentWayIds = parentWays.data.map((w) => w.type + "/" + w.id)
            const idIndex = parentWayIds.indexOf(this.wayToReplaceId)
            if (idIndex < 0) {
                throw "PANIC: the way to replace has a node, which is _not_ part of this was according to the node..."
            }
            parentWayIds.splice(idIndex, 1)
            const partOfSomeWay = parentWayIds.length > 0
            const hasTags = Object.keys(node.tags).length > 1

            const nodeDistances = this.targetCoordinates.map((_) => undefined)
            for (let i = 0; i < this.targetCoordinates.length; i++) {
                if (this.identicalTo[i] !== undefined) {
                    continue
                }
                const targetCoordinate = this.targetCoordinates[i]
                const cp = node.centerpoint()
                const d = GeoOperations.distanceBetween(targetCoordinate, [cp[1], cp[0]])
                if (d > 25) {
                    // This is too much to move
                    continue
                }
                if (d < 3 || !(hasTags || partOfSomeWay)) {
                    // If there is some relation: cap the move distance to 3m
                    nodeDistances[i] = d
                }
            }
            distances.set(node.id, nodeDistances)
            nodeInfo.set(node.id, {
                distances: nodeDistances,
                partOfWay: partOfSomeWay,
                hasTags,
            })
        }

        const closestIds = this.targetCoordinates.map((_) => undefined)
        const unusedIds = new Map<
            number,
            {
                reason: string
                hasTags: boolean
            }
        >()
        {
            // Search best merge candidate
            /**
             * Then, we search the node that has to move the least distance and add this as mapping.
             * We do this until no points are left
             */
            let candidate: number
            let moveDistance: number
            /**
             * The list of nodes that are _not_ used anymore, typically if there are less targetCoordinates then source coordinates
             */
            do {
                candidate = undefined
                moveDistance = Infinity
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
                    let targetId: number = undefined
                    let lowestDistance = Number.MAX_VALUE
                    let nodeDistances = distances.get(candidate)
                    for (let i = 0; i < nodeDistances.length; i++) {
                        const d = nodeDistances[i]
                        if (d !== undefined && d < lowestDistance) {
                            lowestDistance = d
                            targetId = i
                        }
                    }

                    // This candidates role is done, it can be removed from the distance matrix
                    distances.delete(candidate)

                    if (targetId !== undefined) {
                        // At this point, we have our target coordinate index: targetId!
                        // Lets map it...
                        closestIds[targetId] = candidate

                        // To indicate that this targetCoordinate is taken, we remove them from the distances matrix
                        distances.forEach((dists) => {
                            dists[targetId] = undefined
                        })
                    } else {
                        // Seems like all the targetCoordinates have found a source point
                        unusedIds.set(candidate, {
                            reason: "Unused by new way",
                            hasTags: nodeInfo.get(candidate).hasTags,
                        })
                    }
                }
            } while (candidate !== undefined)
        }

        // If there are still unused values in 'distances', they are definitively unused
        distances.forEach((_, nodeId) => {
            unusedIds.set(nodeId, {
                reason: "Unused by new way",
                hasTags: nodeInfo.get(nodeId).hasTags,
            })
        })

        const reprojectedNodes = new Map<
            number,
            {
                /*Move the node with this ID into the way as extra node, as it has some relation with the original object*/
                projectAfterIndex: number
                distance: number
                newLat: number
                newLon: number
                nodeId: number
            }
        >()
        {
            // Lets check the unused ids: can they be detached or do they signify some relation with the object?
            unusedIds.forEach(({}, id) => {
                const info = nodeInfo.get(id)
                if (!(info.hasTags || info.partOfWay)) {
                    // Nothing special here, we detach
                    return
                }

                // The current node has tags and/or has an attached other building.
                // We should project them and move them onto the building on an appropriate place
                const node = allNodesById.get(id)

                // Project the node onto the target way to calculate the new coordinates
                const way = <Feature<LineString>>{
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: self.targetCoordinates,
                    },
                }
                const projected = GeoOperations.nearestPoint(way, [node.lon, node.lat])
                reprojectedNodes.set(id, {
                    newLon: projected.geometry.coordinates[0],
                    newLat: projected.geometry.coordinates[1],
                    projectAfterIndex: projected.properties.index,
                    distance: projected.properties.dist,
                    nodeId: id,
                })
            })

            reprojectedNodes.forEach((_, nodeId) => unusedIds.delete(nodeId))
        }

        return { closestIds, allNodesById, osmWay, detachedNodes: unusedIds, reprojectedNodes }
    }

    protected async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {
        const nodeDb = this.state.fullNodeDatabase
        if (nodeDb === undefined) {
            throw "PANIC: replaceGeometryAction needs the FullNodeDatabase, which is undefined. This should be initialized by having the 'type_node'-layer enabled in your theme. (NB: the replacebutton has type_node as dependency)"
        }

        const { closestIds, osmWay, detachedNodes, reprojectedNodes } = await this.GetClosestIds()
        const allChanges: ChangeDescription[] = []
        const actualIdsToUse: number[] = []
        for (let i = 0; i < closestIds.length; i++) {
            if (this.identicalTo[i] !== undefined) {
                const j = this.identicalTo[i]
                actualIdsToUse.push(actualIdsToUse[j])
                continue
            }
            const closestId = closestIds[i]
            const [lon, lat] = this.targetCoordinates[i]
            if (closestId === undefined) {
                const newNodeAction = new CreateNewNodeAction([], lat, lon, {
                    allowReuseOfPreviouslyCreatedPoints: true,
                    theme: this.theme,
                    changeType: null,
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
                        changeType: "move",
                    },
                    changes: { lon, lat },
                }
                actualIdsToUse.push(closestId)
                allChanges.push(change)
            }
        }

        console.log("Adding tags", this.newTags, "to conflated way nr", this.wayToReplaceId)
        if (this.newTags !== undefined && this.newTags.length > 0) {
            const addExtraTags = new ChangeTagAction(
                this.wayToReplaceId,
                new And(this.newTags),
                osmWay.tags,
                {
                    theme: this.theme,
                    changeType: "conflation",
                }
            )
            allChanges.push(...(await addExtraTags.CreateChangeDescriptions()))
        }

        const newCoordinates = [...this.targetCoordinates]

        {
            // Add reprojected nodes to the way

            const proj = Array.from(reprojectedNodes.values())
            proj.sort((a, b) => {
                // Sort descending
                const diff = b.projectAfterIndex - a.projectAfterIndex
                if (diff !== 0) {
                    return diff
                }
                return b.distance - a.distance
            })

            for (const reprojectedNode of proj) {
                const change = <ChangeDescription>{
                    id: reprojectedNode.nodeId,
                    type: "node",
                    meta: {
                        theme: this.theme,
                        changeType: "move",
                    },
                    changes: { lon: reprojectedNode.newLon, lat: reprojectedNode.newLat },
                }
                allChanges.push(change)
                actualIdsToUse.splice(
                    reprojectedNode.projectAfterIndex + 1,
                    0,
                    reprojectedNode.nodeId
                )
                newCoordinates.splice(reprojectedNode.projectAfterIndex + 1, 0, [
                    reprojectedNode.newLon,
                    reprojectedNode.newLat,
                ])
            }
        }

        // Actually change the nodes of the way!
        allChanges.push({
            type: "way",
            id: osmWay.id,
            changes: {
                nodes: actualIdsToUse,
                coordinates: newCoordinates,
            },
            meta: {
                theme: this.theme,
                changeType: "conflation",
            },
        })

        // Some nodes might need to be deleted
        if (detachedNodes.size > 0) {
            detachedNodes.forEach(({ hasTags, reason }, nodeId) => {
                const parentWays = nodeDb.GetParentWays(nodeId)
                const index = parentWays.data.map((w) => w.id).indexOf(osmWay.id)
                if (index < 0) {
                    console.error(
                        "ReplaceGeometryAction is trying to detach node " +
                            nodeId +
                            ", but it isn't listed as being part of way " +
                            osmWay.id
                    )
                    return
                }
                // We detachted this node - so we unregister
                parentWays.data.splice(index, 1)
                parentWays.ping()

                if (hasTags) {
                    // Has tags: we leave this node alone
                    return
                }
                if (parentWays.data.length != 0) {
                    // Still part of other ways: we leave this node alone!
                    return
                }

                console.log("Removing node " + nodeId, "as it isn't needed anymore by any way")
                allChanges.push({
                    meta: {
                        theme: this.theme,
                        changeType: "delete",
                    },
                    doDelete: true,
                    type: "node",
                    id: nodeId,
                })
            })
        }

        return allChanges
    }
}
