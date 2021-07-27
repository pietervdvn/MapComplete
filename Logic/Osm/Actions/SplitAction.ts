import {OsmRelation, OsmWay} from "../OsmObject";
import {Changes} from "../Changes";
import {GeoOperations} from "../../GeoOperations";
import OsmChangeAction from "./OsmChangeAction";
import {ChangeDescription} from "./ChangeDescription";
import RelationSplitlHandler from "./RelationSplitlHandler";

interface SplitInfo {
    originalIndex?: number, // or negative for new elements
    lngLat: [number, number],
    doSplit: boolean
}

export default class SplitAction extends OsmChangeAction {
    private readonly roadObject: any;
    private readonly osmWay: OsmWay;
    private _partOf: OsmRelation[];
    private readonly _splitPoints: any[];

    constructor(osmWay: OsmWay, wayGeoJson: any, partOf: OsmRelation[], splitPoints: any[]) {
        super()
        this.osmWay = osmWay;
        this.roadObject = wayGeoJson;
        this._partOf = partOf;
        this._splitPoints = splitPoints;
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

    CreateChangeDescriptions(changes: Changes): ChangeDescription[] {
        const splitPoints = this._splitPoints
        // We mark the new split points with a new id
        console.log(splitPoints)
        for (const splitPoint of splitPoints) {
            splitPoint.properties["_is_split_point"] = true
        }


        const self = this;
        const partOf = this._partOf
        const originalElement = this.osmWay
        const originalNodes = this.osmWay.nodes;

        // First, calculate splitpoints and remove points close to one another
        const splitInfo = self.CalculateSplitCoordinates(splitPoints)
        // Now we have a list with e.g. 
        // [ { originalIndex: 0}, {originalIndex: 1, doSplit: true}, {originalIndex: 2}, {originalIndex: undefined, doSplit: true}, {originalIndex: 3}]

        // Lets change 'originalIndex' to the actual node id first:
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
                }
            })
        }

        const newWayIds: number[] = []
        // Lets create OsmWays based on them
        for (const wayPart of wayParts) {

            let isOriginal = wayPart === longest
            if (isOriginal) {
                // We change the actual element!
                changeDescription.push({
                    type: "way",
                    id: originalElement.id,
                    changes: {
                        locations: wayPart.map(p => p.lngLat),
                        nodes: wayPart.map(p => p.originalIndex)
                    }
                })
            } else {
                let id = changes.getNewID();
                newWayIds.push(id)

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
                changeDescription.push({
                    type: "way",
                    id: id,
                    tags: kv,
                    changes: {
                        locations: wayPart.map(p => p.lngLat),
                        nodes: wayPart.map(p => p.originalIndex)
                    }
                })
            }

        }

        // At last, we still have to check that we aren't part of a relation...
        // At least, the order of the ways is identical, so we can keep the same roles
        changeDescription.push(...new RelationSplitlHandler(partOf, newWayIds, originalNodes).CreateChangeDescriptions(changes))

        // And we have our objects!
        // Time to upload

        return changeDescription
    }

    /**
     * Calculates the actual points to split
     * If another point is closer then ~5m, we reuse that point
     */
    private CalculateSplitCoordinates(
        splitPoints: any[],
        toleranceInM = 5): SplitInfo[] {

        const allPoints = [...splitPoints];
        // We have a bunch of coordinates here: [ [lat, lon], [lat, lon], ...] ...
        const originalPoints: [number, number][] = this.roadObject.geometry.coordinates
        // We project them onto the line (which should yield pretty much the same point
        for (let i = 0; i < originalPoints.length; i++) {
            let originalPoint = originalPoints[i];
            let projected = GeoOperations.nearestPoint(this.roadObject, originalPoint)
            projected.properties["_is_split_point"] = false
            projected.properties["_original_index"] = i
            allPoints.push(projected)
        }
        // At this point, we have a list of both the split point and the old points, with some properties to discriminate between them
        // We sort this list so that the new points are at the same location
        allPoints.sort((a, b) => a.properties.location - b.properties.location)

        // When this is done, we check that no now point is too close to an already existing point and no very small segments get created

        /*   for (let i = allPoints.length - 1; i > 0; i--) {
   
               const point = allPoints[i];
               if (point.properties._original_index !== undefined) {
                   // This point is already in OSM - we have to keep it!
                   continue;
               }
   
               if (i != allPoints.length - 1) {
                   const prevPoint = allPoints[i + 1]
                   const diff = Math.abs(point.properties.location - prevPoint.properties.location) * 1000
                   if (diff <= toleranceInM) {
                       // To close to the previous point! We delete this point...
                       allPoints.splice(i, 1)
                       // ... and mark the previous point as a split point
                       prevPoint.properties._is_split_point = true
                       continue;
                   }
               }
   
               if (i > 0) {
                   const nextPoint = allPoints[i - 1]
                   const diff = Math.abs(point.properties.location - nextPoint.properties.location) * 1000
                   if (diff <= toleranceInM) {
                       // To close to the next point! We delete this point...
                       allPoints.splice(i, 1)
                       // ... and mark the next point as a split point
                       nextPoint.properties._is_split_point = true
                       // noinspection UnnecessaryContinueJS
                       continue;
                   }
               }
               // We don't have to remove this point...
           }*/

        const splitInfo: SplitInfo[] = []
        let nextId = -1

        for (const p of allPoints) {
            let index = p.properties._original_index
            if (index === undefined) {
                index = nextId;
                nextId--;
            }
            const splitInfoElement = {
                originalIndex: index,
                lngLat: p.geometry.coordinates,
                doSplit: p.properties._is_split_point
            }
            splitInfo.push(splitInfoElement)
        }

        return splitInfo
    }


}
