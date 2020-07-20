"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllKnownLayouts = void 0;
var Groen_1 = require("./Layouts/Groen");
var GRB_1 = require("./Layouts/GRB");
var Bookcases_1 = require("./Layouts/Bookcases");
var Cyclofix_1 = require("./Layouts/Cyclofix");
var WalkByBrussels_1 = require("./Layouts/WalkByBrussels");
var All_1 = require("./Layouts/All");
var MetaMap_1 = require("./Layouts/MetaMap");
var StreetWidth_1 = require("./Layouts/StreetWidth");
var Natuurpunt_1 = require("./Layouts/Natuurpunt");
var AllKnownLayouts = /** @class */ (function () {
    function AllKnownLayouts() {
    }
    AllKnownLayouts.AllLayouts = function () {
        var all = new All_1.All();
        var layouts = [
            new Groen_1.Groen(),
            new GRB_1.GRB(),
            new Cyclofix_1.default(),
            new Bookcases_1.Bookcases(),
            new WalkByBrussels_1.WalkByBrussels(),
            new MetaMap_1.MetaMap(),
            new StreetWidth_1.StreetWidth(),
            new Natuurpunt_1.Natuurpunt(),
            all
            /*new Toilets(),
            new Statues(),
            */
        ];
        var allSets = {};
        for (var _i = 0, layouts_1 = layouts; _i < layouts_1.length; _i++) {
            var layout = layouts_1[_i];
            allSets[layout.name] = layout;
            all.layers = all.layers.concat(layout.layers);
        }
        return allSets;
    };
    AllKnownLayouts.GetSets = function (layoutNames) {
        var all = new All_1.All();
        for (var _i = 0, layoutNames_1 = layoutNames; _i < layoutNames_1.length; _i++) {
            var name_1 = layoutNames_1[_i];
            all.layers = all.layers.concat(AllKnownLayouts.allSets[name_1].layers);
        }
        return all;
    };
    AllKnownLayouts.allSets = AllKnownLayouts.AllLayouts();
    return AllKnownLayouts;
}());
exports.AllKnownLayouts = AllKnownLayouts;
