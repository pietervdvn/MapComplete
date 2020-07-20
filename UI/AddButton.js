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
exports.AddButton = void 0;
var UIEventSource_1 = require("./UIEventSource");
var UIElement_1 = require("./UIElement");
var AddButton = /** @class */ (function (_super) {
    __extends(AddButton, _super);
    function AddButton(basemap, changes, options) {
        var _this = _super.call(this, undefined) || this;
        _this.curentAddSelection = new UIEventSource_1.UIEventSource("");
        _this.SELECTING_POI = "selecting_POI";
        _this.PLACING_POI = "placing_POI";
        /*State is one of:
         * "": the default stated
         * "select_POI": show a 'select which POI to add' query (skipped if only one option exists)
         * "placing_point": shown while adding a point
         * ""
         */
        _this.state = new UIEventSource_1.UIEventSource("");
        _this.zoomlevel = basemap.Location;
        _this.ListenTo(_this.zoomlevel);
        _this._options = options;
        _this.ListenTo(_this.curentAddSelection);
        _this.ListenTo(_this.state);
        _this.state.setData(_this.SELECTING_POI);
        _this.changes = changes;
        var self = _this;
        basemap.map.on("click", function (e) {
            var location = e.latlng;
            console.log("Clicked at ", location);
            self.HandleClick(location.lat, location.lng);
        });
        basemap.map.on("mousemove", function () {
            if (self.state.data === self.PLACING_POI) {
                var icon = "crosshair";
                for (var _i = 0, _a = self._options; _i < _a.length; _i++) {
                    var option = _a[_i];
                    if (option.name === self.curentAddSelection.data && option.icon !== undefined) {
                        icon = 'url("' + option.icon + '") 32 32 ,crosshair';
                        console.log("Cursor icon: ", icon);
                    }
                }
                document.getElementById('leafletDiv').style.cursor = icon;
            }
            else {
                // @ts-ignore
                document.getElementById('leafletDiv').style.cursor = '';
            }
        });
        return _this;
    }
    AddButton.prototype.HandleClick = function (lat, lon) {
        this.state.setData(this.SELECTING_POI);
        console.log("Handling click", lat, lon, this.curentAddSelection.data);
        for (var _i = 0, _a = this._options; _i < _a.length; _i++) {
            var option = _a[_i];
            if (this.curentAddSelection.data === option.name) {
                console.log("PLACING a ", option);
                var feature = this.changes.createElement(option.tags, lat, lon);
                option.layerToAddTo.AddNewElement(feature);
                return;
            }
        }
    };
    AddButton.prototype.InnerRender = function () {
        if (this.zoomlevel.data.zoom < 19) {
            return "Zoom in om een punt toe te voegen";
        }
        if (this.state.data === this.SELECTING_POI) {
            var html = "<form>";
            for (var _i = 0, _a = this._options; _i < _a.length; _i++) {
                var option = _a[_i];
                // <button type='button'> looks SO retarded
                // the default type of button is 'submit', which performs a POST and page reload
                html += "<button type='button' class='addPOIoption' value='" + option.name + "'>Voeg een " + option.name + " toe</button><br/>";
            }
            html += "</form>";
            return html;
        }
        if (this.state.data === this.PLACING_POI) {
            return "<div id='clickOnMapInstruction'>Klik op de kaart om een nieuw punt toe te voegen<div>" +
                "<div id='cancelInstruction'>Klik hier om toevoegen te annuleren</div>";
        }
        if (this.curentAddSelection.data === "") {
            return "<span onclick>Voeg een punt toe...</span>";
        }
        return "Annuleer";
    };
    AddButton.prototype.InnerUpdate = function (htmlElement) {
        var self = this;
        htmlElement.onclick = function (event) {
            // @ts-ignore
            if (event.consumed) {
                return;
            }
            if (self.state.data === self.PLACING_POI) {
                self.state.setData(self.SELECTING_POI);
            }
        };
        var buttons = htmlElement.getElementsByClassName('addPOIoption');
        var _loop_1 = function (button) {
            button.onclick = function (event) {
                self.curentAddSelection.setData(button.value);
                self.state.setData(self.PLACING_POI);
                event.consumed = true;
            };
        };
        // @ts-ignore
        for (var _i = 0, buttons_1 = buttons; _i < buttons_1.length; _i++) {
            var button = buttons_1[_i];
            _loop_1(button);
        }
    };
    return AddButton;
}(UIElement_1.UIElement));
exports.AddButton = AddButton;
