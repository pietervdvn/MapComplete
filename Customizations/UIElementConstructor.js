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
exports.TagDependantUIElement = void 0;
var UIElement_1 = require("../UI/UIElement");
var TagDependantUIElement = /** @class */ (function (_super) {
    __extends(TagDependantUIElement, _super);
    function TagDependantUIElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TagDependantUIElement;
}(UIElement_1.UIElement));
exports.TagDependantUIElement = TagDependantUIElement;
