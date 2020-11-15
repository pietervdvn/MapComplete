import Translations from "./UI/i18n/Translations";
import {TabbedComponent} from "./UI/Base/TabbedComponent";
import {ShareScreen} from "./UI/ShareScreen";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import CheckBox from "./UI/Input/CheckBox";
import Combine from "./UI/Base/Combine";
import {UIElement} from "./UI/UIElement";
import {MoreScreen} from "./UI/MoreScreen";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {Basemap} from "./Logic/Leaflet/Basemap";
import State from "./State";
import {WelcomeMessage} from "./UI/WelcomeMessage";
import {LayerSelection} from "./UI/LayerSelection";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {UpdateFromOverpass} from "./Logic/UpdateFromOverpass";
import {UIEventSource} from "./Logic/UIEventSource";
import {QueryParameters} from "./Logic/Web/QueryParameters";
import {PersonalLayersPanel} from "./Logic/PersonalLayersPanel";
import Locale from "./UI/i18n/Locale";
import {StrayClickHandler} from "./Logic/Leaflet/StrayClickHandler";
import {SimpleAddUI} from "./UI/SimpleAddUI";
import {CenterMessageBox} from "./UI/CenterMessageBox";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {TagUtils} from "./Logic/Tags";
import {UserBadge} from "./UI/UserBadge";
import {SearchAndGo} from "./UI/SearchAndGo";
import {FullScreenMessageBox} from "./UI/FullScreenMessageBoxHandler";
import {GeoLocationHandler} from "./Logic/Leaflet/GeoLocationHandler";
import {LocalStorageSource} from "./Logic/Web/LocalStorageSource";
import {Utils} from "./Utils";
import BackgroundSelector from "./UI/BackgroundSelector";
import AvailableBaseLayers from "./Logic/AvailableBaseLayers";
import {FeatureInfoBox} from "./UI/Popup/FeatureInfoBox";
import Svg from "./Svg";
import Link from "./UI/Base/Link";
import * as personal from "./assets/themes/personalLayout/personalLayout.json"
import LayoutConfig from "./Customizations/JSON/LayoutConfig";

export class InitUiElements {


    private static setupAllLayerElements() {

        // ------------- Setup the layers -------------------------------

        InitUiElements.InitLayers();
        InitUiElements.InitLayerSelection();


        // ------------------ Setup various other UI elements ------------


        InitUiElements.OnlyIf(State.state.featureSwitchAddNew, () => {

            let presetCount = 0;
            for (const layer of State.state.filteredLayers.data) {
                for (const preset of layer.layerDef.presets) {
                    presetCount++;
                }
            }
            if (presetCount == 0) {
                return;
            }


            new StrayClickHandler(() => {
                    return new SimpleAddUI();
                }
            );
        });

        new CenterMessageBox().AttachTo("centermessage");

    }

    static InitAll(layoutToUse: LayoutConfig, layoutFromBase64: string, testing: UIEventSource<string>, layoutName: string,
                   layoutDefinition: string = "") {
        if (layoutToUse === undefined) {
            console.log("Incorrect layout")
            new FixedUiElement("Error: incorrect layout <i>" + layoutName + "</i><br/><a href='https://pietervdvn.github.io/MapComplete/index.html'>Go back</a>").AttachTo("centermessage").onClick(() => {
            });
            throw "Incorrect layout"
        }

        console.log("Using layout: ", layoutToUse.id, "LayoutFromBase64 is ", layoutFromBase64);
        State.state = new State(layoutToUse);
        
        // This 'leaks' the global state via the window object, useful for debugging
        // @ts-ignore
        window.mapcomplete_state = State.state;

        if (layoutToUse.hideFromOverview) {
            State.state.osmConnection.GetPreference("hidden-theme-" + layoutToUse.id + "-enabled").setData("true");
        }

        if (layoutFromBase64 !== "false") {
            State.state.layoutDefinition = layoutDefinition;
            console.log("Layout definition:", Utils.EllipsesAfter(State.state.layoutDefinition, 100))
            if (testing.data !== "true") {
                State.state.osmConnection.OnLoggedIn(() => {
                    State.state.osmConnection.GetLongPreference("installed-theme-" + layoutToUse.id).setData(State.state.layoutDefinition);
                })
            } else {
                console.warn("NOT saving custom layout to OSM as we are tesing -> probably in an iFrame")
            }
        }
        InitUiElements.InitBaseMap();

        new FixedUiElement("").AttachTo("decoration-desktop"); // Remove the decoration

        InitUiElements.setupAllLayerElements();

        if (layoutToUse.customCss !== undefined) {
           Utils.LoadCustomCss(layoutToUse.customCss);
        }

        function updateFavs() {
            const favs = State.state.favouriteLayers.data ?? [];

            layoutToUse.layers.splice(0, layoutToUse.layers.length);
            for (const fav of favs) {
                const layer = AllKnownLayouts.allLayers[fav];
                if (!!layer) {
                    layoutToUse.layers.push(layer);
                }

                for (const layouts of State.state.installedThemes.data) {
                    for (const layer of layouts.layout.layers) {
                        if (typeof layer === "string") {
                            continue;
                        }
                        if (layer.id === fav) {
                            layoutToUse.layers.push(layer);
                        }
                    }
                }
            }

            InitUiElements.setupAllLayerElements();
            State.state.layerUpdater.ForceRefresh();
            State.state.layoutToUse.ping();

        }

        if (layoutToUse.id === personal.id) {
            State.state.favouriteLayers.addCallback(updateFavs);
            State.state.installedThemes.addCallback(updateFavs);
        }


        /**
         * Show the questions and information for the selected element
         * This is given to the div which renders fullscreen on mobile devices
         */
        State.state.selectedElement.addCallback((feature) => {
                if (feature?.properties === undefined) {
                    return;
                }
                const data = feature.properties;
                // Which is the applicable set?
                for (const layer of layoutToUse.layers) {
                    if (typeof layer === "string") {
                        continue;
                    }
                    const applicable = layer.overpassTags.matches(TagUtils.proprtiesToKV(data));
                    if (applicable) {
                        // This layer is the layer that gives the questions

                        const featureBox = new FeatureInfoBox(
                            State.state.allElements.getElement(data.id),
                            layer
                        );

                        State.state.fullScreenMessage.setData(featureBox);
                        break;
                    }
                }
            }
        );

        InitUiElements.OnlyIf(State.state.featureSwitchUserbadge, () => {
            new UserBadge().AttachTo('userbadge');
        });

        InitUiElements.OnlyIf((State.state.featureSwitchSearch), () => {
            new SearchAndGo().AttachTo("searchbox");
        });


        new FullScreenMessageBox(() => {
            State.state.selectedElement.setData(undefined)
        }).AttachTo("messagesboxmobile");


        InitUiElements.OnlyIf(State.state.featureSwitchWelcomeMessage, () => {
            InitUiElements.InitWelcomeMessage()
        });

        if ((window != window.top && !State.state.featureSwitchWelcomeMessage.data) || State.state.featureSwitchIframe.data) {
            const currentLocation = State.state.locationControl;
            const url = `${window.location.origin}${window.location.pathname}?z=${currentLocation.data.zoom}&lat=${currentLocation.data.lat}&lon=${currentLocation.data.lon}`;
            const content = new Link(Svg.pop_out_ui().SetClass("iframe-escape"), url, true);
            new FixedUiElement(content.Render()).AttachTo("help-button-mobile")
            content.AttachTo("messagesbox");
        }


        new GeoLocationHandler()
            .SetStyle(`position:relative;display:block;border: solid 2px #0005;cursor: pointer; z-index: 999; /*Just below leaflets zoom*/background-color: white;border-radius: 5px;width: 43px;height: 43px;`)
            .AttachTo("geolocate-button");
        State.state.locationControl.ping();
    }
    
    static LoadLayoutFromHash(userLayoutParam: UIEventSource<string>) {
        try {
            let hash = location.hash.substr(1);
            const layoutFromBase64 = userLayoutParam.data;
            // layoutFromBase64 contains the name of the theme. This is partly to do tracking with goat counter

            const dedicatedHashFromLocalStorage = LocalStorageSource.Get("user-layout-" + layoutFromBase64.replace(" ", "_"));
            if (dedicatedHashFromLocalStorage.data?.length < 10) {
                dedicatedHashFromLocalStorage.setData(undefined);
            }

            const hashFromLocalStorage = LocalStorageSource.Get("last-loaded-user-layout");
            if (hash.length < 10) {
                hash = dedicatedHashFromLocalStorage.data ?? hashFromLocalStorage.data;
            } else {
                console.log("Saving hash to local storage")
                hashFromLocalStorage.setData(hash);
                dedicatedHashFromLocalStorage.setData(hash);
            }
            const layoutToUse = new LayoutConfig(JSON.parse(atob(hash)));
            userLayoutParam.setData(layoutToUse.id);
            return layoutToUse;
        } catch (e) {
            new FixedUiElement("Error: could not parse the custom layout:<br/> " + e).AttachTo("centermessage");
            throw e;
        }
    }

    static OnlyIf(featureSwitch: UIEventSource<boolean>, callback: () => void) {
        featureSwitch.addCallback(() => {

            if (featureSwitch.data) {
                callback();
            }
        });

        if (featureSwitch.data) {
            callback();
        }

    }


    private static CreateWelcomePane() {

        const layoutToUse = State.state.layoutToUse.data;
        let welcome: UIElement = new WelcomeMessage();
        if (layoutToUse.id === personal.id) {
            welcome = new PersonalLayersPanel();
        }

        const tabs = [
            {header: `<img src='${layoutToUse.icon}'>`, content: welcome},
            {
                header: Svg.osm_logo_img,
                content: Translations.t.general.openStreetMapIntro as UIElement
            },

        ]

        if (State.state.featureSwitchShareScreen.data) {
            tabs.push({header: Svg.share, content: new ShareScreen()});
        }

        if (State.state.featureSwitchMoreQuests.data) {

            tabs.push({
                header: Svg.add_img,
                content: new MoreScreen()
            });
        }


        tabs.push({
                header: Svg.help    ,
                content: new VariableUiElement(State.state.osmConnection.userDetails.map(userdetails => {
                    if (userdetails.csCount < State.userJourney.mapCompleteHelpUnlock) {
                        return ""
                    }
                    return new Combine([Translations.t.general.aboutMapcomplete, "<br/>Version "+State.vNumber]).Render();
                }, [Locale.language]))
            }
        );


        return new TabbedComponent(tabs, State.state.welcomeMessageOpenedTab)
            .ListenTo(State.state.osmConnection.userDetails);

    }


    static InitWelcomeMessage() {

        const fullOptions = this.CreateWelcomePane();

        const help = Svg.help_svg().SetClass("open-welcome-button");
        const close = Svg.close_svg().SetClass("close-welcome-button");
        const checkbox = new CheckBox(
            new Combine([
                close,
                fullOptions
                    .SetClass("welcomeMessage")
                    .onClick(() => {/*Catch the click*/
                    })]),
            help
            , true
        ).AttachTo("messagesbox");
        const openedTime = new Date().getTime();
        State.state.locationControl.addCallback(() => {
            if (new Date().getTime() - openedTime < 15 * 1000) {
                // Don't autoclose the first 15 secs when the map is moving
                return;
            }
            checkbox.isEnabled.setData(false);
        })


        const fullOptions2 = this.CreateWelcomePane();
        State.state.fullScreenMessage.setData(fullOptions2)

        Svg.help_svg()
            .SetClass("open-welcome-button")
            .SetClass("shadow")
            .onClick(() => {
                State.state.fullScreenMessage.setData(fullOptions2)
            }).AttachTo("help-button-mobile");


    }
    
    private static GenerateLayerControlPanel() {


        let layerControlPanel: UIElement = undefined;
        if (State.state.layoutToUse.data.enableBackgroundLayerSelection) {
            layerControlPanel = new BackgroundSelector();
            layerControlPanel.SetStyle("margin:1em");
            layerControlPanel.onClick(() => {            });
        }

        if (State.state.filteredLayers.data.length > 1) {
            const layerSelection = new LayerSelection();
            layerSelection.onClick(() => {
            });
            layerControlPanel = new Combine([layerSelection, "<br/>", layerControlPanel]);
        }
        return layerControlPanel;
    }

    static InitLayerSelection() {
        InitUiElements.OnlyIf(State.state.featureSwitchLayers, () => {

            const layerControlPanel = this.GenerateLayerControlPanel();
            if (layerControlPanel === undefined) {
                return;
            }

            layerControlPanel.SetStyle("display:block;padding:0.75em;border-radius:1em;");
            const closeButton = Svg.close_svg().SetClass("layer-selection-toggle").SetStyle("  background: var(--subtle-detail-color);")
            const checkbox = new CheckBox(
                new Combine([
                    closeButton,
                    layerControlPanel]).SetStyle("display:flex;flex-direction:row;")
                    .SetClass("hidden-on-mobile")
                ,
                Svg.layers_svg().SetClass("layer-selection-toggle"),
                State.state.layerControlIsOpened
            );

            checkbox.AttachTo("layer-selection");


            State.state.bm.Location.addCallback(() => {
                // Close the layer selection when the map is moved
                checkbox.isEnabled.setData(false);
            });

            const fullScreen = this.GenerateLayerControlPanel();
            checkbox.isEnabled.addCallback(isEnabled => {
                if (isEnabled) {
                    State.state.fullScreenMessage.setData(fullScreen);
                }
            })
            State.state.fullScreenMessage.addCallbackAndRun(latest => {
                if (latest === undefined) {
                    checkbox.isEnabled.setData(false);
                }
            })

        });
    }


    static CreateAttribution() {
        return new VariableUiElement(
            State.state.locationControl.map((location) => {
                const mapComplete = new Link(`Mapcomplete ${State.vNumber}`, 'https://github.com/pietervdvn/MapComplete', true);
                const reportBug = new Link(Svg.bug_img, "https://github.com/pietervdvn/MapComplete/issues", true);

                const layoutId = State.state.layoutToUse.data.id;
                const osmChaLink = `https://osmcha.org/?filters=%7B%22comment%22%3A%5B%7B%22label%22%3A%22%23${layoutId}%22%2C%22value%22%3A%22%23${layoutId}%22%7D%5D%2C%22date__gte%22%3A%5B%7B%22label%22%3A%222020-07-05%22%2C%22value%22%3A%222020-07-05%22%7D%5D%2C%22editor%22%3A%5B%7B%22label%22%3A%22MapComplete%22%2C%22value%22%3A%22MapComplete%22%7D%5D%7D`
                const stats = new Link(Svg.statistics_img, osmChaLink, true)
                let editHere: (UIElement | string) = "";
                if (location !== undefined) {
                    const idLink = `https://www.openstreetmap.org/edit?editor=id#map=${location.zoom}/${location.lat}/${location.lon}`
                    editHere = new Link(Svg.pencil_img, idLink, true);
                }
                let editWithJosm: (UIElement | string) = ""
                if (location !== undefined &&
                    State.state.osmConnection !== undefined &&
                    State.state.bm !== undefined &&
                    State.state.osmConnection.userDetails.data.csCount >= State.userJourney.tagsVisibleAndWikiLinked) {
                    const bounds = (State.state.bm as Basemap).map.getBounds();
                    const top = bounds.getNorth();
                    const bottom = bounds.getSouth();
                    const right = bounds.getEast();
                    const left = bounds.getWest();

                    const josmLink = `http://127.0.0.1:8111/load_and_zoom?left=${left}&right=${right}&top=${top}&bottom=${bottom}`
                    editWithJosm = new Link(Svg.josm_logo_img, josmLink, true);
                }
                return new Combine([mapComplete, reportBug, " | ", stats, " | ", editHere, editWithJosm]).Render();

            }, [State.state.osmConnection.userDetails])
                
        ).SetClass("map-attribution")
    }

    static InitBaseMap() {
        const bm = new Basemap("leafletDiv", State.state.locationControl, this.CreateAttribution());
        State.state.bm = bm;
        State.state.layerUpdater = new UpdateFromOverpass(State.state);

        State.state.availableBackgroundLayers = new AvailableBaseLayers(State.state).availableEditorLayers;
        const queryParam = QueryParameters.GetQueryParameter("background", State.state.layoutToUse.data.defaultBackgroundId, "The id of the background layer to start with");

        queryParam.addCallbackAndRun((selectedId: string) => {
            const available = State.state.availableBackgroundLayers.data;
            for (const layer of available) {
                if (layer.id === selectedId) {
                    State.state.bm.CurrentLayer.setData(layer);
                }
            }
        })

        State.state.bm.CurrentLayer.addCallbackAndRun(currentLayer => {
            queryParam.setData(currentLayer.id);
        });

    }


    static InitLayers() {

        const flayers: FilteredLayer[] = []

        const state = State.state;

        for (const layer of state.layoutToUse.data.layers) {

            if (typeof (layer) === "string") {
                throw "Layer " + layer + " was not substituted";
            }

            const generateInfo = (tagsES) => {

                return new FeatureInfoBox(
                    tagsES,
                    layer,
                )
            };

            const flayer: FilteredLayer = FilteredLayer.fromDefinition(layer, generateInfo);
            flayers.push(flayer);

            QueryParameters.GetQueryParameter("layer-" + layer.id, "true", "Wehter or not layer "+layer.id+" is shown")
                .map<boolean>((str) => str !== "false", [], (b) => b.toString())
                .syncWith(
                    flayer.isDisplayed
                )
        }

        State.state.filteredLayers.setData(flayers);
    }

}