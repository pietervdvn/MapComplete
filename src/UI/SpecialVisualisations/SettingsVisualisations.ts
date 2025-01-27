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
import { Feature } from "geojson"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import ClearCaches from "../Popup/ClearCaches.svelte"

export class SettingsVisualisations {
    public static initList(): SpecialVisualizationSvelte[] {
        return [
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
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): SvelteUIElement {
                    return new SvelteUIElement<any, any, any>(ClearCaches, {
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
            }

        ]
    }
}
