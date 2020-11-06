import {Layout} from "../Customizations/Layout";
import Translations from "../UI/i18n/Translations";
import {Img} from "../UI/Img";
import Svg from "../Svg";

export class PersonalLayout extends Layout {

    public static NAME: string = "personal";

    constructor() {
        super(
            PersonalLayout.NAME,
            ["en"],
            Translations.t.favourite.title,
            [],
            12,
            0,
            0,
            Translations.t.favourite.description,
        );
        this.maintainer = "MapComplete"
        this.description = "The personal theme allows to select one or more layers from all the layouts, creating a truly personal editor"
        this.icon = Img.AsData(Svg.add)
    }

}