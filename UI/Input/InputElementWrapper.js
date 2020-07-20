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
exports.InputElementWrapper = void 0;
var InputElement_1 = require("./InputElement");
var UIElement_1 = require("../UIElement");
var InputElementWrapper = /** @class */ (function (_super) {
    __extends(InputElementWrapper, _super);
    function InputElementWrapper(pre, input, post) {
        var _this = _super.call(this, undefined) || this;
        _this.post = UIElement_1.UIElement.Fix(post);
        _this.input = input;
        _this.pre = UIElement_1.UIElement.Fix(pre);
        return _this;
    }
    InputElementWrapper.prototype.GetValue = function () {
        return this.input.GetValue();
    };
    InputElementWrapper.prototype.InnerRender = function () {
        return this.pre.Render() + this.input.Render() + this.post.Render();
    };
    InputElementWrapper.prototype.IsValid = function (t) {
        return this.input.IsValid(t);
    };
    return InputElementWrapper;
}(InputElement_1.InputElement));
exports.InputElementWrapper = InputElementWrapper;
