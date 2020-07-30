import {LayerDefinition} from "../LayerDefinition";
import {Tag} from "../../Logic/TagsFilter";
import L from "leaflet";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import Translations from "../../UI/i18n/Translations";
import {TagRenderingOptions} from "../TagRendering";
import Website from "../Questions/Website";
import FixedText from "../Questions/FixedText";

export class Artwork extends LayerDefinition {

    constructor() {
        super();
        this.name = "artwork";
        const t = Translations.t.artwork;
        this.title = t.title;
        const tag = new Tag("tourism", "artwork");
        this.presets = [
            {
                title: this.title,
                tags: [tag]
            }
        ];
        this.icon = "./assets/statue.svg";
        this.overpassFilter = tag;
        this.minzoom = 13;


        const to = Translations.t.artwork.type;
        const artworkType = new TagRenderingOptions({
            priority: 5,
            question: to.question,
            freeform: {
                key: "artwork_type",
                extraTags: new Tag("fixme", "Freeform artwork_type= tag used: possibly a wrong value"),
                template: to.template.txt,
                renderTemplate: to.render.txt,
                placeholder: Translations.t.cyclofix.freeFormPlaceholder,
            },
            mappings: [
                {k: new Tag("artwork_type", "architecture"), txt: to.architecture},
                {k: new Tag("artwork_type", "mural"), txt: to.mural},
                {k: new Tag("artwork_type", "painting"), txt: to.painting},
                {k: new Tag("artwork_type", "sculpture"), txt: to.sculpture},
                {k: new Tag("artwork_type", "statue"), txt: to.statue},
                {k: new Tag("artwork_type", "bust"), txt: to.bust},
                {k: new Tag("artwork_type", "stone"), txt: to.stone},
                {k: new Tag("artwork_type", "installation"), txt: to.installation},
                {k: new Tag("artwork_type", "graffiti"), txt: to.graffiti},
                {k: new Tag("artwork_type", "relief"), txt: to.relief},
                {k: new Tag("artwork_type", "azulejo"), txt: to.azulejo},
                {k: new Tag("artwork_type", "tilework"), txt: to.tilework}
            ]
        });


        const artistQuestion = new TagRenderingOptions({
            question: t.artist.question,
            freeform: {
                key: "artist",
                template: "$$$",
                renderTemplate: "{artist}"
            }
        });

        this.elementsToShow = [

            new ImageCarouselWithUploadConstructor(),
            artworkType,
            artistQuestion,
            new Website(t.title)
        ];


        this.style = function (tags) {
            return {
                icon: {
                    iconUrl: "./assets/statue.svg",
                    iconSize: [40, 40],
                },
                color: "#0000ff"
            };

        }
    }


}