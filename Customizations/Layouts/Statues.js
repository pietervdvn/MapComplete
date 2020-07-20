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
exports.Statues = void 0;
var Layout_1 = require("../Layout");
var Artwork_1 = require("../Layers/Artwork");
var Statues = /** @class */ (function (_super) {
    __extends(Statues, _super);
    function Statues() {
        return _super.call(this, "statues", "Open Artwork Map", [new Artwork_1.Artwork()], 10, 50.8435, 4.3688, "        <h3>Open Statue Map</h3>\n" +
            "\n" +
            "<p>" +
            "Help with creating a map of all statues all over the world!", "  <p>Start by <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">creating an account\n" +
            "            </a> or by " +
            "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">logging in</span>.</p>", "Start by clicking a pin and answering the questions") || this;
    }
    return Statues;
}(Layout_1.Layout));
exports.Statues = Statues;
