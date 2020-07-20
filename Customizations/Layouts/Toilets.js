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
var Layout_1 = require("../Layout");
var Layer = require("../Layers/Toilets");
var Toilets = /** @class */ (function (_super) {
    __extends(Toilets, _super);
    function Toilets() {
        return _super.call(this, "toilets", "Open Toilet Map", [new Layer.Toilets()], 12, 51.2, 3.2, "        <h3>Open Toilet Map</h3>\n" +
            "\n" +
            "<p>Help us to create the most complete map about <i>all</i> the toilets in the world, based on openStreetMap." +
            "One can answer questions here, which help users all over the world to find an accessible toilet, close to them.</p>", "  <p>Start by <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">creating an account\n" +
            "            </a> or by " +
            "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">logging in</span>.</p>", "Start by clicking a pin and answering the questions") || this;
    }
    return Toilets;
}(Layout_1.Layout));
exports.Toilets = Toilets;
