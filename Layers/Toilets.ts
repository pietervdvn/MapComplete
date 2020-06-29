import {LayerDefinition} from "../LayerDefinition";
import {Quests} from "../Quests";
import {FixedUiElement} from "../UI/Base/FixedUiElement";
import {TagMappingOptions} from "../UI/TagMapping";
import L from "leaflet";
import {Tag} from "../Logic/TagsFilter";

export class Toilets extends LayerDefinition{
    
    constructor() {
        super();
        
        this.name="toilet";
        this.newElementTags = [new Tag( "amenity", "toilets")];
        this.icon = "./assets/toilets.svg";
        this.overpassFilter = new Tag("amenity","toilets");
        this.minzoom = 13;
        this.questions = [Quests.hasFee, 
            Quests.toiletsWheelChairs,
            Quests.toiletsChangingTable, 
            Quests.toiletsChangingTableLocation, 
            Quests.toiletsPosition];
        
        this.style = function(tags){
            if(tags.wheelchair == "yes"){
                
            return {icon :  new L.icon({
                    iconUrl: "assets/wheelchair.svg",
                    iconSize: [40, 40]
                })};
            }
            return {icon :  new L.icon({
                    iconUrl: "assets/toilets.svg",
                    iconSize: [40, 40]
                })};
        }
        
        this.elementsToShow = [


            new FixedUiElement("<h2>Toiletten</h2>"),

            new TagMappingOptions({
                key: "access",
                mapping: {
                    yes: "Toegankelijk",
                    no: "Niet toegankelijk",
                    private: "Niet toegankelijk",
                    customers: "Enkel voor klanten",
                }
            }),

            new TagMappingOptions({
                key: "fee",
                mapping: {
                    yes: "Betalend",
                    no: "Gratis",
                    ["0"]: "Gratis"
                },
                template: "Betalend, men vraagt {fee}"
            }),

            new TagMappingOptions({
                key: "toilets:position",
                mapping: {
                    seated: 'Gewone zittoiletten',
                    urinal: 'Een enkele urinoir',
                    urinals: 'Urinoirs',
                    ['urinals;seated']: "Urinoirs en gewone toiletten",
                    ['seated;urinals']: "Urinoirs en gewone toiletten",

                }
            }),

            new TagMappingOptions({
                key: "wheelchair",
                mapping: {
                    yes: "Rolstoeltoegankelijk",
                    no: "Niet Rolstoeltoegankelijk",
                    limited: "Beperkt rolstoeltoegankelijk",

                }
            }),
        ];
    }
    
    
}