import {UIEventSource} from "../UIEventSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import {OsmConnection} from "../Osm/OsmConnection";
import {Utils} from "../../Utils";
import LZString from "lz-string";

export default class InstalledThemes {
    public installedThemes: UIEventSource<{ layout: LayoutConfig; definition: string }[]>;
    
    constructor(osmConnection: OsmConnection) {
        this.installedThemes = osmConnection.preferencesHandler.preferences.map<{ layout: LayoutConfig, definition: string }[]>(allPreferences => {
            const installedThemes: { layout: LayoutConfig, definition: string }[] = [];
            if (allPreferences === undefined) {
                console.log("All prefs is undefined");
                return installedThemes;
            }
            const invalidThemes = []
            for (const allPreferencesKey in allPreferences) {
                const themename = allPreferencesKey.match(/^mapcomplete-installed-theme-(.*)-combined-length$/);
                if (themename && themename[1] !== "") {
                    const customLayout = osmConnection.GetLongPreference("installed-theme-" + themename[1]);
                    if (customLayout.data === undefined) {
                        console.log("No data defined for ", themename[1]);
                        continue;
                    }
                    try {
                        let layoutJson;
                        try{
                            layoutJson = JSON.parse(atob(customLayout.data))
                        }catch(e){
                            layoutJson =  JSON.parse( Utils.UnMinify(LZString.decompressFromBase64(customLayout.data)))
                        }
                        const layout = new LayoutConfig(layoutJson, false);
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

    private static DeleteInvalid(osmConnection: OsmConnection, invalidThemes: any[]) {
        for (const invalid of invalidThemes) {
            console.error("Attempting to remove ", invalid)
            osmConnection.GetLongPreference(
                "installed-theme-" + invalid
            ).setData(null);
        }
    }

}