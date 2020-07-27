import {TagRenderingOptions} from "../../TagRendering";
import {Tag} from "../../../Logic/TagsFilter";
import Translations from "../../../UI/i18n/Translations";
import Combine from "../../../UI/Base/Combine";

class ParkingTypeHelper {
    static GenerateMappings() {
        const images = {
            stands: "assets/bike/parking_staple.svg",
            wall_loops: "assets/bike/parking_wall_loops.svg",
            handlebar_holder: "assets/bike/parking_handlebar_holder.svg",
            rack: "assets/bike/parking_rack.svg",
            shed: "assets/bike/parking_shed.svg"
        };


        const toImg = (url) => `<br /><img width="150px" src=${url}>`
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
