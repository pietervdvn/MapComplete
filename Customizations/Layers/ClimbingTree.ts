import {LayerDefinition} from "../LayerDefinition";
import Translations from "../../UI/i18n/Translations";
import FixedText from "../Questions/FixedText";
import {And, Tag} from "../../Logic/Tags";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";

export class ClimbingTree extends LayerDefinition {


    constructor() {
        super("climbingtree");
        const t = Translations.t.climbingTrees.layer;
        this.title = new FixedText(t.title);
        const icon = "./assets/themes/nature/tree.svg";
        this.icon = icon;
        this.description = t.description;
        this.style = (tags) => {
            return {
                color: "#00aa00",
                icon: {
                    iconUrl: icon,
                    iconSize: [50, 50]
                }
            }
        }
        const tags = [new Tag("natural","tree"),new Tag("sport","climbing")];
        this.overpassFilter = new And(tags);
        this.presets = [
            {
                title: t.title,
                description: t.description,
                tags: tags
            }
        ]
        this.minzoom = 12;
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor()
        ]
        

    }

}