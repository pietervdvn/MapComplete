import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";

/**
 * The 'Toggle' is a UIElement showing either one of two elements, depending on the state.
 * It can be used to implement e.g. checkboxes or collapsible elements
 */
export default class Toggle extends VariableUiElement{

    public readonly isEnabled: UIEventSource<boolean>;

    constructor(showEnabled: string | BaseUIElement, showDisabled: string | BaseUIElement, data: UIEventSource<boolean> = new UIEventSource<boolean>(false)) {
        super(
            data.map(isEnabled => isEnabled ? showEnabled : showDisabled)
        );
        this.onClick(() => {
            data.setData(!data.data);
        })

    }
}