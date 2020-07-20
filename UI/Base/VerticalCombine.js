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
exports.VerticalCombine = void 0;
var UIElement_1 = require("../UIElement");
var VerticalCombine = /** @class */ (function (_super) {
    __extends(VerticalCombine, _super);
    function VerticalCombine(elements, className) {
        if (className === void 0) { className = undefined; }
        var _this = _super.call(this, undefined) || this;
        _this._elements = elements;
        _this._className = className;
        return _this;
    }
    VerticalCombine.prototype.InnerRender = function () {
        var html = "";
        for (var _i = 0, _a = this._elements; _i < _a.length; _i++) {
            var element = _a[_i];
            if (!element.IsEmpty()) {
                html += "<div>" + element.Render() + "</div>";
            }
        }
        if (html === "") {
            return "";
        }
        if (this._className === undefined) {
            return html;
        }
        return "<div class='" + this._className + "'>" + html + "</div>";
    };
    return VerticalCombine;
}(UIElement_1.UIElement));
exports.VerticalCombine = VerticalCombine;
