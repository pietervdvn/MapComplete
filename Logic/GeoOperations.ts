export class GeoOperations {


    static featureIsContainedInAny(feature: any, shouldNotContain: any[], noTouching: boolean = false): boolean {

        if (feature.geometry.type === "Point") {
            const coor = feature.geometry.coordinates;
            for (const shouldNotContainElement of shouldNotContain) {

                let shouldNotContainBBox = BBox.get(shouldNotContainElement);
                let featureBBox = BBox.get(feature);
                if (!featureBBox.overlapsWith(shouldNotContainBBox)) {
                    continue;
                }

                if (this.inside(coor, shouldNotContainElement)) {
                    return true
                }
            }
            return false;
        }


        if (feature.geometry.type === "Polygon") {

            const poly = feature;
            for (const shouldNotContainElement of shouldNotContain) {

                let shouldNotContainBBox = BBox.get(shouldNotContainElement);
                let featureBBox = BBox.get(feature);
                if (!featureBBox.overlapsWith(shouldNotContainBBox)) {
                    continue;
                }

                if (noTouching) {
                    if (GeoOperations.isPolygonTouching(poly, shouldNotContainElement)) {
                        return true;
                    }
                } else {
                    if (GeoOperations.isPolygonInside(poly, shouldNotContainElement)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Simple check: that every point of the polygon is inside the container
     * @param polygon
     * @param container
     */
    static isPolygonInside(polygon, container) {
        for (const coor of polygon.geometry.coordinates[0]) {
            if (!GeoOperations.inside(coor, container)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Simple check: one point of the polygon is inside the container
     * @param polygon
     * @param container
     */
    static isPolygonTouching(polygon, container) {
        for (const coor of polygon.geometry.coordinates[0]) {
            if (GeoOperations.inside(coor, container)) {
                return true;
            }
        }
        return false;
    }


    static inside(pointCoordinate, feature): boolean {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

        if (feature.geometry.type === "Point") {
            return false;
        }


        const x: number = pointCoordinate[0];
        const y: number = pointCoordinate[1];


        let poly = feature.geometry.coordinates[0];

        var inside = false;
        for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const coori = poly[i];
            const coorj = poly[j];

            const xi = coori[0];
            const yi = coori[1];
            const xj = coorj[0];
            const yj = coorj[1];

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }

        return inside;
    };

}


class BBox {

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
        if (this.minLat > other.maxLat) {
            return false;
        }
        return true;
    }

    static get(feature) {
        if (feature.bbox === undefined) {
            if (feature.geometry.type === "Polygon") {
                feature.bbox = new BBox(feature.geometry.coordinates[0]);
            } else if (feature.geometry.type === "LineString") {
                feature.bbox = new BBox(feature.geometry.coordinates);
            } else {
                // Point
                feature.bbox = new BBox([feature.geometry.coordinates]);
            }
        }

        return feature.bbox;
    }

}