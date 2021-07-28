import * as turf from '@turf/turf'

export class GeoOperations {

    static surfaceAreaInSqMeters(feature: any) {
        return turf.area(feature);
    }

    /**
     * Converts a GeoJSon feature to a point feature
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
     * Returns the distance between the two points in kilometers
     * @param lonlat0
     * @param lonlat1
     */
    static distanceBetween(lonlat0: [number, number], lonlat1: [number, number]) {
        return turf.distance(lonlat0, lonlat1)
    }

    /**
     * Calculates the overlap of 'feature' with every other specified feature.
     * The features with which 'feature' overlaps, are returned together with their overlap area in m²
     *
     * If 'feature' is a LineString, the features in which this feature is (partly) embedded is returned, the overlap length in meter is given
     *
     * If 'feature' is a point, it will return every feature the point is embedded in. Overlap will be undefined
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

                const intersection = this.calculateInstersection(feature, otherFeature, featureBBox)
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

    /**
     * Calculates the intersection between two features.
     * Returns the length if intersecting a linestring and a (multi)polygon (in meters), returns a surface area (in m²) if intersecting two (multi)polygons
     * Returns 0 if both are linestrings
     * Returns null if the features are not intersecting
     */
    private static calculateInstersection(feature, otherFeature, featureBBox: BBox, otherFeatureBBox?: BBox): number {
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
            console.warn("EXCEPTION CAUGHT WHILE INTERSECTING: ", exception);
            return undefined
        }
        return undefined;
    }

    /**
     * Generates the closest point on a way from a given point
     * @param way The road on which you want to find a point
     * @param point Point defined as [lon, lat]
     */
    public static nearestPoint(way, point: [number, number]) {
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

}


export class BBox {

    readonly maxLat: number;
    readonly maxLon: number;
    readonly minLat: number;
    readonly minLon: number;

    constructor(coordinates) {
        this.maxLat = Number.MIN_VALUE;
        this.maxLon = Number.MIN_VALUE;
        this.minLat = Number.MAX_VALUE;
        this.minLon = Number.MAX_VALUE;


        for (const coordinate of coordinates) {
            this.maxLon = Math.max(this.maxLon, coordinate[0]);
            this.maxLat = Math.max(this.maxLat, coordinate[1]);
            this.minLon = Math.min(this.minLon, coordinate[0]);
            this.minLat = Math.min(this.minLat, coordinate[1]);
        }
        this.check();
    }

    static fromLeafletBounds(bounds) {
        return new BBox([[bounds.getWest(), bounds.getNorth()], [bounds.getEast(), bounds.getSouth()]])
    }

    static get(feature) {
        if (feature.bbox?.overlapsWith === undefined) {
            const turfBbox: number[] = turf.bbox(feature)
            feature.bbox = new BBox([[turfBbox[0], turfBbox[1]],[turfBbox[2], turfBbox[3]]]);
        }

        return feature.bbox;
    }

    public overlapsWith(other: BBox) {
        if (this.maxLon < other.minLon) {
            return false;
        }
        if (this.maxLat < other.minLat) {
            return false;
        }
        if (this.minLon > other.maxLon) {
            return false;
        }
        return this.minLat <= other.maxLat;

    }

    public isContainedIn(other: BBox) {
        if (this.maxLon > other.maxLon) {
            return false;
        }
        if (this.maxLat > other.maxLat) {
            return false;
        }
        if (this.minLon < other.minLon) {
            return false;
        }
        if (this.minLat < other.minLat) {
            return false
        }
        return true;
    }

    private check() {
        if (isNaN(this.maxLon) || isNaN(this.maxLat) || isNaN(this.minLon) || isNaN(this.minLat)) {
            console.log(this);
            throw  "BBOX has NAN";
        }
    }

}