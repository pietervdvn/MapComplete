import { VariableUiElement } from "../Base/VariableUIElement"
import { Store } from "../../Logic/UIEventSource"
import Loc from "../../Models/Loc"
import Translations from "../i18n/Translations"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import Combine from "../Base/Combine"

export class MapillaryLink extends VariableUiElement {
    constructor(state: { readonly locationControl: Store<Loc> }, iconStyle?: string) {
        const t = Translations.t.general.attribution
        super(
            state.locationControl.map((location) => {
                const mapillaryLink = `https://www.mapillary.com/app/?focus=map&lat=${
                    location?.lat ?? 0
                }&lng=${location?.lon ?? 0}&z=${Math.max((location?.zoom ?? 2) - 1, 1)}`
                return new SubtleButton(
                    Svg.mapillary_black_svg().SetStyle(iconStyle),
                    new Combine([t.openMapillary.SetClass("font-bold"), t.mapillaryHelp]).SetClass(
                        "flex flex-col link-no-underline"
                    ),
                    {
                        url: mapillaryLink,
                        newTab: true,
                    }
                )
            })
        )
    }
}
