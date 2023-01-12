import ScrollableFullScreen from "../Base/ScrollableFullScreen"
import Translations from "../i18n/Translations"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import Combine from "../Base/Combine"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import { VariableUiElement } from "../Base/VariableUIElement"
import Img from "../Base/Img"
import { FixedUiElement } from "../Base/FixedUiElement"
import Link from "../Base/Link"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Loc from "../../Models/Loc"
import BaseUIElement from "../BaseUIElement"
import Showdown from "showdown"
import LanguagePicker from "../LanguagePicker"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import Constants from "../../Models/Constants"
import EditableTagRendering from "../Popup/EditableTagRendering"
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig"
import { SaveButton } from "../Popup/SaveButton"
import { TagUtils } from "../../Logic/Tags/TagUtils"
import * as usersettings from "../../assets/generated/layers/usersettings.json"
import { LoginToggle } from "../Popup/LoginButton"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

export class ImportViewerLinks extends VariableUiElement {
    constructor(osmConnection: OsmConnection) {
        super(
            osmConnection.userDetails.map((ud) => {
                if (ud.csCount < Constants.userJourney.importHelperUnlock) {
                    return undefined
                }
                return new Combine([
                    new SubtleButton(undefined, Translations.t.importHelper.title, {
                        url: "import_helper.html",
                    }),
                    new SubtleButton(Svg.note_svg(), Translations.t.importInspector.title, {
                        url: "import_viewer.html",
                    }),
                ])
            })
        )
    }
}

class SingleUserSettingsPanel extends EditableTagRendering {
    constructor(config: TagRenderingConfig, osmConnection: OsmConnection) {
        const editMode = new UIEventSource(false)
        super(
            osmConnection.preferencesHandler.preferences,
            config,
            [],
            { osmConnection },
            {
                editMode,
                createSaveButton: (store) =>
                    new SaveButton(
                        osmConnection.preferencesHandler.preferences,
                        osmConnection
                    ).onClick(() => {
                        const prefs = osmConnection.preferencesHandler.preferences
                        const selection = TagUtils.FlattenMultiAnswer(
                            TagUtils.FlattenAnd(store.data, prefs.data)
                        ).asChange(prefs.data)
                        for (const kv of selection) {
                            osmConnection.GetPreference(kv.k, "", "").setData(kv.v)
                        }

                        editMode.setData(false)
                    }),
            }
        )
    }
}

class UserInformationMainPanel extends VariableUiElement {
    constructor(
        osmConnection: OsmConnection,
        locationControl: UIEventSource<Loc>,
        layout: LayoutConfig,
        isOpened: UIEventSource<boolean>
    ) {
        const t = Translations.t.userinfo
        const imgSize = "h-6 w-6"
        const ud = osmConnection.userDetails
        super(
            ud.map((ud) => {
                let img: BaseUIElement = Svg.person_ui().SetClass("block")
                if (ud.img !== undefined) {
                    img = new Img(ud.img)
                }
                img.SetClass("rounded-full h-12 w-12 m-4")

                let description: BaseUIElement = undefined
                const editLink = osmConnection.Backend() + "/profile/edit"
                if (ud.description) {
                    const editButton = new Link(
                        Svg.pencil_svg().SetClass("h-4 w-4"),
                        editLink,
                        true
                    ).SetClass(
                        "absolute block bg-subtle rounded-full p-2 bottom-2 right-2 w-min self-end"
                    )

                    const htmlString = new Showdown.Converter()
                        .makeHtml(ud.description)
                        .replace(/&gt;/g, ">")
                        .replace(/&lt;/g, "<")
                    description = new Combine([
                        new FixedUiElement(htmlString).SetClass("link-underline"),
                        editButton,
                    ]).SetClass("relative w-full m-2")
                } else {
                    description = new Combine([
                        t.noDescription,
                        new SubtleButton(Svg.pencil_svg(), t.noDescriptionCallToAction, {
                            imgSize,
                            url: editLink,
                            newTab: true,
                        }),
                    ]).SetClass("w-full m-2")
                }

                let panToHome: BaseUIElement
                if (ud.home) {
                    panToHome = new SubtleButton(Svg.home_svg(), t.moveToHome, {
                        imgSize,
                    }).onClick(() => {
                        const home = ud?.home
                        if (home === undefined) {
                            return
                        }
                        locationControl.setData({ ...home, zoom: 16 })
                        isOpened.setData(false)
                    })
                }

                const usersettingsConfig = new LayerConfig(usersettings, "userinformationpanel")

                const questions = usersettingsConfig.tagRenderings.map((c) =>
                    new SingleUserSettingsPanel(c, osmConnection).SetClass("block my-4")
                )

                return new Combine([
                    new Combine([img, description]).SetClass("flex border border-black rounded-md"),
                    new LanguagePicker(
                        layout.language,
                        Translations.t.general.pickLanguage.Clone()
                    ),
                    ...questions,
                    new SubtleButton(
                        Svg.envelope_svg(),
                        new Combine([
                            t.gotoInbox,
                            ud.unreadMessages == 0
                                ? undefined
                                : t.newMessages.SetClass("alert block"),
                        ]),
                        { imgSize, url: `${ud.backend}/messages/inbox`, newTab: true }
                    ),
                    new SubtleButton(Svg.gear_svg(), t.gotoSettings, {
                        imgSize,
                        url: `${ud.backend}/user/${encodeURIComponent(ud.name)}/account`,
                        newTab: true,
                    }),
                    panToHome,
                    new ImportViewerLinks(osmConnection),
                    new SubtleButton(Svg.logout_svg(), Translations.t.general.logout, {
                        imgSize,
                    }).onClick(() => {
                        osmConnection.LogOut()
                    }),
                ])
            })
        )
        this.SetClass("flex flex-col")
    }
}

export default class UserInformationPanel extends ScrollableFullScreen {
    constructor(
        state: {
            readonly layoutToUse: LayoutConfig
            readonly osmConnection: OsmConnection
            readonly locationControl: UIEventSource<Loc>
            readonly featureSwitchUserbadge: Store<boolean>
        },
        options?: {
            isOpened?: UIEventSource<boolean>
        }
    ) {
        const isOpened = options?.isOpened ?? new UIEventSource<boolean>(false)
        super(
            () => {
                return new VariableUiElement(
                    state.osmConnection.userDetails.map((ud) => {
                        if (ud.loggedIn === false) {
                            return Translations.t.userinfo.titleNotLoggedIn
                        }
                        return Translations.t.userinfo.welcome.Subs(ud)
                    })
                )
            },
            () =>
                new LoginToggle(
                    new UserInformationMainPanel(
                        state.osmConnection,
                        state.locationControl,
                        state.layoutToUse,
                        isOpened
                    ),
                    Translations.t.general.getStartedLogin,
                    state
                ),
            "userinfo",
            isOpened
        )
    }
}
