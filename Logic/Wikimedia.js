"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseInfo = exports.ImagesInCategory = exports.Wikidata = exports.Wikimedia = void 0;
var $ = require("jquery");
/**
 * This module provides endpoints for wikipedia/wikimedia and others
 */
var Wikimedia = /** @class */ (function () {
    function Wikimedia() {
    }
    Wikimedia.ImageNameToUrl = function (filename, width, height) {
        if (width === void 0) { width = 500; }
        if (height === void 0) { height = 200; }
        filename = encodeURIComponent(filename);
        return "https://commons.wikimedia.org/wiki/Special:FilePath/" + filename + "?width=" + width + "&height=" + height;
    };
    Wikimedia.LicenseData = function (filename, handle) {
        if (filename in this.knownLicenses) {
            return this.knownLicenses[filename];
        }
        if (filename === "") {
            return;
        }
        var url = "https://en.wikipedia.org/w/" +
            "api.php?action=query&prop=imageinfo&iiprop=extmetadata&" +
            "titles=" + filename +
            "&format=json&origin=*";
        $.getJSON(url, function (data, status) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var licenseInfo = new LicenseInfo();
            var license = data.query.pages[-1].imageinfo[0].extmetadata;
            licenseInfo.artist = (_a = license.Artist) === null || _a === void 0 ? void 0 : _a.value;
            licenseInfo.license = (_b = license.License) === null || _b === void 0 ? void 0 : _b.value;
            licenseInfo.copyrighted = (_c = license.Copyrighted) === null || _c === void 0 ? void 0 : _c.value;
            licenseInfo.attributionRequired = (_d = license.AttributionRequired) === null || _d === void 0 ? void 0 : _d.value;
            licenseInfo.usageTerms = (_e = license.UsageTerms) === null || _e === void 0 ? void 0 : _e.value;
            licenseInfo.licenseShortName = (_f = license.LicenseShortName) === null || _f === void 0 ? void 0 : _f.value;
            licenseInfo.credit = (_g = license.Credit) === null || _g === void 0 ? void 0 : _g.value;
            licenseInfo.description = (_h = license.ImageDescription) === null || _h === void 0 ? void 0 : _h.value;
            Wikimedia.knownLicenses[filename] = licenseInfo;
            handle(licenseInfo);
        });
    };
    Wikimedia.GetCategoryFiles = function (categoryName, handleCategory, alreadyLoaded, continueParameter) {
        var _this = this;
        if (alreadyLoaded === void 0) { alreadyLoaded = 0; }
        if (continueParameter === void 0) { continueParameter = undefined; }
        if (categoryName === undefined || categoryName === null || categoryName === "") {
            return;
        }
        // @ts-ignore
        if (!categoryName.startsWith("Category:")) {
            categoryName = "Category:" + categoryName;
        }
        var url = "https://commons.wikimedia.org/w/api.php?" +
            "action=query&list=categorymembers&format=json&" +
            "&origin=*" +
            "&cmtitle=" + encodeURIComponent(categoryName);
        if (continueParameter !== undefined) {
            url = url + "&" + continueParameter.k + "=" + continueParameter.param;
        }
        $.getJSON(url, function (response) {
            var _a;
            var imageOverview = new ImagesInCategory();
            var members = (_a = response.query) === null || _a === void 0 ? void 0 : _a.categorymembers;
            if (members === undefined) {
                members = [];
            }
            for (var _i = 0, members_1 = members; _i < members_1.length; _i++) {
                var member = members_1[_i];
                imageOverview.images.push(member.title);
            }
            if (response.continue === undefined || alreadyLoaded > 30) {
                handleCategory(imageOverview);
            }
            else {
                console.log("Recursive load for ", categoryName);
                _this.GetCategoryFiles(categoryName, function (recursiveImages) {
                    for (var _i = 0, _a = imageOverview.images; _i < _a.length; _i++) {
                        var image = _a[_i];
                        recursiveImages.images.push(image);
                    }
                    handleCategory(recursiveImages);
                }, alreadyLoaded + 10, { k: "cmcontinue", param: response.continue.cmcontinue });
            }
        });
    };
    Wikimedia.GetWikiData = function (id, handleWikidata) {
        var url = "https://www.wikidata.org/wiki/Special:EntityData/Q" + id + ".json";
        $.getJSON(url, function (response) {
            var _a, _b, _c, _d;
            var entity = response.entities["Q" + id];
            var commons = entity.sitelinks.commonswiki;
            var wd = new Wikidata();
            wd.commonsWiki = commons === null || commons === void 0 ? void 0 : commons.title;
            // P18 is the claim 'depicted in this image'
            var image = (_d = (_c = (_b = (_a = entity.claims.P18) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.mainsnak) === null || _c === void 0 ? void 0 : _c.datavalue) === null || _d === void 0 ? void 0 : _d.value;
            if (image) {
                wd.image = "File:" + image;
            }
            handleWikidata(wd);
        });
    };
    Wikimedia.knownLicenses = {};
    return Wikimedia;
}());
exports.Wikimedia = Wikimedia;
var Wikidata = /** @class */ (function () {
    function Wikidata() {
    }
    return Wikidata;
}());
exports.Wikidata = Wikidata;
var ImagesInCategory = /** @class */ (function () {
    function ImagesInCategory() {
        // Filenames of relevant images
        this.images = [];
    }
    return ImagesInCategory;
}());
exports.ImagesInCategory = ImagesInCategory;
var LicenseInfo = /** @class */ (function () {
    function LicenseInfo() {
        this.artist = "";
        this.license = "";
        this.licenseShortName = "";
        this.usageTerms = "";
        this.attributionRequired = false;
        this.copyrighted = false;
        this.credit = "";
        this.description = "";
    }
    return LicenseInfo;
}());
exports.LicenseInfo = LicenseInfo;
