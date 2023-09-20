import Combine from "../Base/Combine"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { BBox } from "../../Logic/BBox"
import Translations from "../i18n/Translations"
import { VariableUiElement } from "../Base/VariableUIElement"
import Toggle from "../Input/Toggle"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import { Utils } from "../../Utils"
import Constants from "../../Models/Constants"

export class OpenJosm extends Combine {
    constructor(osmConnection: OsmConnection, bounds: Store<BBox>, iconStyle?: string) {
        const t = Translations.t.general.attribution

        const josmState = new UIEventSource<string>(undefined)
        // Reset after 15s
        josmState.stabilized(15000).addCallbackD(() => josmState.setData(undefined))

        const stateIndication = new VariableUiElement(
            josmState.map((state) => {
                if (state === undefined) {
                    return undefined
                }
                state = state.toUpperCase()
                if (state === "OK") {
                    return t.josmOpened.SetClass("thanks")
                }
                return t.josmNotOpened.SetClass("alert")
            })
        )

        const toggle = new Toggle(
            new SubtleButton(Svg.josm_logo_svg().SetStyle(iconStyle), t.editJosm)
                .onClick(() => {
                    const bbox = bounds.data
                    if (bbox === undefined) {
                        return
                    }
                    const top = bbox.getNorth()
                    const bottom = bbox.getSouth()
                    const right = bbox.getEast()
                    const left = bbox.getWest()
                    const josmLink = `http://127.0.0.1:8111/load_and_zoom?left=${left}&right=${right}&top=${top}&bottom=${bottom}`
                    Utils.download(josmLink)
                        .then((answer) => josmState.setData(answer.replace(/\n/g, "").trim()))
                        .catch(() => josmState.setData("ERROR"))
                })
                .SetClass("w-full"),
            undefined,
            osmConnection.userDetails.map(
                (ud) => ud.loggedIn && ud.csCount >= Constants.userJourney.historyLinkVisible
            )
        )

        super([stateIndication, toggle])
    }
}
