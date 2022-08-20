import {Utils} from "../../Utils";
import {FixedInputElement} from "../Input/FixedInputElement";
import {RadioButton} from "../Input/RadioButton";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle, {ClickableToggle} from "../Input/Toggle";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import {Translation} from "../i18n/Translation";
import Svg from "../../Svg";
import {ImmutableStore, Store, UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
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
import {FixedUiElement} from "../Base/FixedUiElement";
import BaseLayer from "../../Models/BaseLayer";
import Loc from "../../Models/Loc";

export default class FilterView extends VariableUiElement {
    constructor(filteredLayer: Store<FilteredLayer[]>,
                tileLayers: { config: TilesourceConfig, isDisplayed: UIEventSource<boolean> }[],
                state: {
                    availableBackgroundLayers?: Store<BaseLayer[]>,
                    featureSwitchBackgroundSelection?: UIEventSource<boolean>,
                    featureSwitchIsDebugging?: UIEventSource<boolean>,
                    locationControl?: UIEventSource<Loc>
                }) {
        const backgroundSelector = new Toggle(
            new BackgroundSelector(state),
            undefined,
            state.featureSwitchBackgroundSelection ?? new ImmutableStore(false)
        )
        super(
            filteredLayer.map((filteredLayers) => {
                    // Create the views which toggle layers (and filters them) ...
                    let elements = filteredLayers
                        ?.map(l => FilterView.createOneFilteredLayerElement(l, state)?.SetClass("filter-panel"))
                        ?.filter(l => l !== undefined)
                    elements[0].SetClass("first-filter-panel")

                    // ... create views for non-interactive layers ...
                    elements = elements.concat(tileLayers.map(tl => FilterView.createOverlayToggle(state, tl)))
                    // ... and add the dropdown to select a different background
                    return elements.concat(backgroundSelector);
                }
            )
        );
    }

    private static createOverlayToggle(state: { locationControl?: UIEventSource<Loc> }, config: { config: TilesourceConfig, isDisplayed: UIEventSource<boolean> }) {

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
                state.locationControl?.map(location => location.zoom >= config.config.minzoom) ?? new ImmutableStore(false)
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

    private static createOneFilteredLayerElement(filteredLayer: FilteredLayer,
                                                 state: { featureSwitchIsDebugging?: Store<boolean>, locationControl?: Store<Loc> }) {
        if (filteredLayer.layerDef.name === undefined) {
            // Name is not defined: we hide this one
            return new Toggle(
                new FixedUiElement(filteredLayer?.layerDef?.id).SetClass("block"),
                undefined,
                state?.featureSwitchIsDebugging ?? new ImmutableStore(false)
            );
        }
        const iconStyle = "width:1.5rem;height:1.5rem;margin-left:1.25rem;flex-shrink: 0;";

        const icon = new Combine([Svg.checkbox_filled]).SetStyle(iconStyle);
        const layer = filteredLayer.layerDef

        const iconUnselected = new Combine([Svg.checkbox_empty]).SetStyle(
            iconStyle
        );

        const name: Translation = filteredLayer.layerDef.name.Clone()

        const styledNameChecked = name.Clone().SetStyle("font-size:large").SetClass("ml-3");

        const styledNameUnChecked = name.Clone().SetStyle("font-size:large").SetClass("ml-3");

        const zoomStatus =
            new Toggle(
                undefined,
                Translations.t.general.layerSelection.zoomInToSeeThisLayer
                    .SetClass("alert")
                    .SetStyle("display: block ruby;width:min-content;"),
                state?.locationControl?.map(location => location.zoom >= filteredLayer.layerDef.minzoom) ?? new ImmutableStore(false)
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


        const filterPanel: BaseUIElement = new LayerFilterPanel(state, filteredLayer)


        return new Toggle(
            new Combine([layerChecked, filterPanel]),
            layerNotChecked,
            filteredLayer.isDisplayed
        );
    }
}

export class LayerFilterPanel extends Combine {

    public constructor(state: any, flayer: FilteredLayer) {
        const layer = flayer.layerDef
        if (layer.filters.length === 0) {
            return undefined;
        }


        const toShow: BaseUIElement [] = []

        for (const filter of layer.filters) {

            const [ui, actualTags] = LayerFilterPanel.createFilter(state, filter)

            ui.SetClass("mt-1")
            toShow.push(ui)
            actualTags.addCallback(tagsToFilterFor => {
                flayer.appliedFilters.data.set(filter.id, tagsToFilterFor)
                flayer.appliedFilters.ping()
            })
            flayer.appliedFilters.map(dict => dict.get(filter.id))
                .addCallbackAndRun(filters => actualTags.setData(filters))


        }

        super(toShow)
        this.SetClass("flex flex-col p-2 ml-12 pl-1 pt-0 layer-filters")
    }

    // Filter which uses one or more textfields
    private static createFilterWithFields(state: any, filterConfig: FilterConfig): [BaseUIElement, UIEventSource<FilterState>] {

        const filter = filterConfig.options[0]
        const mappings = new Map<string, BaseUIElement>()
        let allValid: Store<boolean> = new ImmutableStore(true)
        var allFields: InputElement<string>[] = []
        const properties = new UIEventSource<any>({})
        for (const {name, type} of filter.fields) {
            const value = QueryParameters.GetQueryParameter("filter-" + filterConfig.id + "-" + name, "", "Value for filter " + filterConfig.id)
            const field = ValidatedTextField.ForType(type).ConstructInputElement({
                value
            }).SetClass("inline-block")
            mappings.set(name, field)
            const stable = value.stabilized(250)
            stable.addCallbackAndRunD(v => {
                properties.data[name] = v.toLowerCase();
                properties.ping()
            })
            allFields.push(field)
            allValid = allValid.map(previous => previous && field.IsValid(stable.data) && stable.data !== "", [stable])
        }
        const tr = new SubstitutedTranslation(filter.question, new UIEventSource<any>({id: filterConfig.id}), state, mappings)
        const trigger: Store<FilterState> = allValid.map(isValid => {
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

        const settableFilter = new UIEventSource<FilterState>(undefined)
        trigger.addCallbackAndRun(state => settableFilter.setData(state))
        settableFilter.addCallback(state => {
            if (state === undefined) {
                // still initializing
                return
            }
            if (state.currentFilter === undefined) {
                allFields.forEach(f => f.GetValue().setData(undefined));
            }
        })

        return [tr, settableFilter];
    }

    private static createCheckboxFilter(filterConfig: FilterConfig): [BaseUIElement, UIEventSource<FilterState>] {
        let option = filterConfig.options[0];

        const icon = Svg.checkbox_filled_svg().SetClass("block mr-2 w-6");
        const iconUnselected = Svg.checkbox_empty_svg().SetClass("block mr-2 w-6");

        const toggle = new ClickableToggle(
            new Combine([icon, option.question.Clone().SetClass("block")]).SetClass("flex"),
            new Combine([iconUnselected, option.question.Clone().SetClass("block")]).SetClass("flex")
        )
            .ToggleOnClick()
            .SetClass("block m-1")

        return [toggle, toggle.isEnabled.sync(enabled => enabled ? {
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
            filterPicker.GetValue().sync(
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

    private static createFilter(state: {}, filterConfig: FilterConfig): [BaseUIElement, UIEventSource<FilterState>] {

        if (filterConfig.options[0].fields.length > 0) {
            return LayerFilterPanel.createFilterWithFields(state, filterConfig)
        }


        if (filterConfig.options.length === 1) {
            return LayerFilterPanel.createCheckboxFilter(filterConfig)
        }

        const filter = LayerFilterPanel.createMultiFilter(filterConfig)
        filter[0].SetClass("pl-2")
        return filter
    }
}
