"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchAndGo = void 0;
var UIElement_1 = require("./UIElement");
var TextField_1 = require("./Input/TextField");
var UIEventSource_1 = require("./UIEventSource");
var FixedUiElement_1 = require("./Base/FixedUiElement");
var Geocoding_1 = require("../Logic/Geocoding");
var SearchAndGo = /** @class */ (function (_super) {
    __extends(SearchAndGo, _super);
    function SearchAndGo(map) {
        var _this = _super.call(this, undefined) || this;
        _this._placeholder = new UIEventSource_1.UIEventSource("Zoek naar een locatie...");
        _this._searchField = new TextField_1.TextField({
            placeholder: _this._placeholder
        });
        _this._foundEntries = new UIEventSource_1.UIEventSource([]);
        _this._goButton = new FixedUiElement_1.FixedUiElement("<img class='search-go' src='./assets/search.svg' alt='GO'>");
        _this._map = map;
        _this.ListenTo(_this._foundEntries);
        var self = _this;
        _this._searchField.enterPressed.addCallback(function () {
            self.RunSearch();
        });
        _this._goButton.onClick(function () {
            self.RunSearch();
        });
        return _this;
    }
    // Triggered by 'enter' or onclick
    SearchAndGo.prototype.RunSearch = function () {
        var _this = this;
        var searchString = this._searchField.GetValue().data;
        this._searchField.Clear();
        this._placeholder.setData("Bezig met zoeken...");
        var self = this;
        Geocoding_1.Geocoding.Search(searchString, this._map, function (result) {
            if (result.length == 0) {
                _this._placeholder.setData("Niets gevonden");
                return;
            }
            var bb = result[0].boundingbox;
            var bounds = [
                [bb[0], bb[2]],
                [bb[1], bb[3]]
            ];
            self._map.map.fitBounds(bounds);
            _this._placeholder.setData("Zoek naar een locatie...");
        }, function () {
            _this._placeholder.setData("Niets gevonden: er ging iets mis");
        });
    };
    SearchAndGo.prototype.InnerRender = function () {
        // "<img class='search' src='./assets/search.svg' alt='Search'> " +
        return this._searchField.Render() +
            this._goButton.Render();
    };
    SearchAndGo.prototype.Update = function () {
        _super.prototype.Update.call(this);
        this._searchField.Update();
        this._goButton.Update();
    };
    SearchAndGo.prototype.Activate = function () {
        _super.prototype.Activate.call(this);
        this._searchField.Activate();
        this._goButton.Activate();
    };
    return SearchAndGo;
}(UIElement_1.UIElement));
exports.SearchAndGo = SearchAndGo;
