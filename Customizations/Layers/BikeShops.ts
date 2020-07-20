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


export default class BikeShops extends LayerDefinition {
    constructor() {
        super();
        this.name = Translations.t.cylofix.shop.name.txt;
        this.icon = "./assets/bike/shop.svg";
        this.overpassFilter = new Tag("shop", "bicycle");
        this.newElementTags = [
            new Tag("shop", "bicycle"),
        ];
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new FixedText(Translations.t.cylofix.shop.title.txt)
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            //new ParkingOperator(),
            new ShopRetail(),
            new ShopRental(),
            new ShopRepair(),
            new ShopPump(),
        ];

    }

    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            return {
                color: "#00bb00",
                icon: L.icon({
                    iconUrl: self.icon,
                    iconSize: [50, 50]
                })
            };
        };
    }
}
