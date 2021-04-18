import * as turf from '@turf/turf'

export class GeoOperations {

    static surfaceAreaInSqMeters(feature: any) {
        return turf.area(feature);
    }

    static centerpoint(feature: any) 
    {
        const newFeature= turf.center(feature);    
        newFeature.properties = feature.properties;
        newFeature.id = feature.id;
        
        return newFeature;
    }
    
    static centerpointCoordinates(feature: any): [number, number]{
        // @ts-ignore
        return turf.center(feature).geometry.coordinates;
    }

    /**
     * Returns the distance between the two points in kilometers
     * @param lonlat0
     * @param lonlat1
     */
    static distanceBetween(lonlat0: [number,number], lonlat1:[number, number]){
        return turf.distance(lonlat0, lonlat1)
    }

    /**
     * Calculates the overlap of 'feature' with every other specified feature.
     * The features with which 'feature' overlaps, are returned together with their overlap area in m²
     * 
     * If 'feature' is a point, it will return every feature the point is embedded in. Overlap will be undefined
     */
    static calculateOverlap(feature: any,
                                   otherFeatures: any[]): { feat: any, overlap: number }[] {
        const featureBBox = BBox.get(feature);
        const result : { feat: any, overlap: number }[] = [];
        if (feature.geometry.type === "Point") {
            const coor = feature.geometry.coordinates;
            for (const otherFeature of otherFeatures) {

                let otherFeatureBBox = BBox.get(otherFeature);
                 if (!featureBBox.overlapsWith(otherFeatureBBox)) {
                    continue;
                }

                if (this.inside(coor, otherFeatures)) {
                   result.push({ feat: otherFeatures, overlap: undefined })
                }
            }
            return result;
        }

        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {

            for (const otherFeature of otherFeatures) {
                const otherFeatureBBox = BBox.get(otherFeature);
                const overlaps = featureBBox.overlapsWith(otherFeatureBBox)
                if (!overlaps) {
                    continue;
                }

                // Calculate the surface area of the intersection
                try {

                    const intersection = turf.intersect(feature, otherFeature);
                    if (intersection == null) {
                        continue;
                    }
                    const intersectionSize = turf.area(intersection); // in m²
                    result.push({feat: otherFeature, overlap: intersectionSize})
                } catch (exception) {
                    console.log("EXCEPTION CAUGHT WHILE INTERSECTING: ", exception);
                }

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


        const x: number = pointCoordinate[0];
        const y: number = pointCoordinate[1];


        let poly = feature.geometry.coordinates[0];

        var inside = false;
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

        return inside;
    };

    static lengthInMeters(feature: any) {
        return turf.length(feature) * 1000
    }
}


class BBox{

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

    private check() {
        if (isNaN(this.maxLon) || isNaN(this.maxLat) || isNaN(this.minLon) || isNaN(this.minLat)) {
            console.log(this);
            throw  "BBOX has NAN";
        }
    }

    public overlapsWith(other: BBox) {
        this.check();
        other.check();
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

    static get(feature) {
        if (feature.bbox?.overlapsWith === undefined) {

            if (feature.geometry.type === "MultiPolygon") {
                let coordinates = [];
                for (const coorlist of feature.geometry.coordinates) {
                    coordinates = coordinates.concat(coorlist[0]);
                }
                feature.bbox = new BBox(coordinates);
            } else if (feature.geometry.type === "Polygon") {
                feature.bbox = new BBox(feature.geometry.coordinates[0]);
            } else if (feature.geometry.type === "LineString") {
                feature.bbox = new BBox(feature.geometry.coordinates);
            } else if (feature.geometry.type === "Point") {
                // Point
                feature.bbox = new BBox([feature.geometry.coordinates]);
            } else {
                throw "Cannot calculate bbox, unknown type " + feature.geometry.type;
            }
        }

        return feature.bbox;
    }

}