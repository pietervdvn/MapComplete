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
exports.ImageCarousel = exports.ImageCarouselConstructor = void 0;
var ImageSearcher_1 = require("../../Logic/ImageSearcher");
var SlideShow_1 = require("../SlideShow");
var FixedUiElement_1 = require("../Base/FixedUiElement");
var VariableUIElement_1 = require("../Base/VariableUIElement");
var ConfirmDialog_1 = require("../ConfirmDialog");
var UIElementConstructor_1 = require("../../Customizations/UIElementConstructor");
var ImageCarouselConstructor = /** @class */ (function () {
    function ImageCarouselConstructor() {
    }
    ImageCarouselConstructor.prototype.IsKnown = function (properties) {
        return true;
    };
    ImageCarouselConstructor.prototype.IsQuestioning = function (properties) {
        return false;
    };
    ImageCarouselConstructor.prototype.Priority = function () {
        return 0;
    };
    ImageCarouselConstructor.prototype.construct = function (tags, changes) {
        return new ImageCarousel(tags, changes);
    };
    return ImageCarouselConstructor;
}());
exports.ImageCarouselConstructor = ImageCarouselConstructor;
var ImageCarousel = /** @class */ (function (_super) {
    __extends(ImageCarousel, _super);
    function ImageCarousel(tags, changes) {
        var _this = _super.call(this, tags) || this;
        _this._userDetails = changes.login.userDetails;
        var self = _this;
        _this.searcher = new ImageSearcher_1.ImageSearcher(tags, changes);
        _this._uiElements = _this.searcher.map(function (imageURLS) {
            var uiElements = [];
            for (var _i = 0, imageURLS_1 = imageURLS; _i < imageURLS_1.length; _i++) {
                var url = imageURLS_1[_i];
                var image = ImageSearcher_1.ImageSearcher.CreateImageElement(url);
                uiElements.push(image);
            }
            return uiElements;
        });
        _this.slideshow = new SlideShow_1.SlideShow(_this._uiElements, new FixedUiElement_1.FixedUiElement("")).HideOnEmpty(true);
        var showDeleteButton = _this.slideshow._currentSlide.map(function (i) {
            if (!self._userDetails.data.loggedIn) {
                return false;
            }
            return self.searcher.IsDeletable(self.searcher.data[i]);
        }, [_this.searcher, _this._userDetails]);
        _this.slideshow._currentSlide.addCallback(function () {
            showDeleteButton.ping(); // This pings the showDeleteButton, which indicates that it has to hide it's subbuttons
        });
        var deleteCurrent = function () {
            self.searcher.Delete(self.searcher.data[self.slideshow._currentSlide.data]);
        };
        _this._deleteButton = new ConfirmDialog_1.ConfirmDialog(showDeleteButton, "<img src='assets/delete.svg' alt='Afbeelding verwijderen' class='delete-image'>", "<span>Afbeelding verwijderen</span>", "<span>Terug</span>", deleteCurrent, function () { }, 'delete-image-confirm', 'delete-image-cancel');
        var mapping = _this.slideshow._currentSlide.map(function (i) {
            if (_this.searcher._deletedImages.data.indexOf(_this.searcher.data[i]) >= 0) {
                return "<div class='image-is-removed'>Deze afbeelding is verwijderd</div>";
            }
            return "";
        });
        _this._isDeleted = new VariableUIElement_1.VariableUiElement(mapping);
        _this.searcher._deletedImages.addCallback(function () {
            _this.slideshow._currentSlide.ping();
        });
        return _this;
    }
    ImageCarousel.prototype.InnerRender = function () {
        return "<span class='image-carousel-container'>" +
            "<div class='image-delete-container'>" +
            this._deleteButton.Render() +
            this._isDeleted.Render() +
            "</div>" +
            this.slideshow.Render() +
            "</span>";
    };
    ImageCarousel.prototype.IsKnown = function () {
        return true;
    };
    ImageCarousel.prototype.IsQuestioning = function () {
        return false;
    };
    ImageCarousel.prototype.Priority = function () {
        return 0;
    };
    ImageCarousel.prototype.InnerUpdate = function (htmlElement) {
        _super.prototype.InnerUpdate.call(this, htmlElement);
        this._deleteButton.Update();
        this._isDeleted.Update();
    };
    ImageCarousel.prototype.Activate = function () {
        _super.prototype.Activate.call(this);
        this.searcher.Activate();
    };
    return ImageCarousel;
}(UIElementConstructor_1.TagDependantUIElement));
exports.ImageCarousel = ImageCarousel;
