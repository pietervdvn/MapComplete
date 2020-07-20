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
exports.All = void 0;
var Layout_1 = require("../Layout");
var All = /** @class */ (function (_super) {
    __extends(All, _super);
    function All() {
        return _super.call(this, "all", "All quest layers", [], 15, 51.2, 3.2, "<h3>All quests of MapComplete</h3>" +
            "This is a mixed bag. Some quests might be hard or for experts to answer only", "Please log in", "") || this;
    }
    return All;
}(Layout_1.Layout));
exports.All = All;
