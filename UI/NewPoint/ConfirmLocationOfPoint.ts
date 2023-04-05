import { UIEventSource } from "../../Logic/UIEventSource"
import BaseUIElement from "../BaseUIElement"
import LocationInput from "../Input/LocationInput"
import { BBox } from "../../Logic/BBox"
import { TagUtils } from "../../Logic/Tags/TagUtils"
import { SubtleButton } from "../Base/SubtleButton"
import Combine from "../Base/Combine"
import Translations from "../i18n/Translations"
import Svg from "../../Svg"
import Toggle from "../Input/Toggle"
import { PresetInfo } from "../BigComponents/SimpleAddUI"
import Title from "../Base/Title"
import { VariableUiElement } from "../Base/VariableUIElement"
import { Tag } from "../../Logic/Tags/Tag"
import { WayId } from "../../Models/OsmFeature"
import { Translation } from "../i18n/Translation"
import { Feature } from "geojson"
import { AvailableRasterLayers } from "../../Models/RasterLayers"
import { SpecialVisualizationState } from "../SpecialVisualization"
import ClippedFeatureSource from "../../Logic/FeatureSource/Sources/ClippedFeatureSource"

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
        let preciseInput: LocationInput = undefined
        if (preset.preciseInput !== undefined) {
            // Create location input

            // We uncouple the event source
            const zloc = { ...loc, zoom: 19 }
            const locationSrc = new UIEventSource(zloc)

            let backgroundLayer = new UIEventSource(
                state?.mapProperties.rasterLayer?.data ?? AvailableRasterLayers.osmCarto
            )
            if (preset.preciseInput.preferredBackground) {
                const defaultBackground = AvailableRasterLayers.SelectBestLayerAccordingTo(
                    locationSrc,
                    new UIEventSource<string | string[]>(preset.preciseInput.preferredBackground)
                )
                // Note that we _break the link_ here, as the minimap will take care of the switching!
                backgroundLayer.setData(defaultBackground.data)
            }

            let snapToFeatures: UIEventSource<Feature[]> = undefined
            let mapBounds: UIEventSource<BBox> = undefined
            if (preset.preciseInput.snapToLayers && preset.preciseInput.snapToLayers.length > 0) {
                snapToFeatures = new UIEventSource<Feature[]>([])
                mapBounds = new UIEventSource<BBox>(undefined)
            }

            const tags = TagUtils.KVtoProperties(preset.tags ?? [])
            preciseInput = new LocationInput({
                mapBackground: backgroundLayer,
                centerLocation: locationSrc,
                snapTo: snapToFeatures,
                renderLayerForSnappedPoint: preset.layerToAddTo.layerDef,
                snappedPointTags: tags,
                maxSnapDistance: preset.preciseInput.maxSnapDistance,
                bounds: mapBounds,
                state: <any>state,
            })
            preciseInput.installBounds(preset.boundsFactor ?? 0.25, true)
            preciseInput
                .SetClass("rounded-xl overflow-hidden border border-gray")
                .SetStyle("height: 18rem; max-height: 50vh")

            if (preset.preciseInput.snapToLayers && preset.preciseInput.snapToLayers.length > 0) {
                // We have to snap to certain layers.
                // Lets fetch them

                let loadedBbox: BBox = undefined
                mapBounds?.addCallbackAndRunD((bbox) => {
                    if (loadedBbox !== undefined && bbox.isContainedIn(loadedBbox)) {
                        // All is already there
                        // return;
                    }

                    bbox = bbox.pad(
                        Math.max(preset.boundsFactor ?? 0.25, 2),
                        Math.max(preset.boundsFactor ?? 0.25, 2)
                    )
                    loadedBbox = bbox
                    const sources = preset.preciseInput.snapToLayers.map(
                        (layerId) =>
                            new ClippedFeatureSource(
                                state.perLayer.get(layerId),
                                bbox.asGeoJson({})
                            )
                    )
                })
            }
        }

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
                confirm(
                    [...preset.tags, ...globalTags],
                    preciseInput?.GetValue()?.data ?? loc,
                    preciseInput?.snappedOnto?.data?.properties?.id
                )
            })

        if (preciseInput !== undefined) {
            confirmButton = new Combine([preciseInput, confirmButton])
        } else {
            confirmButton = new Combine([confirmButton])
        }

        let openLayerOrConfirm = confirmButton

        const disableFilter = new SubtleButton(
            new Combine([
                Svg.filter_ui().SetClass("absolute w-full"),
                Svg.cross_bottom_right_svg().SetClass("absolute red-svg"),
            ]).SetClass("relative"),
            new Combine([
                Translations.t.general.add.disableFiltersExplanation.Clone(),
                Translations.t.general.add.disableFilters.Clone().SetClass("text-xl"),
            ]).SetClass("flex flex-col")
        ).onClick(() => {
            const appliedFilters = preset.layerToAddTo.appliedFilters
            appliedFilters.data.forEach((_, k) => appliedFilters.data.set(k, undefined))
            appliedFilters.ping()
            cancel()
            closePopup()
        })

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

        // If at least one filter is active which _might_ hide a newly added item, this blocks the preset and requests the filter to be disabled
        const disableFiltersOrConfirm = new Toggle(openLayerOrConfirm, disableFilter)

        const cancelButton = new SubtleButton(
            options?.cancelIcon ?? Svg.close_ui(),
            options?.cancelText ?? Translations.t.general.cancel
        ).onClick(cancel)

        let examples: BaseUIElement = undefined
        if (preset.exampleImages !== undefined && preset.exampleImages.length > 0) {
            examples = new Combine([new Title()])
        }

        super([
            new Toggle(
                Translations.t.general.testing.SetClass("alert"),
                undefined,
                state.featureSwitchIsTesting
            ),
            disableFiltersOrConfirm,
            cancelButton,
            preset.description,
            examples,
        ])

        this.SetClass("flex flex-col")
    }
}
