import UserRelatedState from "../Logic/State/UserRelatedState"
import { FixedUiElement } from "./Base/FixedUiElement"
import Combine from "./Base/Combine"
import MoreScreen from "./BigComponents/MoreScreen"
import Translations from "./i18n/Translations"
import Constants from "../Models/Constants"
import LanguagePicker from "./LanguagePicker"
import IndexText from "./BigComponents/IndexText"
import { ImportViewerLinks } from "./BigComponents/UserInformation"
import { LoginToggle } from "./Popup/LoginButton"
import { ImmutableStore } from "../Logic/UIEventSource"
import { OsmConnection } from "../Logic/Osm/OsmConnection"

export default class AllThemesGui {
    setup() {
        try {
            const osmConnection = new OsmConnection()
            const state = new UserRelatedState(osmConnection)
            const intro = new Combine([
                new LanguagePicker(Translations.t.index.title.SupportedLanguages(), "").SetClass(
                    "flex absolute top-2 right-3"
                ),
                new IndexText(),
            ])
            new Combine([
                intro,
                new MoreScreen(state, true),
                new LoginToggle(undefined, Translations.t.index.logIn, {
                    osmConnection,
                    featureSwitchUserbadge: new ImmutableStore(true),
                }),
                new ImportViewerLinks(state.osmConnection),
                Translations.t.general.aboutMapComplete.intro.SetClass("link-underline"),
                new FixedUiElement("v" + Constants.vNumber).SetClass("block"),
            ])
                .SetClass("block m-5 lg:w-3/4 lg:ml-40")
                .AttachTo("main")
        } catch (e) {
            console.error(">>>> CRITICAL", e)
            new FixedUiElement(
                "Seems like no layers are compiled - check the output of `npm run generate:layeroverview`. Is this visible online? Contact pietervdvn immediately!"
            )
                .SetClass("alert")
                .AttachTo("main")
        }
    }
}
