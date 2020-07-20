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
var Layout_1 = require("../Layout");
var BikeParkings_1 = require("../Layers/BikeParkings");
var BikeStations_1 = require("../Layers/BikeStations");
var GhostBike_1 = require("../Layers/GhostBike");
var DrinkingWater_1 = require("../Layers/DrinkingWater");
var Cyclofix = /** @class */ (function (_super) {
    __extends(Cyclofix, _super);
    function Cyclofix() {
        return _super.call(this, "pomp", "Cyclofix bicycle infrastructure", [new GhostBike_1.GhostBike(), new BikeStations_1.default(), new BikeParkings_1.default(), new DrinkingWater_1.DrinkingWater()], 16, 50.8465573, 4.3516970, "<h3>Cyclofix bicycle infrastructure</h3>\n" +
            "\n" +
            "<p><b>EN&gt;</b> On this map we want to collect data about the whereabouts of bicycle pumps and public racks in Brussels." +
            "As a result, cyclists will be able to quickly find the nearest infrastructure for their needs.</p>" +
            "<p><b>NL&gt;</b> Op deze kaart willen we gegevens verzamelen over de locatie van fietspompen en openbare stelplaatsen in Brussel." +
            "Hierdoor kunnen fietsers snel de dichtstbijzijnde infrastructuur vinden die voldoet aan hun behoeften.</p>" +
            "<p><b>FR&gt;</b> Sur cette carte, nous voulons collecter des données sur la localisation des pompes à vélo et des supports publics à Bruxelles." +
            "Les cyclistes pourront ainsi trouver rapidement l'infrastructure la plus proche de leurs besoins.</p>", "", "") || this;
    }
    return Cyclofix;
}(Layout_1.Layout));
exports.default = Cyclofix;
