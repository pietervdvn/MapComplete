import {UIEventSource} from "./UI/UIEventSource";
import {Changes} from "./Logic/Changes";
import {OsmConnection} from "./Logic/OsmConnection";
import {ElementStorage} from "./Logic/ElementStorage";
import {WikipediaLink} from "./Customizations/Questions/WikipediaLink";
import {OsmLink} from "./Customizations/Questions/OsmLink";
import {ConfirmDialog} from "./UI/ConfirmDialog";
import {Imgur} from "./Logic/Imgur";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {TextField} from "./UI/Input/TextField";
import {FixedInputElement} from "./UI/Input/FixedInputElement";
import {RadioButton} from "./UI/Input/RadioButton";
import {DropDown} from "./UI/Input/DropDown";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

const dropdown = new RadioButton<string>(
    [new FixedInputElement("5","5"),
    new TextField({
        toString: ((str) => str),
        fromString: ((str) => str),
    })]
).AttachTo("maindiv");
const value = dropdown.GetValue();
value.setData("asldkjvmqlksjdf")