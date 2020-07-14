import {LayerDefinition} from "../LayerDefinition";
import {Tag} from "../../Logic/TagsFilter";
import {FixedUiElement} from "../../UI/Base/FixedUiElement";
import {TagRenderingOptions} from "../TagRendering";
import FixedText from "../Questions/FixedText";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import L from "leaflet";

export class GhostBike extends LayerDefinition {
    constructor() {
        super();
        this.name = "ghost bike";
        this.overpassFilter = new Tag("memorial", "ghost_bike")
        this.title = new FixedText("Ghost bike");

        this.elementsToShow = [
            new FixedText("A <b>ghost bike</b> is a memorial for a cyclist who died in a traffic accident," +
                " in the form of a white bicycle placed permanently near the accident location."),
            new ImageCarouselWithUploadConstructor(),


        ];

        this.style =  (tags: any) => {
            return {
                color: "#000000",
                icon: L.icon({
                    iconUrl: 'assets/ghost_bike.svg',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                })
            }
        };

    }
}