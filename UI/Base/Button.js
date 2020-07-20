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
exports.Button = void 0;
var UIElement_1 = require("../UIElement");
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button(text, onclick, clss) {
        if (clss === void 0) { clss = ""; }
        var _this = _super.call(this, undefined) || this;
        _this._text = text;
        _this._onclick = onclick;
        if (clss !== "") {
            _this._clss = "class='" + clss + "'";
        }
        else {
            _this._clss = "";
        }
        return _this;
    }
    Button.prototype.InnerRender = function () {
        return "<form>" +
            "<button id='button-" + this.id + "' type='button' " + this._clss + ">" + this._text.Render() + "</button>" +
            "</form>";
    };
    Button.prototype.InnerUpdate = function (htmlElement) {
        _super.prototype.InnerUpdate.call(this, htmlElement);
        var self = this;
        console.log("Update for ", htmlElement);
        document.getElementById("button-" + this.id).onclick = function () {
            console.log("Clicked");
            self._onclick();
        };
    };
    return Button;
}(UIElement_1.UIElement));
exports.Button = Button;
