import { SpecialVisualizationState, SpecialVisualizationSvelte } from "../SpecialVisualization"
import SvelteUIElement from "../Base/SvelteUIElement"
import DisabledQuestions from "../Popup/DisabledQuestions.svelte"
import Constants from "../../Models/Constants"
import LogoutButton from "../Base/LogoutButton.svelte"
import LoginButton from "../Base/LoginButton.svelte"
import ThemeViewState from "../../Models/ThemeViewState"
import OrientationDebugPanel from "../Debug/OrientationDebugPanel.svelte"
import AllTagsPanel from "../Popup/AllTagsPanel.svelte"
import { UIEventSource } from "../../Logic/UIEventSource"
import ClearCaches from "../Popup/ClearCaches.svelte"
import Locale from "../i18n/Locale"
import LanguageUtils from "../../Utils/LanguageUtils"
import LanguagePicker from "../InputElement/LanguagePicker.svelte"
import PendingChangesIndicator from "../BigComponents/PendingChangesIndicator.svelte"

export class SettingsVisualisations {
    public static initList(): SpecialVisualizationSvelte[] {
        return [
            {
                funcName: "language_picker",
                args: [],
                group: "settings",
                docs: "A component to set the language of the user interface",
                constr(state: SpecialVisualizationState): SvelteUIElement {
                    const availableLanguages = Locale.showLinkToWeblate.map((showTranslations) =>
                        showTranslations
                            ? LanguageUtils.usedLanguagesSorted
                            : state.theme.language)
                    return new SvelteUIElement(LanguagePicker, {
                        assignTo: state.userRelatedState.language,
                        availableLanguages,
                        preferredLanguages: state.osmConnection.userDetails.map(
                            (ud) => ud?.languages ?? []
                        )
                    })
                }
            },

            {
                funcName: "disabled_questions",
                group: "settings",
                docs: "Shows which questions are disabled for every layer. Used in 'settings'",
                needsUrls: [],
                args: [],
                constr(state) {
                    return new SvelteUIElement(DisabledQuestions, { state })
                }
            },
            {
                funcName: "gyroscope_all_tags",
                group: "settings",
                docs: "Shows the current tags of the GPS-representing object, used for debugging",
                args: [],
                constr(): SvelteUIElement {
                    return new SvelteUIElement(OrientationDebugPanel, {})
                }
            },
            {
                funcName: "gps_all_tags",
                group: "settings",
                docs: "Shows the current tags of the GPS-representing object, used for debugging",
                args: [],
                constr(
                    state: SpecialVisualizationState
                ): SvelteUIElement {
                    const tags = (<ThemeViewState>(
                        state
                    )).geolocation.currentUserLocation.features.map(
                        (features) => features[0]?.properties
                    )
                    return new SvelteUIElement(AllTagsPanel, {
                        state,
                        tags
                    })
                }
            },
            {
                funcName: "clear_caches",
                docs: "A button which clears the locally downloaded data and the service worker. Login status etc will be kept",
                args: [
                    {
                        name: "text",
                        required: true,
                        doc: "The text to show on the button"
                    }
                ],
                group: "settings",
                constr(
                    _: SpecialVisualizationState,
                    __: UIEventSource<Record<string, string>>,
                    argument: string[],
                ): SvelteUIElement {
                    return new SvelteUIElement(ClearCaches, {
                        msg: argument[0] ?? "Clear local caches"
                    })
                }
            },
            {
                funcName: "login_button",
                args: [],
                docs: "Show a login button",
                needsUrls: [],
                group: "settings",
                constr(state: SpecialVisualizationState): SvelteUIElement {
                    return new SvelteUIElement(LoginButton, { osmConnection: state.osmConnection })
                }
            },

            {
                funcName: "logout",
                args: [],
                needsUrls: [Constants.osmAuthConfig.url],
                docs: "Shows a button where the user can log out",
                group: "settings",
                constr(state: SpecialVisualizationState): SvelteUIElement {
                    return new SvelteUIElement(LogoutButton, { osmConnection: state.osmConnection })
                }
            },
            {
                funcName: "pending_changes",
                docs: "A module showing the pending changes, with the option to clear the pending changes",
                group: "settings",
                args: [],
                constr(state: SpecialVisualizationState): SvelteUIElement {
                    return new SvelteUIElement(PendingChangesIndicator, { state, compact: false })
                }
            }
        ]
    }
}
