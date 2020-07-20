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
exports.ImageSearcher = void 0;
var UIEventSource_1 = require("../UI/UIEventSource");
var Wikimedia_1 = require("./Wikimedia");
var WikimediaImage_1 = require("../UI/Image/WikimediaImage");
var SimpleImageElement_1 = require("../UI/Image/SimpleImageElement");
var ImgurImage_1 = require("../UI/Image/ImgurImage");
/**
 * There are multiple way to fetch images for an object
 * 1) There is an image tag
 * 2) There is an image tag, the image tag contains multiple ';'-seperated URLS
 * 3) there are multiple image tags, e.g. 'image', 'image:0', 'image:1', and 'image_0', 'image_1' - however, these are pretty rare so we are gonna ignore them
 * 4) There is a wikimedia_commons-tag, which either has a 'File': or a 'category:' containing images
 * 5) There is a wikidata-tag, and the wikidata item either has an 'image' attribute or has 'a link to a wikimedia commons category'
 * 6) There is a wikipedia article, from which we can deduct the wikidata item
 *
 * For some images, author and license should be shown
 */
/**
 * Class which search for all the possible locations for images and which builds a list of UI-elements for it.
 * Note that this list is embedded into an UIEVentSource, ready to put it into a carousel
 */
var ImageSearcher = /** @class */ (function (_super) {
    __extends(ImageSearcher, _super);
    function ImageSearcher(tags, changes) {
        var _this = _super.call(this, []) || this;
        _this._wdItem = new UIEventSource_1.UIEventSource("");
        _this._commons = new UIEventSource_1.UIEventSource("");
        _this._activated = false;
        _this._deletedImages = new UIEventSource_1.UIEventSource([]);
        _this._tags = tags;
        _this._changes = changes;
        var self = _this;
        _this._wdItem.addCallback(function () {
            // Load the wikidata item, then detect usage on 'commons'
            var wikidataId = self._wdItem.data;
            // @ts-ignore
            if (wikidataId.startsWith("Q")) {
                wikidataId = wikidataId.substr(1);
            }
            Wikimedia_1.Wikimedia.GetWikiData(parseInt(wikidataId), function (wd) {
                self.AddImage(wd.image);
                Wikimedia_1.Wikimedia.GetCategoryFiles(wd.commonsWiki, function (images) {
                    for (var _i = 0, _a = images.images; _i < _a.length; _i++) {
                        var image = _a[_i];
                        // @ts-ignore
                        if (image.startsWith("File:")) {
                            self.AddImage(image);
                        }
                    }
                });
            });
        });
        _this._commons.addCallback(function () {
            var commons = self._commons.data;
            // @ts-ignore
            if (commons.startsWith("Category:")) {
                Wikimedia_1.Wikimedia.GetCategoryFiles(commons, function (images) {
                    for (var _i = 0, _a = images.images; _i < _a.length; _i++) {
                        var image = _a[_i];
                        // @ts-ignore
                        if (image.startsWith("File:")) {
                            self.AddImage(image);
                        }
                    }
                });
            }
            else { // @ts-ignore
                if (commons.startsWith("File:")) {
                    self.AddImage(commons);
                }
            }
        });
        return _this;
    }
    ImageSearcher.prototype.AddImage = function (url) {
        if (url === undefined || url === null || url === "") {
            return;
        }
        for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
            var el = _a[_i];
            if (el === url) {
                return;
            }
        }
        this.data.push(url);
        this.ping();
    };
    ImageSearcher.prototype.ImageKey = function (url) {
        var tgs = this._tags.data;
        for (var key in tgs) {
            if (tgs[key] === url) {
                return key;
            }
        }
        return undefined;
    };
    ImageSearcher.prototype.IsDeletable = function (url) {
        return this.ImageKey(url) !== undefined;
    };
    ImageSearcher.prototype.Delete = function (url) {
        var key = this.ImageKey(url);
        if (key === undefined) {
            return;
        }
        console.log("Deleting image...", key, " --> ", url);
        this._changes.addChange(this._tags.data.id, key, "");
        this._deletedImages.data.push(url);
        this._deletedImages.ping();
    };
    ImageSearcher.prototype.Activate = function () {
        if (this._activated) {
            return;
        }
        this._activated = true;
        this.LoadImages();
        var self = this;
        this._tags.addCallback(function () { return self.LoadImages(); });
    };
    ImageSearcher.prototype.LoadImages = function () {
        if (!this._activated) {
            return;
        }
        var imageTag = this._tags.data.image;
        if (imageTag !== undefined) {
            var bareImages = imageTag.split(";");
            for (var _i = 0, bareImages_1 = bareImages; _i < bareImages_1.length; _i++) {
                var bareImage = bareImages_1[_i];
                this.AddImage(bareImage);
            }
        }
        for (var key in this._tags.data) {
            // @ts-ignore
            if (key.startsWith("image:")) {
                var url = this._tags.data[key];
                this.AddImage(url);
            }
        }
        var wdItem = this._tags.data.wikidata;
        if (wdItem !== undefined) {
            this._wdItem.setData(wdItem);
        }
        var commons = this._tags.data.wikimedia_commons;
        if (commons !== undefined) {
            this._commons.setData(commons);
        }
    };
    /***
     * Creates either a 'simpleimage' or a 'wikimediaimage' based on the string
     * @param url
     * @constructor
     */
    ImageSearcher.CreateImageElement = function (url) {
        // @ts-ignore
        if (url.startsWith("File:")) {
            return new WikimediaImage_1.WikimediaImage(url);
        }
        else if (url.startsWith("https://commons.wikimedia.org/wiki/")) {
            var commons = url.substr("https://commons.wikimedia.org/wiki/".length);
            return new WikimediaImage_1.WikimediaImage(commons);
        }
        else if (url.startsWith("https://i.imgur.com/")) {
            return new ImgurImage_1.ImgurImage(url);
        }
        else {
            return new SimpleImageElement_1.SimpleImageElement(new UIEventSource_1.UIEventSource(url));
        }
    };
    return ImageSearcher;
}(UIEventSource_1.UIEventSource));
exports.ImageSearcher = ImageSearcher;
