import UserRelatedState from "../Logic/State/UserRelatedState";
import {FixedUiElement} from "./Base/FixedUiElement";
import Combine from "./Base/Combine";
import MoreScreen from "./BigComponents/MoreScreen";
import Translations from "./i18n/Translations";
import Constants from "../Models/Constants";
import {Utils} from "../Utils";
import LanguagePicker from "./LanguagePicker";
import IndexText from "./BigComponents/IndexText";
import FeaturedMessage from "./BigComponents/FeaturedMessage";
import Toggle from "./Input/Toggle";
import {SubtleButton} from "./Base/SubtleButton";
import {VariableUiElement} from "./Base/VariableUIElement";
import Svg from "../Svg";

export default class AllThemesGui {
    constructor() {
        try {

            new FixedUiElement("").AttachTo("centermessage")
            const state = new UserRelatedState(undefined);
            const intro = new Combine([

                LanguagePicker.CreateLanguagePicker(Translations.t.index.title.SupportedLanguages())

                    .SetClass("flex absolute top-2 right-3"),
                new IndexText()
            ]);
            new Combine([
                intro,
                new FeaturedMessage().SetClass("mb-4 block"),
                new MoreScreen(state, true),
                new Toggle(
                    undefined,
                    new SubtleButton(undefined, Translations.t.index.logIn).SetStyle("height:min-content").onClick(() => state.osmConnection.AttemptLogin()),
                    state.osmConnection.isLoggedIn),
                new VariableUiElement(state.osmConnection.userDetails.map(ud => {
                    if (ud.csCount < Constants.userJourney.importHelperUnlock) {
                        return undefined;
                    }
                    return new Combine([
                        new SubtleButton(undefined, Translations.t.importHelper.title, {url: "import_helper.html"}),
                        new SubtleButton(Svg.note_svg(), Translations.t.importInspector.title, {url: "import_viewer.html"})
                    ]).SetClass("p-4 border-2 border-gray-500 m-4 block")
                })),
                Translations.t.general.aboutMapcomplete
                    .Subs({"osmcha_link": Utils.OsmChaLinkFor(7)})
                    .SetClass("link-underline"),
                new FixedUiElement("v" + Constants.vNumber)
            ]).SetClass("block m-5 lg:w-3/4 lg:ml-40")
                .SetStyle("pointer-events: all;")
                .AttachTo("topleft-tools");
        } catch (e) {
            console.error(">>>> CRITICAL", e)
            new FixedUiElement("Seems like no layers are compiled - check the output of `npm run generate:layeroverview`. Is this visible online? Contact pietervdvn immediately!").SetClass("alert")
                .AttachTo("centermessage")
        }
    }
}
