import {UIElement} from "../UIElement";
import {DropDown} from "../Input/DropDown";
import Translations from "../i18n/Translations";
import State from "../../State";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseLayer from "../../Models/BaseLayer";

export default class BackgroundSelector extends UIElement {

    private _dropdown: UIElement;
    private readonly _availableLayers: UIEventSource<BaseLayer[]>;

    constructor() {
        super();
        const self = this;
        this._availableLayers = State.state.availableBackgroundLayers;
        this._availableLayers.addCallbackAndRun(available => self.CreateDropDown(available));
    }

    private CreateDropDown(available) {
        if(available.length === 0){
            return;
        }
        
        const baseLayers: { value: BaseLayer, shown: string }[] = [];
        for (const i in available) {
            const layer: BaseLayer = available[i];
            baseLayers.push({value: layer, shown: layer.name ?? "id:" + layer.id});
        }

        this._dropdown = new DropDown(Translations.t.general.backgroundMap, baseLayers, State.state.backgroundLayer);
    }

    InnerRender(): string {
        return this._dropdown.Render();
    }

}