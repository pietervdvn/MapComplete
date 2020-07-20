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
exports.TextField = void 0;
var UIEventSource_1 = require("../UIEventSource");
var InputElement_1 = require("./InputElement");
var FixedUiElement_1 = require("../Base/FixedUiElement");
var TextField = /** @class */ (function (_super) {
    __extends(TextField, _super);
    function TextField(options) {
        var _a, _b, _c, _d;
        var _this = _super.call(this, undefined) || this;
        /**
         * Pings and has the value data
         */
        _this.enterPressed = new UIEventSource_1.UIEventSource(undefined);
        _this.value = new UIEventSource_1.UIEventSource("");
        _this.mappedValue = (_a = options === null || options === void 0 ? void 0 : options.value) !== null && _a !== void 0 ? _a : new UIEventSource_1.UIEventSource(undefined);
        // @ts-ignore
        _this._fromString = (_b = options.fromString) !== null && _b !== void 0 ? _b : (function (str) { return (str); });
        _this.value.addCallback(function (str) { return _this.mappedValue.setData(options.fromString(str)); });
        _this.mappedValue.addCallback(function (t) { return _this.value.setData(options.toString(t)); });
        _this._placeholder =
            typeof (options.placeholder) === "string" ? new FixedUiElement_1.FixedUiElement(options.placeholder) :
                ((_c = options.placeholder) !== null && _c !== void 0 ? _c : new FixedUiElement_1.FixedUiElement(""));
        _this._toString = (_d = options.toString) !== null && _d !== void 0 ? _d : (function (t) { return ("" + t); });
        var self = _this;
        _this.mappedValue.addCallback(function (t) {
            if (t === undefined && t === null) {
                return;
            }
            var field = document.getElementById('text-' + _this.id);
            if (field === undefined || field === null) {
                return;
            }
            // @ts-ignore
            field.value = options.toString(t);
        });
        return _this;
    }
    TextField.prototype.GetValue = function () {
        return this.mappedValue;
    };
    TextField.prototype.InnerRender = function () {
        return "<form onSubmit='return false' class='form-text-field'>" +
            "<input type='text' placeholder='" + this._placeholder.InnerRender() + "' id='text-" + this.id + "'>" +
            "</form>";
    };
    TextField.prototype.InnerUpdate = function (htmlElement) {
        var field = document.getElementById('text-' + this.id);
        if (field === null) {
            return;
        }
        var self = this;
        field.oninput = function () {
            // @ts-ignore
            self.value.setData(field.value);
        };
        field.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                // @ts-ignore
                self.enterPressed.setData(field.value);
            }
        });
    };
    TextField.prototype.IsValid = function (t) {
        if (t === undefined || t === null) {
            return false;
        }
        var result = this._toString(t);
        return result !== undefined && result !== null;
    };
    TextField.prototype.Clear = function () {
        var field = document.getElementById('text-' + this.id);
        if (field !== undefined) {
            // @ts-ignore
            field.value = "";
        }
    };
    return TextField;
}(InputElement_1.InputElement));
exports.TextField = TextField;
