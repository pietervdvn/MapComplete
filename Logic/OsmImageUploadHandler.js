"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OsmImageUploadHandler = void 0;
var ImageUploadFlow_1 = require("../UI/ImageUploadFlow");
var OsmImageUploadHandler = /** @class */ (function () {
    function OsmImageUploadHandler(tags, userdetails, preferedLicense, changeHandler, slideShow) {
        this._slideShow = slideShow; // To move the slideshow (if any) to the last, just added element
        if (tags === undefined || userdetails === undefined || changeHandler === undefined) {
            throw "Something is undefined";
        }
        this._tags = tags;
        this._changeHandler = changeHandler;
        this._userdetails = userdetails;
        this._preferedLicense = preferedLicense;
    }
    OsmImageUploadHandler.prototype.generateOptions = function (license) {
        var _a;
        var tags = this._tags.data;
        var self = this;
        var title = (_a = tags.name) !== null && _a !== void 0 ? _a : "Unknown area";
        var description = [
            "author:" + this._userdetails.data.name,
            "license:" + license,
            "wikidata:" + tags.wikidata,
            "osmid:" + tags.id,
            "name:" + tags.name
        ].join("\n");
        var changes = this._changeHandler;
        return {
            title: title,
            description: description,
            handleURL: function (url) {
                var freeIndex = 0;
                while (tags["image:" + freeIndex] !== undefined) {
                    freeIndex++;
                }
                console.log("Adding image:" + freeIndex, url);
                changes.addChange(tags.id, "image:" + freeIndex, url);
                self._slideShow.MoveTo(-1); // set the last (thus newly added) image) to view
            },
            allDone: function () {
                changes.uploadAll(function () {
                    console.log("Writing changes...");
                });
            }
        };
    };
    OsmImageUploadHandler.prototype.getUI = function () {
        var self = this;
        return new ImageUploadFlow_1.ImageUploadFlow(this._userdetails, this._preferedLicense, function (license) {
            return self.generateOptions(license);
        });
    };
    return OsmImageUploadHandler;
}());
exports.OsmImageUploadHandler = OsmImageUploadHandler;
