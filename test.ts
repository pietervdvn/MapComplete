import {CheckBoxes} from "./UI/Input/Checkboxes";
import {FixedInputElement} from "./UI/Input/FixedInputElement";
import {VariableUiElement} from "./UI/Base/VariableUIElement";


const cb = new CheckBoxes(
   [ new FixedInputElement("One", 1),
   new FixedInputElement("Two",2),
   new FixedInputElement("Thee",3)]
)

cb.AttachTo("maindiv");
new VariableUiElement(cb.GetValue().map(ts => ts?.join(", "))).AttachTo("extradiv")

window.setTimeout(() => {
   cb.GetValue().setData([2,3]);
}, 2500)

window.setTimeout(() => {
   cb.GetValue().setData([2]);
}, 3000)

window.setTimeout(() => {
   cb.GetValue().setData([1, 2]);
}, 3500)