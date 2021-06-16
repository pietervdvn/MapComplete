import ValidatedTextField from "./UI/Input/ValidatedTextField";
import Combine from "./UI/Base/Combine";
import {VariableUiElement} from "./UI/Base/VariableUIElement";


new Combine(ValidatedTextField.tpList.map(tp => {
    const tf = ValidatedTextField.InputForType(tp.name);
    
    return new Combine([tf, new VariableUiElement(tf.GetValue()).SetClass("alert")]);
})).AttachTo("maindiv")