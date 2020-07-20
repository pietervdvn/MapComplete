import {UIEventSource} from "./UI/UIEventSource";
import {Changes} from "./Logic/Changes";
import {OsmConnection} from "./Logic/OsmConnection";
import {ElementStorage} from "./Logic/ElementStorage";
import {WikipediaLink} from "./Customizations/Questions/WikipediaLink";
import {OsmLink} from "./Customizations/Questions/OsmLink";
import {ConfirmDialog} from "./UI/ConfirmDialog";
import {Imgur} from "./Logic/Imgur";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {UIRadioButton} from "./UI/Base/UIRadioButton";
import {FixedInputElement} from "./UI/Base/FixedInputElement";
import {TextField} from "./UI/Base/TextField";


const buttons = new UIRadioButton<number>(
    [new FixedInputElement("Five", 5),
        new FixedInputElement("Ten", 10),
        new TextField<number>({
            fromString: (str) => parseInt(str),
            toString: (i) => ("" + i),
        })
    ]
).AttachTo("maindiv");

buttons.GetValue().addCallback(console.log);
buttons.GetValue().setData(10)

const value = new TextField<number>({
    fromString: (str) => parseInt(str),
    toString: (i) => {
        if(isNaN(i)){
            return ""
        }
        return ("" + i)
    },
}).AttachTo("extradiv").GetValue();

value.setData(42);
value.addCallback(console.log)