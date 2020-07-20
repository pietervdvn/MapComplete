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
exports.ConfirmDialog = void 0;
var UIElement_1 = require("./UIElement");
var UIEventSource_1 = require("./UIEventSource");
var FixedUiElement_1 = require("./Base/FixedUiElement");
var VariableUIElement_1 = require("./Base/VariableUIElement");
var ConfirmDialog = /** @class */ (function (_super) {
    __extends(ConfirmDialog, _super);
    function ConfirmDialog(show, question, optionA, optionB, executeA, executeB, classA, classB) {
        if (classA === void 0) { classA = ""; }
        if (classB === void 0) { classB = ""; }
        var _this = _super.call(this, show) || this;
        _this._showOptions = new UIEventSource_1.UIEventSource(false);
        _this.ListenTo(_this._showOptions);
        var self = _this;
        show.addCallback(function () {
            self._showOptions.setData(false);
        });
        _this._question = new FixedUiElement_1.FixedUiElement("<span class='ui-question'>" + question + "</span>")
            .onClick(function () {
            self._showOptions.setData(!self._showOptions.data);
        });
        _this._optionA = new VariableUIElement_1.VariableUiElement(_this._showOptions.map(function (show) { return show ? "<div class='" + classA + "'>" + optionA + "</div>" : ""; }))
            .onClick(function () {
            self._showOptions.setData(false);
            executeA();
        });
        _this._optionB = new VariableUIElement_1.VariableUiElement(_this._showOptions.map(function (show) {
            return show ? "<div class='" + classB + "'>" + optionB + "</div>" : "";
        }))
            .onClick(function () {
            self._showOptions.setData(false);
            executeB();
        });
        return _this;
    }
    ConfirmDialog.prototype.InnerRender = function () {
        if (!this._source.data) {
            return "";
        }
        return this._question.Render() +
            this._optionA.Render() +
            this._optionB.Render();
    };
    ConfirmDialog.prototype.Update = function () {
        _super.prototype.Update.call(this);
        this._question.Update();
        this._optionA.Update();
        this._optionB.Update();
    };
    return ConfirmDialog;
}(UIElement_1.UIElement));
exports.ConfirmDialog = ConfirmDialog;
