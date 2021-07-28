import {Utils} from "../../Utils";
import {FixedInputElement} from "../Input/FixedInputElement";
import {RadioButton} from "../Input/RadioButton";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import {Translation} from "../i18n/Translation";
import Svg from "../../Svg";
import FilterConfig from "../../Customizations/JSON/FilterConfig";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import {And} from "../../Logic/Tags/And";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import State from "../../State";
import FilteredLayer from "../../Models/FilteredLayer";
import BackgroundSelector from "./BackgroundSelector";


/**
 * Shows the filter
 */

export default class FilterView extends VariableUiElement {
    constructor(filteredLayer: UIEventSource<FilteredLayer[]>) {
        const backgroundSelector =  new Toggle(
            new BackgroundSelector(),
            undefined,
            State.state.featureSwitchBackgroundSlection
        )
        super(
            filteredLayer.map((filteredLayers) =>
                filteredLayers?.map(l => FilterView.createOneFilteredLayerElement(l)).concat(backgroundSelector)
            )
        );
    }

    private static createOneFilteredLayerElement(filteredLayer) {
        if(filteredLayer.layerDef.name   === undefined){
            // Name is not defined: we hide this one
            return undefined;
        }
        const iconStyle = "width:1.5rem;height:1.5rem;margin-left:1.25rem";

        const icon = new Combine([Svg.checkbox_filled]).SetStyle(iconStyle);
        const iconUnselected = new Combine([Svg.checkbox_empty]).SetStyle(
            iconStyle
        );

        if (filteredLayer.layerDef.name === undefined) {
            return;
        }


        const name: Translation = Translations.WT(
            filteredLayer.layerDef.name
        )?.Clone();

        const styledNameChecked = name
            .Clone()
            .SetStyle("font-size:large;padding-left:1.25rem");

        const styledNameUnChecked = name
            .Clone()
            .SetStyle("font-size:large;padding-left:1.25rem");

        const zoomStatus =
            new Toggle(
                undefined,
                Translations.t.general.layerSelection.zoomInToSeeThisLayer.Clone()
                    .SetClass("alert")
                    .SetStyle("display: block ruby;width:min-content;"),
                State.state.locationControl.map(location =>location.zoom >= filteredLayer.layerDef.minzoom )
            )
            

        const style =
            "display:flex;align-items:center;padding:0.5rem 0;";
        const layerChecked = new Combine([icon, styledNameChecked, zoomStatus])
            .SetStyle(style)
            .onClick(() => filteredLayer.isDisplayed.setData(false));

        const layerNotChecked = new Combine([iconUnselected, styledNameUnChecked])
            .SetStyle(style)
            .onClick(() => filteredLayer.isDisplayed.setData(true));


        const filterPanel: BaseUIElement = FilterView.createFilterPanel(filteredLayer)



        return new Toggle(
            new Combine([layerChecked, filterPanel]),
            layerNotChecked,
            filteredLayer.isDisplayed
        );
    }

    static createFilterPanel(flayer: {
        layerDef: LayerConfig,
        appliedFilters: UIEventSource<TagsFilter>
    }): BaseUIElement {
        const layer = flayer.layerDef
        if (layer.filters.length === 0) {
            return undefined;
        }

        let listFilterElements: [BaseUIElement, UIEventSource<TagsFilter>][] = layer.filters.map(
            FilterView.createFilter
        );

        const update = () => {
            let listTagsFilters = Utils.NoNull(
                listFilterElements.map((input) => input[1].data)
            );
            flayer.appliedFilters.setData(new And(listTagsFilters));
        };

        listFilterElements.forEach((inputElement) =>
            inputElement[1].addCallback((_) => update())
        );

        return new Combine(listFilterElements.map(input => input[0].SetClass("mt-3")))
            .SetClass("flex flex-col ml-8 bg-gray-300 rounded-xl p-2")

    }

    static createFilter(filterConfig: FilterConfig): [BaseUIElement, UIEventSource<TagsFilter>] {
        if (filterConfig.options.length === 1) {
            let option = filterConfig.options[0];

            const icon = Svg.checkbox_filled_svg().SetClass("block mr-2");
            const iconUnselected = Svg.checkbox_empty_svg().SetClass("block mr-2");

            const toggle = new Toggle(
                new Combine([icon, option.question.Clone()]).SetClass("flex"),
                new Combine([iconUnselected, option.question.Clone()]).SetClass("flex")
            )
                .ToggleOnClick()
                .SetClass("block m-1")

            return [toggle, toggle.isEnabled.map(enabled => enabled ? option.osmTags : undefined)]
        }

        let options = filterConfig.options;

        const radio = new RadioButton(
            options.map(
                (option) =>
                    new FixedInputElement(option.question.Clone(), option.osmTags)
            ),
            {
                dontStyle: true
            }
        );
        return [radio, radio.GetValue()]
    }
}
