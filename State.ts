import {UIElement} from "./UI/UIElement";
import {Layout} from "./Customizations/Layout";
import {Utils} from "./Utils";
import {LayerDefinition, Preset} from "./Customizations/LayerDefinition";
import {ElementStorage} from "./Logic/ElementStorage";
import {Changes} from "./Logic/Osm/Changes";
import {OsmConnection} from "./Logic/Osm/OsmConnection";
import Locale from "./UI/i18n/Locale";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import Translations from "./UI/i18n/Translations";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {LayerUpdater} from "./Logic/LayerUpdater";
import {UIEventSource} from "./Logic/UIEventSource";
import {LocalStorageSource} from "./Logic/Web/LocalStorageSource";
import {QueryParameters} from "./Logic/Web/QueryParameters";
import {CustomLayoutFromJSON} from "./Customizations/JSON/CustomLayoutFromJSON";

/**
 * Contains the global state: a bunch of UI-event sources
 */

export class State {

    // The singleton of the global state
    public static state: State;
    
    public static vNumber = "0.0.7";
    
    // The user journey states thresholds when a new feature gets unlocked
    public static userJourney = {
        customLayoutUnlock: 50,
        themeGeneratorUnlock: 500,
        tagsVisibleAt: 200,
        tagsVisibleAndWikiLinked: 250


    };

    public static runningFromConsole: boolean = false; 

    public readonly layoutToUse = new UIEventSource<Layout>(undefined);

    /**
     The mapping from id -> UIEventSource<properties>
     */
    public allElements: ElementStorage;
    /**
     THe change handler
     */
    public changes: Changes;
    /**
     THe basemap with leaflet instance
     */
    public bm;
    /**
     The user credentials
     */
    public osmConnection: OsmConnection;

    public favouriteLayers: UIEventSource<string[]>;

    public layerUpdater: LayerUpdater;


    public filteredLayers: UIEventSource<FilteredLayer[]> = new UIEventSource<FilteredLayer[]>([])
    public presets: UIEventSource<Preset[]> = new UIEventSource<Preset[]>([])

    /**
     *  The message that should be shown at the center of the screen
     */
    public readonly centerMessage = new UIEventSource<string>("");

    /**
     * The countdown: if set to e.g. ten, it'll start counting down. When reaching zero, changes will be saved. NB: this is implemented later, not in the eventSource
     */
    public readonly secondsTillChangesAreSaved = new UIEventSource<number>(0);


    /**
     This message is shown full screen on mobile devices
     */
    public readonly fullScreenMessage = new UIEventSource<UIElement>(undefined);

    /**
     The latest element that was selected - used to generate the right UI at the right place
     */
    public readonly selectedElement = new UIEventSource<{ feature: any }>(undefined);

    public readonly zoom = QueryParameters.GetQueryParameter("z", undefined)
        .syncWith(LocalStorageSource.Get("zoom"));
    public readonly lat = QueryParameters.GetQueryParameter("lat", undefined)
        .syncWith(LocalStorageSource.Get("lat"));
    public readonly lon = QueryParameters.GetQueryParameter("lon", undefined)
        .syncWith(LocalStorageSource.Get("lon"));


    public readonly featureSwitchUserbadge: UIEventSource<boolean>;
    public readonly featureSwitchSearch: UIEventSource<boolean>;
    public readonly featureSwitchLayers: UIEventSource<boolean>;
    public readonly featureSwitchAddNew: UIEventSource<boolean>;
    public readonly featureSwitchWelcomeMessage: UIEventSource<boolean>;
    public readonly featureSwitchIframe: UIEventSource<boolean>;
    public readonly featureSwitchMoreQuests: UIEventSource<boolean>;
    public readonly featureSwitchShareScreen: UIEventSource<boolean>;
    public readonly featureSwitchGeolocation: UIEventSource<boolean>;


    /**
     * The map location: currently centered lat, lon and zoom
     */
    public readonly locationControl = new UIEventSource<{ lat: number, lon: number, zoom: number }>(undefined);

    /**
     * The location as delivered by the GPS
     */
    public currentGPSLocation: UIEventSource<{
        latlng: number,
        accuracy: number
    }> = new UIEventSource<{ latlng: number, accuracy: number }>(undefined);

    /** After this many milliseconds without changes, saves are sent of to OSM
     */
    public readonly saveTimeout = new UIEventSource<number>(30 * 1000);
    public layoutDefinition: string;
    public installedThemes: UIEventSource<{ layout: Layout; definition: string }[]>;


    constructor(layoutToUse: Layout) {
        const self = this;
        this.layoutToUse.setData(layoutToUse)
        this.locationControl = new UIEventSource<{ lat: number, lon: number, zoom: number }>({
            zoom: Utils.asFloat(this.zoom.data),
            lat: Utils.asFloat(this.lat.data),
            lon: Utils.asFloat(this.lon.data),
        }).addCallback((latlonz) => {
            this.zoom.setData(latlonz.zoom.toString());
            this.lat.setData(latlonz.lat.toString().substr(0, 6));
            this.lon.setData(latlonz.lon.toString().substr(0, 6));
        });

        this.layoutToUse.addCallback(layoutToUse => {
            const lcd = self.locationControl.data;
            lcd.zoom = lcd.zoom ?? layoutToUse?.startzoom;
            lcd.lat = lcd.lat ?? layoutToUse?.startLat;
            lcd.lon = lcd.lon ?? layoutToUse?.startLon;
            self.locationControl.ping();
        });


        function featSw(key: string, deflt: (layout: Layout) => boolean): UIEventSource<boolean> {
            const queryParameterSource = QueryParameters.GetQueryParameter(key, undefined);
            // I'm so sorry about someone trying to decipher this

            // It takes the current layout, extracts the default value for this query paramter. A query parameter event source is then retreived and flattened
            return UIEventSource.flatten(
                self.layoutToUse.map((layout) => {
                    const defaultValue = deflt(layout);
                    const queryParam = QueryParameters.GetQueryParameter(key, "" + defaultValue)
                    return queryParam.map((str) => str === undefined ? defaultValue : (str !== "false"));
                }), [queryParameterSource]);
        }


        this.featureSwitchUserbadge = featSw("fs-userbadge", (layoutToUse) => layoutToUse?.enableUserBadge ?? true);
        this.featureSwitchSearch = featSw("fs-search", (layoutToUse) => layoutToUse?.enableSearch ?? true);
        this.featureSwitchLayers = featSw("fs-layers", (layoutToUse) => layoutToUse?.enableLayers ?? true);
        this.featureSwitchAddNew = featSw("fs-add-new", (layoutToUse) => layoutToUse?.enableAdd ?? true);
        this.featureSwitchWelcomeMessage = featSw("fs-welcome-message", () => true);
        this.featureSwitchIframe = featSw("fs-iframe", () => false);
        this.featureSwitchMoreQuests = featSw("fs-more-quests", (layoutToUse) => layoutToUse?.enableMoreQuests ?? true);
        this.featureSwitchShareScreen = featSw("fs-share-screen", (layoutToUse) => layoutToUse?.enableShareScreen ?? true);
        this.featureSwitchGeolocation = featSw("fs-geolocation", (layoutToUse) => layoutToUse?.enableGeolocation ?? true);

        this.osmConnection = new OsmConnection(
            QueryParameters.GetQueryParameter("test", "false").data === "true",
            QueryParameters.GetQueryParameter("oauth_token", undefined)
        );


        this.favouriteLayers = this.osmConnection.GetLongPreference("favouriteLayers").map(
            str => Utils.Dedup(str?.split(";")) ?? [],
            [], layers => Utils.Dedup(layers)?.join(";")
        );

        this.installedThemes = this.osmConnection.preferencesHandler.preferences.map<{ layout: Layout, definition: string }[]>(allPreferences => {
            const installedThemes: { layout: Layout, definition: string }[] = [];
            if (allPreferences === undefined) {
                return installedThemes;
            }
            for (const allPreferencesKey in allPreferences) {
                const themename = allPreferencesKey.match(/^mapcomplete-installed-theme-(.*)-combined-length$/);
                if (themename && themename[1] !== "") {
                    const customLayout = State.state.osmConnection.GetLongPreference("installed-theme-" + themename[1]);
                    if(customLayout.data === undefined){
                        console.log("No data defined for ", themename[1]);
                        continue;
                    }
                    try {
                        installedThemes.push({
                            layout: CustomLayoutFromJSON.FromQueryParam(customLayout.data),
                            definition: customLayout.data
                        });
                    } catch (e) {
                        console.warn("Could not parse custom layout from preferences: ", allPreferencesKey, e, customLayout.data);
                    }
                }
            }

            return installedThemes;

        });

        Locale.language.syncWith(this.osmConnection.GetPreference("language"));


        Locale.language.addCallback((currentLanguage) => {
            const layoutToUse = self.layoutToUse.data;
            if (layoutToUse === undefined) {
                return;
            }
            if (this.layoutToUse.data.supportedLanguages.indexOf(currentLanguage) < 0) {
                console.log("Resetting language to", layoutToUse.supportedLanguages[0], "as", currentLanguage, " is unsupported")
                // The current language is not supported -> switch to a supported one
                Locale.language.setData(layoutToUse.supportedLanguages[0]);
            }
        }).ping()

        this.layoutToUse.map((layoutToUse) => {
                if (layoutToUse === undefined) {
                    return "MapComplete";
                }
                return Translations.W(layoutToUse.title).InnerRender()
            }, [Locale.language]
        ).addCallback((title) => {
            document.title = title
        });


        this.allElements = new ElementStorage();
        this.changes = new Changes(this);

        if (State.runningFromConsole) {
            console.warn("running from console - not initializing map. Assuming test.html");
            return;
        }


        if (document.getElementById("leafletDiv") === null) {
            console.warn("leafletDiv not found - not initializing map. Assuming test.html");
            return;
        }

       

    }
    
    public GetFilteredLayerFor(id: string) : FilteredLayer{
        for (const flayer of this.filteredLayers.data) {
            if(flayer.layerDef.id === id){
                return flayer;
            }
        }
        return undefined;
    }
}
