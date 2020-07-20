"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Imgur = void 0;
var jquery_1 = require("jquery");
var Wikimedia_1 = require("./Wikimedia");
var Imgur = /** @class */ (function () {
    function Imgur() {
    }
    Imgur.uploadMultiple = function (title, description, blobs, handleSuccessfullUpload, allDone, offset) {
        if (offset === void 0) { offset = 0; }
        if (blobs.length == offset) {
            allDone();
            return;
        }
        var blob = blobs.item(offset);
        var self = this;
        this.uploadImage(title, description, blob, function (imageUrl) {
            handleSuccessfullUpload(imageUrl);
            self.uploadMultiple(title, description, blobs, handleSuccessfullUpload, allDone, offset + 1);
        });
    };
    Imgur.getDescriptionOfImage = function (url, handleDescription) {
        var hash = url.substr("https://i.imgur.com/".length).split(".jpg")[0];
        var apiUrl = 'https://api.imgur.com/3/image/' + hash;
        var apiKey = '7070e7167f0a25a';
        var settings = {
            async: true,
            crossDomain: true,
            processData: false,
            contentType: false,
            type: 'GET',
            url: apiUrl,
            headers: {
                Authorization: 'Client-ID ' + apiKey,
                Accept: 'application/json',
            },
        };
        jquery_1.default.ajax(settings).done(function (response) {
            var descr = response.data.description;
            var data = {};
            for (var _i = 0, _a = descr.split("\n"); _i < _a.length; _i++) {
                var tag = _a[_i];
                var kv = tag.split(":");
                var k = kv[0];
                var v = kv[1].replace("\r", "");
                data[k] = v;
            }
            console.log(data);
            var licenseInfo = new Wikimedia_1.LicenseInfo();
            licenseInfo.licenseShortName = data.license;
            licenseInfo.artist = data.author;
            handleDescription(licenseInfo);
        }).fail(function (reason) {
            console.log("Getting metadata from to IMGUR failed", reason);
        });
    };
    Imgur.uploadImage = function (title, description, blob, handleSuccessfullUpload) {
        var apiUrl = 'https://api.imgur.com/3/image';
        var apiKey = '7070e7167f0a25a';
        var settings = {
            async: true,
            crossDomain: true,
            processData: false,
            contentType: false,
            type: 'POST',
            url: apiUrl,
            headers: {
                Authorization: 'Client-ID ' + apiKey,
                Accept: 'application/json',
            },
            mimeType: 'multipart/form-data',
        };
        var formData = new FormData();
        formData.append('image', blob);
        formData.append("title", title);
        formData.append("description", description);
        // @ts-ignore
        settings.data = formData;
        // Response contains stringified JSON
        // Image URL available at response.data.link
        jquery_1.default.ajax(settings).done(function (response) {
            response = JSON.parse(response);
            handleSuccessfullUpload(response.data.link);
        }).fail(function (reason) {
            console.log("Uploading to IMGUR failed", reason);
        });
    };
    return Imgur;
}());
exports.Imgur = Imgur;
