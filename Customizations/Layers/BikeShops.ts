import { LayerDefinition } from "../LayerDefinition";
import Translations from "../../UI/i18n/Translations";
import { Tag } from "../../Logic/TagsFilter";
import FixedText from "../Questions/FixedText";
import { ImageCarouselWithUploadConstructor } from "../../UI/Image/ImageCarouselWithUpload";
import * as L from "leaflet";
import ShopRetail from "../Questions/bike/ShopRetail";
import ShopPump from "../Questions/bike/ShopPump";
import ShopRental from "../Questions/bike/ShopRental";
import ShopRepair from "../Questions/bike/ShopRepair";
import ShopDiy from "../Questions/bike/ShopDiy";
import ShopName from "../Questions/bike/ShopName";
import ShopSecondHand from "../Questions/bike/ShopSecondHand";
import { TagRenderingOptions } from "../TagRendering";


export default class BikeShops extends LayerDefinition {
    private readonly sellsBikes = new Tag("service:bicycle:retail", "yes")
    private readonly repairsBikes = new Tag("service:bicycle:repair", "yes")

    constructor() {
        super();
        this.name = Translations.t.cyclofix.shop.name.txt
        this.icon = "./assets/bike/repair_shop.svg"
        this.overpassFilter = new Tag("shop", "bicycle");
        this.newElementTags = [
            new Tag("shop", "bicycle"),
        ]
        this.maxAllowedOverlapPercentage = 10

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new TagRenderingOptions({
            mappings: [
                {k: this.sellsBikes, txt: "Bicycle shop"},
                {k: new Tag("service:bicycle:retail", "no"), txt: Translations.t.cyclofix.shop.titleRepair},
                {k: new Tag("service:bicycle:retail", ""), txt: Translations.t.cyclofix.shop.title},
            ]
        })
        
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            //new ParkingOperator(),
            new ShopRetail(),
            new ShopRental(),
            new ShopRepair(),
            new ShopPump(),
            new ShopDiy(),
            new ShopName(),
            new ShopSecondHand()
        ]
    }

    private generateStyleFunction() {
        const self = this;
        return function (tags: any) {
            let icon = "assets/bike/repair_shop.svg";

            if (self.sellsBikes.matchesProperties(tags)) {
                icon = "assets/bike/shop.svg";
            }

            return {
                color: "#00bb00",
                icon: L.icon({
                    iconUrl: self.icon,
                    iconSize: [50, 50],
                    iconAnchor: [25, 50]
                })
            }
        }
    }
}
