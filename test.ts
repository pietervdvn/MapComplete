import ValidatedTextField from "./UI/Input/ValidatedTextField";
import {VariableUiElement} from "./UI/Base/VariableUIElement";


const vtf= ValidatedTextField.KeyInput(true);
vtf.AttachTo('maindiv')
vtf.GetValue().addCallback(console.log)
new VariableUiElement(vtf.GetValue().map(n => ""+n)).AttachTo("extradiv")