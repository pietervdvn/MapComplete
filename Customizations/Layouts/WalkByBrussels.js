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
exports.WalkByBrussels = void 0;
var Layout_1 = require("../Layout");
var DrinkingWater_1 = require("../Layers/DrinkingWater");
var NatureReserves_1 = require("../Layers/NatureReserves");
var Park_1 = require("../Layers/Park");
var WalkByBrussels = /** @class */ (function (_super) {
    __extends(WalkByBrussels, _super);
    function WalkByBrussels() {
        return _super.call(this, "walkbybrussels", "Drinking Water Spots", [new DrinkingWater_1.DrinkingWater(), new Park_1.Park(), new NatureReserves_1.NatureReserves()], 10, 50.8435, 4.3688, "        <h3>Drinking water</h3>\n" +
            "\n" +
            "<p>" +
            "Help with creating a map of drinking water points!", "  <p>Start by <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">creating an account\n" +
            "            </a> or by " +
            "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">logging in</span>.</p>", "Start by clicking a pin and answering the questions") || this;
    }
    return WalkByBrussels;
}(Layout_1.Layout));
exports.WalkByBrussels = WalkByBrussels;
