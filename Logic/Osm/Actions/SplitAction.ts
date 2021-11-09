import {OsmObject, OsmWay} from "../OsmObject";
import {Changes} from "../Changes";
import {GeoOperations} from "../../GeoOperations";
import OsmChangeAction from "./OsmChangeAction";
import {ChangeDescription} from "./ChangeDescription";
import RelationSplitHandler from "./RelationSplitHandler";

interface SplitInfo {
    originalIndex?: number, // or negative for new elements
    lngLat: [number, number],
    doSplit: boolean
}

export default class SplitAction extends OsmChangeAction {
    private readonly wayId: string;
    private readonly _splitPointsCoordinates: [number, number] []// lon, lat
    private _meta: { theme: string, changeType: "split" };
    private _toleranceInMeters: number;

    /**
     * Create a changedescription for splitting a point.
     * Will attempt to reuse existing points
     * @param wayId
     * @param splitPointCoordinates: lon, lat
     * @param meta
     * @param toleranceInMeters: if a splitpoint closer then this amount of meters to an existing point, the existing point will be used to split the line instead of a new point
     */
    constructor(wayId: string, splitPointCoordinates: [number, number][], meta: { theme: string }, toleranceInMeters = 5) {
        super(wayId,true)
        this.wayId = wayId;
        this._splitPointsCoordinates = splitPointCoordinates
        this._toleranceInMeters = toleranceInMeters;
        this._meta = {...meta, changeType: "split"};
    }

    private static SegmentSplitInfo(splitInfo: SplitInfo[]): SplitInfo[][] {
        const wayParts = []
        let currentPart = []
        for (const splitInfoElement of splitInfo) {
            currentPart.push(splitInfoElement)

            if (splitInfoElement.doSplit) {
                // We have to do a split!
                // We add the current index to the currentParts, flush it and add it again
                wayParts.push(currentPart)
                currentPart = [splitInfoElement]
            }
        }
        wayParts.push(currentPart)
        return wayParts.filter(wp => wp.length > 0)
    }

    async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {
        const originalElement = <OsmWay>await OsmObject.DownloadObjectAsync(this.wayId)
        const originalNodes = originalElement.nodes;

        // First, calculate splitpoints and remove points close to one another
        const splitInfo = this.CalculateSplitCoordinates(originalElement, this._toleranceInMeters)
        // Now we have a list with e.g. 
        // [ { originalIndex: 0}, {originalIndex: 1, doSplit: true}, {originalIndex: 2}, {originalIndex: undefined, doSplit: true}, {originalIndex: 3}]

        // Lets change 'originalIndex' to the actual node id first (or assign a new id if needed):
        for (const element of splitInfo) {
            if (element.originalIndex >= 0) {
                element.originalIndex = originalElement.nodes[element.originalIndex]
            } else {
                element.originalIndex = changes.getNewID();
            }
        }

        // Next up is creating actual parts from this
        const wayParts: SplitInfo[][] = SplitAction.SegmentSplitInfo(splitInfo);
        // Allright! At this point, we have our new ways!
        // Which one is the longest of them (and can keep the id)?

        let longest = undefined;
        for (const wayPart of wayParts) {
            if (longest === undefined) {
                longest = wayPart;
                continue
            }
            if (wayPart.length > longest.length) {
                longest = wayPart
            }
        }

        const changeDescription: ChangeDescription[] = []
        // Let's create the new points as needed
        for (const element of splitInfo) {
            if (element.originalIndex >= 0) {
                continue;
            }
            changeDescription.push({
                type: "node",
                id: element.originalIndex,
                changes: {
                    lon: element.lngLat[0],
                    lat: element.lngLat[1]
                },
                meta: this._meta
            })
        }

        // The ids of all the ways (including the original)
        const allWayIdsInOrder: number[] = []

        const allWaysNodesInOrder: number[][] = []
        // Lets create OsmWays based on them
        for (const wayPart of wayParts) {

            let isOriginal = wayPart === longest
            if (isOriginal) {
                // We change the actual element!
                const nodeIds = wayPart.map(p => p.originalIndex)
                changeDescription.push({
                    type: "way",
                    id: originalElement.id,
                    changes: {
                        coordinates: wayPart.map(p => p.lngLat),
                        nodes: nodeIds
                    },
                    meta: this._meta
                })
                allWayIdsInOrder.push(originalElement.id)
                allWaysNodesInOrder.push(nodeIds)
            } else {
                let id = changes.getNewID();
                // Copy the tags from the original object onto the new
                const kv = []
                for (const k in originalElement.tags) {
                    if (!originalElement.tags.hasOwnProperty(k)) {
                        continue
                    }
                    if (k.startsWith("_") || k === "id") {
                        continue;
                    }
                    kv.push({k: k, v: originalElement.tags[k]})
                }
                const nodeIds = wayPart.map(p => p.originalIndex)
                changeDescription.push({
                    type: "way",
                    id: id,
                    tags: kv,
                    changes: {
                        coordinates: wayPart.map(p => p.lngLat),
                        nodes: nodeIds
                    },
                    meta: this._meta
                })

                allWayIdsInOrder.push(id)
                allWaysNodesInOrder.push(nodeIds)
            }
        }

        // At last, we still have to check that we aren't part of a relation...
        // At least, the order of the ways is identical, so we can keep the same roles
        const relations = await OsmObject.DownloadReferencingRelations(this.wayId)
        for (const relation of relations) {
            const changDescrs = await new RelationSplitHandler({
                relation: relation,
                allWayIdsInOrder: allWayIdsInOrder,
                originalNodes: originalNodes,
                allWaysNodesInOrder: allWaysNodesInOrder,
                originalWayId: originalElement.id,
            }, this._meta.theme).CreateChangeDescriptions(changes)
            changeDescription.push(...changDescrs)
        }

        // And we have our objects!
        // Time to upload

        return changeDescription
    }

    /**
     * Calculates the actual points to split
     * If another point is closer then ~5m, we reuse that point
     */
    private CalculateSplitCoordinates(osmWay: OsmWay, toleranceInM = 5): SplitInfo[] {
        const wayGeoJson = osmWay.asGeoJson()
        // Should be [lon, lat][]
        const originalPoints: [number, number][] = osmWay.coordinates.map(c => [c[1], c[0]])
        const allPoints: {
            // lon, lat
            coordinates: [number, number],
            isSplitPoint: boolean,
            originalIndex?: number, // Original index
            dist: number, // Distance from the nearest point on the original line
            location: number // Distance from the start of the way
        }[] = this._splitPointsCoordinates.map(c => {
            // From the turf.js docs:
            // The properties object will contain three values: 
            // - `index`: closest point was found on nth line part,
            // - `dist`: distance between pt and the closest point, 
            // `location`: distance along the line between start and the closest point.
            let projected = GeoOperations.nearestPoint(wayGeoJson, c)
            // c is lon lat
            return ({
                coordinates: c,
                isSplitPoint: true,
                dist: projected.properties.dist,
                location: projected.properties.location
            });
        })

        // We have a bunch of coordinates here: [ [lon, lon], [lat, lon], ...] ...
        // We project them onto the line (which should yield pretty much the same point and add them to allPoints
        for (let i = 0; i < originalPoints.length; i++) {
            let originalPoint = originalPoints[i];
            let projected = GeoOperations.nearestPoint(wayGeoJson, originalPoint)
            allPoints.push({
                coordinates: originalPoint,
                isSplitPoint: false,
                location: projected.properties.location,
                originalIndex: i,
                dist: projected.properties.dist
            })
        }
        // At this point, we have a list of both the split point and the old points, with some properties to discriminate between them
        // We sort this list so that the new points are at the same location
        allPoints.sort((a, b) => a.location - b.location)


        for (let i = allPoints.length - 2; i >= 1; i--) {
            // We 'merge' points with already existing nodes if they are close enough to avoid closeby elements

            // Note the loop bounds: we skip the first two and last two elements:
            // The first and last element are always part of the original way and should be kept
            // Furthermore, we run in reverse order as we'll delete elements on the go

            const point = allPoints[i]
            if (point.originalIndex !== undefined) {
                // We keep the original points
                continue
            }

            // At this point, 'dist' told us the point is pretty close to an already existing point.
            // Lets see which (already existing) point is closer and mark it as splitpoint
            const nextPoint = allPoints[i + 1]
            const prevPoint = allPoints[i - 1]
            const distToNext = nextPoint.location - point.location
            const distToPrev = point.location - prevPoint.location

            if (distToNext * 1000 > toleranceInM && distToPrev * 1000 > toleranceInM) {
                // Both are too far away to mark them as the split point
                continue;
            }

            let closest = nextPoint
            if (distToNext > distToPrev) {
                closest = prevPoint
            }
            // Ok, we have a closest point!
            if (closest.originalIndex === 0 || closest.originalIndex === originalPoints.length) {
                // We can not split on the first or last points...
                continue
            }
            closest.isSplitPoint = true;
            allPoints.splice(i, 1)

        }

        const splitInfo: SplitInfo[] = []
        let nextId = -1 // Note: these IDs are overwritten later on, no need to use a global counter here

        for (const p of allPoints) {
            let index = p.originalIndex
            if (index === undefined) {
                index = nextId;
                nextId--;
            }
            const splitInfoElement = {
                originalIndex: index,
                lngLat: p.coordinates,
                doSplit: p.isSplitPoint
            }
            splitInfo.push(splitInfoElement)
        }

        return splitInfo
    }


}
