import {DropDown} from "../Input/DropDown";
import Translations from "../i18n/Translations";
import State from "../../State";
import BaseLayer from "../../Models/BaseLayer";
import {VariableUiElement} from "../Base/VariableUIElement";
import {Store} from "../../Logic/UIEventSource";

export default class BackgroundSelector extends VariableUiElement {

    constructor(state: {availableBackgroundLayers?:Store<BaseLayer[]>} ) {
        const available = state.availableBackgroundLayers?.map(available => {
            if(available === undefined){
                return undefined
            }
                const baseLayers: { value: BaseLayer, shown: string }[] = [];
                for (const i in available) {
                    if (!available.hasOwnProperty(i)) {
                        continue;
                    }
                    const layer: BaseLayer = available[i];
                    baseLayers.push({value: layer, shown: layer.name ?? "id:" + layer.id});
                }
                return baseLayers
            }
        )

        super(
            available?.map(baseLayers => {
                    if (baseLayers === undefined || baseLayers.length <= 1) {
                        return undefined;
                    }
                    return new DropDown(Translations.t.general.backgroundMap.Clone(), baseLayers, State.state.backgroundLayer, {
                        select_class: 'bg-indigo-100 p-1 rounded hover:bg-indigo-200 w-full'
                    })
                }
            )
        )

    }

}