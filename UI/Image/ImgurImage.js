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
exports.ImgurImage = void 0;
var UIEventSource_1 = require("../UIEventSource");
var UIElement_1 = require("../UIElement");
var Imgur_1 = require("../../Logic/Imgur");
var ImgurImage = /** @class */ (function (_super) {
    __extends(ImgurImage, _super);
    function ImgurImage(source) {
        var _this = _super.call(this, undefined) || this;
        _this._imageLocation = source;
        if (ImgurImage.allLicenseInfos[source] !== undefined) {
            _this._imageMeta = ImgurImage.allLicenseInfos[source];
        }
        else {
            _this._imageMeta = new UIEventSource_1.UIEventSource(null);
            ImgurImage.allLicenseInfos[source] = _this._imageMeta;
            var self_1 = _this;
            Imgur_1.Imgur.getDescriptionOfImage(source, function (license) {
                self_1._imageMeta.setData(license);
            });
        }
        _this.ListenTo(_this._imageMeta);
        return _this;
    }
    ImgurImage.prototype.InnerRender = function () {
        var _a, _b;
        var image = "<img src='" + this._imageLocation + "' " + "alt='' >";
        if (this._imageMeta.data === null) {
            return image;
        }
        var attribution = "<span class='attribution-author'><b>" + ((_a = this._imageMeta.data.artist) !== null && _a !== void 0 ? _a : "") + "</b></span>" + " <span class='license'>" + ((_b = this._imageMeta.data.licenseShortName) !== null && _b !== void 0 ? _b : "") + "</span>";
        return "<div class='imgWithAttr'>" +
            image +
            "<div class='attribution'>" +
            attribution +
            "</div>" +
            "</div>";
    };
    /***
     * Dictionary from url to alreayd known license info
     */
    ImgurImage.allLicenseInfos = {};
    return ImgurImage;
}(UIElement_1.UIElement));
exports.ImgurImage = ImgurImage;
