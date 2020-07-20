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
exports.StreetWidth = void 0;
var Layout_1 = require("../Layout");
var Widths_1 = require("../Layers/Widths");
var StreetWidth = /** @class */ (function (_super) {
    __extends(StreetWidth, _super);
    function StreetWidth() {
        return _super.call(this, "width", "Straatbreedtes in Brugge", [new Widths_1.Widths(2, 1.5, 0.75)], 15, 51.20875, 3.22435, "<h3>De straat is opgebruikt</h3>" +
            "<p>Er is steeds meer druk op de openbare ruimte. Voetgangers, fietsers, steps, auto's, bussen, bestelwagens, buggies, cargobikes, ... willen allemaal hun deel van de openbare ruimte.</p>" +
            "" +
            "<p>In deze studie nemen we Brugge onder de loep en kijken we hoe breed elke straat is én hoe breed elke straat zou moeten zijn voor een veilig én vlot verkeer.</p>" +
            "Verschillende ingrepen kunnen de stad teruggeven aan de inwoners en de stad leefbaarder en levendiger maken.<br/>" +
            "Denk aan:" +
            "<ul>" +
            "<li>De autovrije zone's uitbreiden</li>" +
            "<li>De binnenstad fietszone maken</li>" +
            "<li>Het aantal woonerven uitbreiden</li>" +
            "<li>Grotere auto's meer belasten - ze nemen immers meer parkeerruimte in.</li>" +
            "</ul>", "", "") || this;
    }
    return StreetWidth;
}(Layout_1.Layout));
exports.StreetWidth = StreetWidth;
