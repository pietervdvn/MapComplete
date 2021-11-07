import {FixedUiElement} from "./Base/FixedUiElement";
import Combine from "./Base/Combine";
import MoreScreen from "./BigComponents/MoreScreen";
import Translations from "./i18n/Translations";
import Constants from "../Models/Constants";
import UserRelatedState from "../Logic/State/UserRelatedState";
import {Utils} from "../Utils";
import LanguagePicker from "./LanguagePicker";
import IndexText from "./BigComponents/IndexText";
import FeaturedMessage from "./BigComponents/FeaturedMessage";

export default class AllThemesGui {
    constructor() {

        try {

            new FixedUiElement("").AttachTo("centermessage")
            const state = new UserRelatedState(undefined);
            const intro = new Combine([
                LanguagePicker.CreateLanguagePicker(Translations.t.index.title.SupportedLanguages())
                    .SetClass("absolute top-2 right-3"),
                new IndexText()
            ]);
            new Combine([
                intro,
                new FeaturedMessage(),
                new MoreScreen(state, true),
                Translations.t.general.aboutMapcomplete
                    .Subs({"osmcha_link": Utils.OsmChaLinkFor(7)})
                    .SetClass("link-underline"),
                new FixedUiElement("v" + Constants.vNumber)
            ]).SetClass("block m-5 lg:w-3/4 lg:ml-40")
                .SetStyle("pointer-events: all;")
                .AttachTo("topleft-tools");
        } catch (e) {
            new FixedUiElement("Seems like no layers are compiled - check the output of `npm run generate:layeroverview`. Is this visible online? Contact pietervdvn immediately!").SetClass("alert")
                .AttachTo("centermessage")
        }
    }
}
