import {FixedUiElement} from "./UI/Base/FixedUiElement";
import CheckBox from "./UI/Input/CheckBox";
import Combine from "./UI/Base/Combine";
import {Basemap} from "./UI/BigComponents/Basemap";
import State from "./State";
import LoadFromOverpass from "./Logic/Actors/UpdateFromOverpass";
import {UIEventSource} from "./Logic/UIEventSource";
import {QueryParameters} from "./Logic/Web/QueryParameters";
import StrayClickHandler from "./Logic/Actors/StrayClickHandler";
import SimpleAddUI from "./UI/BigComponents/SimpleAddUI";
import CenterMessageBox from "./UI/CenterMessageBox";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";
import {TagUtils} from "./Logic/Tags";
import UserBadge from "./UI/BigComponents/UserBadge";
import SearchAndGo from "./UI/BigComponents/SearchAndGo";
import FullScreenMessageBox from "./UI/FullScreenMessageBoxHandler";
import GeoLocationHandler from "./Logic/Actors/GeoLocationHandler";
import {LocalStorageSource} from "./Logic/Web/LocalStorageSource";
import {Utils} from "./Utils";
import FeatureInfoBox from "./UI/Popup/FeatureInfoBox";
import Svg from "./Svg";
import Link from "./UI/Base/Link";
import * as personal from "./assets/themes/personalLayout/personalLayout.json"
import LayoutConfig from "./Customizations/JSON/LayoutConfig";
import * as L from "leaflet";
import Img from "./UI/Base/Img";
import UserDetails from "./Logic/Osm/OsmConnection";
import Attribution from "./UI/BigComponents/Attribution";
import MetaTagging from "./Logic/MetaTagging";
import FeatureSourceMerger from "./Logic/FeatureSource/FeatureSourceMerger";
import RememberingSource from "./Logic/FeatureSource/RememberingSource";
import FilteringFeatureSource from "./Logic/FeatureSource/FilteringFeatureSource";
import WayHandlingApplyingFeatureSource from "./Logic/FeatureSource/WayHandlingApplyingFeatureSource";
import NoOverlapSource from "./Logic/FeatureSource/NoOverlapSource";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
import LayerResetter from "./Logic/Actors/LayerResetter";
import FullWelcomePaneWithTabs from "./UI/BigComponents/FullWelcomePaneWithTabs";
import LayerControlPanel from "./UI/BigComponents/LayerControlPanel";
import FeatureSwitched from "./UI/Base/FeatureSwitched";
import FeatureDuplicatorPerLayer from "./Logic/FeatureSource/FeatureDuplicatorPerLayer";
import LayerConfig from "./Customizations/JSON/LayerConfig";
import ShowDataLayer from "./UI/ShowDataLayer";
import Hash from "./Logic/Web/Hash";
import HistoryHandling from "./Logic/Actors/HistoryHandling";

export class InitUiElements {


    static InitAll(layoutToUse: LayoutConfig, layoutFromBase64: string, testing: UIEventSource<string>, layoutName: string,
                   layoutDefinition: string = "") {
        if (layoutToUse === undefined) {
            console.log("Incorrect layout")
            new FixedUiElement(`Error: incorrect layout <i>${layoutName}</i><br/><a href='https://${window.location.host}/index.html'>Go back</a>`).AttachTo("centermessage").onClick(() => {
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

                if (feature === undefined) {
                    State.state.fullScreenMessage.setData(undefined);
                }
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
                    if (!applicable) {
                        continue;
                    }

                    if ((layer.title ?? null) === null && layer.tagRenderings.length === 0) {
                        continue;
                    }

                    // This layer is the layer that gives the questions
                    const featureBox = new FeatureInfoBox(
                        State.state.allElements.getEventSourceById(data.id),
                        layer
                    );

                    State.state.fullScreenMessage.setData({
                        content: featureBox,
                        hashText: feature.properties.id.replace("/", "_"),
                        titleText: featureBox.title
                    });
                    break;
                }
            }
        );

        new HistoryHandling(Hash.hash, State.state.fullScreenMessage);

        InitUiElements.OnlyIf(State.state.featureSwitchUserbadge, () => {
            new UserBadge().AttachTo('userbadge');
        });

        InitUiElements.OnlyIf((State.state.featureSwitchSearch), () => {
            new SearchAndGo().AttachTo("searchbox");
        });


        new FullScreenMessageBox().AttachTo("messagesboxmobile");


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

        State.state.osmConnection.userDetails.map((userDetails: UserDetails) => userDetails?.home)
            .addCallbackAndRun(home => {
                if (home === undefined) {
                    return;
                }
                const color = getComputedStyle(document.body).getPropertyValue("--subtle-detail-color")
                const icon = L.icon({
                    iconUrl: Img.AsData(Svg.home_white_bg.replace(/#ffffff/g, color)),
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });
                const marker = L.marker([home.lat, home.lon], {icon: icon})
                marker.addTo(State.state.leafletMap.data)
            });

        new FeatureSwitched(
            new GeoLocationHandler(
                State.state.currentGPSLocation,
                State.state.leafletMap
            )
                .SetStyle(`position:relative;display:block;border: solid 2px #0005;cursor: pointer; z-index: 999; /*Just below leaflets zoom*/background-color: white;border-radius: 5px;width: 43px;height: 43px;`)
            , State.state.featureSwitchGeolocation)
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

    private static OnlyIf(featureSwitch: UIEventSource<boolean>, callback: () => void) {
        featureSwitch.addCallbackAndRun(() => {

            if (featureSwitch.data) {
                callback();
            }
        });
    }

    private static InitWelcomeMessage() {

        const fullOptions = new FullWelcomePaneWithTabs();

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

        State.state.selectedElement.addCallback(selected => {
            if (selected !== undefined) {
                checkbox.isEnabled.setData(false);
            }
        })


        const fullOptions2 = new FullWelcomePaneWithTabs();
        State.state.fullScreenMessage.setData({content: fullOptions2, hashText: "welcome"})

        Svg.help_svg()
            .SetClass("open-welcome-button")
            .SetClass("shadow")
            .onClick(() => {
                State.state.fullScreenMessage.setData({content: fullOptions2, hashText: "welcome"})
            }).AttachTo("help-button-mobile");


    }

    private static InitLayerSelection() {
        InitUiElements.OnlyIf(State.state.featureSwitchLayers, () => {

            const layerControlPanel = new LayerControlPanel()
                .SetStyle("display:block;padding:0.75em;border-radius:1em;");
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


            State.state.locationControl
                .addCallback(() => {
                    // Close the layer selection when the map is moved
                    //  checkbox.isEnabled.setData(false);
                });

            const fullScreen = new LayerControlPanel();
            checkbox.isEnabled.addCallback(isEnabled => {
                if (isEnabled) {
                    State.state.fullScreenMessage.setData({content: fullScreen, hashText: "layer-select"});
                }
            })
            State.state.fullScreenMessage.addCallback(latest => {
                if (latest === undefined) {
                    checkbox.isEnabled.setData(false);
                }
            })

        });
    }

    private static InitBaseMap() {

        State.state.availableBackgroundLayers = new AvailableBaseLayers(State.state.locationControl).availableEditorLayers;
        State.state.backgroundLayer = QueryParameters.GetQueryParameter("background",
            State.state.layoutToUse.data.defaultBackgroundId ?? AvailableBaseLayers.osmCarto.id,
            "The id of the background layer to start with")
            .map((selectedId: string) => {
                const available = State.state.availableBackgroundLayers.data;
                for (const layer of available) {
                    if (layer.id === selectedId) {
                        return layer;
                    }
                }
                return AvailableBaseLayers.osmCarto;
            }, [], layer => layer.id);


        new LayerResetter(
            State.state.backgroundLayer, State.state.locationControl,
            State.state.availableBackgroundLayers, State.state.layoutToUse.map((layout: LayoutConfig) => layout.defaultBackgroundId));


        const attr = new Attribution(State.state.locationControl, State.state.osmConnection.userDetails, State.state.layoutToUse,
            State.state.leafletMap);
        const bm = new Basemap("leafletDiv",
            State.state.locationControl,
            State.state.backgroundLayer,
            State.state.LastClickLocation,
            attr
        );
        State.state.leafletMap.setData(bm.map);
    }

    private static InitLayers() {


        const state = State.state;
        const flayers: { layerDef: LayerConfig, isDisplayed: UIEventSource<boolean> }[] = []
        for (const layer of state.layoutToUse.data.layers) {

            if (typeof (layer) === "string") {
                throw "Layer " + layer + " was not substituted";
            }

            const isDisplayed = QueryParameters.GetQueryParameter("layer-" + layer.id, "true", "Wether or not layer " + layer.id + " is shown")
                .map<boolean>((str) => str !== "false", [], (b) => b.toString());
            const flayer = {
                isDisplayed: isDisplayed,
                layerDef: layer
            }
            flayers.push(flayer);
        }

        State.state.filteredLayers.setData(flayers);


        const updater = new LoadFromOverpass(state.locationControl, state.layoutToUse, state.leafletMap);
        State.state.layerUpdater = updater;


        const source =
            new FilteringFeatureSource(
                flayers,
                State.state.locationControl,
                new FeatureSourceMerger([
                    new RememberingSource(new WayHandlingApplyingFeatureSource(flayers,
                        new NoOverlapSource(flayers, new FeatureDuplicatorPerLayer(flayers, updater))
                    )),
                    new FeatureDuplicatorPerLayer(flayers, State.state.changes)
                ])
            );

        source.features.addCallback((featuresFreshness: { feature: any, freshness: Date }[]) => {
            let features = featuresFreshness.map(ff => ff.feature);
            features.forEach(feature => {
                State.state.allElements.addElement(feature);
            })
            MetaTagging.addMetatags(features);
        })

        new ShowDataLayer(source.features, State.state.leafletMap,
            State.state.layoutToUse.data);


    }

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


            new StrayClickHandler(
                State.state.LastClickLocation,
                State.state.selectedElement,
                State.state.filteredLayers,
                State.state.leafletMap,
                State.state.fullScreenMessage,
                () => {
                    return new SimpleAddUI();
                }
            );
        });

        new CenterMessageBox().AttachTo("centermessage");

    }
}