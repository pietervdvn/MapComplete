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
exports.GRB = void 0;
var Layout_1 = require("../Layout");
var GrbToFix_1 = require("../Layers/GrbToFix");
var GRB = /** @class */ (function (_super) {
    __extends(GRB, _super);
    function GRB() {
        return _super.call(this, "grb", "Grb import fix tool", [new GrbToFix_1.GrbToFix()], 15, 51.2083, 3.2279, "<h3>GRB Fix tool</h3>\n" +
            "\n" +
            "Expert use only", "", "") || this;
    }
    return GRB;
}(Layout_1.Layout));
exports.GRB = GRB;
