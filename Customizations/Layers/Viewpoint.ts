import {LayerDefinition} from "../LayerDefinition";
import {FixedUiElement} from "../../UI/Base/FixedUiElement";
import FixedText from "../Questions/FixedText";
import {Tag} from "../../Logic/TagsFilter";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import {TagRenderingOptions} from "../TagRendering";

export class Viewpoint extends LayerDefinition {

    constructor() {
        super({
            name: "Bezienswaardigheid",
            description: "Wil je een foto toevoegen van iets dat geen park, bos of natuurgebied is? Dit kan hiermee",
            newElementTags: [new Tag("tourism", "viewpoint"), new Tag("fixme", "Added with mapcomplete. This viewpoint should probably me merged with some existing feature")],
            icon: "assets/viewpoint.svg",
            wayHandling: LayerDefinition.WAYHANDLING_CENTER_ONLY,
            style: tags => {
                return {
                    color: undefined, icon:{
                        iconUrl: "assets/viewpoint.svg",
                        iconSize: [20, 20]
                    }
                }
            },
            maxAllowedOverlapPercentage: 0,
            overpassFilter: new Tag("tourism", "viewpoint"),
            minzoom: 13,
            title: new FixedText("Bezienswaardigheid")
        });
        
        this.elementsToShow = [
            new FixedText(this.description),
            new ImageCarouselWithUploadConstructor(),
            new TagRenderingOptions({
                question: "Zijn er bijzonderheden die je wilt toevoegen?",
                freeform:{
                    key: "description:0",
                    template: "$$$",
                    renderTemplate: "<h3>Bijzonderheden</h3>{description:0}"
                }
            })
        ]
    }

}