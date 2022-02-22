import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";

export default class BackToIndex extends SubtleButton {

    constructor(message?: string | BaseUIElement) {
        super(
            Svg.back_svg().SetStyle("height: 1.5rem;"),
            message ?? Translations.t.general.backToMapcomplete,
            {
                url: "index.html"
            }
        )
    }


}