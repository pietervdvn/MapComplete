import {UIElement} from "../UIElement";
import Translations from "../../UI/i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";

export default class CheckBox extends UIElement{
    public readonly isEnabled: UIEventSource<boolean>;
    private readonly _showEnabled:  UIElement;
    private readonly _showDisabled: UIElement;

    constructor(showEnabled: string | UIElement, showDisabled: string | UIElement, data: UIEventSource<boolean> | boolean = false) {
        super(undefined);
        this.isEnabled =
            data instanceof UIEventSource ? data : new UIEventSource(data ?? false);
        this.ListenTo(this.isEnabled);
        this._showEnabled = Translations.W(showEnabled);
        this._showDisabled =Translations.W(showDisabled);
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