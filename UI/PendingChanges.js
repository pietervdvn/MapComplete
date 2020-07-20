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
exports.PendingChanges = void 0;
var UIElement_1 = require("./UIElement");
var PendingChanges = /** @class */ (function (_super) {
    __extends(PendingChanges, _super);
    function PendingChanges(changes, countdown) {
        var _this = _super.call(this, changes.pendingChangesES) || this;
        _this.ListenTo(changes.isSaving);
        _this.ListenTo(countdown);
        _this._pendingChangesCount = changes.pendingChangesES;
        _this._countdown = countdown;
        _this._isSaving = changes.isSaving;
        _this.onClick(function () {
            changes.uploadAll();
        });
        return _this;
    }
    PendingChanges.prototype.InnerRender = function () {
        if (this._isSaving.data) {
            return "<span class='alert'>Saving</span>";
        }
        if (this._pendingChangesCount.data == 0) {
            return "";
        }
        var restingSeconds = this._countdown.data / 1000;
        var dots = "";
        while (restingSeconds > 0) {
            dots += ".";
            restingSeconds = restingSeconds - 1;
        }
        return "Saving " + this._pendingChangesCount.data;
    };
    return PendingChanges;
}(UIElement_1.UIElement));
exports.PendingChanges = PendingChanges;
