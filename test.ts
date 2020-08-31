import TagInput from "./UI/Input/TagInput";
import {UIEventSource} from "./Logic/UIEventSource";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {MultiTagInput} from "./UI/Input/MultiTagInput";

const input = new MultiTagInput(new UIEventSource<string[]>(["key~value|0"]));
input.GetValue().addCallback(console.log);
input.AttachTo("maindiv");
new VariableUiElement(input.GetValue().map(tags => tags.join(" & "))).AttachTo("extradiv")