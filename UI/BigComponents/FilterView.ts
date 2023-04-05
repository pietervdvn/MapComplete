import { VariableUiElement } from "../Base/VariableUIElement"
import Toggle from "../Input/Toggle"
import Combine from "../Base/Combine"
import Translations from "../i18n/Translations"
import { Translation } from "../i18n/Translation"
import Svg from "../../Svg"
import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
import FilteredLayer from "../../Models/FilteredLayer"
import TilesourceConfig from "../../Models/ThemeConfig/TilesourceConfig"
import Loc from "../../Models/Loc"

export default class FilterView extends VariableUiElement {
    constructor(
        filteredLayer: Store<FilteredLayer[]>,
        tileLayers: { config: TilesourceConfig; isDisplayed: UIEventSource<boolean> }[],
        state: {
            readonly availableBackgroundLayers?: Store<BaseLayer[]>
            readonly featureSwitchBackgroundSelection?: UIEventSource<boolean>
            readonly featureSwitchIsDebugging?: UIEventSource<boolean>
            readonly locationControl?: UIEventSource<Loc>
            readonly featureSwitchMoreQuests: Store<boolean>
        }
    ) {
        super(
            filteredLayer.map((filteredLayers) => {
                // Create the views which toggle layers (and filters them) ...
                let elements = filteredLayers
                    ?.map((l) =>
                        FilterView.createOneFilteredLayerElement(l, state)?.SetClass("filter-panel")
                    )
                    ?.filter((l) => l !== undefined)
                elements[0].SetClass("first-filter-panel")

                // ... create views for non-interactive layers ...
                elements = elements.concat(
                    tileLayers.map((tl) => FilterView.createOverlayToggle(state, tl))
                )

                return elements
            })
        )
    }

    private static createOverlayToggle(
        state: { locationControl?: UIEventSource<Loc> },
        config: { config: TilesourceConfig; isDisplayed: UIEventSource<boolean> }
    ) {
        const iconStyle = "width:1.5rem;height:1.5rem;margin-left:1.25rem;flex-shrink: 0;"

        const icon = new Combine([Svg.checkbox_filled]).SetStyle(iconStyle)
        const iconUnselected = new Combine([Svg.checkbox_empty]).SetStyle(iconStyle)
        const name: Translation = config.config.name

        const styledNameChecked = name.Clone().SetStyle("font-size:large").SetClass("ml-2")
        const styledNameUnChecked = name.Clone().SetStyle("font-size:large").SetClass("ml-2")

        const style = "display:flex;align-items:center;padding:0.5rem 0;"
        const layerChecked = new Combine([icon, styledNameChecked])
            .SetStyle(style)
            .onClick(() => config.isDisplayed.setData(false))

        const layerNotChecked = new Combine([iconUnselected, styledNameUnChecked])
            .SetStyle(style)
            .onClick(() => config.isDisplayed.setData(true))

        return new Toggle(layerChecked, layerNotChecked, config.isDisplayed)
    }
}
