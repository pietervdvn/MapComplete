import * as turf from '@turf/turf'
import {BBox} from "./BBox";
import togpx from "togpx"
import Constants from "../Models/Constants";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";

export class GeoOperations {

    private static readonly _earthRadius = 6378137;
    private static readonly _originShift = 2 * Math.PI * GeoOperations._earthRadius / 2;

    static surfaceAreaInSqMeters(feature: any) {
        return turf.area(feature);
    }

    /**
     * Converts a GeoJson feature to a point GeoJson feature
     * @param feature
     */
    static centerpoint(feature: any) {
        const newFeature = turf.center(feature);
        newFeature.properties = feature.properties;
        newFeature.id = feature.id;
        return newFeature;
    }

    static centerpointCoordinates(feature: any): [number, number] {
        // @ts-ignore
        return turf.center(feature).geometry.coordinates;
    }

    /**
     * Returns the distance between the two points in meters
     * @param lonlat0
     * @param lonlat1
     */
    static distanceBetween(lonlat0: [number, number], lonlat1: [number, number]) {
        return turf.distance(lonlat0, lonlat1) * 1000
    }

    /**
     * Calculates the overlap of 'feature' with every other specified feature.
     * The features with which 'feature' overlaps, are returned together with their overlap area in m²
     *
     * If 'feature' is a LineString, the features in which this feature is (partly) embedded is returned, the overlap length in meter is given
     * If 'feature' is a Polygon, overlapping points and points within the polygon will be returned
     *
     * If 'feature' is a point, it will return every feature the point is embedded in. Overlap will be undefined
     *
     */
    static calculateOverlap(feature: any, otherFeatures: any[]): { feat: any, overlap: number }[] {

        const featureBBox = BBox.get(feature);
        const result: { feat: any, overlap: number }[] = [];
        if (feature.geometry.type === "Point") {
            const coor = feature.geometry.coordinates;
            for (const otherFeature of otherFeatures) {

                if (feature.id !== undefined && feature.id === otherFeature.id) {
                    continue;
                }

                if (otherFeature.geometry === undefined) {
                    console.error("No geometry for feature ", feature)
                    throw "List of other features contains a feature without geometry an undefined"
                }

                if (GeoOperations.inside(coor, otherFeature)) {
                    result.push({feat: otherFeature, overlap: undefined})
                }
            }
            return result;
        }

        if (feature.geometry.type === "LineString") {

            for (const otherFeature of otherFeatures) {

                if (feature.id !== undefined && feature.id === otherFeature.id) {
                    continue;
                }

                const intersection = GeoOperations.calculateInstersection(feature, otherFeature, featureBBox)
                if (intersection === null) {
                    continue
                }
                result.push({feat: otherFeature, overlap: intersection})

            }
            return result;
        }

        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {

            for (const otherFeature of otherFeatures) {

                if (feature.id === otherFeature.id) {
                    continue;
                }

                if (otherFeature.geometry.type === "Point") {
                    if (this.inside(otherFeature, feature)) {
                        result.push({feat: otherFeature, overlap: undefined})
                    }
                    continue;
                }


                // Calculate the surface area of the intersection

                const intersection = this.calculateInstersection(feature, otherFeature, featureBBox)
                if (intersection === null) {
                    continue;
                }
                result.push({feat: otherFeature, overlap: intersection})

            }
            return result;
        }
        console.error("Could not correctly calculate the overlap of ", feature, ": unsupported type")
        return result;
    }

    public static inside(pointCoordinate, feature): boolean {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        if (feature.geometry.type === "Point") {
            return false;
        }

        if (pointCoordinate.geometry !== undefined) {
            pointCoordinate = pointCoordinate.geometry.coordinates
        }

        if (feature.geometry.type === "MultiPolygon") {
            const coordinates = feature.geometry.coordinates[0];
            const outerPolygon = coordinates[0];
            const inside = GeoOperations.inside(pointCoordinate, {
                geometry: {
                    type: 'Polygon',
                    coordinates: [outerPolygon]
                }
            })
            if (!inside) {
                return false;
            }
            for (let i = 1; i < coordinates.length; i++) {
                const inHole = GeoOperations.inside(pointCoordinate, {
                    geometry: {
                        type: 'Polygon',
                        coordinates: [coordinates[i]]
                    }
                })
                if (inHole) {
                    return false;
                }
            }
            return true;
        }


        const x: number = pointCoordinate[0];
        const y: number = pointCoordinate[1];

        for (let i = 0; i < feature.geometry.coordinates.length; i++) {
            let poly = feature.geometry.coordinates[i];

            let inside = false;
            for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
                const coori = poly[i];
                const coorj = poly[j];

                const xi = coori[0];
                const yi = coori[1];
                const xj = coorj[0];
                const yj = coorj[1];

                const intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) {
                    inside = !inside;
                }
            }
            if (inside) {
                return true;
            }
        }

        return false;
    };

    static lengthInMeters(feature: any) {
        return turf.length(feature) * 1000
    }

    static buffer(feature: any, bufferSizeInMeter: number) {
        return turf.buffer(feature, bufferSizeInMeter / 1000, {
            units: 'kilometers'
        })
    }

    static bbox(feature: any) {
        const [lon, lat, lon0, lat0] = turf.bbox(feature)
        return {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        lon,
                        lat
                    ],
                    [
                        lon0,
                        lat
                    ],
                    [
                        lon0,
                        lat0
                    ],
                    [
                        lon,
                        lat0
                    ],
                    [
                        lon,
                        lat
                    ],
                ]
            }
        }
    }

    /**
     * Generates the closest point on a way from a given point
     *
     *  The properties object will contain three values:
     // - `index`: closest point was found on nth line part,
     // - `dist`: distance between pt and the closest point (in kilometer),
     // `location`: distance along the line between start (of the line) and the closest point.
     * @param way The road on which you want to find a point
     * @param point Point defined as [lon, lat]
     */
    public static nearestPoint(way, point: [number, number]) {
        if (way.geometry.type === "Polygon") {
            way = {...way}
            way.geometry = {...way.geometry}
            way.geometry.type = "LineString"
            way.geometry.coordinates = way.geometry.coordinates[0]
        }

        return turf.nearestPointOnLine(way, point, {units: "kilometers"});
    }

    public static toCSV(features: any[]): string {

        const headerValuesSeen = new Set<string>();
        const headerValuesOrdered: string[] = []

        function addH(key) {
            if (!headerValuesSeen.has(key)) {
                headerValuesSeen.add(key)
                headerValuesOrdered.push(key)
            }
        }

        addH("_lat")
        addH("_lon")

        const lines: string[] = []

        for (const feature of features) {
            const properties = feature.properties;
            for (const key in properties) {
                if (!properties.hasOwnProperty(key)) {
                    continue;
                }
                addH(key)

            }
        }
        headerValuesOrdered.sort()
        for (const feature of features) {
            const properties = feature.properties;
            let line = ""
            for (const key of headerValuesOrdered) {
                const value = properties[key]
                if (value === undefined) {
                    line += ","
                } else {
                    line += JSON.stringify(value) + ","
                }
            }
            lines.push(line)
        }

        return headerValuesOrdered.map(v => JSON.stringify(v)).join(",") + "\n" + lines.join("\n")
    }

    //Converts given lat/lon in WGS84 Datum to XY in Spherical Mercator EPSG:900913
    public static ConvertWgs84To900913(lonLat: [number, number]): [number, number] {
        const lon = lonLat[0];
        const lat = lonLat[1];
        const x = lon * GeoOperations._originShift / 180;
        let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * GeoOperations._originShift / 180;
        return [x, y];
    }

    //Converts XY point from (Spherical) Web Mercator EPSG:3785 (unofficially EPSG:900913) to lat/lon in WGS84 Datum
    public static Convert900913ToWgs84(lonLat: [number, number]): [number, number] {
        const lon = lonLat[0]
        const lat = lonLat[1]
        const x = 180 * lon / GeoOperations._originShift;
        let y = 180 * lat / GeoOperations._originShift;
        y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
        return [x, y];
    }

    public static GeoJsonToWGS84(geojson) {
        return turf.toWgs84(geojson)
    }

    /**
     * Tries to remove points which do not contribute much to the general outline.
     * Points for which the angle is ~ 180° are removed
     * @param coordinates
     * @constructor
     */
    public static SimplifyCoordinates(coordinates: [number, number][]) {
        const newCoordinates = []
        for (let i = 1; i < coordinates.length - 1; i++) {
            const coordinate = coordinates[i];
            const prev = coordinates[i - 1]
            const next = coordinates[i + 1]
            const b0 = turf.bearing(prev, coordinate, {final: true})
            const b1 = turf.bearing(coordinate, next)

            const diff = Math.abs(b1 - b0)
            if (diff < 2) {
                continue
            }
            newCoordinates.push(coordinate)
        }
        return newCoordinates

    }

    /**
     * Calculates the intersection between two features.
     * Returns the length if intersecting a linestring and a (multi)polygon (in meters), returns a surface area (in m²) if intersecting two (multi)polygons
     * Returns 0 if both are linestrings
     * Returns null if the features are not intersecting
     */
    static calculateInstersection(feature, otherFeature, featureBBox: BBox, otherFeatureBBox?: BBox): number {
        try {
            if (feature.geometry.type === "LineString") {


                otherFeatureBBox = otherFeatureBBox ?? BBox.get(otherFeature);
                const overlaps = featureBBox.overlapsWith(otherFeatureBBox)
                if (!overlaps) {
                    return null;
                }

                // Calculate the length of the intersection


                let intersectionPoints = turf.lineIntersect(feature, otherFeature);
                if (intersectionPoints.features.length == 0) {
                    // No intersections.
                    // If one point is inside of the polygon, all points are


                    const coors = feature.geometry.coordinates;
                    const startCoor = coors[0]
                    if (this.inside(startCoor, otherFeature)) {
                        return this.lengthInMeters(feature)
                    }

                    return null;
                }
                let intersectionPointsArray = intersectionPoints.features.map(d => {
                    return d.geometry.coordinates
                });

                if (otherFeature.geometry.type === "LineString") {
                    if (intersectionPointsArray.length > 0) {
                        return 0
                    }
                    return null;
                }
                if (intersectionPointsArray.length == 1) {
                    // We need to add the start- or endpoint of the current feature, depending on which one is embedded
                    const coors = feature.geometry.coordinates;
                    const startCoor = coors[0]
                    if (this.inside(startCoor, otherFeature)) {
                        // The startpoint is embedded
                        intersectionPointsArray.push(startCoor)
                    } else {
                        intersectionPointsArray.push(coors[coors.length - 1])
                    }
                }

                let intersection = turf.lineSlice(turf.point(intersectionPointsArray[0]), turf.point(intersectionPointsArray[1]), feature);

                if (intersection == null) {
                    return null;
                }
                const intersectionSize = turf.length(intersection); // in km
                return intersectionSize * 1000


            }

            if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
                const otherFeatureBBox = BBox.get(otherFeature);
                const overlaps = featureBBox.overlapsWith(otherFeatureBBox)
                if (!overlaps) {
                    return null;
                }
                if (otherFeature.geometry.type === "LineString") {
                    return this.calculateInstersection(otherFeature, feature, otherFeatureBBox, featureBBox)
                }

                const intersection = turf.intersect(feature, otherFeature);
                if (intersection == null) {
                    return null;
                }
                return turf.area(intersection); // in m²

            }

        } catch (exception) {
            console.warn("EXCEPTION CAUGHT WHILE INTERSECTING: ", exception,"\nThe considered objects are",feature, otherFeature);
            return undefined
        }
        return undefined;
    }

    public static AsGpx(feature, generatedWithLayer?: LayerConfig){
        
        const metadata = {}
        const tags = feature.properties
        
        if(generatedWithLayer !== undefined){
            
            metadata["name"] = generatedWithLayer.title?.GetRenderValue(tags)?.Subs(tags)?.txt
            metadata["desc"] = "Generated with MapComplete layer "+generatedWithLayer.id
            if(tags._backend?.contains("openstreetmap")){
                metadata["copyright"]= "Data copyrighted by OpenStreetMap-contributors, freely available under ODbL. See https://www.openstreetmap.org/copyright"
                metadata["author"] = tags["_last_edit:contributor"]
                metadata["link"]= "https://www.openstreetmap.org/"+tags.id
                metadata["time"] = tags["_last_edit:timestamp"]
            }else{
                metadata["time"] = new Date().toISOString()
            }
        }
        
        return togpx(feature, {
            creator: "MapComplete "+Constants.vNumber,
            metadata
        })
    }
    
    public static IdentifieCommonSegments(coordinatess: [number,number][][] ): {
        originalIndex: number,
        segmentShardWith: number[],
        coordinates: []
    }[]{
        
        // An edge. Note that the edge might be reversed to fix the sorting condition:  start[0] < end[0] && (start[0] != end[0] || start[0] < end[1])
        type edge = {start: [number, number], end: [number, number], intermediate: [number,number][], members: {index:number, isReversed: boolean}[]}

        // The strategy:
        // 1. Index _all_ edges from _every_ linestring. Index them by starting key, gather which relations run over them
        // 2. Join these edges back together - as long as their membership groups are the same
        // 3. Convert to results
        
        const allEdgesByKey = new Map<string, edge>()

        for (let index = 0; index < coordinatess.length; index++){
            const coordinates = coordinatess[index];
            for (let i = 0; i < coordinates.length - 1; i++){
                
                const c0 = coordinates[i];
                const c1 = coordinates[i + 1]
                const isReversed = (c0[0] > c1[0]) || (c0[0] == c1[0] && c0[1] > c1[1])
                
                let key : string
                if(isReversed){
                    key = ""+c1+";"+c0
                }else{
                    key = ""+c0+";"+c1
                }
                const member = {index, isReversed}
                if(allEdgesByKey.has(key)){
                    allEdgesByKey.get(key).members.push(member)
                    continue
                }
                
                let edge : edge;
                if(!isReversed){
                    edge = {
                        start : c0,
                        end: c1,
                        members: [member],
                        intermediate: []
                    }
                }else{
                    edge = {
                        start : c1,
                        end: c0,
                        members: [member],
                        intermediate: []
                    }
                }
                allEdgesByKey.set(key, edge)
                
            }
        }

        // Lets merge them back together!
        
        let didMergeSomething = false;
        let allMergedEdges = Array.from(allEdgesByKey.values())
        const allEdgesByStartPoint = new Map<string, edge[]>()
        for (const edge of allMergedEdges) {
            
            edge.members.sort((m0, m1) => m0.index - m1.index)
            
            const kstart = edge.start+""
            if(!allEdgesByStartPoint.has(kstart)){
                allEdgesByStartPoint.set(kstart, [])
            }
            allEdgesByStartPoint.get(kstart).push(edge)
        }
        
        
        function membersAreCompatible(first:edge, second:edge): boolean{
            // There must be an exact match between the members
            if(first.members === second.members){
                return true
            }
            
            if(first.members.length !== second.members.length){
                return false
            }
            
            // Members are sorted and have the same length, so we can check quickly
            for (let i = 0; i < first.members.length; i++) {
                const m0 = first.members[i]
                const m1 = second.members[i]
                if(m0.index !== m1.index || m0.isReversed !== m1.isReversed){
                    return false
                }
            }
            
            // Allrigth, they are the same, lets mark this permanently
            second.members = first.members
            return true
            
        }
        
        do{
            didMergeSomething = false
            // We use 'allMergedEdges' as our running list
            const consumed = new Set<edge>()
            for (const edge of allMergedEdges) {
                // Can we make this edge longer at the end?
                if(consumed.has(edge)){
                    continue
                }
                
                console.log("Considering edge", edge)
                const matchingEndEdges = allEdgesByStartPoint.get(edge.end+"") 
                console.log("Matchign endpoints:", matchingEndEdges)
                if(matchingEndEdges === undefined){
                    continue
                }
                
                
                for (let i = 0; i < matchingEndEdges.length; i++){
                    const endEdge = matchingEndEdges[i];
                    
                    if(consumed.has(endEdge)){
                        continue
                    }
                    
                    if(!membersAreCompatible(edge, endEdge)){
                        continue
                    }
                    
                    // We can make the segment longer!
                    didMergeSomething = true
                    console.log("Merging ", edge, "with ", endEdge)
                    edge.intermediate.push(edge.end)
                    edge.end = endEdge.end
                    consumed.add(endEdge)
                    matchingEndEdges.splice(i, 1)
                    break;
                }
            }
            
            allMergedEdges = allMergedEdges.filter(edge => !consumed.has(edge));
            
        }while(didMergeSomething)
        
        return []
    }
}


