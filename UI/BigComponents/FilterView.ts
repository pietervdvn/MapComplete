import {Utils} from "../../Utils";
import {FixedInputElement} from "../Input/FixedInputElement";
import {RadioButton} from "../Input/RadioButton";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import {Translation} from "../i18n/Translation";
import Svg from "../../Svg";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import State from "../../State";
import FilteredLayer from "../../Models/FilteredLayer";
import BackgroundSelector from "./BackgroundSelector";
import FilterConfig from "../../Models/ThemeConfig/FilterConfig";
import TilesourceConfig from "../../Models/ThemeConfig/TilesourceConfig";

export default class FilterView extends VariableUiElement {
    constructor(filteredLayer: UIEventSource<FilteredLayer[]>, tileLayers: { config: TilesourceConfig, isDisplayed: UIEventSource<boolean> }[]) {
        const backgroundSelector = new Toggle(
            new BackgroundSelector(),
            undefined,
            State.state.featureSwitchBackgroundSelection
        )
        super(
            filteredLayer.map((filteredLayers) => {
                    let elements = filteredLayers?.map(l => FilterView.createOneFilteredLayerElement(l))
                    elements = elements.concat(tileLayers.map(tl => FilterView.createOverlayToggle(tl)))
                    return elements.concat(backgroundSelector);
                }
            )
        );
    }

    private static createOverlayToggle(config: { config: TilesourceConfig, isDisplayed: UIEventSource<boolean> }) {

        const iconStyle = "width:1.5rem;height:1.5rem;margin-left:1.25rem;flex-shrink: 0;";

        const icon = new Combine([Svg.checkbox_filled]).SetStyle(iconStyle);
        const iconUnselected = new Combine([Svg.checkbox_empty]).SetStyle(
            iconStyle
        );
        const name: Translation = config.config.name;

        const styledNameChecked = name.Clone().SetStyle("font-size:large").SetClass("ml-2");
        const styledNameUnChecked = name.Clone().SetStyle("font-size:large").SetClass("ml-2");

        const zoomStatus =
            new Toggle(
                undefined,
                Translations.t.general.layerSelection.zoomInToSeeThisLayer
                    .SetClass("alert")
                    .SetStyle("display: block ruby;width:min-content;"),
                State.state.locationControl.map(location => location.zoom >= config.config.minzoom)
            )


        const style =
            "display:flex;align-items:center;padding:0.5rem 0;";
        const layerChecked = new Combine([icon, styledNameChecked, zoomStatus])
            .SetStyle(style)
            .onClick(() => config.isDisplayed.setData(false));

        const layerNotChecked = new Combine([iconUnselected, styledNameUnChecked])
            .SetStyle(style)
            .onClick(() => config.isDisplayed.setData(true));


        return new Toggle(
            layerChecked,
            layerNotChecked,
            config.isDisplayed
        );
    }

    private static createOneFilteredLayerElement(filteredLayer: FilteredLayer) {
        if (filteredLayer.layerDef.name === undefined) {
            // Name is not defined: we hide this one
            return undefined;
        }
        const iconStyle = "width:1.5rem;height:1.5rem;margin-left:1.25rem;flex-shrink: 0;";

        const icon = new Combine([Svg.checkbox_filled]).SetStyle(iconStyle);
        const layer = filteredLayer.layerDef

        const iconUnselected = new Combine([Svg.checkbox_empty]).SetStyle(
            iconStyle
        );

        if (filteredLayer.layerDef.name === undefined) {
            return;
        }


        const name: Translation = Translations.WT(
            filteredLayer.layerDef.name
        );

        const styledNameChecked = name.Clone().SetStyle("font-size:large").SetClass("ml-3");

        const styledNameUnChecked = name.Clone().SetStyle("font-size:large").SetClass("ml-3");

        const zoomStatus =
            new Toggle(
                undefined,
                Translations.t.general.layerSelection.zoomInToSeeThisLayer
                    .SetClass("alert")
                    .SetStyle("display: block ruby;width:min-content;"),
                State.state.locationControl.map(location => location.zoom >= filteredLayer.layerDef.minzoom)
            )


        const style =
            "display:flex;align-items:center;padding:0.5rem 0;";
        const layerIcon = layer.defaultIcon()?.SetClass("w-8 h-8 ml-2")
        const layerIconUnchecked = layer.defaultIcon()?.SetClass("opacity-50  w-8 h-8 ml-2")

        const layerChecked = new Combine([icon, layerIcon, styledNameChecked, zoomStatus])
            .SetStyle(style)
            .onClick(() => filteredLayer.isDisplayed.setData(false));

        const layerNotChecked = new Combine([iconUnselected, layerIconUnchecked, styledNameUnChecked])
            .SetStyle(style)
            .onClick(() => filteredLayer.isDisplayed.setData(true));


        const filterPanel: BaseUIElement = FilterView.createFilterPanel(filteredLayer)


        return new Toggle(
            new Combine([layerChecked, filterPanel]),
            layerNotChecked,
            filteredLayer.isDisplayed
        );
    }

    private static createFilterPanel(flayer: FilteredLayer): BaseUIElement {
        const layer = flayer.layerDef
        if (layer.filters.length === 0) {
            return undefined;
        }

        const filterIndexes = new Map<string, number>()
        layer.filters.forEach((f, i) => filterIndexes.set(f.id, i))

        let listFilterElements: [BaseUIElement, UIEventSource<{ filter: FilterConfig, selected: number }>][] = layer.filters.map(
            FilterView.createFilter
        );

        listFilterElements.forEach((inputElement, i) =>
            inputElement[1].addCallback((changed) => {
                const oldValue = flayer.appliedFilters.data

                if (changed === undefined) {
                    // Lets figure out which filter should be removed
                    // We know this inputElement corresponds with layer.filters[i]
                    // SO, if there is a value in 'oldValue' with this filter, we have to recalculated
                    if (!oldValue.some(f => f.filter === layer.filters[i])) {
                        // The filter to remove is already gone, we can stop
                        return;
                    }
                } else if (oldValue.some(f => f.filter === changed.filter && f.selected === changed.selected)) {
                    // The changed value is already there
                    return;
                }
                const listTagsFilters = Utils.NoNull(
                    listFilterElements.map((input) => input[1].data)
                );

                flayer.appliedFilters.setData(listTagsFilters);
            })
        );

        flayer.appliedFilters.addCallbackAndRun(appliedFilters => {
            for (let i = 0; i < layer.filters.length; i++) {
                const filter = layer.filters[i];
                let foundMatch = undefined
                for (const appliedFilter of appliedFilters) {
                    if (appliedFilter.filter === filter) {
                        foundMatch = appliedFilter
                        break;
                    }
                }

                listFilterElements[i][1].setData(foundMatch)
            }

        })

        return new Combine(listFilterElements.map(input => input[0].SetClass("mt-3")))
            .SetClass("flex flex-col ml-8 bg-gray-300 rounded-xl p-2")

    }

    private static createFilter(filterConfig: FilterConfig): [BaseUIElement, UIEventSource<{ filter: FilterConfig, selected: number }>] {
        if (filterConfig.options.length === 1) {
            let option = filterConfig.options[0];

            const icon = Svg.checkbox_filled_svg().SetClass("block mr-2 w-6");
            const iconUnselected = Svg.checkbox_empty_svg().SetClass("block mr-2 w-6");

            const toggle = new Toggle(
                new Combine([icon, option.question.Clone().SetClass("block")]).SetClass("flex"),
                new Combine([iconUnselected, option.question.Clone().SetClass("block")]).SetClass("flex")
            )
                .ToggleOnClick()
                .SetClass("block m-1")

            const selected = {
                filter: filterConfig,
                selected: 0
            }
            return [toggle, toggle.isEnabled.map(enabled => enabled ? selected : undefined, [],
                f => f?.filter === filterConfig && f?.selected === 0)
            ]
        }

        let options = filterConfig.options;

        const values = options.map((f, i) => ({
            filter: filterConfig, selected: i
        }))
        const radio = new RadioButton(
            options.map(
                (option, i) =>
                    new FixedInputElement(option.question.Clone().SetClass("block"), i)
            ),
            {
                dontStyle: true
            }
        );
        return [radio,
            radio.GetValue().map(
                i => values[i],
                [],
                selected => {
                    return selected?.selected
                }
            )]
    }
}
