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
exports.Widths = void 0;
var LayerDefinition_1 = require("../LayerDefinition");
var TagsFilter_1 = require("../../Logic/TagsFilter");
var TagRendering_1 = require("../TagRendering");
var Widths = /** @class */ (function (_super) {
    __extends(Widths, _super);
    function Widths(carWidth, cyclistWidth, pedestrianWidth) {
        var _this = _super.call(this) || this;
        _this._bothSideParking = new TagsFilter_1.Tag("parking:lane:both", "parallel");
        _this._noSideParking = new TagsFilter_1.Tag("parking:lane:both", "no_parking");
        _this._otherParkingMode = new TagsFilter_1.Or([
            new TagsFilter_1.Tag("parking:lane:both", "perpendicular"),
            new TagsFilter_1.Tag("parking:lane:left", "perpendicular"),
            new TagsFilter_1.Tag("parking:lane:right", "perpendicular"),
            new TagsFilter_1.Tag("parking:lane:both", "diagonal"),
            new TagsFilter_1.Tag("parking:lane:left", "diagonal"),
            new TagsFilter_1.Tag("parking:lane:right", "diagonal"),
        ]);
        _this._leftSideParking = new TagsFilter_1.And([new TagsFilter_1.Tag("parking:lane:left", "parallel"), new TagsFilter_1.Tag("parking:lane:right", "no_parking")]);
        _this._rightSideParking = new TagsFilter_1.And([new TagsFilter_1.Tag("parking:lane:right", "parallel"), new TagsFilter_1.Tag("parking:lane:left", "no_parking")]);
        _this._sidewalkBoth = new TagsFilter_1.Tag("sidewalk", "both");
        _this._sidewalkLeft = new TagsFilter_1.Tag("sidewalk", "left");
        _this._sidewalkRight = new TagsFilter_1.Tag("sidewalk", "right");
        _this._sidewalkNone = new TagsFilter_1.Tag("sidewalk", "none");
        _this._oneSideParking = new TagsFilter_1.Or([_this._leftSideParking, _this._rightSideParking]);
        _this._carfree = new TagsFilter_1.Or([new TagsFilter_1.Tag("highway", "pedestrian"), new TagsFilter_1.Tag("highway", "living_street")]);
        _this._notCarFree = new TagsFilter_1.Not(_this._carfree);
        _this.carWidth = carWidth;
        _this.cyclistWidth = cyclistWidth;
        _this.pedestrianWidth = pedestrianWidth;
        _this.minzoom = 12;
        function r(n) {
            var pre = Math.floor(n);
            var post = Math.floor((n * 10) % 10);
            return "" + pre + "." + post;
        }
        _this.name = "widths";
        _this.overpassFilter = new TagsFilter_1.Tag("width:carriageway", "*");
        _this.title = new TagRendering_1.TagRenderingOptions({
            freeform: {
                renderTemplate: "{name}",
                template: "$$$",
                key: "name"
            }
        });
        var self = _this;
        _this.style = function (properties) {
            var c = "#f00";
            var props = self.calcProps(properties);
            if (props.pedestrianFlowNeeded > 0) {
                c = "#fa0";
            }
            if (props.width >= props.targetWidth || !props.cyclingAllowed) {
                c = "#0c0";
            }
            if (!props.parkingStateKnown && properties["note:width:carriageway"] === undefined) {
                c = "#f0f";
            }
            if (_this._carfree.matchesProperties(properties)) {
                c = "#aaa";
            }
            // Mark probably wrong data
            if (props.width > 15) {
                c = "#f0f";
            }
            var dashArray = undefined;
            if (props.onewayBike) {
                dashArray = [20, 8];
            }
            return {
                icon: null,
                color: c,
                weight: 7,
                dashArray: dashArray
            };
        };
        _this.elementsToShow = [
            new TagRendering_1.TagRenderingOptions({
                question: "Mogen auto's hier parkeren?",
                mappings: [
                    {
                        k: _this._bothSideParking,
                        txt: "Auto's kunnen langs beide zijden parkeren.<br+>Dit gebruikt <b>" + r(_this.carWidth * 2) + "m</b><br/>"
                    },
                    {
                        k: _this._oneSideParking,
                        txt: "Auto's kunnen langs één kant parkeren.<br/>Dit gebruikt <b>" + r(_this.carWidth) + "m</b><br/>"
                    },
                    {
                        k: _this._otherParkingMode,
                        txt: "Deze straat heeft dwarsparkeren of diagonaalparkeren aan minstens één zijde. Deze parkeerruimte is niet opgenomen in de straatbreedte."
                    },
                    { k: _this._noSideParking, txt: "Auto's mogen hier niet parkeren" },
                ],
                freeform: {
                    key: "note:width:carriageway",
                    renderTemplate: "{note:width:carriageway}",
                    template: "$$$",
                }
            }).OnlyShowIf(_this._notCarFree),
            new TagRendering_1.TagRenderingOptions({
                mappings: [
                    {
                        k: _this._sidewalkNone,
                        txt: "Deze straat heeft geen voetpaden. Voetgangers hebben hier <b>" + r(_this.pedestrianWidth * 2) + "m</b> nodig"
                    },
                    {
                        k: new TagsFilter_1.Or([_this._sidewalkLeft, _this._sidewalkRight]),
                        txt: "Deze straat heeft een voetpad aan één kant. Voetgangers hebben hier <b>" + r(_this.pedestrianWidth) + "m</b> nodig"
                    },
                    { k: _this._sidewalkBoth, txt: "Deze straat heeft voetpad aan beide zijden." },
                ],
                freeform: {
                    key: "note:width:carriageway",
                    renderTemplate: "{note:width:carriageway}",
                    template: "$$$",
                }
            }).OnlyShowIf(_this._notCarFree),
            new TagRendering_1.TagRenderingOptions({
                mappings: [
                    {
                        k: new TagsFilter_1.Tag("bicycle", "use_sidepath"),
                        txt: "Er is een afgescheiden, verplicht te gebruiken fietspad. Fietsen op dit wegsegment hoeft dus niet"
                    },
                    {
                        k: new TagsFilter_1.Tag("bicycle", "no"),
                        txt: "Fietsen is hier niet toegestaan"
                    },
                    {
                        k: new TagsFilter_1.Tag("oneway:bicycle", "yes"),
                        txt: "Eenrichtingsverkeer, óók voor fietsers. Dit gebruikt <b>" + r(_this.carWidth + _this.cyclistWidth) + "m</b>"
                    },
                    {
                        k: new TagsFilter_1.And([new TagsFilter_1.Tag("oneway", "yes"), new TagsFilter_1.Tag("oneway:bicycle", "no")]),
                        txt: "Tweerichtingverkeer voor fietsers, eenrichting voor auto's Dit gebruikt <b>" + r(_this.carWidth + 2 * _this.cyclistWidth) + "m</b>"
                    },
                    {
                        k: new TagsFilter_1.Tag("oneway", "yes"),
                        txt: "Eenrichtingsverkeer voor iedereen. Dit gebruikt <b>" + (_this.carWidth + _this.cyclistWidth) + "m</b>"
                    },
                    {
                        k: null,
                        txt: "Tweerichtingsverkeer voor iedereen. Dit gebruikt <b>" + r(2 * _this.carWidth + 2 * _this.cyclistWidth) + "m</b>"
                    }
                ]
            }).OnlyShowIf(_this._notCarFree),
            new TagRendering_1.TagRenderingOptions({
                tagsPreprocessor: function (tags) {
                    var props = self.calcProps(tags);
                    tags.targetWidth = r(props.targetWidth);
                    tags.short = "";
                    if (props.width < props.targetWidth) {
                        tags.short = "Er is dus <b class='alert'>" + r(props.targetWidth - props.width) + "m</b> te weinig";
                    }
                },
                freeform: {
                    key: "width:carriageway",
                    renderTemplate: "De totale nodige ruimte voor vlot en veilig verkeer is dus <b>{targetWidth}m</b><br>" +
                        "{short}",
                    template: "$$$",
                }
            }).OnlyShowIf(_this._notCarFree),
            new TagRendering_1.TagRenderingOptions({
                mappings: [
                    { k: new TagsFilter_1.Tag("highway", "living_street"), txt: "Dit is een woonerf" },
                    { k: new TagsFilter_1.Tag("highway", "pedestrian"), txt: "Deze weg is autovrij" }
                ]
            }),
            new TagRendering_1.TagRenderingOptions({
                mappings: [
                    {
                        k: new TagsFilter_1.Tag("sidewalk", "none"),
                        txt: "De afstand van huis tot huis is <b>{width:carriageway}m</b>"
                    },
                    {
                        k: new TagsFilter_1.Tag("sidewalk", "left"),
                        txt: "De afstand van huis tot voetpad is <b>{width:carriageway}m</b>"
                    },
                    {
                        k: new TagsFilter_1.Tag("sidewalk", "right"),
                        txt: "De afstand van huis tot voetpad is <b>{width:carriageway}m</b>"
                    },
                    {
                        k: new TagsFilter_1.Tag("sidewalk", "both"),
                        txt: "De afstand van voetpad tot voetpad is <b>{width:carriageway}m</b>"
                    },
                    {
                        k: new TagsFilter_1.Tag("sidewalk", ""),
                        txt: "De straatbreedte is <b>{width:carriageway}m</b>"
                    }
                ]
            })
        ];
        return _this;
    }
    Widths.prototype.calcProps = function (properties) {
        var parkingStateKnown = true;
        var parallelParkingCount = 0;
        if (this._oneSideParking.matchesProperties(properties)) {
            parallelParkingCount = 1;
        }
        else if (this._bothSideParking.matchesProperties(properties)) {
            parallelParkingCount = 2;
        }
        else if (this._noSideParking.matchesProperties(properties)) {
            parallelParkingCount = 0;
        }
        else if (this._otherParkingMode.matchesProperties(properties)) {
            parallelParkingCount = 0;
        }
        else {
            parkingStateKnown = false;
            console.log("No parking data for ", properties.name, properties.id, properties);
        }
        var pedestrianFlowNeeded = 0;
        if (this._sidewalkBoth.matchesProperties(properties)) {
            pedestrianFlowNeeded = 0;
        }
        else if (this._sidewalkNone.matchesProperties(properties)) {
            pedestrianFlowNeeded = 2;
        }
        else if (this._sidewalkLeft.matchesProperties(properties) || this._sidewalkRight.matches(properties)) {
            pedestrianFlowNeeded = 1;
        }
        else {
            pedestrianFlowNeeded = -1;
        }
        var onewayCar = properties.oneway === "yes";
        var onewayBike = properties["oneway:bicycle"] === "yes" ||
            (onewayCar && properties["oneway:bicycle"] === undefined);
        var cyclingAllowed = !(properties.bicycle === "use_sidepath"
            || properties.bicycle === "no");
        var carWidth = (onewayCar ? 1 : 2) * this.carWidth;
        var cyclistWidth = 0;
        if (cyclingAllowed) {
            cyclistWidth = (onewayBike ? 1 : 2) * this.cyclistWidth;
        }
        var width = parseFloat(properties["width:carriageway"]);
        var targetWidth = carWidth +
            cyclistWidth +
            Math.max(0, pedestrianFlowNeeded) * this.pedestrianWidth +
            parallelParkingCount * this.carWidth;
        return {
            parkingLanes: parallelParkingCount,
            parkingStateKnown: parkingStateKnown,
            width: width,
            targetWidth: targetWidth,
            onewayBike: onewayBike,
            pedestrianFlowNeeded: pedestrianFlowNeeded,
            cyclingAllowed: cyclingAllowed
        };
    };
    return Widths;
}(LayerDefinition_1.LayerDefinition));
exports.Widths = Widths;
