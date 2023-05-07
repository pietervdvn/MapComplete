import { ImmutableStore, Store } from "../../Logic/UIEventSource"
import Translations from "../i18n/Translations"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import Toggle from "../Input/Toggle"
import BaseUIElement from "../BaseUIElement"
import Combine from "../Base/Combine"
import Svg from "../../Svg"

export class EditButton extends Toggle {
    constructor(osmConnection: OsmConnection, onClick: () => void) {
        super(
            new Combine([Svg.pencil_svg()])
                .SetClass("block relative h-10 w-10 p-2 float-right")
                .SetStyle("border: 1px solid black; border-radius: 0.7em")
                .onClick(onClick),
            undefined,
            osmConnection.isLoggedIn
        )
    }
}

export class SaveButton extends Toggle {
    constructor(
        value: Store<any>,
        osmConnection: OsmConnection,
        textEnabled?: BaseUIElement,
        textDisabled?: BaseUIElement
    ) {
        if (value === undefined) {
            throw "No event source for savebutton, something is wrong"
        }

        const pleaseLogin = Translations.t.general.loginToStart
            .Clone()
            .SetClass("login-button-friendly")
            .onClick(() => osmConnection?.AttemptLogin())

        const isSaveable = value.map((v) => v !== false && (v ?? "") !== "")

        const saveEnabled = (textEnabled ?? Translations.t.general.save.Clone()).SetClass(`btn`)
        const saveDisabled = (textDisabled ?? Translations.t.general.save.Clone()).SetClass(
            `btn btn-disabled`
        )

        const save = new Toggle(saveEnabled, saveDisabled, isSaveable)
        super(save, pleaseLogin, osmConnection?.isLoggedIn ?? new ImmutableStore(false))
    }
}
