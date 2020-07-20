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
exports.SimpleAddUI = void 0;
var UIElement_1 = require("./UIElement");
var FixedUiElement_1 = require("./Base/FixedUiElement");
var Button_1 = require("./Base/Button");
/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
var SimpleAddUI = /** @class */ (function (_super) {
    __extends(SimpleAddUI, _super);
    function SimpleAddUI(zoomlevel, lastClickLocation, changes, selectedElement, dataIsLoading, userDetails, addButtons) {
        var _this = _super.call(this, zoomlevel) || this;
        _this._zoomlevel = zoomlevel;
        _this._lastClickLocation = lastClickLocation;
        _this._changes = changes;
        _this._selectedElement = selectedElement;
        _this._dataIsLoading = dataIsLoading;
        _this._userDetails = userDetails;
        _this.ListenTo(userDetails);
        _this.ListenTo(dataIsLoading);
        _this._addButtons = [];
        for (var _i = 0, addButtons_1 = addButtons; _i < addButtons_1.length; _i++) {
            var option = addButtons_1[_i];
            // <button type='button'> looks SO retarded
            // the default type of button is 'submit', which performs a POST and page reload
            var button = new Button_1.Button(new FixedUiElement_1.FixedUiElement("Voeg hier een " + option.name + " toe"), _this.CreatePoint(option));
            _this._addButtons.push(button);
        }
        return _this;
    }
    SimpleAddUI.prototype.CreatePoint = function (option) {
        var self = this;
        return function () {
            console.log("Creating a new ", option.name, " at last click location");
            var loc = self._lastClickLocation.data;
            var feature = self._changes.createElement(option.tags, loc.lat, loc.lon);
            option.layerToAddTo.AddNewElement(feature);
            self._selectedElement.setData(feature.properties);
        };
    };
    SimpleAddUI.prototype.InnerRender = function () {
        var header = "<h2>Geen selectie</h2>" +
            "Je klikte ergens waar er nog geen gezochte data is.<br/>";
        if (!this._userDetails.data.loggedIn) {
            return header + "<a class='activate-osm-authentication'>Gelieve je aan te melden om een nieuw punt toe te voegen</a>";
        }
        if (this._zoomlevel.data.zoom < 19) {
            return header + "Zoom verder in om een element toe te voegen.";
        }
        if (this._dataIsLoading.data) {
            return header + "De data is nog aan het laden. Nog even geduld, dan kan je een punt toevoegen";
        }
        var html = "";
        for (var _i = 0, _a = this._addButtons; _i < _a.length; _i++) {
            var button = _a[_i];
            html += button.Render();
        }
        return header + html;
    };
    SimpleAddUI.prototype.InnerUpdate = function (htmlElement) {
        _super.prototype.InnerUpdate.call(this, htmlElement);
        for (var _i = 0, _a = this._addButtons; _i < _a.length; _i++) {
            var button = _a[_i];
            button.Update();
        }
        this._userDetails.data.osmConnection.registerActivateOsmAUthenticationClass();
    };
    return SimpleAddUI;
}(UIElement_1.UIElement));
exports.SimpleAddUI = SimpleAddUI;
