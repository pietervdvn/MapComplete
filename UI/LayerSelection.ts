import {UIElement} from "./UIElement";
import {CheckBox} from "./Input/CheckBox";
import Combine from "./Base/Combine";
import {Img} from "./Img";
import {State} from "../State";
import Translations from "./i18n/Translations";

export class LayerSelection extends UIElement {

    private readonly _checkboxes: UIElement[];

    constructor() {
        super(undefined);
        this._checkboxes = [];

        for (const layer of State.state.filteredLayers.data) {
            const checkbox = Img.checkmark;
            let icon = "";
            if (layer.layerDef.icon && layer.layerDef.icon !== "") {
                icon = `<img width="20" height="20" src="${layer.layerDef.icon}">`
            }
            const name = Translations.WT(layer.layerDef.name).Clone()
                .SetStyle("font-size:large;");

            this._checkboxes.push(new CheckBox(
                new Combine([checkbox, icon, name]),
                new Combine([Img.no_checkmark, icon, name]),
                layer.isDisplayed)
                .SetStyle("margin:0.3em;")
            );
        }
    }

    InnerRender(): string {
        return new Combine(this._checkboxes)
            .SetStyle("display:flex;flex-direction:column;")
            .Render();
    }

}