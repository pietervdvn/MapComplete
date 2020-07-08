import {LayerDefinition} from "../LayerDefinition";
import L from "leaflet";
import {Tag} from "../../Logic/TagsFilter";
import {QuestionDefinition} from "../../Logic/Question";
import {TagRenderingOptions} from "../TagRendering";
import {NameInline} from "../Questions/NameInline";
import {NameQuestion} from "../Questions/NameQuestion";

export class Bookcases extends LayerDefinition {

    constructor() {
        super();

        this.name = "boekenkast";
        this.newElementTags = [new Tag("amenity", "public_bookcase")];
        this.icon = "./assets/bookcase.svg";
        this.overpassFilter = new Tag("amenity", "public_bookcase");
        this.minzoom = 11;

        this.title = new NameInline("ruilboekenkastje");
        this.elementsToShow = [

            new TagRenderingOptions({
                priority: 13,
                question: "Heeft dit boekenruilkastje een naam?",
                freeform: {
                    key: "name",
                    template: "De naam is $$$",
                    renderTemplate: "", // We don't actually render it, only ask
                    placeholder: "",
                    extraTags: new Tag("noname","")
                },
                mappings: [
                    {k: new Tag("noname", "yes"), txt: "Neen, er is geen naam aangeduid op het boekenruilkastje"},
                ]
            }),
            
            new TagRenderingOptions(
                {
                    question: "Hoeveel boeken passen in dit boekenruilkastje?",
                    freeform: {
                        renderTemplate: "Er passen {capacity} boeken in dit boekenruilkastje",
                        template:  "Er passen $$$ boeken in dit boekenruilkastje",
                        key: "capacity",
                        placeholder: "aantal"
                    },
                    priority: 15
                }
            ),
            new TagRenderingOptions({
                question: "Wat voor soort boeken heeft dit boekenruilkastje?",
                mappings:[
                    {k: new Tag("books","children"), txt: "Voornamelijk kinderboeken"},
                    {k: new Tag("books","adults"), txt: "Voornamelijk boeken voor volwassenen"},
                    {k: new Tag("books","children;adults"), txt: "Zowel kinderboeken als boeken voor volwassenen"}
                ],
                priority: 14
            }),
            
            new TagRenderingOptions({
                question: "",
                freeform:{
                    key: "start_date",
                    renderTemplate: "Geplaatst op {start_date}",
                    template: "Geplaatst op $$$"
                }
            }),
            
            new TagRenderingOptions({
                question: "Is er een website waar we er meer informatie is over dit boekenruilkastje?",
                freeform:{
                    key:"website",
                    renderTemplate: "<a href='{website}' target='_blank'>Meer informatie over dit boekenruilkastje</a>",
                    template:  "$$$",
                    placeholder:"website"

                },
                priority: 5
            }),
            
            
            

        ];

        /*
  this.elementsToShow = [


      
      new TagMappingOptions({key: "operator", template: "Onder de hoede van {operator}"}),
      new TagMappingOptions({key: "brand", template: "Deel van het netwerk {brand}"}),
      new TagMappingOptions({key: "ref", template: "Referentienummer {ref}"}),

      new TagMappingOptions({key: "description", template: "Extra beschrijving: <br /> <p>{description}</p>"}),
  ]
  ;*/
        
     /*   this.questions = [
            QuestionDefinition.textQuestion("Heeft dit boekenkastje een peter, meter of voogd?", "operator", 10),
            // QuestionDefinition.textQuestion("Wie kunnen we (per email) contacteren voor dit boekenruilkastje?", "email", 5),


        ]
        ;
        */

        this.style = function (tags) {
            return {
                icon: new L.icon({
                    iconUrl: "assets/bookcase.svg",
                    iconSize: [40, 40]
                }),
                color: "#0000ff"
            };
        }

  
    }


}