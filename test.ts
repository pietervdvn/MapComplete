import {VariableUiElement} from "./UI/Base/VariableUIElement";
import SimpleDatePicker from "./UI/Input/SimpleDatePicker";


const vtf=new SimpleDatePicker();
vtf.AttachTo('maindiv')
vtf.GetValue().addCallback(console.log)
new VariableUiElement(vtf.GetValue().map(n => ""+n)).AttachTo("extradiv")