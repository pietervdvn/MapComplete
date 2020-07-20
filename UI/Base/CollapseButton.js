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
exports.CollapseButton = void 0;
var UIElement_1 = require("../UIElement");
var UIEventSource_1 = require("../UIEventSource");
var CollapseButton = /** @class */ (function (_super) {
    __extends(CollapseButton, _super);
    function CollapseButton(idToCollapse) {
        var _this = _super.call(this, undefined) || this;
        _this.isCollapsed = new UIEventSource_1.UIEventSource(false);
        _this.ListenTo(_this.isCollapsed);
        _this.isCollapsed.addCallback(function (collapse) {
            var el = document.getElementById(idToCollapse);
            if (el === undefined || el === null) {
                console.log("Element not found");
                return;
            }
            if (collapse) {
                el.style.height = "3.5em";
                el.style.width = "15em";
            }
            else {
                el.style.height = "auto";
                el.style.width = "auto";
            }
        });
        var self = _this;
        _this.onClick(function () {
            self.isCollapsed.setData(!self.isCollapsed.data);
        });
        return _this;
    }
    CollapseButton.prototype.InnerRender = function () {
        var up = './assets/arrow-up.svg';
        var down = './assets/arrow-down.svg';
        var arrow = up;
        if (this.isCollapsed.data) {
            arrow = down;
        }
        return "<img class='collapse-button' src='" + arrow + "' alt='collapse'>";
    };
    return CollapseButton;
}(UIElement_1.UIElement));
exports.CollapseButton = CollapseButton;
