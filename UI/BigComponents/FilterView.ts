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
import FilteredLayer, {FilterState} from "../../Models/FilteredLayer";
import BackgroundSelector from "./BackgroundSelector";
import FilterConfig from "../../Models/ThemeConfig/FilterConfig";
import TilesourceConfig from "../../Models/ThemeConfig/TilesourceConfig";
import {SubstitutedTranslation} from "../SubstitutedTranslation";
import ValidatedTextField from "../Input/ValidatedTextField";
import {QueryParameters} from "../../Logic/Web/QueryParameters";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import {InputElement} from "../Input/InputElement";
import {DropDown} from "../Input/DropDown";

export default class FilterView extends VariableUiElement {
    constructor(filteredLayer: UIEventSource<FilteredLayer[]>, 
                tileLayers: { config: TilesourceConfig, isDisplayed: UIEventSource<boolean> }[]) {
        const backgroundSelector = new Toggle(
            new BackgroundSelector(),
            undefined,
            State.state.featureSwitchBackgroundSelection
        )
        super(
            filteredLayer.map((filteredLayers) => {
                    // Create the views which toggle layers (and filters them) ...
                    let elements = filteredLayers
                        ?.map(l => FilterView.createOneFilteredLayerElement(l)?.SetClass("filter-panel"))
                        ?.filter(l => l !== undefined)
                    elements[0].SetClass("first-filter-panel")
                
                    // ... create views for non-interactive layers ...
                    elements = elements.concat(tileLayers.map(tl => FilterView.createOverlayToggle(tl)))
                    // ... and add the dropdown to select a different background
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


        const toggleClasses = "layer-toggle flex flex-wrap items-center pt-2 pb-2 px-0";
        const layerIcon = layer.defaultIcon()?.SetClass("flex-shrink-0 w-8 h-8 ml-2")
        const layerIconUnchecked = layer.defaultIcon()?.SetClass("flex-shrink-0 opacity-50  w-8 h-8 ml-2")

        const layerChecked = new Combine([icon, layerIcon, styledNameChecked, zoomStatus])
            .SetClass(toggleClasses)
            .onClick(() => filteredLayer.isDisplayed.setData(false));

        const layerNotChecked = new Combine([iconUnselected, layerIconUnchecked, styledNameUnChecked])
            .SetClass(toggleClasses)
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


        const toShow: BaseUIElement [] = []

        for (const filter of layer.filters) {

            const [ui, actualTags] = FilterView.createFilter(filter)

            ui.SetClass("mt-1")
            toShow.push(ui)
            actualTags.addCallback(tagsToFilterFor => {
                flayer.appliedFilters.data.set(filter.id, tagsToFilterFor)
                flayer.appliedFilters.ping()
            })
            flayer.appliedFilters.map(dict => dict.get(filter.id))
                .addCallbackAndRun(filters => actualTags.setData(filters))


        }

        return new Combine(toShow)
            .SetClass("flex flex-col p-2 ml-12 pl-1 pt-0 layer-filters")

    }

    // Filter which uses one or more textfields
    private static createFilterWithFields(filterConfig: FilterConfig): [BaseUIElement, UIEventSource<FilterState>] {

        const filter = filterConfig.options[0]
        const mappings = new Map<string, BaseUIElement>()
        let allValid = new UIEventSource(true)
        const properties = new UIEventSource<any>({})
        for (const {name, type} of filter.fields) {
            const value = QueryParameters.GetQueryParameter("filter-" + filterConfig.id + "-" + name, "", "Value for filter " + filterConfig.id)
            const field = ValidatedTextField.InputForType(type, {
                value
            }).SetClass("inline-block")
            mappings.set(name, field)
            const stable = value.stabilized(250)
            stable.addCallbackAndRunD(v => {
                properties.data[name] = v.toLowerCase();
                properties.ping()
            })
            allValid = allValid.map(previous => previous && field.IsValid(stable.data) && stable.data !== "", [stable])
        }
        const tr = new SubstitutedTranslation(filter.question, new UIEventSource<any>({id: filterConfig.id}), State.state, mappings)
        const trigger: UIEventSource<FilterState> = allValid.map(isValid => {
            if (!isValid) {
                return undefined
            }
            const props = properties.data
            // Replace all the field occurences in the tags...
            const tagsSpec = Utils.WalkJson(filter.originalTagsSpec,
                v => {
                    if (typeof v !== "string") {
                        return v
                    }

                    for (const key in props) {
                        v = (<string>v).replace("{" + key + "}", props[key])
                    }

                    return v
                }
            )
            const tagsFilter = TagUtils.Tag(tagsSpec)
            return {
                currentFilter: tagsFilter,
                state: JSON.stringify(props)
            }
        }, [properties])

        return [tr, trigger];
    }

    private static createCheckboxFilter(filterConfig: FilterConfig): [BaseUIElement, UIEventSource<FilterState>] {
        let option = filterConfig.options[0];

        const icon = Svg.checkbox_filled_svg().SetClass("block mr-2 w-6");
        const iconUnselected = Svg.checkbox_empty_svg().SetClass("block mr-2 w-6");

        const toggle = new Toggle(
            new Combine([icon, option.question.Clone().SetClass("block")]).SetClass("flex"),
            new Combine([iconUnselected, option.question.Clone().SetClass("block")]).SetClass("flex")
        )
            .ToggleOnClick()
            .SetClass("block m-1")

        return [toggle, toggle.isEnabled.map(enabled => enabled ? {
                currentFilter: option.osmTags,
                state: "true"
            } : undefined, [],
            f => f !== undefined)
        ]
    }

    private static createMultiFilter(filterConfig: FilterConfig): [BaseUIElement, UIEventSource<FilterState>] {

        let options = filterConfig.options;

        const values: FilterState[] = options.map((f, i) => ({
            currentFilter: f.osmTags, state: i
        }))
        let filterPicker: InputElement<number>

        if (options.length <= 6) {
            filterPicker = new RadioButton(
                options.map(
                    (option, i) =>
                        new FixedInputElement(option.question.Clone().SetClass("block"), i)
                ),
                {
                    dontStyle: true
                }
            );
        } else {
            filterPicker = new DropDown("", options.map((option, i) => ({
                value: i, shown: option.question.Clone()
            })))
        }

        return [filterPicker,
            filterPicker.GetValue().map(
                i => values[i],
                [],
                selected => {
                    const v = selected?.state
                    if (v === undefined || typeof v === "string") {
                        return undefined
                    }
                    return v
                }
            )]
    }

    private static createFilter(filterConfig: FilterConfig): [BaseUIElement, UIEventSource<FilterState>] {

        if (filterConfig.options[0].fields.length > 0) {
            return FilterView.createFilterWithFields(filterConfig)
        }


        if (filterConfig.options.length === 1) {
            return FilterView.createCheckboxFilter(filterConfig)
        }

        const filter = FilterView.createMultiFilter(filterConfig)
        filter[0].SetClass("pl-2")
        return filter
    }
}
