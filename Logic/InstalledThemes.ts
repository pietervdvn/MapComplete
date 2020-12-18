import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import {OsmPreferences} from "./Osm/OsmPreferences";
import {UIEventSource} from "./UIEventSource";
import {OsmConnection} from "./Osm/OsmConnection";

export default class InstalledThemes {
    
    private static DeleteInvalid(osmConnection: OsmConnection, invalidThemes: any[]){
       // for (const invalid of invalidThemes) {
       //     console.error("Attempting to remove ", invalid)
       //     osmConnection.GetLongPreference(
       //         "installed-theme-" + invalid
       //     ).setData(null);
       // }
    }
    
    static InstalledThemes(osmConnection: OsmConnection) : UIEventSource<{ layout: LayoutConfig; definition: string }[]>{
       return osmConnection.preferencesHandler.preferences.map<{ layout: LayoutConfig, definition: string }[]>(allPreferences => {
            const installedThemes: { layout: LayoutConfig, definition: string }[] = [];
            console.log("Updating the installed themes")
            if (allPreferences === undefined) {
                console.log("All prefs is undefined");
                return installedThemes;
            }
            const invalidThemes = []
            for (var allPreferencesKey in allPreferences) {
                const themename = allPreferencesKey.match(/^mapcomplete-installed-theme-(.*)-combined-length$/);
                console.log("Preference key match:",themename," for key ",allPreferencesKey);
                if (themename && themename[1] !== "") {
                    const customLayout = osmConnection.GetLongPreference("installed-theme-" + themename[1]);
                    if (customLayout.data === undefined) {
                        console.log("No data defined for ", themename[1]);
                        continue;
                    }
                    try {
                        var json = atob(customLayout.data);
                        const layout = new LayoutConfig(
                            JSON.parse(json));
                        installedThemes.push({
                            layout: layout,
                            definition: customLayout.data
                        });
                    } catch (e) {
                        console.warn("Could not parse custom layout from preferences - deleting: ", allPreferencesKey, e, customLayout.data);
                        invalidThemes.push(themename[1])
                    }
                }
            }

            InstalledThemes.DeleteInvalid(osmConnection, invalidThemes);

            return installedThemes;

        });

    }
    
}