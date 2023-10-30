import { SubtleButton } from "../Base/SubtleButton"
import BaseUIElement from "../BaseUIElement"
import Svg from "../../Svg"
import { OsmConnection, OsmServiceState } from "../../Logic/Osm/OsmConnection"
import { VariableUiElement } from "../Base/VariableUIElement"
import Loading from "../Base/Loading"
import Translations from "../i18n/Translations"
import { ImmutableStore, Store } from "../../Logic/UIEventSource"
import Combine from "../Base/Combine"
import { Translation } from "../i18n/Translation"

class LoginButton extends SubtleButton {
    constructor(
        text: BaseUIElement | string,
        state: {
            osmConnection?: OsmConnection
        },
        icon?: BaseUIElement | string
    ) {
        super(icon ?? Svg.login_svg(), text)
        this.onClick(() => {
            state.osmConnection?.AttemptLogin()
        })
    }
}

export class LoginToggle extends VariableUiElement {
    /**
     * Constructs an element which shows 'el' if the user is logged in
     * If not logged in, 'text' is shown on the button which invites to login.
     *
     * If logging in is not possible for some reason, an appropriate error message is shown
     *
     * State contains the 'osmConnection' to work with
     * @param el: Element to show when logged in
     * @param text: To show on the login button. Default: nothing
     * @param state: if no osmConnection is given, assumes test situation and will show 'el' as if logged in
     */
    constructor(
        el: BaseUIElement,
        text: BaseUIElement | string,
        state: {
            readonly osmConnection?: OsmConnection
            readonly featureSwitchUserbadge?: Store<boolean>
        }
    ) {
        const loading = new Loading("Trying to log in...")
        const login = text === undefined ? undefined : new LoginButton(text, state)
        const t = Translations.t.general
        const offlineModes: Partial<Record<OsmServiceState, Translation>> = {
            offline: t.loginFailedOfflineMode,
            unreachable: t.loginFailedUnreachableMode,
            readonly: t.loginFailedReadonlyMode,
        }

        super(
            state.osmConnection?.loadingStatus?.map(
                (osmConnectionState) => {
                    if (state.featureSwitchUserbadge?.data == false) {
                        // All features to login with are disabled
                        return undefined
                    }

                    const apiState = state.osmConnection?.apiIsOnline?.data ?? "online"
                    const apiTranslation = offlineModes[apiState]
                    if (apiTranslation !== undefined) {
                        return new Combine([
                            Svg.invalid_svg().SetClass("w-8 h-8 m-2 shrink-0"),
                            apiTranslation,
                        ]).SetClass("flex items-center alert max-w-64")
                    }

                    if (osmConnectionState === "loading") {
                        return loading
                    }
                    if (osmConnectionState === "not-attempted") {
                        return login
                    }
                    if (osmConnectionState === "logged-in") {
                        return el
                    }

                    // Fallback
                    return new LoginButton(
                        Translations.t.general.loginFailed,
                        state,
                        Svg.invalid_svg()
                    )
                },
                [state.featureSwitchUserbadge, state.osmConnection?.apiIsOnline]
            ) ?? new ImmutableStore(el)
        )
    }
}
