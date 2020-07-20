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
exports.DropDown = void 0;
var UIEventSource_1 = require("../UIEventSource");
var UIElement_1 = require("../UIElement");
var DropDown = /** @class */ (function (_super) {
    __extends(DropDown, _super);
    function DropDown(label, values, selectedElement) {
        if (selectedElement === void 0) { selectedElement = undefined; }
        var _this = _super.call(this, undefined) || this;
        _this._label = label;
        _this._values = values;
        _this.selectedElement = selectedElement !== null && selectedElement !== void 0 ? selectedElement : new UIEventSource_1.UIEventSource(values[0].value);
        if (selectedElement.data === undefined) {
            _this.selectedElement.setData(values[0].value);
        }
        var self = _this;
        _this.selectedElement.addCallback(function () {
            self.InnerUpdate();
        });
        return _this;
    }
    DropDown.prototype.InnerRender = function () {
        var options = "";
        for (var _i = 0, _a = this._values; _i < _a.length; _i++) {
            var value = _a[_i];
            options += "<option value='" + value.value + "'>" + value.shown + "</option>";
        }
        return "<form>" +
            "<label for='dropdown-" + this.id + "'>" + this._label + "</label>" +
            "<select name='dropdown-" + this.id + "' id='dropdown-" + this.id + "'>" +
            options +
            "</select>" +
            "</form>";
    };
    DropDown.prototype.InnerUpdate = function () {
        var self = this;
        var e = document.getElementById("dropdown-" + this.id);
        if (e === null) {
            return;
        }
        // @ts-ignore
        if (this.selectedElement.data !== e.value) {
            // @ts-ignore
            e.value = this.selectedElement.data;
        }
        e.onchange = function () {
            // @ts-ignore
            var selectedValue = e.options[e.selectedIndex].value;
            console.log("Putting data", selectedValue);
            self.selectedElement.setData(selectedValue);
        };
    };
    return DropDown;
}(UIElement_1.UIElement));
exports.DropDown = DropDown;
