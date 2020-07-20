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
exports.FixedUiElement = void 0;
var UIElement_1 = require("../UIElement");
var FixedUiElement = /** @class */ (function (_super) {
    __extends(FixedUiElement, _super);
    function FixedUiElement(html) {
        var _this = _super.call(this, undefined) || this;
        _this._html = html !== null && html !== void 0 ? html : "";
        return _this;
    }
    FixedUiElement.prototype.InnerRender = function () {
        return this._html;
    };
    return FixedUiElement;
}(UIElement_1.UIElement));
exports.FixedUiElement = FixedUiElement;
