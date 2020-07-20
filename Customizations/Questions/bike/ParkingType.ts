import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";


export default class ParkingType extends TagRenderingOptions {
    constructor() {
        const images = {
            stands: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Bike_racks_at_north-west_of_Westfield_-_geograph.org.uk_-_1041057.jpg/100px-Bike_racks_at_north-west_of_Westfield_-_geograph.org.uk_-_1041057.jpg",
            loops: "https://wiki.openstreetmap.org/w/images/thumb/c/c2/Bike-parking-wheelbender.jpg/100px-Bike-parking-wheelbender.jpg",
            handlebar: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Bicycle_parking_handlebar_holder.jpg/100px-Bicycle_parking_handlebar_holder.jpg",
            shed: "https://wiki.openstreetmap.org/w/images/thumb/b/b2/Bike-shelter.jpg/100px-Bike-shelter.jpg",
            rack: "https://wiki.openstreetmap.org/w/images/thumb/4/41/Triton_Bike_Rack.png/100px-Triton_Bike_Rack.png",
            double: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bicis_a_l%27estaci%C3%B3_de_Leiden.JPG/100px-Bicis_a_l%27estaci%C3%B3_de_Leiden.JPG"
        }
        const toImg = (url) => `<img src=${url}>`
        const to = Translations.t.cyclofix.parking.type
        super({
            priority: 5,
            question: to.question.Render(),
            freeform: {
                key: "bicycle_parking",
                extraTags: new Tag("fixme", "Freeform bicycle_parking= tag used: possibly a wrong value"),
                template: to.template.txt,
                renderTemplate: to.render.txt,
                placeholder: Translations.t.cyclofix.freeFormPlaceholder.txt,
            },
            mappings: [
                {k: new Tag("bicycle_parking", "stands"), txt: `${to.stands.Render()}, bijvoorbeeld: ${toImg(images.stands)}`},
                {k: new Tag("bicycle_parking", "wall_loops"), txt: `${to.loops.Render()}, bijvoorbeeld: ${toImg(images.loops)}`},
                {k: new Tag("bicycle_parking", "handlebar_holder"), txt: `${to.handlebar.Render()}, bijvoorbeeld: ${toImg(images.handlebar)}`},
                {k: new Tag("bicycle_parking", "shed"), txt: `${to.shed.Render()}, bijvoorbeeld: ${toImg(images.shed)}`},
                {k: new Tag("bicycle_parking", "rack"), txt: `${to.rack.Render()}, bijvoorbeeld: ${toImg(images.rack)}`},
                {k: new Tag("bicycle_parking", "two-tier"), txt: `${to.double.Render()}, bijvoorbeeld: ${toImg(images.double)}`}
            ]
        });
    }
}
