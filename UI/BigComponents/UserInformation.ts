import Translations from "../i18n/Translations"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import Combine from "../Base/Combine"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import { VariableUiElement } from "../Base/VariableUIElement"
import Img from "../Base/Img"
import { FixedUiElement } from "../Base/FixedUiElement"
import Link from "../Base/Link"
import { UIEventSource } from "../../Logic/UIEventSource"
import Loc from "../../Models/Loc"
import BaseUIElement from "../BaseUIElement"
import Showdown from "showdown"
import LanguagePicker from "../LanguagePicker"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import Constants from "../../Models/Constants"

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

class UserInformationMainPanel extends VariableUiElement {
    private readonly settings: UIEventSource<Record<string, BaseUIElement>>
    private readonly userInfoFocusedQuestion?: UIEventSource<string>

    constructor(
        osmConnection: OsmConnection,
        locationControl: UIEventSource<Loc>,
        layout: LayoutConfig,
        isOpened: UIEventSource<boolean>,
        userInfoFocusedQuestion?: UIEventSource<string>
    ) {
        const settings = new UIEventSource<Record<string, BaseUIElement>>({})

        super()
        this.settings = settings
        this.userInfoFocusedQuestion = userInfoFocusedQuestion
        const self = this
        userInfoFocusedQuestion.addCallbackD((_) => {
            self.focusOnSelectedQuestion()
        })
    }

    public focusOnSelectedQuestion() {
        const focusedId = this.userInfoFocusedQuestion.data
        console.log("Focusing on", focusedId, this.settings.data[focusedId])
        if (focusedId === undefined) {
            return
        }
        this.settings.data[focusedId]?.ScrollIntoView()
    }
}
