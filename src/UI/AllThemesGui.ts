import UserRelatedState from "../Logic/State/UserRelatedState"
import { FixedUiElement } from "./Base/FixedUiElement"
import Combine from "./Base/Combine"
import MoreScreen from "./BigComponents/MoreScreen"
import Translations from "./i18n/Translations"
import Constants from "../Models/Constants"
import LanguagePicker from "./LanguagePicker"
import IndexText from "./BigComponents/IndexText"
import { LoginToggle } from "./Popup/LoginButton"
import { ImmutableStore } from "../Logic/UIEventSource"
import { OsmConnection } from "../Logic/Osm/OsmConnection"
import { QueryParameters } from "../Logic/Web/QueryParameters"
import { OsmConnectionFeatureSwitches } from "../Logic/State/FeatureSwitchState"

export default class AllThemesGui {
    setup() {
        try {
            const featureSwitches = new OsmConnectionFeatureSwitches()
            const osmConnection = new OsmConnection({
                fakeUser: featureSwitches.featureSwitchFakeUser.data,
                oauth_token: QueryParameters.GetQueryParameter(
                    "oauth_token",
                    undefined,
                    "Used to complete the login"
                ),
            })
            const state = new UserRelatedState(osmConnection)
            const intro = new Combine([
                new LanguagePicker(
                    Translations.t.index.title.SupportedLanguages(),
                    state.language
                ).SetClass("flex absolute top-2 right-3"),
                new IndexText(),
            ])
            new Combine([
                intro,
                new MoreScreen(state, true),
                new LoginToggle(undefined, Translations.t.index.logIn, {
                    osmConnection,
                    featureSwitchUserbadge: new ImmutableStore(true),
                }).SetClass("flex justify-center w-full"),
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
