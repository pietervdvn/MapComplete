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


const buttons = new RadioButton<number>(
    [new FixedInputElement("Five", 5),
        new FixedInputElement("Ten", 10),
        new TextField<number>({
            fromString: (str) => parseInt(str),
            toString: (i) => ("" + i),
        })
    ], false
).AttachTo("maindiv");

buttons.GetValue().addCallback(console.log);