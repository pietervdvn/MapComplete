import {FixedUiElement} from "./Base/FixedUiElement";
import Combine from "./Base/Combine";
import MoreScreen from "./BigComponents/MoreScreen";
import Translations from "./i18n/Translations";
import Constants from "../Models/Constants";
import UserRelatedState from "../Logic/State/UserRelatedState";
import {Utils} from "../Utils";

export default class AllThemesGui {
    constructor() {
        new FixedUiElement("").AttachTo("centermessage")
       const state = new UserRelatedState(undefined);
        new Combine([new MoreScreen(state, true),
            Translations.t.general.aboutMapcomplete
                .Subs({"osmcha_link": Utils.OsmChaLinkFor(7)})
                .SetClass("link-underline"),
            new FixedUiElement("v" + Constants.vNumber)
        ]).SetClass("block m-5 lg:w-3/4 lg:ml-40")
            .SetStyle("pointer-events: all;")
            .AttachTo("topleft-tools");
    }
}