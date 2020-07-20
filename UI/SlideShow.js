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
exports.SlideShow = void 0;
var UIElement_1 = require("./UIElement");
var UIEventSource_1 = require("./UIEventSource");
var FixedUiElement_1 = require("./Base/FixedUiElement");
var SlideShow = /** @class */ (function (_super) {
    __extends(SlideShow, _super);
    function SlideShow(embeddedElements, noImages) {
        var _this = _super.call(this, embeddedElements) || this;
        _this._currentSlide = new UIEventSource_1.UIEventSource(0);
        _this._embeddedElements = embeddedElements;
        _this.ListenTo(_this._currentSlide);
        _this._noimages = noImages;
        var self = _this;
        _this._prev = new FixedUiElement_1.FixedUiElement("<div class='prev-button'>" +
            "<div class='vspan'></div>" +
            "<img src='assets/arrow-left-smooth.svg' alt='Prev'/>" +
            "</div>")
            .onClick(function () {
            var current = self._currentSlide.data;
            self.MoveTo(current - 1);
        });
        _this._next = new FixedUiElement_1.FixedUiElement("<div class='next-button'>" +
            "<div class='vspan'></div>" +
            "<img src='assets/arrow-right-smooth.svg' alt='Next'/>" +
            "</div>")
            .onClick(function () {
            var current = self._currentSlide.data;
            self.MoveTo(current + 1);
        });
        return _this;
    }
    SlideShow.prototype.InnerRender = function () {
        if (this._embeddedElements.data.length == 0) {
            return this._noimages.Render();
        }
        if (this._embeddedElements.data.length == 1) {
            return "<div class='image-slideshow'><div class='slides'><div class='slide'>" +
                this._embeddedElements.data[0].Render() +
                "</div></div></div>";
        }
        var slides = "";
        for (var i = 0; i < this._embeddedElements.data.length; i++) {
            var embeddedElement = this._embeddedElements.data[i];
            var state = "hidden";
            if (this._currentSlide.data === i) {
                state = "active-slide";
            }
            slides += "      <div class=\"slide " + state + "\">" + embeddedElement.Render() + "</div>\n";
        }
        return "<div class='image-slideshow'>"
            + this._prev.Render()
            + "<div class='slides'>" + slides + "</div>"
            + this._next.Render()
            + "</div>";
    };
    SlideShow.prototype.MoveTo = function (index) {
        if (index < 0) {
            index = this._embeddedElements.data.length - 1;
        }
        index = index % this._embeddedElements.data.length;
        this._currentSlide.setData(index);
    };
    SlideShow.prototype.InnerUpdate = function (htmlElement) {
        this._next.Update();
        this._prev.Update();
    };
    SlideShow.prototype.Activate = function () {
        for (var _i = 0, _a = this._embeddedElements.data; _i < _a.length; _i++) {
            var embeddedElement = _a[_i];
            embeddedElement.Activate();
        }
        this._next.Update();
        this._prev.Update();
    };
    return SlideShow;
}(UIElement_1.UIElement));
exports.SlideShow = SlideShow;
