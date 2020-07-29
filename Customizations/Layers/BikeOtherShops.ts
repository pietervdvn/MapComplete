import { LayerDefinition } from "../LayerDefinition";
import Translations from "../../UI/i18n/Translations";
import {And, Tag, Or, anyValueExcept} from "../../Logic/TagsFilter";
import { ImageCarouselWithUploadConstructor } from "../../UI/Image/ImageCarouselWithUpload";
import ShopRetail from "../Questions/bike/ShopRetail";
import ShopPump from "../Questions/bike/ShopPump";
import ShopRental from "../Questions/bike/ShopRental";
import ShopRepair from "../Questions/bike/ShopRepair";
import ShopDiy from "../Questions/bike/ShopDiy";
import ShopName from "../Questions/bike/ShopName";
import ShopSecondHand from "../Questions/bike/ShopSecondHand";
import { TagRenderingOptions } from "../TagRendering";
import { PhoneNumberQuestion } from "../Questions/PhoneNumberQuestion";
import Website from "../Questions/Website";


export default class BikeOtherShops extends LayerDefinition {
    private readonly sellsBikes = new Tag("service:bicycle:retail", "yes")
    private readonly repairsBikes = anyValueExcept("service:bicycle:repair", "no")
    private readonly rentsBikes = new Tag("service:bicycle:rental", "yes")
    private readonly hasPump = new Tag("service:bicycle:pump", "yes")
    private readonly hasDiy = new Tag("service:bicycle:diy", "yes")
    private readonly sellsSecondHand = anyValueExcept("service:bicycle:repair", "no")
    private readonly hasBikeServices = new Or([
        this.sellsBikes,
        this.repairsBikes,
        // this.rentsBikes,
        // this.hasPump,
        // this.hasDiy,
        // this.sellsSecondHand
    ])

    private readonly to = Translations.t.cyclofix.nonBikeShop

    constructor() {
        super();
        this.name = this.to.name
        this.icon = "./assets/bike/non_bike_repair_shop.svg"
        this.overpassFilter = new And([
            anyValueExcept("shop", "bicycle"),
            this.hasBikeServices
        ])
        this.presets = []
        this.maxAllowedOverlapPercentage = 10
        this.wayHandling = LayerDefinition.WAYHANDLING_CENTER_AND_WAY

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new TagRenderingOptions({
            mappings: [
                {
                    k: new And([new Tag("name", "*"), this.sellsBikes]),
                    txt: this.to.titleShopNamed
                },
                {
                    k: new And([new Tag("name", "*"), new Tag("service:bicycle:retail", "")]),
                    txt: this.to.titleShop
                },
                {
                    k: new And([new Tag("name", "*"), new Tag("service:bicycle:retail", "no")]),
                    txt: this.to.titleRepairNamed
                },
                {k: this.sellsBikes, txt: this.to.titleShop},
                {k: new Tag("service:bicycle:retail", " "), txt: this.to.title},
                {k: new Tag("service:bicycle:retail", "no"), txt: this.to.titleRepair},
                {
                    k: new And([new Tag("name", "*")]),
                    txt: this.to.titleNamed
                },
                {k: null, txt: this.to.title},
            ]
        })
        
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            new ShopName(),
            new PhoneNumberQuestion("{name}"),
            new Website("{name}"),
            new ShopRetail(),
            new ShopRental(),
            new ShopRepair(),
            new ShopPump(),
            new ShopDiy(),
            new ShopSecondHand()
        ]
    }

    private generateStyleFunction() {
        const self = this;
        return function (tags: any) {
            let icon = "assets/bike/non_bike_repair_shop.svg";

            if (self.sellsBikes.matchesProperties(tags)) {
                icon = "assets/bike/non_bike_shop.svg";
            }

            return {
                color: "#00bb00",
                icon: {
                    iconUrl: icon,
                    iconSize: [50, 50],
                    iconAnchor: [25, 50]
                }
            }
        }
    }
}
