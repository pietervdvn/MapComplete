import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import Attribution from "./Attribution";
import State from "../../State";
import {UIEventSource} from "../../Logic/UIEventSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import {FixedUiElement} from "../Base/FixedUiElement";

/**
 * The attribution panel shown on mobile
 */
export default class AttributionPanel extends Combine {

    constructor(layoutToUse: UIEventSource<LayoutConfig>) {
        super([
            Translations.t.general.attribution.attributionContent,
            Translations.t.general.attribution.themeBy.Subs({author: layoutToUse.data.maintainer}),
            "<br/>",
            new Attribution(undefined, undefined, State.state.layoutToUse, undefined),
            "<br/>",
            "<h4>", Translations.t.general.attribution.iconAttribution.title, "</h4>"

        ]);
    }
}