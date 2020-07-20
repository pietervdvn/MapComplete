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
exports.WikimediaImage = void 0;
var UIEventSource_1 = require("../UIEventSource");
var UIElement_1 = require("../UIElement");
var Wikimedia_1 = require("../../Logic/Wikimedia");
var WikimediaImage = /** @class */ (function (_super) {
    __extends(WikimediaImage, _super);
    function WikimediaImage(source) {
        var _this = _super.call(this, undefined) || this;
        _this._imageLocation = source;
        if (WikimediaImage.allLicenseInfos[source] !== undefined) {
            _this._imageMeta = WikimediaImage.allLicenseInfos[source];
        }
        else {
            _this._imageMeta = new UIEventSource_1.UIEventSource(new Wikimedia_1.LicenseInfo());
            WikimediaImage.allLicenseInfos[source] = _this._imageMeta;
            var self_1 = _this;
            Wikimedia_1.Wikimedia.LicenseData(source, function (info) {
                self_1._imageMeta.setData(info);
            });
        }
        _this.ListenTo(_this._imageMeta);
        return _this;
    }
    WikimediaImage.prototype.InnerRender = function () {
        var _a, _b;
        var url = Wikimedia_1.Wikimedia.ImageNameToUrl(this._imageLocation, 500, 400);
        url = url.replace(/'/g, '%27');
        var wikimediaLink = "<a href='https://commons.wikimedia.org/wiki/" + this._imageLocation + "' target='_blank'>" +
            "<img class='wikimedia-link' src='./assets/wikimedia-commons-white.svg' alt='Wikimedia Commons Logo'/>" +
            "</a> ";
        var attribution = "<span class='attribution-author'>" + ((_a = this._imageMeta.data.artist) !== null && _a !== void 0 ? _a : "") + "</span>" + " <span class='license'>" + ((_b = this._imageMeta.data.licenseShortName) !== null && _b !== void 0 ? _b : "") + "</span>";
        var image = "<img src='" + url + "' " + "alt='" + this._imageMeta.data.description + "' >";
        return "<div class='imgWithAttr'>" +
            image +
            "<div class='attribution'>" +
            wikimediaLink +
            attribution +
            "</div>" +
            "</div>";
    };
    WikimediaImage.allLicenseInfos = {};
    return WikimediaImage;
}(UIElement_1.UIElement));
exports.WikimediaImage = WikimediaImage;
