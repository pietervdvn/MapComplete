import {UIElement} from "../UIElement";
import { FilteredLayer } from "../../Logic/FilteredLayer";
import Translations from "../../UI/i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";

export class CheckBox extends UIElement{
    public readonly isEnabled: UIEventSource<boolean>;
    private readonly _showEnabled: string|UIElement;
    private readonly _showDisabled: string|UIElement;

    constructor(showEnabled: string | UIElement, showDisabled: string | UIElement, data: UIEventSource<boolean> | boolean = false) {
        super(undefined);
        this.isEnabled =
            data instanceof UIEventSource ? data : new UIEventSource(data ?? false);
        this.ListenTo(this.isEnabled);
        this._showEnabled = showEnabled;
        this._showDisabled = showDisabled;
        const self = this;
        this.onClick(() => {
            self.isEnabled.setData(!self.isEnabled.data);
        })

    }

    InnerRender(): string {
        if (this.isEnabled.data) {
            return Translations.W(this._showEnabled).Render();
        } else {
            return Translations.W(this._showDisabled).Render();
        }
    }
    
}