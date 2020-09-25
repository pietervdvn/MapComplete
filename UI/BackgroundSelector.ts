import {UIElement} from "./UIElement";
import AvailableBaseLayers from "../Logic/AvailableBaseLayers";
import {DropDown} from "./Input/DropDown";
import Translations from "./i18n/Translations";
import {State} from "../State";
import {UIEventSource} from "../Logic/UIEventSource";
import Combine from "./Base/Combine";

export default class BackgroundSelector extends UIElement {

    private _dropdown: UIElement;
    private readonly state: State;
    private readonly _availableLayers: UIEventSource<any>;

    constructor(state: State) {
        super();
        this.state = state;

        this._availableLayers = new AvailableBaseLayers(state).availableEditorLayers;
        const self = this;
        this._availableLayers.addCallbackAndRun(available => self.CreateDropDown(available));
    }

    private CreateDropDown(available) {
        if(available.length === 0){
            console.warn("NO LAYERS FOUND!")
            return;
        }
        
        const baseLayers: { value: any, shown: string }[] = [];
        for (const i in available) {
            const layer: { url: string, max_zoom: number, license_url: number, name: string, geometry: any, leafletLayer: any } = available[i];
            baseLayers.push({value: layer.leafletLayer, shown: layer.name});

        }

        const dropdown = new DropDown(Translations.t.general.backgroundMap, baseLayers, State.state.bm.CurrentLayer)
        console.log("Installed dropdown with ",baseLayers);
        this._dropdown = dropdown;
    }

    InnerRender(): string {
        return this._dropdown.Render();
    }

}