import {DropDown} from "./UI/Input/DropDown";
import {UIEventSource} from "./UI/UIEventSource";

const source = new UIEventSource(10)

const dd = new DropDown("Test", [
    {value: 5, shown: "five"},
    {value: 10, shown: "ten"}
], source).AttachTo("maindiv")
