import Translations from "./UI/i18n/Translations";
import {TabbedComponent} from "./UI/Base/TabbedComponent";
import {ShareScreen} from "./UI/ShareScreen";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {CheckBox} from "./UI/Input/CheckBox";
import Combine from "./UI/Base/Combine";
import {UIElement} from "./UI/UIElement";
import {MoreScreen} from "./UI/MoreScreen";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {FeatureInfoBox} from "./UI/FeatureInfoBox";
import {Basemap} from "./Logic/Leaflet/Basemap";
import {State} from "./State";
import {WelcomeMessage} from "./UI/WelcomeMessage";
import {Img} from "./UI/Img";
import {DropDown} from "./UI/Input/DropDown";
import {LayerSelection} from "./UI/LayerSelection";
import {Preset} from "./Customizations/LayerDefinition";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {LayerUpdater} from "./Logic/LayerUpdater";
import {UIEventSource} from "./Logic/UIEventSource";
import {QueryParameters} from "./Logic/Web/QueryParameters";
import {PersonalLayout} from "./Logic/PersonalLayout";
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
import {Layout} from "./Customizations/Layout";
import {LocalStorageSource} from "./Logic/Web/LocalStorageSource";
import {FromJSON} from "./Customizations/JSON/FromJSON";
import {Utils} from "./Utils";
import BackgroundSelector from "./UI/BackgroundSelector";

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

    static InitAll(layoutToUse: Layout, layoutFromBase64: string, testing: UIEventSource<string>, layoutName: string,
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


        function updateFavs() {
            const favs = State.state.favouriteLayers.data ?? [];

            layoutToUse.layers = [];
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

        if (layoutToUse === AllKnownLayouts.allSets[PersonalLayout.NAME]) {

            State.state.favouriteLayers.addCallback(updateFavs);
            State.state.installedThemes.addCallback(updateFavs);
        }


        /**
         * Show the questions and information for the selected element
         * This is given to the div which renders fullscreen on mobile devices
         */
        State.state.selectedElement.addCallback((feature) => {
                if (feature?.feature?.properties === undefined) {
                    return;
                }
                const data = feature.feature.properties;
                // Which is the applicable set?
                for (const layer of layoutToUse.layers) {
                    if (typeof layer === "string") {
                        continue;
                    }
                    const applicable = layer.overpassFilter.matches(TagUtils.proprtiesToKV(data));
                    if (applicable) {
                        // This layer is the layer that gives the questions

                        const featureBox = new FeatureInfoBox(
                            feature.feature,
                            State.state.allElements.getElement(data.id),
                            layer.title,
                            layer.elementsToShow,
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
            const content = `<a href='${url}' target='_blank'><span class='iframe-escape'><img src='assets/pop-out.svg'></span></a>`;
            new FixedUiElement(content).AttachTo("messagesbox");
            new FixedUiElement(content).AttachTo("help-button-mobile")
        }


        new GeoLocationHandler().AttachTo("geolocate-button");
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
            const layoutToUse = FromJSON.FromBase64(hash);
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
        if (layoutToUse.id === PersonalLayout.NAME) {
            welcome = new PersonalLayersPanel();
        }

        const tabs = [
            {header: Img.AsImageElement(layoutToUse.icon), content: welcome},
            {header: `<img src='./assets/osm-logo.svg'>`, content: 
                Translations.t.general.openStreetMapIntro},

        ]

        if (State.state.featureSwitchShareScreen.data) {
            tabs.push({header: `<img src='./assets/share.svg'>`, content: new ShareScreen()});
        }

        if (State.state.featureSwitchMoreQuests.data) {

            tabs.push({
                header: `<img src='./assets/add.svg'>`,
                content: new VariableUiElement(State.state.osmConnection.userDetails.map(userdetails => {
                    if(userdetails.csCount < State.userJourney.moreScreenUnlock){
                        return "";
                    }
                    return new MoreScreen().Render()
                }, [Locale.language]))
            });
        }


        tabs.push({
                header: `<img src='./assets/help.svg'>`,
                content: new VariableUiElement(State.state.osmConnection.userDetails.map(userdetails => {
                    if (userdetails.csCount < State.userJourney.mapCompleteHelpUnlock) {
                        return ""
                    }
                    return Translations.t.general.aboutMapcomplete.Render();
                }, [Locale.language]))
            }
        );


        return new TabbedComponent(tabs, State.state.welcomeMessageOpenedTab)
            .ListenTo(State.state.osmConnection.userDetails);

    }


    static InitWelcomeMessage() {

        const fullOptions = this.CreateWelcomePane();

        const help = new FixedUiElement(`<div class='collapse-button-img'><img src='assets/help.svg'  alt='help'></div>`);
        const close = new FixedUiElement(`<div class='collapse-button-img'><img src='assets/close.svg'  alt='close'></div>`);
        const checkbox = new CheckBox(
            new Combine([
                "<span class='collapse-button'>", close, "</span>",
                "<span id='welcomeMessage'>", fullOptions.onClick(() => {
                }), "</span>"]),
            new Combine(["<span class='open-button'>", help, "</span>"])
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
        new FixedUiElement(`<div class='collapse-button-img shadow'><img src='assets/help.svg'  alt='help'></div>`).onClick(() => {
            State.state.fullScreenMessage.setData(fullOptions2)
        }).AttachTo("help-button-mobile");


    }
    
    static CreateLanguagePicker(label: string | UIElement = "") {

        if (State.state.layoutToUse.data.supportedLanguages.length <= 1) {
            return undefined;
        }

        return new DropDown(label, State.state.layoutToUse.data.supportedLanguages.map(lang => {
                return {value: lang, shown: lang}
            }
        ), Locale.language);
    }

    private static GenerateLayerControlPanel() {
        let layerControlPanel: UIElement = new BackgroundSelector(State.state);
        layerControlPanel.SetStyle("margin:1em");
        layerControlPanel.onClick(() => {});
        if (State.state.filteredLayers.data.length > 1) {
            const layerSelection = new LayerSelection();
            layerSelection.onClick(() => {});
            layerControlPanel = new Combine([layerSelection, "<br/>",layerControlPanel]);
        }
        return layerControlPanel;
    }

    static InitLayerSelection() {
        InitUiElements.OnlyIf(State.state.featureSwitchLayers, () => {

            const layerControlPanel = this.GenerateLayerControlPanel()
                .SetStyle("display:block;padding:1em;border-radius:1em;");
            const closeButton = new Combine([Img.openFilterButton])
                .SetStyle("display:block; width: min-content; background: #e5f5ff;padding:1em; border-radius:1em;");
            const checkbox = new CheckBox(
                new Combine([
                    closeButton,
                    layerControlPanel]).SetStyle("display:flex;flex-direction:row;")
                    .SetClass("hidden-on-mobile")
                ,
                new Combine([Img.closedFilterButton])
                    .SetStyle("display:block;border-radius:50%;background:white;padding:1em;"),
                State.state.layerControlIsOpened
            );
            checkbox
                .AttachTo("layer-selection");


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
    
    static InitBaseMap(){
        const bm = new Basemap("leafletDiv", State.state.locationControl, new VariableUiElement(
            State.state.locationControl.map((location) => {
                const mapComplete = `<a href='https://github.com/pietervdvn/MapComplete' target='_blank'>Mapcomplete ${State.vNumber}</a>`
                const reportBug = `<a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'><img src='./assets/bug.svg' class='small-userbadge-icon'></a>`;
               
                const layoutId = State.state.layoutToUse.data.id;
                const osmChaLink = `https://osmcha.org/?filters=%7B%22comment%22%3A%5B%7B%22label%22%3A%22%23${layoutId}%22%2C%22value%22%3A%22%23${layoutId}%22%7D%5D%2C%22date__gte%22%3A%5B%7B%22label%22%3A%222020-07-05%22%2C%22value%22%3A%222020-07-05%22%7D%5D%2C%22editor%22%3A%5B%7B%22label%22%3A%22MapComplete%22%2C%22value%22%3A%22MapComplete%22%7D%5D%7D`
                const stats = `<a href='${osmChaLink}' target='_blank'><img src='./assets/statistics.svg' class='small-userbadge-icon'></a>`;
                let editHere = "";
                if (location !== undefined) {
                    editHere =
                        "<a href='https://www.openstreetmap.org/edit?editor=id#map=" + location.zoom + "/" + location.lat + "/" + location.lon + "' target='_blank'>" +
                        "<img src='./assets/pencil.svg' alt='edit here' class='small-userbadge-icon'>" +
                        "</a>"
                }
                let editWithJosm = ""
                if(location !== undefined &&
                    State.state.osmConnection !== undefined &&
                    State.state.bm !== undefined &&
                    State.state.osmConnection.userDetails.data.csCount >= State.userJourney.tagsVisibleAndWikiLinked){
                    const bounds = (State.state.bm as Basemap).map.getBounds();
                    const top = bounds.getNorth();
                    const bottom = bounds.getSouth();
                    const right = bounds.getEast();
                    const left = bounds.getWest();

                    const josmLink = `http://127.0.0.1:8111/load_and_zoom?left=${left}&right=${right}&top=${top}&bottom=${bottom}`
                    editWithJosm =
                        `<a href='${josmLink}' target='_blank'><img src='./assets/josm_logo.svg' alt='edit here' class='small-userbadge-icon'></a>`
                }
                return new Combine([mapComplete, reportBug, " | ", stats, " | ", editHere, editWithJosm]).Render();

            }, [State.state.osmConnection.userDetails])
            )
        );
        State.state.bm = bm;
        State.state.layerUpdater = new LayerUpdater(State.state);
        

    }


    static InitLayers() {

        const flayers: FilteredLayer[] = []
        const presets: Preset[] = [];

        const state = State.state;

        for (const layer of state.layoutToUse.data.layers) {

            if (typeof (layer) === "string") {
                throw "Layer " + layer + " was not substituted";
            }

            const generateInfo = (tagsES, feature) => {

                return new FeatureInfoBox(
                    feature,
                    tagsES,
                    layer.title,
                    layer.elementsToShow,
                )
            };

            for (const preset of layer.presets ?? []) {

                if (preset.icon === undefined) {
                    const tags = {};
                    for (const tag of preset.tags) {
                        const k = tag.key;
                        if (typeof (k) === "string") {
                            tags[k] = tag.value;
                        }
                    }
                    preset.icon = layer.style(tags)?.icon?.iconUrl;
                }

                presets.push(preset);
            }

            const flayer: FilteredLayer = FilteredLayer.fromDefinition(layer, generateInfo);
            flayers.push(flayer);

            QueryParameters.GetQueryParameter("layer-" + layer.id, "true")
                .map<boolean>((str) => str !== "false", [], (b) => b.toString())
                .syncWith(
                    flayer.isDisplayed
                )
        }

        State.state.filteredLayers.setData(flayers);
        State.state.presets.setData(presets);

    }

}