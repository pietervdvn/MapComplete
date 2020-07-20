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
exports.Bookcases = void 0;
var Layout_1 = require("../Layout");
var Layer = require("../Layers/Bookcases");
var Bookcases = /** @class */ (function (_super) {
    __extends(Bookcases, _super);
    function Bookcases() {
        var _this = _super.call(this, "bookcases", "Open Bookcase Map", [new Layer.Bookcases()], 14, 51.2, 3.2, "        <h3>Open BoekenkastjesKaart</h3>\n" +
            "\n" +
            "<p>" +
            "Help mee met het creëeren van een volledige kaart met alle boekenruilkastjes!" +
            "Een boekenruilkastje is een vaste plaats in publieke ruimte waar iedereen een boek in kan zetten of uit kan meenemen." +
            "Meestal een klein kastje of doosje dat op straat staat, maar ook een oude telefooncellen of een schap in een station valt hieronder." +
            "</p>", "  <p>Begin met <a href=\"https://www.openstreetmap.org/user/new\" target=\"_blank\">het aanmaken van een account\n" +
            "            </a> of door je " +
            "            <span onclick=\"authOsm()\" class=\"activate-osm-authentication\">aan te melden</span>.</p>", "Klik op een boekenruilkastje om vragen te beantwoorden") || this;
        _this.locationContains = ["Bookcases.html", "Bookcase.html", "bookcase"];
        return _this;
    }
    return Bookcases;
}(Layout_1.Layout));
exports.Bookcases = Bookcases;
