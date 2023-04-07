import FeaturePipelineState from "../Logic/State/FeaturePipelineState"
import { Utils } from "../Utils"
import { UIEventSource } from "../Logic/UIEventSource"
import FullWelcomePaneWithTabs from "./BigComponents/FullWelcomePaneWithTabs"
import MapControlButton from "./MapControlButton"
import Svg from "../Svg"
import Toggle from "./Input/Toggle"
import BaseUIElement from "./BaseUIElement"
import LeftControls from "./BigComponents/LeftControls"
import RightControls from "./BigComponents/RightControls"
import CenterMessageBox from "./CenterMessageBox"
import ScrollableFullScreen from "./Base/ScrollableFullScreen"
import Translations from "./i18n/Translations"
import SimpleAddUI from "./BigComponents/SimpleAddUI"
import StrayClickHandler from "../Logic/Actors/StrayClickHandler"
import { DefaultGuiState } from "./DefaultGuiState"
import NewNoteUi from "./Popup/NewNoteUi"
import Combine from "./Base/Combine"
import FilteredLayer from "../Models/FilteredLayer"
import ExtraLinkButton from "./BigComponents/ExtraLinkButton"
import { VariableUiElement } from "./Base/VariableUIElement"
import Img from "./Base/Img"
import UserInformationPanel from "./BigComponents/UserInformation"
import { LoginToggle } from "./Popup/LoginButton"
import { FixedUiElement } from "./Base/FixedUiElement"
import GeoLocationHandler from "../Logic/Actors/GeoLocationHandler"
import Hotkeys from "./Base/Hotkeys"
import CopyrightPanel from "./BigComponents/CopyrightPanel"
import SvelteUIElement from "./Base/SvelteUIElement"
import CommunityIndexView from "./BigComponents/CommunityIndexView.svelte"

/**
 * The default MapComplete GUI initializer
 *
 * Adds a welcome pane, control buttons, ... etc to index.html
 */
export default class DefaultGUI {
    private readonly guiState: DefaultGuiState
    private readonly state: FeaturePipelineState
    private readonly geolocationHandler: GeoLocationHandler | undefined

    constructor(state: FeaturePipelineState, guiState: DefaultGuiState) {
        this.state = state
        this.guiState = guiState
    }

    public setup() {
        this.SetupUIElements()
        this.SetupMap()

        if (
            this.state.layoutToUse.customCss !== undefined &&
            window.location.pathname.indexOf("index") >= 0
        ) {
            Utils.LoadCustomCss(this.state.layoutToUse.customCss)
        }

        Hotkeys.RegisterHotkey(
            { shift: "O" },
            Translations.t.hotkeyDocumentation.selectMapnik,
            () => {
                this.state.backgroundLayer.setData(AvailableBaseLayers.osmCarto)
            }
        )
    }

    public setupClickDialogOnMap(
        filterViewIsOpened: UIEventSource<boolean>,
        state: FeaturePipelineState
    ) {
        const hasPresets = state.layoutToUse.layers.some((layer) => layer.presets.length > 0)
        const noteLayer: FilteredLayer = state.filteredLayers.data.filter(
            (l) => l.layerDef.id === "note"
        )[0]
        let addNewNoteDialog: (isShown: UIEventSource<boolean>) => BaseUIElement = undefined
        if (noteLayer !== undefined) {
            addNewNoteDialog = (isShown) => new NewNoteUi(noteLayer, isShown, state)
        }

        function setup() {
            if (!hasPresets && addNewNoteDialog === undefined) {
                return // nothing to do
            }
            const newPointDialogIsShown = new UIEventSource<boolean>(false)
            const addNewPoint = new ScrollableFullScreen(
                () =>
                    hasPresets
                        ? Translations.t.general.add.title
                        : Translations.t.notes.createNoteTitle,
                ({ resetScrollSignal }) => {
                    let addNew = undefined
                    if (hasPresets) {
                        addNew = new SimpleAddUI(
                            newPointDialogIsShown,
                            resetScrollSignal,
                            filterViewIsOpened,
                            state
                        )
                    }
                    let addNote = undefined
                    if (noteLayer !== undefined) {
                        addNote = addNewNoteDialog(newPointDialogIsShown)
                    }
                    return new Combine([addNew, addNote]).SetClass("flex flex-col font-lg text-lg")
                },
                "new",
                newPointDialogIsShown
            )

            let noteMarker = undefined
            if (!hasPresets && addNewNoteDialog !== undefined) {
                noteMarker = new Combine([
                    Svg.note_svg().SetClass("absolute bottom-0").SetStyle("height: 40px"),
                    Svg.addSmall_svg()
                        .SetClass("absolute w-6 animate-pulse")
                        .SetStyle("right: 10px; bottom: -8px;"),
                ])
                    .SetClass("block relative h-full")
                    .SetStyle("left: calc( 50% - 15px )") // This is a bit hacky, yes I know!
            }
        }

        if (noteLayer !== undefined) {
            setup()
        } else {
            state.featureSwitchAddNew.addCallbackAndRunD((addNewAllowed) => {
                if (addNewAllowed) {
                    setup()
                    return true
                }
            })
        }
    }

    private SetupMap() {
        if (Utils.runningFromConsole) {
            return
        }
        const state = this.state
        const guiState = this.guiState

        this.setupClickDialogOnMap(guiState.filterViewIsOpened, state)

        const selectedElement: FilteredLayer = state.filteredLayers.data.filter(
            (l) => l.layerDef.id === "selected_element"
        )[0]
        new ShowDataLayer({
            leafletMap: state.leafletMap,
            layerToShow: selectedElement.layerDef,
            features: state.selectedElementsLayer,
            state,
        })
    }

    private SetupUIElements() {
        const state = this.state
        const guiState = this.guiState

        const self = this

        const extraLink = Toggle.If(
            state.featureSwitchExtraLinkEnabled,
            () => new ExtraLinkButton(state, state.layoutToUse.extraLink)
        )

        const welcomeMessageMapControl = Toggle.If(state.featureSwitchWelcomeMessage, () =>
            self.InitWelcomeMessage()
        )

        new ScrollableFullScreen(
            () => Translations.t.general.attribution.attributionTitle,
            () => new CopyrightPanel(state),
            "copyright",
            guiState.copyrightViewIsOpened
        )
        const copyright = new MapControlButton(Svg.copyright_svg()).onClick(() =>
            guiState.copyrightViewIsOpened.setData(true)
        )
        new Combine([welcomeMessageMapControl, copyright, extraLink])
            .SetClass("flex flex-col")
            .AttachTo("top-left")

        new Combine([
            new ExtraLinkButton(state, {
                ...state.layoutToUse.extraLink,
                newTab: true,
                requirements: new Set<
                    "iframe" | "no-iframe" | "welcome-message" | "no-welcome-message"
                >(),
            }),
        ])
            .SetClass("flex items-center justify-center normal-background h-full")
            .AttachTo("on-small-screen")

        new LeftControls(state, guiState).AttachTo("bottom-left")
        new RightControls(state, this.geolocationHandler).AttachTo("bottom-right")

        new CenterMessageBox(state).AttachTo("centermessage")
        document?.getElementById("centermessage")?.classList?.add("pointer-events-none")
    }

    private InitWelcomeMessage(): BaseUIElement {
        return new FullWelcomePaneWithTabs(
            new UIEventSource<boolean>(false),
            this.guiState.welcomeMessageOpenedTab,
            this.state,
            this.guiState
        )
    }
}
