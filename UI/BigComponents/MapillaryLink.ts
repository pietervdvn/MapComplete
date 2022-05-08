import {VariableUiElement} from "../Base/VariableUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Loc from "../../Models/Loc";
import Translations from "../i18n/Translations";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Combine from "../Base/Combine";
import Title from "../Base/Title";

export class MapillaryLink extends VariableUiElement {
    constructor(state: { locationControl: UIEventSource<Loc> }, iconStyle?: string) {
        const t = Translations.t.general.attribution
        super(state.locationControl.map(location => {
            const mapillaryLink = `https://www.mapillary.com/app/?focus=map&lat=${location?.lat ?? 0}&lng=${location?.lon ?? 0}&z=${Math.max((location?.zoom ?? 2) - 1, 1)}`
            return new SubtleButton(Svg.mapillary_black_ui().SetStyle(iconStyle),
                new Combine([
                    new Title(t.openMapillary,3),
                    t.mapillaryHelp]), {
                    url: mapillaryLink,
                    newTab: true
                }).SetClass("flex flex-col link-no-underline")
        }))
    }
}