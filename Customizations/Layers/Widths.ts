import {LayerDefinition} from "../LayerDefinition";
import {And, Not, Or, Tag} from "../../Logic/TagsFilter";
import {TagRenderingOptions} from "../TagRendering";
import {UIEventSource} from "../../UI/UIEventSource";
import {Park} from "./Park";

export class Widths extends LayerDefinition {

    private cyclistWidth: number;
    private carWidth: number;

    private readonly _bothSideParking = new Tag("parking:lane:both", "parallel");
    private readonly _noSideParking = new Tag("parking:lane:both", "no_parking");

    private readonly _leftSideParking =
        new And([new Tag("parking:lane:left", "parallel"), new Tag("parking:lane:right", "no_parking")]);
    private readonly _rightSideParking =
        new And([new Tag("parking:lane:right", "parallel"), new Tag("parking:lane:left", "no_parking")]);

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
        } else {
            parkingStateKnown = false;
            console.log("No parking data for ", properties.name, properties.id, properties)
        }


        let onewayCar = properties.oneway === "yes";
        let onewayBike = properties["oneway:bicycle"] === "yes" ||
            (onewayCar && properties["oneway:bicycle"] === undefined)


        let carWidth = (onewayCar ? 1 : 2) * this.carWidth;

        let cyclistWidth = (onewayBike ? 1 : 2) * this.cyclistWidth;

        const width = parseFloat(properties["width:carriageway"]);


        const targetWidth =
            carWidth +
            cyclistWidth +
            parallelParkingCount * this.carWidth;

        return {
            parkingLanes: parallelParkingCount,
            parkingStateKnown: parkingStateKnown,
            width: width,
            targetWidth: targetWidth,
            onewayBike: onewayBike
        }
    }


    constructor(carWidth: number,
                cyclistWidth: number) {
        super();
        this.carWidth = carWidth;
        this.cyclistWidth = cyclistWidth;

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

            let c = "#0c0";


            const props = self.calcProps(properties);

            if (props.width < props.targetWidth) {
                c = "#f00";
            }

            let dashArray = undefined;

            if (!props.parkingStateKnown) {
                c = "#f0f"
            }

            if (this._carfree.matchesProperties(properties)) {
                c = "#aaa";
            }

            if (props.onewayBike) {
                dashArray = [20, 8]
            }

            if (props.width > 15) {
                c = "#ffb72b"
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
                mappings: [
                    {
                        k: this._bothSideParking,
                        txt: "Auto's kunnen langs beide zijden parkeren.<br+>Dit gebruikt <b>" + (this.carWidth * 2) + "m</b><br/>"
                    },
                    {
                        k: this._oneSideParking,
                        txt: "Auto's kunnen langs één kant parkeren.<br/>Dit gebruikt <b>" + this.carWidth + "m</b><br/>"
                    },
                    {k: this._noSideParking, txt: "Auto's mogen hier niet parkeren"},
                    {k: null, txt: "Nog geen parkeerinformatie bekend"}
                ]
            }).OnlyShowIf(this._notCarFree),
            new TagRenderingOptions({
                mappings: [
                    {
                        k: new Tag("oneway:bicycle", "yes"),
                        txt: "Eenrichtingsverkeer, óók voor fietsers. Dit gebruikt <b>" + (this.carWidth + this.cyclistWidth) + "m</b>"
                    },
                    {
                        k: new And([new Tag("oneway", "yes"), new Tag("oneway:bicycle", "no")]),
                        txt: "Tweerichtingverkeer voor fietsers, eenrichting voor auto's Dit gebruikt <b>" + (this.carWidth + 2 * this.cyclistWidth) + "m</b>"
                    },
                    {
                        k: new Tag("oneway", "yes"),
                        txt: "Eenrichtingsverkeer voor iedereen. Dit gebruikt <b>" + (this.carWidth + this.cyclistWidth) + "m</b>"
                    },
                    {
                        k: null,
                        txt: "Tweerichtingsverkeer voor iedereen. Dit gebruikt <b>" + (2 * this.carWidth + 2 * this.cyclistWidth) + "m</b>"
                    }
                ]
            }).OnlyShowIf(this._notCarFree),

            new TagRenderingOptions(
                {
                    tagsPreprocessor: (tags) => {
                        const props = self.calcProps(tags);
                        tags.targetWidth = props.targetWidth;
                        console.log("PREP", tags)
                    },
                    freeform: {
                        key: "width:carriageway",
                        renderTemplate: "De totale nodige ruimte voor vlot en veilig verkeer is dus <b>{targetWidth}m</b>.",
                        template: "$$$",
                    }
                }
            ).OnlyShowIf(this._notCarFree),
            
            
            new TagRenderingOptions({
                mappings: [
                    {k:new Tag("highway","living_street"),txt: "Dit is een woonerf"},
                    {k:new Tag("highway","pedestrian"),txt: "Hier mogen enkel voetgangers komen"}
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