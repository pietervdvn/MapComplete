"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIElement = void 0;
var FixedUiElement_1 = require("./Base/FixedUiElement");
var UIElement = /** @class */ (function () {
    function UIElement(source) {
        this._hideIfEmpty = false;
        this.id = "ui-element-" + UIElement.nextId;
        this._source = source;
        UIElement.nextId++;
        this.ListenTo(source);
    }
    UIElement.prototype.ListenTo = function (source) {
        if (source === undefined) {
            return;
        }
        var self = this;
        source.addCallback(function () {
            self.Update();
        });
    };
    UIElement.prototype.onClick = function (f) {
        this._onClick = f;
        this.Update();
        return this;
    };
    UIElement.Fix = function (element) {
        if (typeof (element) === 'string') {
            return new FixedUiElement_1.FixedUiElement(element);
        }
        return element;
    };
    UIElement.prototype.Update = function () {
        var element = document.getElementById(this.id);
        if (element === null || element === undefined) {
            // The element is not painted
            return;
        }
        element.innerHTML = this.InnerRender();
        if (this._hideIfEmpty) {
            if (element.innerHTML === "") {
                element.parentElement.style.display = "none";
            }
            else {
                element.parentElement.style.display = undefined;
            }
        }
        if (this._onClick !== undefined) {
            var self_1 = this;
            element.onclick = function () {
                self_1._onClick();
            };
            element.style.pointerEvents = "all";
            element.style.cursor = "pointer";
        }
        this.InnerUpdate(element);
        for (var i in this) {
            var child = this[i];
            if (child instanceof UIElement) {
                child.Update();
            }
            else if (child instanceof Array) {
                for (var _i = 0, child_1 = child; _i < child_1.length; _i++) {
                    var ch = child_1[_i];
                    if (ch instanceof UIElement) {
                        ch.Update();
                    }
                }
            }
        }
    };
    UIElement.prototype.HideOnEmpty = function (hide) {
        this._hideIfEmpty = hide;
        this.Update();
        return this;
    };
    // Called after the HTML has been replaced. Can be used for css tricks
    UIElement.prototype.InnerUpdate = function (htmlElement) { };
    UIElement.prototype.Render = function () {
        return "<span class='uielement' id='" + this.id + "'>" + this.InnerRender() + "</span>";
    };
    UIElement.prototype.AttachTo = function (divId) {
        var element = document.getElementById(divId);
        if (element === null) {
            console.log("SEVERE: could not attach UIElement to ", divId);
            return;
        }
        element.innerHTML = this.Render();
        this.Update();
        return this;
    };
    UIElement.prototype.Activate = function () {
        for (var i in this) {
            var child = this[i];
            if (child instanceof UIElement) {
                child.Activate();
            }
            else if (child instanceof Array) {
                for (var _i = 0, child_2 = child; _i < child_2.length; _i++) {
                    var ch = child_2[_i];
                    if (ch instanceof UIElement) {
                        ch.Activate();
                    }
                }
            }
        }
    };
    ;
    UIElement.prototype.IsEmpty = function () {
        return this.InnerRender() === "";
    };
    UIElement.nextId = 0;
    return UIElement;
}());
exports.UIElement = UIElement;
