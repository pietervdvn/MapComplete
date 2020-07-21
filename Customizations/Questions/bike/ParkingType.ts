import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";
import Combine from "../../../UI/Base/Combine";

class ParkingTypeHelper {
    static GenerateMappings() {
        const images = {
            stands: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Bike_racks_at_north-west_of_Westfield_-_geograph.org.uk_-_1041057.jpg/100px-Bike_racks_at_north-west_of_Westfield_-_geograph.org.uk_-_1041057.jpg",
            wall_loops: "https://wiki.openstreetmap.org/w/images/thumb/c/c2/Bike-parking-wheelbender.jpg/100px-Bike-parking-wheelbender.jpg",
            handlebar_holder: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Bicycle_parking_handlebar_holder.jpg/100px-Bicycle_parking_handlebar_holder.jpg",
            shed: "https://wiki.openstreetmap.org/w/images/thumb/b/b2/Bike-shelter.jpg/100px-Bike-shelter.jpg",
            rack: "https://wiki.openstreetmap.org/w/images/thumb/4/41/Triton_Bike_Rack.png/100px-Triton_Bike_Rack.png",
            "two-tier": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bicis_a_l%27estaci%C3%B3_de_Leiden.JPG/100px-Bicis_a_l%27estaci%C3%B3_de_Leiden.JPG"
        };


        const toImg = (url) => `<img src=${url}>`
        const mappings = [];
        const to = Translations.t.cyclofix.parking.type

        for (const imagesKey in images) {
            const mapping =
                {
                    k: new Tag("bicycle_parking", imagesKey),
                    txt: new Combine([
                        to[imagesKey],
                        to.eg,
                        toImg(images[imagesKey])
                    ])
                };

            mappings.push(mapping);

        }

        return mappings;
    }
}

export default class ParkingType extends TagRenderingOptions {
    constructor() {

        const to = Translations.t.cyclofix.parking.type


        super({
            priority: 5,
            question: to.question,
            freeform: {
                key: "bicycle_parking",
                extraTags: new Tag("fixme", "Freeform bicycle_parking= tag used: possibly a wrong value"),
                template: to.template.txt,
                renderTemplate: to.render.txt,
                placeholder: Translations.t.cyclofix.freeFormPlaceholder,
            },
            mappings: ParkingTypeHelper.GenerateMappings()

        });
    }
}
