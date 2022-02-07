import {UIEventSource} from "../../Logic/UIEventSource";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import BaseUIElement from "../BaseUIElement";
import LocationInput from "../Input/LocationInput";
import AvailableBaseLayers from "../../Logic/Actors/AvailableBaseLayers";
import {BBox} from "../../Logic/BBox";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import {SubtleButton} from "../Base/SubtleButton";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import Svg from "../../Svg";
import Toggle from "../Input/Toggle";
import SimpleAddUI, {PresetInfo} from "../BigComponents/SimpleAddUI";
import BaseLayer from "../../Models/BaseLayer";

export default class ConfirmLocationOfPoint extends Combine {


    constructor(
        state: {
            featureSwitchIsTesting: UIEventSource<boolean>;
            osmConnection: OsmConnection,
            featurePipeline: FeaturePipeline,
            backgroundLayer?: UIEventSource<BaseLayer>
        },
        filterViewIsOpened: UIEventSource<boolean>,
        preset: PresetInfo,
        confirmText: BaseUIElement,
        loc: { lon: number, lat: number },
        confirm: (tags: any[], location: { lat: number, lon: number }, snapOntoWayId: string) => void,
        cancel: () => void,
        closePopup: () => void
    ) {

        let preciseInput: LocationInput = undefined
        if (preset.preciseInput !== undefined) {
            // We uncouple the event source
            const zloc = {...loc, zoom: 19}
            const locationSrc = new UIEventSource(zloc);

            let backgroundLayer = new UIEventSource(state?.backgroundLayer?.data ?? AvailableBaseLayers.osmCarto);
            if (preset.preciseInput.preferredBackground) {
                const defaultBackground = AvailableBaseLayers.SelectBestLayerAccordingTo(locationSrc, new UIEventSource<string | string[]>(preset.preciseInput.preferredBackground));
                // Note that we _break the link_ here, as the minimap will take care of the switching!
                backgroundLayer.setData(defaultBackground.data)
            }

            let snapToFeatures: UIEventSource<{ feature: any }[]> = undefined
            let mapBounds: UIEventSource<BBox> = undefined
            if (preset.preciseInput.snapToLayers && preset.preciseInput.snapToLayers.length > 0) {
                snapToFeatures = new UIEventSource<{ feature: any }[]>([])
                mapBounds = new UIEventSource<BBox>(undefined)
            }


            const tags = TagUtils.KVtoProperties(preset.tags ?? []);
            preciseInput = new LocationInput({
                mapBackground: backgroundLayer,
                centerLocation: locationSrc,
                snapTo: snapToFeatures,
                snappedPointTags: tags,
                maxSnapDistance: preset.preciseInput.maxSnapDistance,
                bounds: mapBounds
            })
            preciseInput.installBounds(preset.boundsFactor ?? 0.25, true)
            preciseInput.SetClass("h-32 rounded-xl overflow-hidden border border-gray").SetStyle("height: 12rem;")


            if (preset.preciseInput.snapToLayers && preset.preciseInput.snapToLayers.length > 0) {
                // We have to snap to certain layers.
                // Lets fetch them

                let loadedBbox: BBox = undefined
                mapBounds?.addCallbackAndRunD(bbox => {
                    if (loadedBbox !== undefined && bbox.isContainedIn(loadedBbox)) {
                        // All is already there
                        // return;
                    }

                    bbox = bbox.pad(Math.max(preset.boundsFactor ?? 0.25, 2), Math.max(preset.boundsFactor ?? 0.25, 2));
                    loadedBbox = bbox;
                    const allFeatures: { feature: any }[] = []
                    preset.preciseInput.snapToLayers.forEach(layerId => {
                        console.log("Snapping to", layerId)
                        state.featurePipeline.GetFeaturesWithin(layerId, bbox)?.forEach(feats => allFeatures.push(...feats.map(f => ({feature: f}))))
                    })
                    console.log("Snapping to", allFeatures)
                    snapToFeatures.setData(allFeatures)
                })
            }

        }


        let confirmButton: BaseUIElement = new SubtleButton(preset.icon(),
            new Combine([
                confirmText,
                Translations.t.general.add.warnVisibleForEveryone.Clone().SetClass("alert")
            ]).SetClass("flex flex-col")
        ).SetClass("font-bold break-words")
            .onClick(() => {
                console.log("The confirmLocationPanel - precise input yielded ", preciseInput?.GetValue()?.data)
                confirm(preset.tags, preciseInput?.GetValue()?.data ?? loc, preciseInput?.snappedOnto?.data?.properties?.id);
            });

        if (preciseInput !== undefined) {
            confirmButton = new Combine([preciseInput, confirmButton])
        }

        const openLayerControl =
            new SubtleButton(
                Svg.layers_ui(),
                new Combine([
                    Translations.t.general.add.layerNotEnabled
                        .Subs({layer: preset.layerToAddTo.layerDef.name})
                        .SetClass("alert"),
                    Translations.t.general.add.openLayerControl
                ])
            )
                .onClick(() => filterViewIsOpened.setData(true))


        const openLayerOrConfirm = new Toggle(
            confirmButton,
            openLayerControl,
            preset.layerToAddTo.isDisplayed
        )

        const disableFilter = new SubtleButton(
            new Combine([
                Svg.filter_ui().SetClass("absolute w-full"),
                Svg.cross_bottom_right_svg().SetClass("absolute red-svg")
            ]).SetClass("relative"),
            new Combine(
                [
                    Translations.t.general.add.disableFiltersExplanation.Clone(),
                    Translations.t.general.add.disableFilters.Clone().SetClass("text-xl")
                ]
            ).SetClass("flex flex-col")
        ).onClick(() => {

            const appliedFilters = preset.layerToAddTo.appliedFilters;
            appliedFilters.data.forEach((_, k) => appliedFilters.data.set(k, undefined))
            appliedFilters.ping()
            cancel()
            closePopup()
        })

        const hasActiveFilter = preset.layerToAddTo.appliedFilters
            .map(appliedFilters => {
                const activeFilters = Array.from(appliedFilters.values()).filter(f => f?.currentFilter !== undefined);
                return activeFilters.length === 0;
            })

        // If at least one filter is active which _might_ hide a newly added item, this blocks the preset and requests the filter to be disabled
        const disableFiltersOrConfirm = new Toggle(
            openLayerOrConfirm,
            disableFilter,
            hasActiveFilter)


        const tagInfo = SimpleAddUI.CreateTagInfoFor(preset, state.osmConnection);

        const cancelButton = new SubtleButton(Svg.close_ui(),
            Translations.t.general.cancel
        ).onClick(cancel)

        super([
            new Toggle(
                Translations.t.general.testing.SetClass("alert"),
                undefined,
                state.featureSwitchIsTesting
            ),
            disableFiltersOrConfirm,
            cancelButton,
            preset.description,
            tagInfo

        ])

        this.SetClass("flex flex-col")

    }

}