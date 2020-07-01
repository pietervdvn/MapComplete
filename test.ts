import {Geocoding} from "./Logic/Geocoding";
import {SearchAndGo} from "./UI/SearchAndGo";
import {TextField} from "./UI/Base/TextField";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {DropDownUI} from "./UI/Base/DropDownUI";
import {UIEventSource} from "./UI/UIEventSource";

console.log("HI");


var control = new UIEventSource<string>("b");
control.addCallback((data) => {
    console.log("> GOT", control.data)
})

new DropDownUI("Test",
    [{value: "a", shown: "a"},
        {value: "b", shown: "b"},
        {value: "c", shown: "c"},
    ], control
).AttachTo("maindiv");


new VariableUiElement(control).AttachTo("extradiv");

window.setTimeout(() => {control.setData("a")}, 1000);