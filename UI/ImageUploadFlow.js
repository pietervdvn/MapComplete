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
exports.ImageUploadFlow = void 0;
var UIElement_1 = require("./UIElement");
var UIEventSource_1 = require("./UIEventSource");
var jquery_1 = require("jquery");
var Imgur_1 = require("../Logic/Imgur");
var DropDown_1 = require("./Input/DropDown");
var VariableUIElement_1 = require("./Base/VariableUIElement");
var ImageUploadFlow = /** @class */ (function (_super) {
    __extends(ImageUploadFlow, _super);
    function ImageUploadFlow(userInfo, preferedLicense, uploadOptions) {
        var _this = _super.call(this, undefined) || this;
        _this._isUploading = new UIEventSource_1.UIEventSource(0);
        _this._userdetails = userInfo;
        _this.ListenTo(userInfo);
        _this._uploadOptions = uploadOptions;
        _this.ListenTo(_this._isUploading);
        var licensePicker = new DropDown_1.DropDown("Jouw foto wordt gepubliceerd ", [
            { value: "CC0", shown: "in het publiek domein" },
            { value: "CC-BY-SA 4.0", shown: "onder een CC-BY-SA-licentie" },
            { value: "CC-BY 4.0", shown: "onder een CC-BY-licentie" }
        ], preferedLicense);
        _this._licensePicker = licensePicker;
        _this._selectedLicence = licensePicker.selectedElement;
        var licenseExplanations = {
            "CC-BY-SA 4.0": "<b>Creative Commonse met naamsvermelding en gelijk delen</b><br/>" +
                "Je foto mag door iedereen gratis gebruikt worden, als ze je naam vermelden én ze afgeleide werken met deze licentie en attributie delen.",
            "CC-BY 4.0": "<b>Creative Commonse met naamsvermelding</b> <br/>" +
                "Je foto mag door iedereen gratis gebruikt worden, als ze je naam vermelden",
            "CC0": "<b>Geen copyright</b><br/> Je foto mag door iedereen voor alles gebruikt worden"
        };
        _this._licenseExplanation = new VariableUIElement_1.VariableUiElement(_this._selectedLicence.map(function (license) {
            return licenseExplanations[license];
        }));
        return _this;
    }
    ImageUploadFlow.prototype.InnerRender = function () {
        if (!this._userdetails.data.loggedIn) {
            return "<div class='activate-osm-authentication'>Gelieve je aan te melden om een foto toe te voegen of vragen te beantwoorden</div>";
        }
        if (this._isUploading.data == 1) {
            return "<b>Bezig met een foto te uploaden...</b>";
        }
        if (this._isUploading.data > 0) {
            return "<b>Bezig met uploaden, nog " + this._isUploading.data + " foto's te gaan...</b>";
        }
        return "" +
            "<div class='imageflow'>" +
            "<label for='fileselector-" + this.id + "'>" +
            "<div class='imageflow-file-input-wrapper'>" +
            "<img src='./assets/camera-plus.svg' alt='upload image'/> " +
            "<span class='imageflow-add-picture'>Voeg foto toe</span>" +
            "<div class='break'></div>" +
            "</div>" +
            this._licensePicker.Render() +
            "</label>" +
            "<input id='fileselector-" + this.id + "' " +
            "type='file' " +
            "class='imageflow-file-input' " +
            "accept='image/*' name='picField' size='24' multiple='multiple' alt=''" +
            "/>" +
            "</div>";
    };
    ImageUploadFlow.prototype.InnerUpdate = function (htmlElement) {
        _super.prototype.InnerUpdate.call(this, htmlElement);
        var user = this._userdetails.data;
        htmlElement.onclick = function () {
            if (!user.loggedIn) {
                user.osmConnection.AttemptLogin();
            }
        };
        this._licensePicker.Update();
        var selector = document.getElementById('fileselector-' + this.id);
        var self = this;
        if (selector != null) {
            selector.onchange = function () {
                var files = jquery_1.default(this).get(0).files;
                self._isUploading.setData(files.length);
                var opts = self._uploadOptions(self._selectedLicence.data);
                Imgur_1.Imgur.uploadMultiple(opts.title, opts.description, files, function (url) {
                    console.log("File saved at", url);
                    self._isUploading.setData(self._isUploading.data - 1);
                    opts.handleURL(url);
                }, function () {
                    console.log("All uploads completed");
                    opts.allDone();
                });
            };
        }
    };
    return ImageUploadFlow;
}(UIElement_1.UIElement));
exports.ImageUploadFlow = ImageUploadFlow;
