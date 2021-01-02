import {UIElement} from "./UI/UIElement";
import {Utils} from "./Utils";
import {ElementStorage} from "./Logic/ElementStorage";
import {Changes} from "./Logic/Osm/Changes";
import {OsmConnection} from "./Logic/Osm/OsmConnection";
import Locale from "./UI/i18n/Locale";
import Translations from "./UI/i18n/Translations";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {UpdateFromOverpass} from "./Logic/UpdateFromOverpass";
import {UIEventSource} from "./Logic/UIEventSource";
import {LocalStorageSource} from "./Logic/Web/LocalStorageSource";
import {QueryParameters} from "./Logic/Web/QueryParameters";
import LayoutConfig from "./Customizations/JSON/LayoutConfig";
import Hash from "./Logic/Web/Hash";
import {MangroveIdentity} from "./Logic/Web/MangroveReviews";
import InstalledThemes from "./Logic/InstalledThemes";
import {BaseLayer} from "./Models/BaseLayer";
import Loc from "./Models/Loc";
import Constants from "./Models/Constants";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
import * as L from "leaflet"
import LayerResetter from "./Logic/Actors/LayerResetter";

/**
 * Contains the global state: a bunch of UI-event sources
 */

export default class State {

    // The singleton of the global state
    public static state: State;
    
    public static runningFromConsole: boolean = false;
    
    public readonly layoutToUse = new UIEventSource<LayoutConfig>(undefined);

    /**
     The mapping from id -> UIEventSource<properties>
     */
    public allElements: ElementStorage;
    /**
     THe change handler
     */
    public changes: Changes;
    /**
     The leaflet instance of the big basemap
     */
    public leafletMap = new UIEventSource<L.Map>(undefined);
    /**
     * Background layer id
     */
    public availableBackgroundLayers: UIEventSource<BaseLayer[]>;
    /**
     The user credentials
     */
    public osmConnection: OsmConnection;

    public mangroveIdentity: MangroveIdentity;

    public favouriteLayers: UIEventSource<string[]>;

    public layerUpdater: UpdateFromOverpass;


    public filteredLayers: UIEventSource<FilteredLayer[]> = new UIEventSource<FilteredLayer[]>([])

    /**
     *  The message that should be shown at the center of the screen
     */
    public readonly centerMessage = new UIEventSource<string>("");
    /**
     This message is shown full screen on mobile devices
     */
    public readonly fullScreenMessage = new UIEventSource<UIElement>(undefined);

    /**
     The latest element that was selected - used to generate the right UI at the right place
     */
    public readonly selectedElement = new UIEventSource<any>(undefined);

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
    public readonly locationControl = new UIEventSource<Loc>(undefined);
    public readonly backgroundLayer;
    /* Last location where a click was registered
     */
    public readonly LastClickLocation: UIEventSource<{ lat: number, lon: number }> = new UIEventSource<{ lat: number, lon: number }>(undefined)

    /**
     * The location as delivered by the GPS
     */
    public currentGPSLocation: UIEventSource<{
        latlng: {lat:number, lng:number},
        accuracy: number
    }> = new UIEventSource<{ latlng: {lat:number, lng:number}, accuracy: number }>(undefined);
    public layoutDefinition: string;
    public installedThemes: UIEventSource<{ layout: LayoutConfig; definition: string }[]>;

    public layerControlIsOpened: UIEventSource<boolean> = QueryParameters.GetQueryParameter("layer-control-toggle", "false", "Wether or not the layer control is shown")
        .map<boolean>((str) => str !== "false", [], b => "" + b)

    public welcomeMessageOpenedTab = QueryParameters.GetQueryParameter("tab", "0", `The tab that is shown in the welcome-message. 0 = the explanation of the theme,1 = OSM-credits, 2 = sharescreen, 3 = more themes, 4 = about mapcomplete (user must be logged in and have >${Constants.userJourney.mapCompleteHelpUnlock} changesets)`).map<number>(
        str => isNaN(Number(str)) ? 0 : Number(str), [], n => "" + n
    );

    constructor(layoutToUse: LayoutConfig) {
        const self = this;
        this.layoutToUse.setData(layoutToUse);

        const zoom = State.asFloat(
            QueryParameters.GetQueryParameter("z", "" + layoutToUse.startZoom, "The initial/current zoom level")
            .syncWith(LocalStorageSource.Get("zoom")));
        const lat = State.asFloat(QueryParameters.GetQueryParameter("lat", "" + layoutToUse.startLat, "The initial/current latitude")
            .syncWith(LocalStorageSource.Get("lat")));
        const lon = State.asFloat(QueryParameters.GetQueryParameter("lon", "" + layoutToUse.startLon, "The initial/current longitude of the app")
            .syncWith(LocalStorageSource.Get("lon")));


        this.locationControl = new UIEventSource<Loc>({
            zoom: Utils.asFloat(zoom.data),
            lat: Utils.asFloat(lat.data),
            lon: Utils.asFloat(lon.data),
        }).addCallback((latlonz) => {
            zoom.setData(latlonz.zoom);
            lat.setData(latlonz.lat);
            lon.setData(latlonz.lon);
        });

        this.layoutToUse.addCallback(layoutToUse => {
            const lcd = self.locationControl.data;
            lcd.zoom = lcd.zoom ?? layoutToUse?.startZoom;
            lcd.lat = lcd.lat ?? layoutToUse?.startLat;
            lcd.lon = lcd.lon ?? layoutToUse?.startLon;
            self.locationControl.ping();
        });


        this.availableBackgroundLayers = new AvailableBaseLayers(this.locationControl).availableEditorLayers;
        this.backgroundLayer = QueryParameters.GetQueryParameter("background",
            this.layoutToUse.data.defaultBackgroundId ?? AvailableBaseLayers.osmCarto.id,
            "The id of the background layer to start with")
            .map((selectedId: string) => {
                const available = self.availableBackgroundLayers.data;
                for (const layer of available) {
                    if (layer.id === selectedId) {
                        return layer;
                    }
                }
                return AvailableBaseLayers.osmCarto;
            }, [], layer => layer.id);


        new LayerResetter(
            this.backgroundLayer,this.locationControl,
            this.availableBackgroundLayers, this.layoutToUse.map((layout : LayoutConfig)=> layout.defaultBackgroundId));


        


        function featSw(key: string, deflt: (layout: LayoutConfig) => boolean, documentation: string): UIEventSource<boolean> {
            const queryParameterSource = QueryParameters.GetQueryParameter(key, undefined, documentation);
            // I'm so sorry about someone trying to decipher this

            // It takes the current layout, extracts the default value for this query parameter. A query parameter event source is then retrieved and flattened
            return UIEventSource.flatten(
                self.layoutToUse.map((layout) => {
                    const defaultValue = deflt(layout);
                    const queryParam = QueryParameters.GetQueryParameter(key, "" + defaultValue, documentation)
                    return queryParam.map((str) => str === undefined ? defaultValue : (str !== "false"));
                }), [queryParameterSource]);
        }


        this.featureSwitchUserbadge = featSw("fs-userbadge", (layoutToUse) => layoutToUse?.enableUserBadge ?? true,
            "Disables/Enables the user information pill (userbadge) at the top left. Disabling this disables logging in and thus disables editing all together, effectively putting MapComplete into read-only mode.");
        this.featureSwitchSearch = featSw("fs-search", (layoutToUse) => layoutToUse?.enableSearch ?? true,
            "Disables/Enables the search bar");
        this.featureSwitchLayers = featSw("fs-layers", (layoutToUse) => layoutToUse?.enableLayers ?? true,
            "Disables/Enables the layer control");
        this.featureSwitchAddNew = featSw("fs-add-new", (layoutToUse) => layoutToUse?.enableAddNewPoints ?? true,
            "Disables/Enables the 'add new feature'-popup. (A theme without presets might not have it in the first place)");
        this.featureSwitchWelcomeMessage = featSw("fs-welcome-message", () => true, 
            "Disables/enables the help menu or welcome message");
        this.featureSwitchIframe = featSw("fs-iframe", () => false,
            "Disables/Enables the iframe-popup");
        this.featureSwitchMoreQuests = featSw("fs-more-quests", (layoutToUse) => layoutToUse?.enableMoreQuests ?? true,
            "Disables/Enables the 'More Quests'-tab in the welcome message");
        this.featureSwitchShareScreen = featSw("fs-share-screen", (layoutToUse) => layoutToUse?.enableShareScreen ?? true,
            "Disables/Enables the 'Share-screen'-tab in the welcome message");
        this.featureSwitchGeolocation = featSw("fs-geolocation", (layoutToUse) => layoutToUse?.enableGeolocation ?? true,
            "Disables/Enables the geolocation button");


        
        
        const testParam = QueryParameters.GetQueryParameter("test", "false",
            "If true, 'dryrun' mode is activated. The app will behave as normal, except that changes to OSM will be printed onto the console instead of actually uploaded to osm.org").data;
        this.osmConnection = new OsmConnection(
            testParam === "true",
            QueryParameters.GetQueryParameter("oauth_token", undefined,
                "Used to complete the login"),
            layoutToUse.id,
            true
        );

        this.mangroveIdentity = new MangroveIdentity(
            this.osmConnection.GetLongPreference("identity", "mangrove")
        );


        const h = Hash.Get();
        this.selectedElement.addCallback(selected => {
                if (selected === undefined) {
                    h.setData("");
                } else {
                    h.setData(selected.id)
                }
            }
        )
        h.addCallbackAndRun(hash => {
            if(hash === undefined || hash === ""){
               self.selectedElement.setData(undefined);
            }
        })


        this.installedThemes = InstalledThemes.InstalledThemes(this.osmConnection );

        // Important: the favourite layers are initialized _after_ the installed themes, as these might contain an installedTheme
        this.favouriteLayers = this.osmConnection.GetLongPreference("favouriteLayers").map(
            str => Utils.Dedup(str?.split(";")) ?? [],
            [], layers => Utils.Dedup(layers)?.join(";")
        );

        Locale.language.syncWith(this.osmConnection.GetPreference("language"));


        Locale.language.addCallback((currentLanguage) => {
            const layoutToUse = self.layoutToUse.data;
            if (layoutToUse === undefined) {
                return;
            }
            if (this.layoutToUse.data.language.indexOf(currentLanguage) < 0) {
                console.log("Resetting language to", layoutToUse.language[0], "as", currentLanguage, " is unsupported")
                // The current language is not supported -> switch to a supported one
                Locale.language.setData(layoutToUse.language[0]);
            }
        }).ping()

        this.layoutToUse.map((layoutToUse) => {
                return Translations.WT(layoutToUse?.title)?.txt ?? "MapComplete"
            }, [Locale.language]
        ).addCallbackAndRun((title) => {
            document.title = title
        });


        this.allElements = new ElementStorage();
        this.changes = new Changes();

        if (State.runningFromConsole) {
            console.warn("running from console - not initializing map. Assuming test.html");
            return;
        }


        if (document.getElementById("leafletDiv") === null) {
            console.warn("leafletDiv not found - not initializing map. Assuming test.html");
            return;
        }

    }

   private static asFloat(source: UIEventSource<string>): UIEventSource<number> {
        return source.map(str => {
            let parsed = parseFloat(str);
            return isNaN(parsed) ? undefined : parsed;
        }, [], fl => {
            if (fl === undefined || isNaN(fl)) {
                return undefined;
            }
            return ("" + fl).substr(0, 8);
        })
    }
    
}
