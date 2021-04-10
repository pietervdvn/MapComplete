import {OsmConnection} from "./Logic/Osm/OsmConnection";
import Combine from "./UI/Base/Combine";
import {Button} from "./UI/Base/Button";
import {TextField} from "./UI/Input/TextField";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {UIElement} from "./UI/UIElement";
import {UIEventSource} from "./Logic/UIEventSource";


const connection = new OsmConnection(false, new UIEventSource<string>(undefined), "");

let rendered = false;

function createTable(preferences: any) {
    if (rendered) {
        return;
    }
    rendered = true;
    const prefs = [];
    for (const key in preferences) {
        const pref = connection.GetPreference(key, "");

        let value: UIElement = new FixedUiElement(pref.data);
        if (connection.userDetails.data.csCount > 500 &&
            (key.startsWith("mapcomplete") || connection.userDetails.data.csCount > 2500)) {
            value = new TextField({
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

    new Combine(
        ["<table>",
            ...prefs,
            "</table>"]
    ).AttachTo("maindiv");
}

connection.preferencesHandler.preferences.addCallback((prefs) => createTable(prefs))

