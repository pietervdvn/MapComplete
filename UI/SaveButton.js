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
exports.SaveButton = void 0;
var UIElement_1 = require("./UIElement");
var SaveButton = /** @class */ (function (_super) {
    __extends(SaveButton, _super);
    function SaveButton(value) {
        var _this = _super.call(this, value) || this;
        if (value === undefined) {
            throw "No event source for savebutton, something is wrong";
        }
        _this._value = value;
        return _this;
    }
    SaveButton.prototype.InnerRender = function () {
        if (this._value.data === undefined ||
            this._value.data === null
            || this._value.data === "") {
            return "<span class='save-non-active'>Opslaan</span>";
        }
        return "<span class='save'>Opslaan</span>";
    };
    return SaveButton;
}(UIElement_1.UIElement));
exports.SaveButton = SaveButton;
