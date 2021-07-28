import {FixedUiElement} from "./UI/Base/FixedUiElement";
import Toggle from "./UI/Input/Toggle";
import {Basemap} from "./UI/BigComponents/Basemap";
import State from "./State";
import LoadFromOverpass from "./Logic/Actors/OverpassFeatureSource";
import {UIEventSource} from "./Logic/UIEventSource";
import {QueryParameters} from "./Logic/Web/QueryParameters";
import StrayClickHandler from "./Logic/Actors/StrayClickHandler";
import SimpleAddUI from "./UI/BigComponents/SimpleAddUI";
import CenterMessageBox from "./UI/CenterMessageBox";
import UserBadge from "./UI/BigComponents/UserBadge";
import SearchAndGo from "./UI/BigComponents/SearchAndGo";
import {LocalStorageSource} from "./Logic/Web/LocalStorageSource";
import {Utils} from "./Utils";
import Svg from "./Svg";
import Link from "./UI/Base/Link";
import * as personal from "./assets/themes/personal/personal.json"
import LayoutConfig from "./Customizations/JSON/LayoutConfig";
import * as L from "leaflet";
import Img from "./UI/Base/Img";
import UserDetails from "./Logic/Osm/OsmConnection";
import Attribution from "./UI/BigComponents/Attribution";
import LayerResetter from "./Logic/Actors/LayerResetter";
import FullWelcomePaneWithTabs from "./UI/BigComponents/FullWelcomePaneWithTabs";
import ShowDataLayer from "./UI/ShowDataLayer";
import Hash from "./Logic/Web/Hash";
import FeaturePipeline from "./Logic/FeatureSource/FeaturePipeline";
import ScrollableFullScreen from "./UI/Base/ScrollableFullScreen";
import Translations from "./UI/i18n/Translations";
import MapControlButton from "./UI/MapControlButton";
import SelectedFeatureHandler from "./Logic/Actors/SelectedFeatureHandler";
import LZString from "lz-string";
import {LayoutConfigJson} from "./Customizations/JSON/LayoutConfigJson";
import FeatureSource from "./Logic/FeatureSource/FeatureSource";
import AllKnownLayers from "./Customizations/AllKnownLayers";
import LayerConfig from "./Customizations/JSON/LayerConfig";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
import {TagsFilter} from "./Logic/Tags/TagsFilter";
import LeftControls from "./UI/BigComponents/LeftControls";
import RightControls from "./UI/BigComponents/RightControls";

export class InitUiElements {
    static InitAll(
        layoutToUse: LayoutConfig,
        layoutFromBase64: string,
        testing: UIEventSource<string>,
        layoutName: string,
        layoutDefinition: string = ""
    ) {
        if (layoutToUse === undefined) {
            console.log("Incorrect layout");
            new FixedUiElement(
                `Error: incorrect layout <i>${layoutName}</i><br/><a href='https://${window.location.host}/'>Go back</a>`
            )
                .AttachTo("centermessage")
                .onClick(() => {
                });
            throw "Incorrect layout";
        }

        console.log(
            "Using layout: ",
            layoutToUse.id,
            "LayoutFromBase64 is ",
            layoutFromBase64
        );

        State.state = new State(layoutToUse);

        // This 'leaks' the global state via the window object, useful for debugging
        // @ts-ignore
        window.mapcomplete_state = State.state;

        if (layoutToUse.hideFromOverview) {
            State.state.osmConnection
                .GetPreference("hidden-theme-" + layoutToUse.id + "-enabled")
                .setData("true");
        }

        if (layoutFromBase64 !== "false") {
            State.state.layoutDefinition = layoutDefinition;
            console.log(
                "Layout definition:",
                Utils.EllipsesAfter(State.state.layoutDefinition, 100)
            );
            if (testing.data !== "true") {
                State.state.osmConnection.OnLoggedIn(() => {
                    State.state.osmConnection
                        .GetLongPreference("installed-theme-" + layoutToUse.id)
                        .setData(State.state.layoutDefinition);
                });
            } else {
                console.warn(
                    "NOT saving custom layout to OSM as we are tesing -> probably in an iFrame"
                );
            }
        }

        function updateFavs() {
            // This is purely for the personal theme to load the layers there
            const favs = State.state.favouriteLayers.data ?? [];

            const neededLayers = new Set<LayerConfig>();

            console.log("Favourites are: ", favs);
            layoutToUse.layers.splice(0, layoutToUse.layers.length);
            let somethingChanged = false;
            for (const fav of favs) {
                if (AllKnownLayers.sharedLayers.has(fav)) {
                    const layer = AllKnownLayers.sharedLayers.get(fav);
                    if (!neededLayers.has(layer)) {
                        neededLayers.add(layer);
                        somethingChanged = true;
                    }
                }

                for (const layouts of State.state.installedThemes.data) {
                    for (const layer of layouts.layout.layers) {
                        if (typeof layer === "string") {
                            continue;
                        }
                        if (layer.id === fav) {
                            if (!neededLayers.has(layer)) {
                                neededLayers.add(layer);
                                somethingChanged = true;
                            }
                        }
                    }
                }
            }
            if (somethingChanged) {
                console.log("layoutToUse.layers:", layoutToUse.layers);
                State.state.layoutToUse.data.layers = Array.from(neededLayers);
                State.state.layoutToUse.ping();
                State.state.layerUpdater?.ForceRefresh();
            }
        }

        if (layoutToUse.customCss !== undefined) {
            Utils.LoadCustomCss(layoutToUse.customCss);
        }

        InitUiElements.InitBaseMap();

        InitUiElements.OnlyIf(State.state.featureSwitchUserbadge, () => {
            new UserBadge().AttachTo("userbadge");
        });

        InitUiElements.OnlyIf(State.state.featureSwitchSearch, () => {
            new SearchAndGo().AttachTo("searchbox");
        });

        InitUiElements.OnlyIf(State.state.featureSwitchWelcomeMessage, () => {
            InitUiElements.InitWelcomeMessage();
        });

        if (
            (window != window.top && !State.state.featureSwitchWelcomeMessage.data) ||
            State.state.featureSwitchIframe.data
        ) {
            const currentLocation = State.state.locationControl;
            const url = `${window.location.origin}${window.location.pathname}?z=${
                currentLocation.data.zoom ?? 0
            }&lat=${currentLocation.data.lat ?? 0}&lon=${
                currentLocation.data.lon ?? 0
            }`;
            new MapControlButton(
                new Link(Svg.pop_out_img, url, true).SetClass(
                    "block w-full h-full p-1.5"
                )
            ).AttachTo("messagesbox");
        }

        State.state.osmConnection.userDetails
            .map((userDetails: UserDetails) => userDetails?.home)
            .addCallbackAndRunD((home) => {
                const color = getComputedStyle(document.body).getPropertyValue(
                    "--subtle-detail-color"
                );
                const icon = L.icon({
                    iconUrl: Img.AsData(Svg.home_white_bg.replace(/#ffffff/g, color)),
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                });
                const marker = L.marker([home.lat, home.lon], {icon: icon});
                marker.addTo(State.state.leafletMap.data);
            });


        if (layoutToUse.id === personal.id) {
            updateFavs();
        }

        InitUiElements.setupAllLayerElements();

        if (layoutToUse.id === personal.id) {
            State.state.favouriteLayers.addCallback(updateFavs);
            State.state.installedThemes.addCallback(updateFavs);
        } else {
            State.state.locationControl.ping();
        }

        // Reset the loading message once things are loaded
        new CenterMessageBox().AttachTo("centermessage");
        document
            .getElementById("centermessage")
            .classList.add("pointer-events-none");
    }

    static LoadLayoutFromHash(
        userLayoutParam: UIEventSource<string>
    ): [LayoutConfig, string] {
        try {
            let hash = location.hash.substr(1);
            const layoutFromBase64 = userLayoutParam.data;
            // layoutFromBase64 contains the name of the theme. This is partly to do tracking with goat counter

            const dedicatedHashFromLocalStorage = LocalStorageSource.Get(
                "user-layout-" + layoutFromBase64.replace(" ", "_")
            );
            if (dedicatedHashFromLocalStorage.data?.length < 10) {
                dedicatedHashFromLocalStorage.setData(undefined);
            }

            const hashFromLocalStorage = LocalStorageSource.Get(
                "last-loaded-user-layout"
            );
            if (hash.length < 10) {
                hash = dedicatedHashFromLocalStorage.data ?? hashFromLocalStorage.data;
            } else {
                console.log("Saving hash to local storage");
                hashFromLocalStorage.setData(hash);
                dedicatedHashFromLocalStorage.setData(hash);
            }

            let json: {};
            try {
                json = JSON.parse(atob(hash));
            } catch (e) {
                // We try to decode with lz-string
                json = JSON.parse(
                    Utils.UnMinify(LZString.decompressFromBase64(hash))
                ) as LayoutConfigJson;
            }

            // @ts-ignore
            const layoutToUse = new LayoutConfig(json, false);
            userLayoutParam.setData(layoutToUse.id);
            return [layoutToUse, btoa(Utils.MinifyJSON(JSON.stringify(json)))];
        } catch (e) {
            new FixedUiElement(
                "Error: could not parse the custom layout:<br/> " + e
            ).AttachTo("centermessage");
            throw e;
        }
    }

    private static OnlyIf(
        featureSwitch: UIEventSource<boolean>,
        callback: () => void
    ) {
        featureSwitch.addCallbackAndRun(() => {
            if (featureSwitch.data) {
                callback();
            }
        });
    }

    private static InitWelcomeMessage() {
        const isOpened = new UIEventSource<boolean>(false);
        const fullOptions = new FullWelcomePaneWithTabs(isOpened);

        // ?-Button on Desktop, opens panel with close-X.
        const help = new MapControlButton(Svg.help_svg());
        help.onClick(() => isOpened.setData(true));
        new Toggle(fullOptions.SetClass("welcomeMessage"), help, isOpened).AttachTo(
            "messagesbox"
        );
        const openedTime = new Date().getTime();
        State.state.locationControl.addCallback(() => {
            if (new Date().getTime() - openedTime < 15 * 1000) {
                // Don't autoclose the first 15 secs when the map is moving
                return;
            }
            isOpened.setData(false);
        });

        State.state.selectedElement.addCallbackAndRunD((_) => {
            isOpened.setData(false);
        });
        isOpened.setData(
            Hash.hash.data === undefined ||
            Hash.hash.data === "" ||
            Hash.hash.data == "welcome"
        );
    }

    private static InitBaseMap() {
        State.state.availableBackgroundLayers =
            AvailableBaseLayers.AvailableLayersAt(State.state.locationControl);
        State.state.backgroundLayer = State.state.backgroundLayerId.map(
            (selectedId: string) => {
                if (selectedId === undefined) {
                    return AvailableBaseLayers.osmCarto;
                }

                const available = State.state.availableBackgroundLayers.data;
                for (const layer of available) {
                    if (layer.id === selectedId) {
                        return layer;
                    }
                }
                return AvailableBaseLayers.osmCarto;
            },
            [State.state.availableBackgroundLayers],
            (layer) => layer.id
        );

        new LayerResetter(
            State.state.backgroundLayer,
            State.state.locationControl,
            State.state.availableBackgroundLayers,
            State.state.layoutToUse.map(
                (layout: LayoutConfig) => layout.defaultBackgroundId
            )
        );

        const attr = new Attribution(
            State.state.locationControl,
            State.state.osmConnection.userDetails,
            State.state.layoutToUse,
            State.state.leafletMap
        );

        const bm = new Basemap(
            "leafletDiv",
            State.state.locationControl,
            State.state.backgroundLayer,
            State.state.LastClickLocation,
            attr
        );
        State.state.leafletMap.setData(bm.map);
        const layout = State.state.layoutToUse.data;
        if (layout.lockLocation) {
            if (layout.lockLocation === true) {
                const tile = Utils.embedded_tile(
                    layout.startLat,
                    layout.startLon,
                    layout.startZoom - 1
                );
                const bounds = Utils.tile_bounds(tile.z, tile.x, tile.y);
                // We use the bounds to get a sense of distance for this zoom level
                const latDiff = bounds[0][0] - bounds[1][0];
                const lonDiff = bounds[0][1] - bounds[1][1];
                layout.lockLocation = [
                    [layout.startLat - latDiff, layout.startLon - lonDiff],
                    [layout.startLat + latDiff, layout.startLon + lonDiff],
                ];
            }
            console.warn("Locking the bounds to ", layout.lockLocation);
            bm.map.setMaxBounds(layout.lockLocation);
            bm.map.setMinZoom(layout.startZoom);
        }
    }

    private static InitLayers(): FeatureSource {
        const state = State.state;
        state.filteredLayers = state.layoutToUse.map((layoutToUse) => {
            const flayers = [];

            for (const layer of layoutToUse.layers) {
                const isDisplayed = QueryParameters.GetQueryParameter(
                    "layer-" + layer.id,
                    "true",
                    "Wether or not layer " + layer.id + " is shown"
                ).map<boolean>(
                    (str) => str !== "false",
                    [],
                    (b) => b.toString()
                );
                const flayer = {
                    isDisplayed: isDisplayed,
                    layerDef: layer,
                    appliedFilters: new UIEventSource<TagsFilter>(undefined)
                };
                flayers.push(flayer);
            }
            return flayers;
        });

        const updater = new LoadFromOverpass(
            state.locationControl,
            state.layoutToUse,
            state.leafletMap
        );
        State.state.layerUpdater = updater;

        const source = new FeaturePipeline(
            state.filteredLayers,
            State.state.changes,
            updater,
            state.osmApiFeatureSource,
            state.layoutToUse,
            state.locationControl,
            state.selectedElement
        );

        State.state.featurePipeline = source;
        new ShowDataLayer(
            source.features,
            State.state.leafletMap,
            State.state.layoutToUse
        );

        const selectedFeatureHandler = new SelectedFeatureHandler(
            Hash.hash,
            State.state.selectedElement,
            source,
            State.state.osmApiFeatureSource
        );
        selectedFeatureHandler.zoomToSelectedFeature(State.state.locationControl);
        return source;
    }

    private static setupAllLayerElements() {
        // ------------- Setup the layers -------------------------------

        const source = InitUiElements.InitLayers();

        new LeftControls(source).AttachTo("bottom-left");
        new RightControls().AttachTo("bottom-right");

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

            const newPointDialogIsShown = new UIEventSource<boolean>(false);
            const addNewPoint = new ScrollableFullScreen(
                () => Translations.t.general.add.title.Clone(),
                () => new SimpleAddUI(newPointDialogIsShown),
                "new",
                newPointDialogIsShown
            );
            addNewPoint.isShown.addCallback((isShown) => {
                if (!isShown) {
                    State.state.LastClickLocation.setData(undefined);
                }
            });

            new StrayClickHandler(
                State.state.LastClickLocation,
                State.state.selectedElement,
                State.state.filteredLayers,
                State.state.leafletMap,
                addNewPoint
            );
        });
    }
}
