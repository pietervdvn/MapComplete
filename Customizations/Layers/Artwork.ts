import {LayerDefinition} from "../LayerDefinition";
import {QuestionDefinition} from "../../Logic/Question";
import {Tag} from "../../Logic/TagsFilter";
import L from "leaflet";

export class Artwork extends LayerDefinition {

    constructor() {
        super();

        this.name = "artwork";
        this.newElementTags = [new Tag("tourism", "artwork")];
        this.icon = "./assets/statue.svg";
        this.overpassFilter = new Tag("tourism", "artwork");
        this.minzoom = 13;
        this.questions = [
            QuestionDefinition.radioAndTextQuestion("What kind of artwork is this?", 10, "artwork_type",
                [
                    {text: "A statue", value: "statue"},
                    {text: "A bust (thus a statue, but only of the head and shoulders)", value: "bust"},
                    {text: "A sculpture", value: "sculpture"},
                    {text: "A mural painting", value: "mural"},
                    {text: "A painting", value: "painting"},
                    {text: "A graffiti", value: "graffiti"},
                    {text: "A relief", value: "relief"},
                    {text: "An installation", value: "installation"}]),
            QuestionDefinition.textQuestion("Whom or what is depicted in this statue?", "subject", 20).addUnrequiredTag("subject:wikidata","*"),
            QuestionDefinition.textQuestion("Is there an inscription on this artwork?", "inscription", 16),
            QuestionDefinition.textQuestion("What is the name of this artwork? If there is no explicit name, skip the question", "name", 15),


        ];

        this.style = function (tags) {
            return {
                icon: new L.icon({
                    iconUrl: "assets/statue.svg",
                    iconSize: [40, 40],
                    text: "hi"
                }),
                color: "#0000ff"
            };

        }

        this.elementsToShow = [


            new TagMappingOptions(
                {
                    key: "name",
                    template: "<h2>Artwork '{name}'</h2>",
                    missing: "Artwork"
                }),
            new TagMappingOptions({
                key: "artwork_type",
                template: "This artwork is a {artwork_type}"
            }),
            new TagMappingOptions({
                key: "artist_name",
                template: "This artwork was made by {artist_name}"
            }),
            new TagMappingOptions({
                key: "subject",
                template: "This artwork depicts {subject}"
            }),
            
            new TagMappingOptions({
                key: "subject:wikidata",
                template: "<a href='https://www.wikidata.org/wiki/{subject:wikidata}' target='_blank'>See more data about the subject</a>"
            }),

            new TagMappingOptions({
                key: "website",
                template: "<a href='{website}' target='_blank'>Website of the statue</a>"
            }),




            new TagMappingOptions({key: "image", template: "<img class='popupImg' alt='image' src='{image}' />"})

        ];
    }


}