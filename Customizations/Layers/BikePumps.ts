import {LayerDefinition} from "../LayerDefinition";
import {And, Or, Tag} from "../../Logic/TagsFilter";
import {AccessTag} from "../Questions/AccessTag";
import {OperatorTag} from "../Questions/OperatorTag";
import {NameQuestion} from "../Questions/NameQuestion";
import {NameInline} from "../Questions/NameInline";
import * as L from "leaflet";

export class BikePumps extends LayerDefinition {

    constructor() {
        super();
        this.name = "pomp";
        this.icon = "./assets/bike_pump.svg";

        this.overpassFilter = new Or([
            new And([
                new Tag("amenity", "compressed_air"),
                new Tag("bicycle", "yes"),
            ])
            ]
        );


        this.newElementTags = [
            new Tag("amenity", "compressed_air"),
            new Tag("bicycle", "yes"),
            // new Tag("fixme", "Toegevoegd met MapComplete, geometry nog uit te tekenen")
        ];
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new NameInline("pomp");
        this.elementsToShow = [
            // new NameQuestion(),
            // new AccessTag(),
            new OperatorTag()
        ];

    }


    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            // let questionSeverity = 0;
            // for (const qd of self.elementsToShow) {
            //     if (qd.IsQuestioning(properties)) {
            //         questionSeverity = Math.max(questionSeverity, qd.options.priority ?? 0);
            //     }
            // }

            // let colormapping = {
            //     0: "#00bb00",
            //     1: "#00ff00",
            //     10: "#dddd00",
            //     20: "#ff0000"
            // };

            // let colour = colormapping[questionSeverity];
            // while (colour == undefined) {
            //     questionSeverity--;
            //     colour = colormapping[questionSeverity];
            // }

            return {
                color: "#00bb00",
                icon: new L.icon({
                    iconUrl: self.icon,
                    iconSize: [40, 40]
                })
            };
        };
    }

}