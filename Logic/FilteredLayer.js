"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilteredLayer = void 0;
var TagsFilter_1 = require("./TagsFilter");
var UIEventSource_1 = require("../UI/UIEventSource");
var leaflet_1 = require("leaflet");
var GeoOperations_1 = require("./GeoOperations");
/***
 * A filtered layer is a layer which offers a 'set-data' function
 * It is initialized with a tagfilter.
 *
 * When geojson-data is given to 'setData', all the geojson matching the filter, is rendered on this layer.
 * If it is not rendered, it is returned in a 'leftOver'-geojson; which can be consumed by the next layer.
 *
 * This also makes sure that no objects are rendered twice if they are applicable on two layers
 */
var FilteredLayer = /** @class */ (function () {
    function FilteredLayer(name, map, storage, changes, filters, maxAllowedOverlap, style, selectedElement, showOnPopup) {
        this.isDisplayed = new UIEventSource_1.UIEventSource(true);
        /** List of new elements, geojson features
         */
        this._newElements = [];
        this._selectedElement = selectedElement;
        this._showOnPopup = showOnPopup;
        if (style === undefined) {
            style = function () {
                return {};
            };
        }
        this.name = name;
        this._map = map;
        this.filters = filters;
        this._style = style;
        this._storage = storage;
        this._maxAllowedOverlap = maxAllowedOverlap;
        var self = this;
        this.isDisplayed.addCallback(function (isDisplayed) {
            if (self._geolayer !== undefined && self._geolayer !== null) {
                if (isDisplayed) {
                    self._geolayer.addTo(self._map.map);
                }
                else {
                    self._map.map.removeLayer(self._geolayer);
                }
            }
        });
    }
    /**
     * The main function to load data into this layer.
     * The data that is NOT used by this layer, is returned as a geojson object; the other data is rendered
     */
    FilteredLayer.prototype.SetApplicableData = function (geojson) {
        var leftoverFeatures = [];
        var selfFeatures = [];
        for (var _i = 0, _a = geojson.features; _i < _a.length; _i++) {
            var feature = _a[_i];
            // feature.properties contains all the properties
            var tags = TagsFilter_1.TagUtils.proprtiesToKV(feature.properties);
            if (this.filters.matches(tags)) {
                selfFeatures.push(feature);
            }
            else {
                leftoverFeatures.push(feature);
            }
        }
        this.RenderLayer({
            type: "FeatureCollection",
            features: selfFeatures
        });
        var notShadowed = [];
        for (var _b = 0, leftoverFeatures_1 = leftoverFeatures; _b < leftoverFeatures_1.length; _b++) {
            var feature = leftoverFeatures_1[_b];
            if (this._maxAllowedOverlap !== undefined && this._maxAllowedOverlap > 0) {
                if (GeoOperations_1.GeoOperations.featureIsContainedInAny(feature, selfFeatures, this._maxAllowedOverlap)) {
                    // This feature is filtered away
                    continue;
                }
            }
            notShadowed.push(feature);
        }
        return {
            type: "FeatureCollection",
            features: notShadowed
        };
    };
    FilteredLayer.prototype.AddNewElement = function (element) {
        this._newElements.push(element);
        console.log("Element added");
        this.RenderLayer(this._dataFromOverpass); // Update the layer
    };
    FilteredLayer.prototype.RenderLayer = function (data) {
        var self = this;
        if (this._geolayer !== undefined && this._geolayer !== null) {
            this._map.map.removeLayer(this._geolayer);
        }
        this._dataFromOverpass = data;
        var fusedFeatures = [];
        var idsFromOverpass = [];
        for (var _i = 0, _a = data.features; _i < _a.length; _i++) {
            var feature = _a[_i];
            idsFromOverpass.push(feature.properties.id);
            fusedFeatures.push(feature);
        }
        for (var _b = 0, _c = this._newElements; _b < _c.length; _b++) {
            var feature = _c[_b];
            if (idsFromOverpass.indexOf(feature.properties.id) < 0) {
                // This element is not yet uploaded or not yet visible in overpass
                // We include it in the layer
                fusedFeatures.push(feature);
            }
        }
        // We use a new, fused dataset
        data = {
            type: "FeatureCollection",
            features: fusedFeatures
        };
        // The data is split in two parts: the poinst and the rest
        // The points get a special treatment in order to render them properly
        // Note that some features might get a point representation as well
        this._geolayer = leaflet_1.default.geoJSON(data, {
            style: function (feature) {
                return self._style(feature.properties);
            },
            pointToLayer: function (feature, latLng) {
                var style = self._style(feature.properties);
                var marker;
                if (style.icon === undefined) {
                    marker = leaflet_1.default.circle(latLng, {
                        radius: 25,
                        color: style.color
                    });
                }
                else {
                    marker = leaflet_1.default.marker(latLng, {
                        icon: style.icon
                    });
                }
                return marker;
            },
            onEachFeature: function (feature, layer) {
                var eventSource = self._storage.addOrGetElement(feature);
                eventSource.addCallback(function () {
                    if (layer.setIcon) {
                        layer.setIcon(self._style(feature.properties).icon);
                    }
                    else {
                        console.log("UPdating", layer);
                        self._geolayer.setStyle(function (feature) {
                            return self._style(feature.properties);
                        });
                    }
                });
                layer.on("click", function (e) {
                    console.log("Selected ", feature);
                    self._selectedElement.setData(feature.properties);
                    var uiElement = self._showOnPopup(eventSource);
                    var popup = leaflet_1.default.popup()
                        .setContent(uiElement.Render())
                        .setLatLng(e.latlng)
                        .openOn(self._map.map);
                    uiElement.Update();
                    uiElement.Activate();
                    leaflet_1.default.DomEvent.stop(e); // Marks the event as consumed
                });
            }
        });
        if (this.isDisplayed.data) {
            this._geolayer.addTo(this._map.map);
        }
    };
    return FilteredLayer;
}());
exports.FilteredLayer = FilteredLayer;
