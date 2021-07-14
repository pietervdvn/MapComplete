import {UIEventSource} from "../UIEventSource";
import {OsmNode, OsmObject, OsmWay} from "./OsmObject";
import State from "../../State";
import {distance} from "@turf/turf";
import {GeoOperations} from "../GeoOperations";
import {Changes} from "./Changes";

/**
 * Splits a road in different segments, each splitted at one of the given points (or a point on the road close to it)
 * @param roadID The id of the road you want to split
 * @param points The points on the road where you want the split to occur (geojson point list)
 */
export async function splitRoad(roadID, points) {
    if (points.length != 1) {
        // TODO: more than one point
        console.log(points)
        window.alert("Warning, currently only tested on one point, you selected " + points.length + " points")
    }

    let road = State.state.allElements.ContainingFeatures.get(roadID);

    /**
     * Compares two points based on the starting point of the road, can be used in sort function
     * @param point1 [lon, lat] point
     * @param point2 [lon, lat] point
     */
    function comparePointDistance(point1, point2) {
        let distFromStart1 = GeoOperations.nearestPoint(road, point1).properties.location;
        let distFromStart2 = GeoOperations.nearestPoint(road, point2).properties.location;
        return distFromStart1 - distFromStart2; // Sort requires a number to return instead of a bool
    }

    /**
     * Eliminates split points close (<4m) to existing points on the road, so you can split on these points instead
     * @param road The road geojson object
     * @param points The points on the road where you want the split to occur (geojson point list)
     * @return realSplitPoints List containing all new locations where you should split
     */
    function getSplitPoints(road, points) {
        // Copy the list
        let roadPoints = [...road.geometry.coordinates];

        // Get the coordinates of all geojson points
        let splitPointsCoordinates = points.map((point) => point.geometry.coordinates);

        roadPoints.push(...splitPointsCoordinates);

        // Sort all points on the road based on the distance from the start
        roadPoints.sort(comparePointDistance)

        // Remove points close to existing points on road
        let realSplitPoints = [...splitPointsCoordinates];
        for (let index = roadPoints.length - 1; index > 0; index--) {
            // Iterate backwards to prevent problems when removing elements
            let dist = distance(roadPoints[index - 1], roadPoints[index], {units: "kilometers"});
            // Remove all cutpoints closer than 4m to their previous point
            if ((dist < 0.004) && (splitPointsCoordinates.includes(roadPoints[index]))) {
                console.log("Removed a splitpoint, using a closer point to the road instead")
                realSplitPoints.splice(index, 1)
                realSplitPoints.push(roadPoints[index - 1])
            }
        }
        return realSplitPoints;
    }

    let realSplitPoints = getSplitPoints(road, points);

    // Create a sorted list containing all points
    let allPoints = [...road.geometry.coordinates];
    allPoints.push(...realSplitPoints);
    allPoints.sort(comparePointDistance);

    // The changeset that will contain the operations to split the road
    let changes = new Changes();

    // Download the data of the current road from Osm to get the ID's of the coordinates
    let osmRoad: UIEventSource<OsmWay> = OsmObject.DownloadObject(roadID);

    // TODO: Remove delay, use a callback on odmRoad instead and execute all code below in callback function
    function delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    await delay(3000);

    // Dict to quickly convert a coordinate to a nodeID
    let coordToIDMap = {};

    /**
     * Converts a coordinate to a string, so it's hashable (e.g. for using it in a dict)
     * @param coord [lon, lat] point
     */
    function getCoordKey(coord: [number, number]) {
        return coord[0] + "," + coord[1];
    }

    osmRoad.data.coordinates.forEach((coord, i) => coordToIDMap[getCoordKey([coord[1], coord[0]])] = osmRoad.data.nodes[i]);

    let currentRoadPoints: number[] = [];
    let currentRoadCoordinates: [number, number][] = []

    /**
     * Given a coordinate, check whether there is already a node in osm created (on the road or cutpoints) or create
     * such point if it doesn't exist yet and return the id of this coordinate
     * @param coord [lon, lat] point
     * @return pointID The ID of the existing/created node on given coordinates
     */
    function getOrCreateNodeID(coord) {
        console.log(coordToIDMap)
        let poinID = coordToIDMap[getCoordKey(coord)];
        if (poinID == undefined) {
            console.log(getCoordKey(coord) + " not in map")
            // TODO: Check if lat, lon is correct
            let newNode = changes.createElement([], coord[1], coord[0]);

            coordToIDMap[coord] = newNode.id;
            poinID = newNode.id;

            console.log("New point created ");
        }
        return poinID;
    }

    /**
     * Creates a new road in OSM, while copying the tags from osmRoad and using currentRoadPoints as points
     * @param currentRoadPoints List of id's of nodes the road should exist of
     * @param osmRoad The road to copy the tags from
     */
    function createNewRoadSegment(currentRoadPoints, osmRoad) {
        changes.createRoad(osmRoad.data.tags, currentRoadPoints, currentRoadCoordinates);
    }

    for (let coord of allPoints) {
        console.log("Handling coord")
        let pointID = getOrCreateNodeID(coord);
        currentRoadPoints.push(pointID);
        currentRoadCoordinates.push(coord);
        if (realSplitPoints.includes(coord)) {
            console.log("Handling split")
            // Should split here
            // currentRoadPoints contains a list containing all points for this road segment
            createNewRoadSegment(currentRoadPoints, osmRoad);

            // Cleanup for next split
            currentRoadPoints = [pointID];
            currentRoadCoordinates = [coord];
            console.log("Splitting here...")
        }
    }

    // Update the road to contain only the points of the last segment
    // changes.updateRoadCoordinates(roadID, currentRoadPoints);

    // push the applied changes
    changes.flushChanges();

    return;
}


// TODO: Vlakbij bestaand punt geklikt? Bestaand punt hergebruiken
//  Nieuw wegobject aanmaken, en oude hergebruiken voor andere helft van de weg
// TODO: CHeck if relation exist to the road -> Delete them when splitted, because they might be outdated after the split
