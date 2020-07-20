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
exports.Natuurpunt = void 0;
var Layout_1 = require("../Layout");
var Birdhide_1 = require("../Layers/Birdhide");
var InformationBoard_1 = require("../Layers/InformationBoard");
var NatureReserves_1 = require("../Layers/NatureReserves");
var Natuurpunt = /** @class */ (function (_super) {
    __extends(Natuurpunt, _super);
    function Natuurpunt() {
        return _super.call(this, "natuurpunt", "De natuur in", [new Birdhide_1.Birdhide(), new InformationBoard_1.InformationBoard(), new NatureReserves_1.NatureReserves(true)], 12, 51.20875, 3.22435, "<h3>Natuurpuntstuff</h3>", "", "") || this;
    }
    return Natuurpunt;
}(Layout_1.Layout));
exports.Natuurpunt = Natuurpunt;
