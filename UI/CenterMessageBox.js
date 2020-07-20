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
exports.CenterMessageBox = void 0;
var UIElement_1 = require("./UIElement");
var UIEventSource_1 = require("./UIEventSource");
var CenterMessageBox = /** @class */ (function (_super) {
    __extends(CenterMessageBox, _super);
    function CenterMessageBox(startZoom, centermessage, osmConnection, location, queryRunning) {
        var _this = _super.call(this, centermessage) || this;
        _this._zoomInMore = new UIEventSource_1.UIEventSource(true);
        _this._centermessage = centermessage;
        _this._location = location;
        _this._osmConnection = osmConnection;
        _this._queryRunning = queryRunning;
        _this.ListenTo(queryRunning);
        var self = _this;
        location.addCallback(function () {
            self._zoomInMore.setData(location.data.zoom < startZoom);
        });
        _this.ListenTo(_this._zoomInMore);
        return _this;
    }
    CenterMessageBox.prototype.InnerRender = function () {
        if (this._centermessage.data != "") {
            return this._centermessage.data;
        }
        if (this._queryRunning.data) {
            return "Data wordt geladen...";
        }
        else if (this._zoomInMore.data) {
            return "Zoom in om de data te zien en te bewerken";
        }
        return "Klaar!";
    };
    CenterMessageBox.prototype.ShouldShowSomething = function () {
        if (this._queryRunning.data) {
            return true;
        }
        return this._zoomInMore.data;
    };
    CenterMessageBox.prototype.InnerUpdate = function (htmlElement) {
        var pstyle = htmlElement.parentElement.style;
        if (this._centermessage.data != "") {
            pstyle.opacity = "1";
            pstyle.pointerEvents = "all";
            this._osmConnection.registerActivateOsmAUthenticationClass();
            return;
        }
        pstyle.pointerEvents = "none";
        if (this.ShouldShowSomething()) {
            pstyle.opacity = "0.5";
        }
        else {
            pstyle.opacity = "0";
        }
    };
    return CenterMessageBox;
}(UIElement_1.UIElement));
exports.CenterMessageBox = CenterMessageBox;
