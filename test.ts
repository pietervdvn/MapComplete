import ValidatedTextField from "./UI/Input/ValidatedTextField";
import {VariableUiElement} from "./UI/Base/VariableUIElement";

const tf = ValidatedTextField.InputForType("url")
tf.AttachTo("maindiv")
new VariableUiElement(tf.GetValue()).AttachTo("extradiv")