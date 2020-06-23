import {LayerDefinition} from "../LayerDefinition";
import {QuestionDefinition} from "../Logic/Question";
import {TagMappingOptions} from "../UI/TagMapping";
import {CommonTagMappings} from "./CommonTagMappings";
import L from "leaflet"
import {Regex} from "../Logic/TagsFilter";

export class GrbToFix extends LayerDefinition {

    constructor() {
        super();

        this.name = "grb";
        this.newElementTags = undefined;
        this.icon = "./assets/star.svg";
        this.overpassFilter = new Regex("fixme","GRB");
        this.minzoom = 13;


        this.questions = [
            QuestionDefinition.GrbNoNumberQuestion(),
            QuestionDefinition.GrbHouseNumberQuestion()
        ];

        this.style = function (tags) {
            return {
                icon: new L.icon({
                    iconUrl: "assets/star.svg",
                    iconSize: [40, 40],
                    text: "hi"
                })
            };

        }

        this.elementsToShow = [
            new TagMappingOptions(
                {
                    key: "fixme",
                    template: "<h2>Fixme</h2>{fixme}",
                }),
            new TagMappingOptions({
                key: "addr:street",
                template: "Straat: <b>{addr:street}</b>",
                missing: "<b>Geen straat bekend</b>"
            }),
            new TagMappingOptions({
                key: "addr:housenumber",
                template: "Nummer: <b>{addr:housenumber}</b>",
                missing: "<b>Geen huisnummer bekend</b>"
            }),
            CommonTagMappings.osmLink

        ];
    }


}