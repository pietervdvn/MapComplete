import {OsmConnection} from "./Logic/Osm/OsmConnection";
import {VerticalCombine} from "./UI/Base/VerticalCombine";
import Combine from "./UI/Base/Combine";
import {SubtleButton} from "./UI/Base/SubtleButton";
import {Button} from "./UI/Base/Button";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {All} from "./Customizations/Layouts/All";
import {TextField} from "./UI/Input/TextField";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {UIElement} from "./UI/UIElement";
import {UIEventSource} from "./Logic/UIEventSource";


const connection = new OsmConnection(false, new UIEventSource<string>(undefined));

let rendered = false;

function createTable(preferences: any) {
    if (rendered) {
        return;
    }
    rendered = true;
    const prefs = [];
    console.log(preferences);
    for (const key in preferences) {
        console.log(key)
        const pref = connection.GetPreference(key, "");

        let value: UIElement = new FixedUiElement(pref.data);
        if (connection.userDetails.data.csCount > 500 &&
            (key.startsWith("mapcomplete") || connection.userDetails.data.csCount > 2500)) {
            value = new TextField<string>({
                toString: (str) => str,
                fromString: (str) => str,
                value: pref
            });
        }

        const c = [
            "<tr><td>",
            key,
            "</td><td>",
            new Button("delete", () => pref.setData("")),
            "</td><td>",
            value, 
            "</td></tr>"
        ];
        prefs.push(...c);
    }

    const el = new Combine(
        ["<table>",
            ...prefs,
            "</table>"]
    ); // .AttachTo("maindiv");
    console.log(el.InnerRender())
    el.AttachTo("maindiv");
}

connection.preferences.addCallback((prefs) => createTable(prefs))

