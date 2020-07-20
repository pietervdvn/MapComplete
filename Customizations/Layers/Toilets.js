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
exports.Toilets = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var Quests_1 = require("../../Quests");
var FixedUiElement_1 = require("../../UI/Base/FixedUiElement");
var leaflet_1 = require("leaflet");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var Toilets = /** @class */ (function (_super) {
    __extends(Toilets, _super);
    function Toilets() {
        var _a, _b;
        var _this = _super.call(this) || this;
        _this.name = "toilet";
        _this.newElementTags = [new TagsFilter_1.Tag("amenity", "toilets")];
        _this.icon = "./assets/toilets.svg";
        _this.overpassFilter = new TagsFilter_1.Tag("amenity", "toilets");
        _this.minzoom = 13;
        _this.questions = [Quests_1.Quests.hasFee,
            Quests_1.Quests.toiletsWheelChairs,
            Quests_1.Quests.toiletsChangingTable,
            Quests_1.Quests.toiletsChangingTableLocation,
            Quests_1.Quests.toiletsPosition];
        _this.style = function (tags) {
            if (tags.wheelchair == "yes") {
                return { icon: new leaflet_1.default.icon({
                        iconUrl: "assets/wheelchair.svg",
                        iconSize: [40, 40]
                    }) };
            }
            return { icon: new leaflet_1.default.icon({
                    iconUrl: "assets/toilets.svg",
                    iconSize: [40, 40]
                }) };
        };
        _this.elementsToShow = [
            new FixedUiElement_1.FixedUiElement("Toiletten"),
            new TagMappingOptions({
                key: "access",
                mapping: {
                    yes: "Toegankelijk",
                    no: "Niet toegankelijk",
                    private: "Niet toegankelijk",
                    customers: "Enkel voor klanten",
                }
            }),
            new TagMappingOptions({
                key: "fee",
                mapping: (_a = {
                        yes: "Betalend",
                        no: "Gratis"
                    },
                    _a["0"] = "Gratis",
                    _a),
                template: "Betalend, men vraagt {fee}"
            }),
            new TagMappingOptions({
                key: "toilets:position",
                mapping: (_b = {
                        seated: 'Gewone zittoiletten',
                        urinal: 'Een enkele urinoir',
                        urinals: 'Urinoirs'
                    },
                    _b['urinals;seated'] = "Urinoirs en gewone toiletten",
                    _b['seated;urinals'] = "Urinoirs en gewone toiletten",
                    _b)
            }),
            new TagMappingOptions({
                key: "wheelchair",
                mapping: {
                    yes: "Rolstoeltoegankelijk",
                    no: "Niet Rolstoeltoegankelijk",
                    limited: "Beperkt rolstoeltoegankelijk",
                }
            }),
        ];
        return _this;
    }
    return Toilets;
}(LayerDefinition_1.LayerDefinition));
exports.Toilets = Toilets;
