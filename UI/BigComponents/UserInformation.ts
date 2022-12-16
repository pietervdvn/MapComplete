import ScrollableFullScreen from "../Base/ScrollableFullScreen";
import Translations from "../i18n/Translations";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import {VariableUiElement} from "../Base/VariableUIElement";
import Img from "../Base/Img";
import {FixedUiElement} from "../Base/FixedUiElement";
import Link from "../Base/Link";
import {UIEventSource} from "../../Logic/UIEventSource";
import Loc from "../../Models/Loc";
import BaseUIElement from "../BaseUIElement";
import Showdown from "showdown"
import LanguagePicker from "../LanguagePicker";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import Constants from "../../Models/Constants";

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

class UserInformationMainPanel extends Combine {
    constructor(osmConnection: OsmConnection, locationControl: UIEventSource<Loc>, layout: LayoutConfig) {
        const t = Translations.t.userinfo;
        const imgSize = "h-6 w-6"
        const ud = osmConnection.userDetails;
        super([

            new VariableUiElement(ud.map(ud => {

                    if (!ud?.loggedIn) {
                        // Not logged in
                        return new SubtleButton(
                            Svg.login_svg(), "Login", {imgSize}
                        ).onClick(osmConnection.AttemptLogin)
                    }

                    let img: Img = Svg.person_svg();
                    if (ud.img !== undefined) {
                        img = new Img(ud.img)
                    }
                    img.SetClass("rounded-full h-12 w-12 m-4")

                    let description: BaseUIElement = undefined
                    if (ud.description) {
                        const editButton = new Link(
                            Svg.pencil_svg().SetClass("h-4 w-4"),
                            "https://www.openstreetmap.org/profile/edit",
                            true
                        ).SetClass("absolute block bg-subtle rounded-full p-2 bottom-2 right-2 w-min self-end")

                        description = new Combine([
                            new FixedUiElement(new Showdown.Converter().makeHtml(ud.description)).SetClass("link-underline"),
                            editButton
                        ]).SetClass("relative w-full m-2")

                    } else {
                        description = new Combine([
                            t.noDescription, new SubtleButton(Svg.pencil_svg(), t.noDescriptionCallToAction, {imgSize})
                        ]).SetClass("w-full m-2")
                    }

                    let panToHome: BaseUIElement;
                    if (ud.home) {
                        panToHome = new SubtleButton(Svg.home_svg(), t.moveToHome, {imgSize})
                            .onClick(() => {
                                    const home = ud?.home
                                    if (home === undefined) {
                                        return
                                    }
                                    locationControl.setData({...home, zoom: 16})
                                }
                            );
                    }

                    return new Combine([
                        new Combine([img, description]).SetClass("flex border border-black rounded-md"),
                        new LanguagePicker(layout.language, Translations.t.general.pickLanguage.Clone()),

                        new SubtleButton(Svg.envelope_svg(), new Combine([t.gotoInbox,
                                ud.unreadMessages == 0 ? undefined : t.newMessages.SetClass("alert block")
                            ]),
                            {imgSize, url: `${ud.backend}/messages/inbox`, newTab: true}),
                        new SubtleButton(Svg.gear_svg(), t.gotoSettings,
                            {imgSize, url: `${ud.backend}/user/${encodeURIComponent(ud.name)}/account`, newTab: true}),
                        panToHome,
                        new ImportViewerLinks(osmConnection),
                        new SubtleButton(Svg.logout_svg(), Translations.t.general.logout, {imgSize}).onClick(osmConnection.LogOut)

                    ])
                }
            )).SetClass("flex flex-col"),


        ]);
    }
}

export default class UserInformationPanel extends ScrollableFullScreen {
    constructor(state: {
        layoutToUse: LayoutConfig;
        osmConnection: OsmConnection, locationControl: UIEventSource<Loc>
    }) {
        const t = Translations.t.general;
        super(
            () => {
                return new VariableUiElement(state.osmConnection.userDetails.map(ud => "Welcome " + ud.name))
            },
            () => {
                return new UserInformationMainPanel(state.osmConnection, state.locationControl, state.layoutToUse)
            },
            "userinfo"
        );
    }
}
