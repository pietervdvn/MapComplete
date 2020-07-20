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
exports.FixedInputElement = void 0;
var InputElement_1 = require("./InputElement");
var UIEventSource_1 = require("../UIEventSource");
var FixedUiElement_1 = require("../Base/FixedUiElement");
var FixedInputElement = /** @class */ (function (_super) {
    __extends(FixedInputElement, _super);
    function FixedInputElement(rendering, value) {
        var _this = _super.call(this, undefined) || this;
        _this.value = new UIEventSource_1.UIEventSource(value);
        _this.rendering = typeof (rendering) === 'string' ? new FixedUiElement_1.FixedUiElement(rendering) : rendering;
        return _this;
    }
    FixedInputElement.prototype.GetValue = function () {
        return this.value;
    };
    FixedInputElement.prototype.InnerRender = function () {
        return this.rendering.Render();
    };
    FixedInputElement.prototype.IsValid = function (t) {
        return t === this.value.data;
    };
    return FixedInputElement;
}(InputElement_1.InputElement));
exports.FixedInputElement = FixedInputElement;
