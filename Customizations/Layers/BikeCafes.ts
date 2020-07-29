import {LayerDefinition} from "../LayerDefinition";
import FixedText from "../Questions/FixedText";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import Translations from "../../UI/i18n/Translations";
import CafeName from "../Questions/bike/CafeName";
import { Or, And, Tag, anyValueExcept, Regex } from "../../Logic/TagsFilter";
import { PhoneNumberQuestion } from "../Questions/PhoneNumberQuestion";
import Website from "../Questions/Website";
import CafeRepair from "../Questions/bike/CafeRepair";
import CafeDiy from "../Questions/bike/CafeDiy";
import CafePump from "../Questions/bike/CafePump";


export default class BikeCafes extends LayerDefinition {
    private readonly repairsBikes = anyValueExcept("service:bicycle:repair", "no")
    private readonly hasPump = new Tag("service:bicycle:pump", "yes")
    private readonly diy = new Tag("service:bicycle:diy", "yes")
    private readonly bikeServices = [
        this.diy,
        this.repairsBikes,
        this.hasPump
    ]
    private readonly to = Translations.t.cyclofix.cafe

    constructor() {
        super();
        this.name = this.to.name;
        this.icon = "./assets/bike/cafe.svg";
        this.overpassFilter = new And([
            new Or([
                new Regex("amenity", "^pub|bar|cafe")
            ]),
            new Or([
                ...this.bikeServices,
                new Tag("pub", "cycling")
            ])
        ]) 
        this.newElementTags = [
            new Tag("amenity", "pub"),
            new Tag("pub", "cycling"),
        ];
        this.maxAllowedOverlapPercentage = 10;

        this.minzoom = 13;
        this.style = this.generateStyleFunction();
        this.title = new FixedText(this.to.title)
        this.elementsToShow = [
            new ImageCarouselWithUploadConstructor(),
            new CafeName(),
            new PhoneNumberQuestion("{name}"),
            new Website("{name}"),
            new CafeRepair(),
            new CafeDiy(),
            new CafePump()
        ];
        this.wayHandling = LayerDefinition.WAYHANDLING_CENTER_AND_WAY;

    }

    private generateStyleFunction() {
        const self = this;
        return function (properties: any) {
            return {
                color: "#00bb00",
                icon: {
                    iconUrl: self.icon,
                    iconSize: [50, 50],
                    iconAnchor: [25,50]
                }
            };
        };
    }
}
