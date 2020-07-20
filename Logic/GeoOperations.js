"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoOperations = void 0;
var turf = require("turf");
var GeoOperations = /** @class */ (function () {
    function GeoOperations() {
    }
    GeoOperations.surfaceAreaInSqMeters = function (feature) {
        return turf.area(feature);
    };
    GeoOperations.featureIsContainedInAny = function (feature, shouldNotContain, maxOverlapPercentage) {
        // Returns 'false' if no problematic intersection is found
        if (feature.geometry.type === "Point") {
            var coor = feature.geometry.coordinates;
            for (var _i = 0, shouldNotContain_1 = shouldNotContain; _i < shouldNotContain_1.length; _i++) {
                var shouldNotContainElement = shouldNotContain_1[_i];
                var shouldNotContainBBox = BBox.get(shouldNotContainElement);
                var featureBBox = BBox.get(feature);
                if (!featureBBox.overlapsWith(shouldNotContainBBox)) {
                    continue;
                }
                if (this.inside(coor, shouldNotContainElement)) {
                    return true;
                }
            }
            return false;
        }
        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
            var poly = feature;
            var featureBBox = BBox.get(feature);
            var featureSurface = GeoOperations.surfaceAreaInSqMeters(poly);
            for (var _a = 0, shouldNotContain_2 = shouldNotContain; _a < shouldNotContain_2.length; _a++) {
                var shouldNotContainElement = shouldNotContain_2[_a];
                var shouldNotContainBBox = BBox.get(shouldNotContainElement);
                var overlaps = featureBBox.overlapsWith(shouldNotContainBBox);
                if (!overlaps) {
                    continue;
                }
                // Calculate the surface area of the intersection
                // If it is too big, refuse
                try {
                    var intersection = turf.intersect(poly, shouldNotContainElement);
                    if (intersection == null) {
                        continue;
                    }
                    var intersectionSize = turf.area(intersection);
                    var ratio = intersectionSize / featureSurface;
                    if (ratio * 100 >= maxOverlapPercentage) {
                        console.log("Refused", poly.id, " due to ", shouldNotContainElement.id, "intersection ratio is ", ratio, "which is bigger then the target ratio of ", (maxOverlapPercentage / 100));
                        return true;
                    }
                }
                catch (exception) {
                    console.log("EXCEPTION CAUGHT WHILE INTERSECTING: ", exception);
                    // We assume that this failed due to an intersection
                    return true;
                }
            }
            return false; // No problematic intersections found
        }
        return false;
    };
    /**
     * Simple check: that every point of the polygon is inside the container
     * @param polygon
     * @param container
     */
    GeoOperations.isPolygonInside = function (polygon, container) {
        for (var _i = 0, _a = polygon.geometry.coordinates[0]; _i < _a.length; _i++) {
            var coor = _a[_i];
            if (!GeoOperations.inside(coor, container)) {
                return false;
            }
        }
        return true;
    };
    /**
     * Simple check: one point of the polygon is inside the container
     * @param polygon
     * @param container
     */
    GeoOperations.isPolygonTouching = function (polygon, container) {
        for (var _i = 0, _a = polygon.geometry.coordinates[0]; _i < _a.length; _i++) {
            var coor = _a[_i];
            if (GeoOperations.inside(coor, container)) {
                return true;
            }
        }
        return false;
    };
    GeoOperations.inside = function (pointCoordinate, feature) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        if (feature.geometry.type === "Point") {
            return false;
        }
        var x = pointCoordinate[0];
        var y = pointCoordinate[1];
        var poly = feature.geometry.coordinates[0];
        var inside = false;
        for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            var coori = poly[i];
            var coorj = poly[j];
            var xi = coori[0];
            var yi = coori[1];
            var xj = coorj[0];
            var yj = coorj[1];
            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    };
    ;
    return GeoOperations;
}());
exports.GeoOperations = GeoOperations;
var BBox = /** @class */ (function () {
    function BBox(coordinates) {
        this.maxLat = Number.MIN_VALUE;
        this.maxLon = Number.MIN_VALUE;
        this.minLat = Number.MAX_VALUE;
        this.minLon = Number.MAX_VALUE;
        for (var _i = 0, coordinates_1 = coordinates; _i < coordinates_1.length; _i++) {
            var coordinate = coordinates_1[_i];
            this.maxLon = Math.max(this.maxLon, coordinate[0]);
            this.maxLat = Math.max(this.maxLat, coordinate[1]);
            this.minLon = Math.min(this.minLon, coordinate[0]);
            this.minLat = Math.min(this.minLat, coordinate[1]);
        }
        this.check();
    }
    BBox.prototype.check = function () {
        if (isNaN(this.maxLon) || isNaN(this.maxLat) || isNaN(this.minLon) || isNaN(this.minLat)) {
            console.log(this);
            throw "BBOX has NAN";
        }
    };
    BBox.prototype.overlapsWith = function (other) {
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
        if (this.minLat > other.maxLat) {
            return false;
        }
        return true;
    };
    BBox.get = function (feature) {
        if (feature.bbox === undefined) {
            if (feature.geometry.type === "MultiPolygon") {
                var coordinates = [];
                for (var _i = 0, _a = feature.geometry.coordinates; _i < _a.length; _i++) {
                    var coorlist = _a[_i];
                    coordinates = coordinates.concat(coorlist[0]);
                }
                feature.bbox = new BBox(coordinates);
            }
            else if (feature.geometry.type === "Polygon") {
                feature.bbox = new BBox(feature.geometry.coordinates[0]);
            }
            else if (feature.geometry.type === "LineString") {
                feature.bbox = new BBox(feature.geometry.coordinates);
            }
            else if (feature.geometry.type === "Point") {
                // Point
                feature.bbox = new BBox([feature.geometry.coordinates]);
            }
            else {
                throw "Cannot calculate bbox, unknown type " + feature.geometry.type;
            }
        }
        return feature.bbox;
    };
    return BBox;
}());
