import {OsmConnection} from "./Logic/Osm/OsmConnection";
import Combine from "./UI/Base/Combine";
import {Button} from "./UI/Base/Button";
import {TextField} from "./UI/Input/TextField";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {UIElement} from "./UI/UIElement";
import {UIEventSource} from "./Logic/UIEventSource";
import {Utils} from "./Utils";
import {SubtleButton} from "./UI/Base/SubtleButton";


const connection = new OsmConnection(false, new UIEventSource<string>(undefined), "");

let rendered = false;

function salvageThemes(preferences: any) {
    const knownThemeNames = new Set<string>();
    const correctThemeNames = []
    for (const key in preferences) {
        if (!(typeof key === "string")) {
            continue;
        }
        const prefix = "mapcomplete-installed-theme-";
        // mapcomplete-installed-theme-arbres_llefia-combined-11
        //mapcomplete-installed-theme-1roadAlllanes-combined-length
        if (!key.startsWith(prefix)) {
            continue;
        }
        const theme = key.substring(prefix.length, key.indexOf("-combined-"))

        if (key.endsWith("-length")) {
            correctThemeNames.push(theme)
        } else {
            knownThemeNames.add(theme);
        }
    }

    for (const correctThemeName of correctThemeNames) {
        knownThemeNames.delete(correctThemeName);
    }

    const missingValues = Array.from(knownThemeNames).map(failedTheme => {

        let i = 0;
        let foundValue = undefined
        let combined = ""
        do {
            const key = prefix + failedTheme + "-combined-" + i;
            foundValue = preferences[key]
            i++;
            combined += foundValue ?? ""
        } while (foundValue !== undefined);

        const json = Utils.UnMinify(combined);

        return {
            themeName: failedTheme,
            contents: json
        }
    })
    return missingValues;
}

function SalvageButton(theme: {themeName: string, contents: string}){
    return new SubtleButton("bug.svg", "Download broken theme "+theme.themeName).onClick(
        () => {
            Utils.downloadTxtFile(theme.contents, theme.themeName+".json")
        }
    )
}

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
        [
            ...salvageThemes(preferences).map(theme => SalvageButton(theme)),
            "<table>",
            ...prefs,
            "</table>"]
    ).AttachTo("maindiv");
}

connection.preferencesHandler.preferences.addCallback((prefs) => createTable(prefs))

