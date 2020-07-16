import {TagRenderingOptions} from "../TagRendering";
import {Tag} from "../../Logic/TagsFilter";


export class BikeParkingType extends TagRenderingOptions {
    private static options = {
        priority: 5,
        question: "Van welk type is deze fietsenparking?",
        freeform: {
            key: "bicycle_parking",
            extraTags: new Tag("fixme", "Freeform bicycle_parking= tag used: possibly a wrong value"),
            template: "Iets anders: $$$",
            renderTemplate: "Dit is een fietsenparking van het type: {bicycle_parking}",
            placeholder: "Specifieer"
        },
        mappings: [
            {k: new Tag("bicycle_parking", "stands"), txt: "<img src=\"https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Bike_racks_at_north-west_of_Westfield_-_geograph.org.uk_-_1041057.jpg/100px-Bike_racks_at_north-west_of_Westfield_-_geograph.org.uk_-_1041057.jpg\">"},
            {k: new Tag("bicycle_parking", "wall_loops"), txt: "<img src=\"https://wiki.openstreetmap.org/w/images/thumb/c/c2/Bike-parking-wheelbender.jpg/100px-Bike-parking-wheelbender.jpg\">"},
            {k: new Tag("bicycle_parking", "handlebar_holder"), txt: "<img src=\"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Bicycle_parking_handlebar_holder.jpg/100px-Bicycle_parking_handlebar_holder.jpg\">"},
            {k: new Tag("bicycle_parking", "shed"), txt: "<img src=\"https://wiki.openstreetmap.org/w/images/thumb/b/b2/Bike-shelter.jpg/100px-Bike-shelter.jpg\">"},
            {k: new Tag("bicycle_parking", "two-tier"), txt: "<img src=\"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bicis_a_l%27estaci%C3%B3_de_Leiden.JPG/100px-Bicis_a_l%27estaci%C3%B3_de_Leiden.JPG\">"}
        ]
    }

    constructor() {
        super(BikeParkingType.options);
    }
}
