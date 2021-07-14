import {OsmNode, OsmObject, OsmRelation, OsmWay} from "./OsmObject";
import {GeoOperations} from "../GeoOperations";
import State from "../../State";
import {UIEventSource} from "../UIEventSource";
import {Changes} from "./Changes";

interface SplitInfo {
    originalIndex?: number, // or negative for new elements
    lngLat: [number, number],
    doSplit: boolean
}

export default class SplitAction {
    private readonly roadObject: any;

    /***
     *
     * @param roadObject: the geojson of the road object. Properties.id must be the corresponding OSM-id
     */
    constructor(roadObject: any) {
        this.roadObject = roadObject;
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
        return wayParts
    }

    public DoSplit(splitPoints: any[]) {
        // We mark the new split points with a new id
        for (const splitPoint of splitPoints) {
            splitPoint.properties["_is_split_point"] = true
        }


        const self = this;
        const id = this.roadObject.properties.id
        const osmWay = <UIEventSource<OsmWay>>OsmObject.DownloadObject(id)
        const partOf = OsmObject.DownloadReferencingRelations(id)
        osmWay.map(originalElement => {

            if(originalElement === undefined || partOf === undefined){
                return;
            }
            
            const changes = State.state?.changes ?? new Changes();
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
            const wayParts = SplitAction.SegmentSplitInfo(splitInfo);

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

            const newOsmObjects: OsmObject[] = []
            const modifiedObjects: OsmObject[] = []
            // Let's create the new points as needed
            for (const element of splitInfo) {
                if (element.originalIndex >= 0) {
                    continue;
                }
                const node = new OsmNode(element.originalIndex)
                node.lon = element.lngLat[0]
                node.lat = element.lngLat[1]
                newOsmObjects.push(node)
            }

            const newWayIds: number[] = []
            // Lets create OsmWays based on them
            for (const wayPart of wayParts) {

                let isOriginal = wayPart === longest
                if(isOriginal){
                    // We change the actual element!
                    originalElement.nodes = wayPart.map(p => p.originalIndex);
                    originalElement.changed = true;
                    modifiedObjects.push(originalElement)
                }else{
                    let id = changes.getNewID();
                    const way = new OsmWay(id)
                    way.tags = originalElement.tags;
                    way.nodes = wayPart.map(p => p.originalIndex);
                    way.changed = true;
                    newOsmObjects.push(way)
                        newWayIds.push(way.id)
                }
             
            }
            
            // At last, we still have to check that we aren't part of a relation...
            // At least, the order of the ways is identical, so we can keep the same roles

            modifiedObjects.push(...SplitAction.UpdateRelations(partOf.data, newWayIds, originalElement))
            // And we have our objects!
            // Time to upload

            console.log(Changes.createChangesetFor("123", modifiedObjects, newOsmObjects))
        }, [partOf])
    }

    private static UpdateRelations(data: OsmRelation[], newWayIds: number[], originalElement: OsmWay):OsmRelation[]{
        // TODO
        return []
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

        for (let i = allPoints.length - 1; i > 0; i--) {

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
        }

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
