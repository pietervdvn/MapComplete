import {LayerDefinition} from "../LayerDefinition";
import {And, Not, Or, Tag} from "../../Logic/TagsFilter";
import {TagRenderingOptions} from "../TagRendering";
import {UIEventSource} from "../../UI/UIEventSource";
import {Park} from "./Park";

export class Widths extends LayerDefinition {

    private cyclistWidth: number;
    private carWidth: number;
    private pedestrianWidth: number;

    private readonly _bothSideParking = new Tag("parking:lane:both", "parallel");
    private readonly _noSideParking = new Tag("parking:lane:both", "no_parking");
    private readonly _otherParkingMode =
        new Or([
            new Tag("parking:lane:both", "perpendicular"),
            new Tag("parking:lane:left", "perpendicular"),
            new Tag("parking:lane:right", "perpendicular"),
            new Tag("parking:lane:both", "diagonal"),
            new Tag("parking:lane:left", "diagonal"),
            new Tag("parking:lane:right", "diagonal"),
        ])


    private readonly _leftSideParking =
        new And([new Tag("parking:lane:left", "parallel"), new Tag("parking:lane:right", "no_parking")]);
    private readonly _rightSideParking =
        new And([new Tag("parking:lane:right", "parallel"), new Tag("parking:lane:left", "no_parking")]);


    private _sidewalkBoth = new Tag("sidewalk", "both");
    private _sidewalkLeft = new Tag("sidewalk", "left");
    private _sidewalkRight = new Tag("sidewalk", "right");
    private _sidewalkNone = new Tag("sidewalk", "none");


    private readonly _oneSideParking = new Or([this._leftSideParking, this._rightSideParking]);

    private readonly _carfree = new Or([new Tag("highway", "pedestrian"), new Tag("highway", "living_street")])
    private readonly _notCarFree = new Not(this._carfree);

    private calcProps(properties) {
        let parkingStateKnown = true;
        let parallelParkingCount = 0;

        if (this._oneSideParking.matchesProperties(properties)) {
            parallelParkingCount = 1;
        } else if (this._bothSideParking.matchesProperties(properties)) {
            parallelParkingCount = 2;
        } else if (this._noSideParking.matchesProperties(properties)) {
            parallelParkingCount = 0;
        } else if (this._otherParkingMode.matchesProperties(properties)) {
            parallelParkingCount = 0;
        } else {
            parkingStateKnown = false;
            console.log("No parking data for ", properties.name, properties.id, properties)
        }


        let pedestrianFlowNeeded = 0;

        if (this._sidewalkBoth.matchesProperties(properties)) {
            pedestrianFlowNeeded = 0;
        } else if (this._sidewalkNone.matchesProperties(properties)) {
            pedestrianFlowNeeded = 2;
        } else if (this._sidewalkLeft.matchesProperties(properties) || this._sidewalkRight.matches(properties)) {
            pedestrianFlowNeeded = 1;
        } else {
            pedestrianFlowNeeded = -1;
        }


        let onewayCar = properties.oneway === "yes";
        let onewayBike = properties["oneway:bicycle"] === "yes" ||
            (onewayCar && properties["oneway:bicycle"] === undefined)

        let cyclingAllowed = 
            !(properties.bicycle === "use_sidepath"
           || properties.bicycle === "no");

        let carWidth = (onewayCar ? 1 : 2) * this.carWidth;
        let cyclistWidth = 0;
        if (cyclingAllowed) {
            cyclistWidth = (onewayBike ? 1 : 2) * this.cyclistWidth;
        }

        const width = parseFloat(properties["width:carriageway"]);


        const targetWidth =
            carWidth +
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
        }
    }


    constructor(carWidth: number,
                cyclistWidth: number,
                pedestrianWidth: number) {
        super();
        this.carWidth = carWidth;
        this.cyclistWidth = cyclistWidth;
        this.pedestrianWidth = pedestrianWidth;
        this.minzoom = 12;

        function r(n: number) {
            const pre = Math.floor(n);
            const post = Math.floor((n * 10) % 10);
            return "" + pre + "." + post;
        }

        this.name = "widths";
        this.overpassFilter = new Tag("width:carriageway", "*");

        this.title = new TagRenderingOptions({
            freeform: {
                renderTemplate: "{name}",
                template: "$$$",
                key: "name"
            }
        })

        const self = this;
        this.style = (properties) => {

            let c = "#f00";


            const props = self.calcProps(properties);
            if (props.pedestrianFlowNeeded > 0) {
                c = "#fa0"
            }
            if (props.width >= props.targetWidth || !props.cyclingAllowed) {
                c = "#0c0";
            }

            if (!props.parkingStateKnown && properties["note:width:carriageway"] === undefined) {
                c = "#f0f"
            }
            
            if (this._carfree.matchesProperties(properties)) {
                c = "#aaa";
            }


            // Mark probably wrong data
            if (props.width > 15) {
                c = "#f0f"
            }

            let dashArray = undefined;
            if (props.onewayBike) {
                dashArray = [20, 8]
            }
            return {
                icon: null,
                color: c,
                weight: 7,
                dashArray: dashArray
            }
        }

        this.elementsToShow = [
            new TagRenderingOptions({
                question: "Mogen auto's hier parkeren?",
                mappings: [
                    {
                        k: this._bothSideParking,
                        txt: "Auto's kunnen langs beide zijden parkeren.<br+>Dit gebruikt <b>" + r(this.carWidth * 2) + "m</b><br/>"
                    },
                    {
                        k: this._oneSideParking,
                        txt: "Auto's kunnen langs één kant parkeren.<br/>Dit gebruikt <b>" + r(this.carWidth) + "m</b><br/>"
                    },
                    {
                        k: this._otherParkingMode,
                        txt: "Deze straat heeft dwarsparkeren of diagonaalparkeren aan minstens één zijde. Deze parkeerruimte is niet opgenomen in de straatbreedte."
                    },
                    {k: this._noSideParking, txt: "Auto's mogen hier niet parkeren"},
                    // {k: null, txt: "Nog geen parkeerinformatie bekend"}
                ],
                freeform: {
                    key: "note:width:carriageway",
                    renderTemplate: "{note:width:carriageway}",
                    template: "$$$",
                }
            }).OnlyShowIf(this._notCarFree),


            new TagRenderingOptions({
                mappings: [
                    {
                        k: this._sidewalkNone,
                        txt: "Deze straat heeft geen voetpaden. Voetgangers hebben hier <b>" + r(this.pedestrianWidth * 2) + "m</b> nodig"
                    },
                    {
                        k: new Or([this._sidewalkLeft, this._sidewalkRight]),
                        txt: "Deze straat heeft een voetpad aan één kant. Voetgangers hebben hier <b>" + r(this.pedestrianWidth) + "m</b> nodig"
                    },
                    {k: this._sidewalkBoth, txt: "Deze straat heeft voetpad aan beide zijden."},
                ],
                freeform: {
                    key: "note:width:carriageway",
                    renderTemplate: "{note:width:carriageway}",
                    template: "$$$",
                }
            }).OnlyShowIf(this._notCarFree),


            new TagRenderingOptions({
                mappings: [
                    {
                        k: new Tag("bicycle", "use_sidepath"),
                        txt: "Er is een afgescheiden, verplicht te gebruiken fietspad. Fietsen op dit wegsegment hoeft dus niet"
                    },
                    {
                        k: new Tag("bicycle", "no"),
                        txt: "Fietsen is hier niet toegestaan"
                    },
                    {
                        k: new Tag("oneway:bicycle", "yes"),
                        txt: "Eenrichtingsverkeer, óók voor fietsers. Dit gebruikt <b>" + r(this.carWidth + this.cyclistWidth) + "m</b>"
                    },
                    {
                        k: new And([new Tag("oneway", "yes"), new Tag("oneway:bicycle", "no")]),
                        txt: "Tweerichtingverkeer voor fietsers, eenrichting voor auto's Dit gebruikt <b>" + r(this.carWidth + 2 * this.cyclistWidth) + "m</b>"
                    },
                    {
                        k: new Tag("oneway", "yes"),
                        txt: "Eenrichtingsverkeer voor iedereen. Dit gebruikt <b>" + (this.carWidth + this.cyclistWidth) + "m</b>"
                    },
                    {
                        k: null,
                        txt: "Tweerichtingsverkeer voor iedereen. Dit gebruikt <b>" + r(2 * this.carWidth + 2 * this.cyclistWidth) + "m</b>"
                    }
                ]
            }).OnlyShowIf(this._notCarFree),

            new TagRenderingOptions(
                {
                    tagsPreprocessor: (tags) => {
                        const props = self.calcProps(tags);
                        tags.targetWidth = r(props.targetWidth);
                        tags.short = "";
                        if (props.width < props.targetWidth) {
                            tags.short = "Er is dus <b class='alert'>" + r(props.targetWidth - props.width) + "m</b> te weinig"
                        }
                    },
                    freeform: {
                        key: "width:carriageway",
                        renderTemplate: "De totale nodige ruimte voor vlot en veilig verkeer is dus <b>{targetWidth}m</b><br>" +
                            "{short}",
                        template: "$$$",
                    }
                }
            ).OnlyShowIf(this._notCarFree),
            
            
            new TagRenderingOptions({
                mappings: [
                    {k:new Tag("highway","living_street"),txt: "Dit is een woonerf"},
                    {k:new Tag("highway","pedestrian"),txt: "Deze weg is autovrij"}
                ]
            }),
            
            new TagRenderingOptions({
                mappings: [
                    {
                        k: new Tag("sidewalk", "none"),
                        txt: "De afstand van huis tot huis is <b>{width:carriageway}m</b>"
                    },
                    {
                        k: new Tag("sidewalk", "left"),
                        txt: "De afstand van huis tot voetpad is <b>{width:carriageway}m</b>"
                    },
                    {
                        k: new Tag("sidewalk", "right"),
                        txt: "De afstand van huis tot voetpad is <b>{width:carriageway}m</b>"
                    },
                    {
                        k: new Tag("sidewalk", "both"),
                        txt: "De afstand van voetpad tot voetpad is <b>{width:carriageway}m</b>"
                    },
                    {
                        k: new Tag("sidewalk", ""),
                        txt: "De straatbreedte is <b>{width:carriageway}m</b>"
                    }

                ]
            })


        ]

    }

}