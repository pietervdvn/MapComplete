import Combine from "../Base/Combine"
import Toggle from "../Input/Toggle"
import MapControlButton from "../MapControlButton"
import Svg from "../../Svg"
import AllDownloads from "./AllDownloads"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Lazy from "../Base/Lazy"
import { VariableUiElement } from "../Base/VariableUIElement"
import FeatureInfoBox from "../Popup/FeatureInfoBox"
import FeaturePipelineState from "../../Logic/State/FeaturePipelineState"
import { DefaultGuiState } from "../DefaultGuiState"

export default class LeftControls extends Combine {
    constructor(state: FeaturePipelineState, guiState: DefaultGuiState) {
        const currentViewFL = state.currentView?.layer
        const currentViewAction = new Toggle(
            new Lazy(() => {
                const feature: Store<any> = state.currentView.features.map((ffs) => ffs[0])
                const icon = new VariableUiElement(
                    feature.map((feature) => {
                        const defaultIcon = Svg.checkbox_empty_svg()
                        if (feature === undefined) {
                            return defaultIcon
                        }
                        const tags = { ...feature.properties, button: "yes" }
                        const elem = currentViewFL.layerDef.mapRendering[0]?.GetSimpleIcon(
                            new UIEventSource(tags)
                        )
                        if (elem === undefined) {
                            return defaultIcon
                        }
                        return elem
                    })
                ).SetClass("inline-block w-full h-full")

                feature.map((feature) => {
                    if (feature === undefined) {
                        return undefined
                    }
                    const tagsSource = state.allElements.getEventSourceById(feature.properties.id)
                    return new FeatureInfoBox(tagsSource, currentViewFL.layerDef, state, {
                        hashToShow: "currentview",
                        isShown: guiState.currentViewControlIsOpened,
                    })
                })

                return new MapControlButton(icon)
            }).onClick(() => {
                guiState.currentViewControlIsOpened.setData(true)
            }),

            undefined,
            new UIEventSource<boolean>(
                currentViewFL !== undefined && currentViewFL?.layerDef?.tagRenderings !== null
            )
        )

        new AllDownloads(guiState.downloadControlIsOpened, state)
        const toggledDownload = new MapControlButton(Svg.download_svg()).onClick(() =>
            guiState.downloadControlIsOpened.setData(true)
        )

        const downloadButton = new Toggle(
            toggledDownload,
            undefined,
            state.featureSwitchEnableExport.map(
                (downloadEnabled) => downloadEnabled || state.featureSwitchExportAsPdf.data,
                [state.featureSwitchExportAsPdf]
            )
        )

        super([currentViewAction, downloadButton])

        this.SetClass("flex flex-col")
    }
}
