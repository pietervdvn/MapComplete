import {UIElement} from "../UIElement";
import {UIEventSource} from "../UIEventSource";
import { FilteredLayer } from "../../Logic/FilteredLayer";
import Translations from "../../UI/i18n/Translations";
import instantiate = WebAssembly.instantiate;


export class CheckBox extends UIElement{
    private data: UIEventSource<boolean>;

    private readonly _data: UIEventSource<boolean>;
    private readonly _showEnabled: string|UIElement;
    private readonly _showDisabled: string|UIElement;

    constructor(showEnabled: string | UIElement, showDisabled: string | UIElement, data: UIEventSource<boolean> | boolean = false) {
        super(undefined);
        this._data =
            data instanceof UIEventSource ? data : new UIEventSource(data ?? false);
        this.ListenTo(this._data);
        this._showEnabled = showEnabled;
        this._showDisabled = showDisabled;
        const self = this;
        this.onClick(() => {
            self._data.setData(!self._data.data);
        })

    }

    InnerRender(): string {
        if (this._data.data) {
            return Translations.W(this._showEnabled).Render();
        } else {
            return Translations.W(this._showDisabled).Render();
        }
    }
    
}