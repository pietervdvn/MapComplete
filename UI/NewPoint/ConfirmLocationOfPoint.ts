import { UIEventSource } from "../../Logic/UIEventSource"
import BaseUIElement from "../BaseUIElement"
import { SubtleButton } from "../Base/SubtleButton"
import Combine from "../Base/Combine"
import Translations from "../i18n/Translations"
import Svg from "../../Svg"
import Toggle from "../Input/Toggle"
import { PresetInfo } from "../BigComponents/SimpleAddUI"
import { VariableUiElement } from "../Base/VariableUIElement"
import { Tag } from "../../Logic/Tags/Tag"
import { WayId } from "../../Models/OsmFeature"
import { Translation } from "../i18n/Translation"
import { SpecialVisualizationState } from "../SpecialVisualization"

/**
 * @deprecated
 */
export default class ConfirmLocationOfPoint extends Combine {
    constructor(
        state: SpecialVisualizationState,
        filterViewIsOpened: UIEventSource<boolean>,
        preset: PresetInfo,
        confirmText: BaseUIElement,
        loc: { lon: number; lat: number },
        confirm: (
            tags: any[],
            location: { lat: number; lon: number },
            snapOntoWayId: WayId | undefined
        ) => void,
        cancel: () => void,
        closePopup: () => void,
        options?: {
            cancelIcon: BaseUIElement
            cancelText?: string | Translation
        }
    ) {
        let confirmButton: BaseUIElement = new SubtleButton(
            preset.icon(),
            new Combine([confirmText]).SetClass("flex flex-col")
        )
            .SetClass("font-bold break-words")
            .onClick(() => {
                const globalFilterTagsToAdd: Tag[][] = state.globalFilters.data
                    .filter((gf) => gf.onNewPoint !== undefined)
                    .map((gf) => gf.onNewPoint.tags)
                const globalTags: Tag[] = [].concat(...globalFilterTagsToAdd)
                console.log("Global tags to add are: ", globalTags)
            })

        confirmButton = new Combine([confirmButton])

        let openLayerOrConfirm = confirmButton

        // We assume the number of global filters won't change during the run of the program
        for (let i = 0; i < state.globalFilters.data.length; i++) {
            const hasBeenCheckedOf = new UIEventSource(false)

            const filterConfirmPanel = new VariableUiElement(
                state.globalFilters.map((gfs) => {
                    const gf = gfs[i]
                    const confirm = gf.onNewPoint?.confirmAddNew?.Subs({ preset: preset.title })
                    return new Combine([
                        gf.onNewPoint?.safetyCheck,
                        new SubtleButton(Svg.confirm_svg(), confirm).onClick(() =>
                            hasBeenCheckedOf.setData(true)
                        ),
                    ])
                })
            )

            openLayerOrConfirm = new Toggle(
                openLayerOrConfirm,
                filterConfirmPanel,
                state.globalFilters.map(
                    (f) => hasBeenCheckedOf.data || f[i]?.onNewPoint === undefined,
                    [hasBeenCheckedOf]
                )
            )
        }

        super([openLayerOrConfirm])
    }
}
