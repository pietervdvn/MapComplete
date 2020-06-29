import {LayerDefinition} from "../LayerDefinition";
import {TagMappingOptions} from "../UI/TagMapping";
import L from "leaflet";
import {QuestionDefinition} from "../Logic/Question";
import {Tag} from "../Logic/TagsFilter";

export class Bookcases extends LayerDefinition {

    constructor() {
        super();

        this.name = "boekenkast";
        this.newElementTags = [new Tag( "amenity",  "public_bookcase")];
        this.icon = "./assets/bookcase.svg";
        this.overpassFilter = new Tag("amenity","public_bookcase");
        this.minzoom = 13;


        this.questions = [
            QuestionDefinition.noNameOrNameQuestion("Wat is de naam van dit boekenruilkastje?", "Dit boekenruilkastje heeft niet echt een naam", 20),
            QuestionDefinition.textQuestion("Hoeveel boeken kunnen er in?", "capacity", 15),
            QuestionDefinition.textQuestion("Heeft dit boekenkastje een peter, meter of voogd?", "operator", 10),
           // QuestionDefinition.textQuestion("Wie kunnen we (per email) contacteren voor dit boekenruilkastje?", "email", 5),


    ]
        ;

        this.style = function (tags) {
            return {
                icon: new L.icon({
                    iconUrl: "assets/bookcase.svg",
                    iconSize: [40, 40]
                })
            };
        }

        this.elementsToShow = [


            new TagMappingOptions({
                    key: "name",
                    template: "{name}",
                    missing: "Boekenruilkastje"
                }
            ),
            new TagMappingOptions({key: "capacity", template: "Plaats voor {capacity} boeken"}),
            new TagMappingOptions({key: "operator", template: "Onder de hoede van {operator}"}),
            new TagMappingOptions({
                key: "website",
                mapping: "Meer informatie beschikbaar op <a href='{website}'>{website}</a>"
            }),
            new TagMappingOptions({key: "start_date", template: "Geplaatst op {start_date}"}),
            new TagMappingOptions({key: "brand", template: "Deel van het netwerk {brand}"}),
            new TagMappingOptions({key: "ref", template: "Referentienummer {ref}"}),

            new TagMappingOptions({key: "description", template: "Extra beschrijving: <br /> <p>{description}</p>"}),
        ]
        ;
    }


}