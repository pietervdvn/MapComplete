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
exports.ImageCarouselWithUploadConstructor = void 0;
var UIElementConstructor_1 = require("../../Customizations/UIElementConstructor");
var ImageCarousel_1 = require("./ImageCarousel");
var OsmImageUploadHandler_1 = require("../../Logic/OsmImageUploadHandler");
var ImageCarouselWithUploadConstructor = /** @class */ (function () {
    function ImageCarouselWithUploadConstructor() {
    }
    ImageCarouselWithUploadConstructor.prototype.IsKnown = function (properties) {
        return true;
    };
    ImageCarouselWithUploadConstructor.prototype.IsQuestioning = function (properties) {
        return false;
    };
    ImageCarouselWithUploadConstructor.prototype.Priority = function () {
        return 0;
    };
    ImageCarouselWithUploadConstructor.prototype.construct = function (dependencies) {
        return new ImageCarouselWithUpload(dependencies);
    };
    return ImageCarouselWithUploadConstructor;
}());
exports.ImageCarouselWithUploadConstructor = ImageCarouselWithUploadConstructor;
var ImageCarouselWithUpload = /** @class */ (function (_super) {
    __extends(ImageCarouselWithUpload, _super);
    function ImageCarouselWithUpload(dependencies) {
        var _this = _super.call(this, dependencies.tags) || this;
        var tags = dependencies.tags;
        var changes = dependencies.changes;
        _this._imageElement = new ImageCarousel_1.ImageCarousel(tags, changes);
        var userDetails = changes.login.userDetails;
        var license = changes.login.GetPreference("mapcomplete-pictures-license");
        _this._pictureUploader = new OsmImageUploadHandler_1.OsmImageUploadHandler(tags, userDetails, license, changes, _this._imageElement.slideshow).getUI();
        return _this;
    }
    ImageCarouselWithUpload.prototype.InnerRender = function () {
        return this._imageElement.Render() +
            this._pictureUploader.Render();
    };
    ImageCarouselWithUpload.prototype.Activate = function () {
        _super.prototype.Activate.call(this);
        this._imageElement.Activate();
        this._pictureUploader.Activate();
    };
    ImageCarouselWithUpload.prototype.Update = function () {
        _super.prototype.Update.call(this);
        this._imageElement.Update();
        this._pictureUploader.Update();
    };
    ImageCarouselWithUpload.prototype.IsKnown = function () {
        return true;
    };
    ImageCarouselWithUpload.prototype.IsQuestioning = function () {
        return false;
    };
    ImageCarouselWithUpload.prototype.Priority = function () {
        return 0;
    };
    return ImageCarouselWithUpload;
}(UIElementConstructor_1.TagDependantUIElement));
