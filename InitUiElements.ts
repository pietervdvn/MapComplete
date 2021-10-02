import {FixedUiElement} from "./UI/Base/FixedUiElement";
import Toggle from "./UI/Input/Toggle";
import State from "./State";
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
import * as personal from "./assets/themes/personal/personal.json";
import * as L from "leaflet";
import Img from "./UI/Base/Img";
import Attribution from "./UI/BigComponents/Attribution";
import BackgroundLayerResetter from "./Logic/Actors/BackgroundLayerResetter";
import FullWelcomePaneWithTabs from "./UI/BigComponents/FullWelcomePaneWithTabs";
import ShowDataLayer from "./UI/ShowDataLayer/ShowDataLayer";
import Hash from "./Logic/Web/Hash";
import FeaturePipeline from "./Logic/FeatureSource/FeaturePipeline";
import ScrollableFullScreen from "./UI/Base/ScrollableFullScreen";
import Translations from "./UI/i18n/Translations";
import MapControlButton from "./UI/MapControlButton";
import LZString from "lz-string";
import AvailableBaseLayers from "./Logic/Actors/AvailableBaseLayers";
import LeftControls from "./UI/BigComponents/LeftControls";
import RightControls from "./UI/BigComponents/RightControls";
import {LayoutConfigJson} from "./Models/ThemeConfig/Json/LayoutConfigJson";
import LayoutConfig from "./Models/ThemeConfig/LayoutConfig";
import Minimap from "./UI/Base/Minimap";
import SelectedFeatureHandler from "./Logic/Actors/SelectedFeatureHandler";
import Combine from "./UI/Base/Combine";
import {SubtleButton} from "./UI/Base/SubtleButton";
import ShowTileInfo from "./UI/ShowDataLayer/ShowTileInfo";
import {Tiles} from "./Models/TileRange";
import {TileHierarchyAggregator} from "./UI/ShowDataLayer/TileHierarchyAggregator";
import FilterConfig from "./Models/ThemeConfig/FilterConfig";
import FilteredLayer from "./Models/FilteredLayer";
import {BBox} from "./Logic/BBox";
import {AllKnownLayouts} from "./Customizations/AllKnownLayouts";

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
        
        if(layoutToUse.id === personal.id){
            layoutToUse.layers = AllKnownLayouts.AllPublicLayers()
            for (const layer of layoutToUse.layers) {
                layer.minzoomVisible = Math.max(layer.minzoomVisible, layer.minzoom)
                layer.minzoom = Math.max(16, layer.minzoom)
            }
        }

        State.state = new State(layoutToUse);

        if(layoutToUse.id === personal.id) {
            // Disable overpass all together
            State.state.overpassMaxZoom.setData(0)
            
        }

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

        if (State.state.featureSwitchIframe.data) {
            const currentLocation = State.state.locationControl;
            const url = `${window.location.origin}${
                window.location.pathname
            }?z=${currentLocation.data.zoom ?? 0}&lat=${
                currentLocation.data.lat ?? 0
            }&lon=${currentLocation.data.lon ?? 0}`;
            new MapControlButton(
                new Link(Svg.pop_out_img, url, true).SetClass(
                    "block w-full h-full p-1.5"
                )
            ).AttachTo("messagesbox");
        }

        function addHomeMarker() {
            const userDetails = State.state.osmConnection.userDetails.data;
            if (userDetails === undefined) {
                return false;
            }
            console.log("Adding home location of ", userDetails)
            const home = userDetails.home;
            if (home === undefined) {
                return userDetails.loggedIn; // If logged in, the home is not set and we unregister. If not logged in, we stay registered if a login still comes
            }
            const leaflet = State.state.leafletMap.data;
            if (leaflet === undefined) {
                return false;
            }
            const color = getComputedStyle(document.body).getPropertyValue(
                "--subtle-detail-color"
            );
            const icon = L.icon({
                iconUrl: Img.AsData(
                    Svg.home_white_bg.replace(/#ffffff/g, color)
                ),
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            });
            const marker = L.marker([home.lat, home.lon], {icon: icon});
            marker.addTo(leaflet);
            return true;
        }

        State.state.osmConnection.userDetails
            .addCallbackAndRunD(_ => addHomeMarker());
        State.state.leafletMap.addCallbackAndRunD(_ => addHomeMarker())


        InitUiElements.setupAllLayerElements();
            State.state.locationControl.ping();

        new SelectedFeatureHandler(Hash.hash, State.state)

        // Reset the loading message once things are loaded
        new CenterMessageBox().AttachTo("centermessage");
        document
            .getElementById("centermessage")
            .classList.add("pointer-events-none");
    }

    static LoadLayoutFromHash(
        userLayoutParam: UIEventSource<string>
    ): [LayoutConfig, string] {
        let hash = location.hash.substr(1);
        try {
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
                hash =
                    dedicatedHashFromLocalStorage.data ??
                    hashFromLocalStorage.data;
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

            if (hash === undefined || hash.length < 10) {
                e = "Did you effectively add a theme? It seems no data could be found."
            }

            new Combine([
                "Error: could not parse the custom layout:",
                new FixedUiElement("" + e).SetClass("alert"),
                new SubtleButton("./assets/svg/mapcomplete_logo.svg",
                    "Go back to the theme overview",
                    {url: window.location.protocol + "//" + window.location.hostname + "/index.html", newTab: false})

            ])
                .SetClass("flex flex-col")
                .AttachTo("centermessage");
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
        new Toggle(
            fullOptions.SetClass("welcomeMessage pointer-events-auto"),
            help.SetClass("pointer-events-auto"),
            isOpened
        )
            .AttachTo("messagesbox");
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

        new BackgroundLayerResetter(
            State.state.backgroundLayer,
            State.state.locationControl,
            State.state.availableBackgroundLayers,
            State.state.layoutToUse.defaultBackgroundId
        );

        const attr = new Attribution(
            State.state.locationControl,
            State.state.osmConnection.userDetails,
            State.state.layoutToUse,
            State.state.currentBounds
        );

        Minimap.createMiniMap({
            background: State.state.backgroundLayer,
            location: State.state.locationControl,
            leafletMap: State.state.leafletMap,
            bounds: State.state.currentBounds,
            attribution: attr,
            lastClickLocation: State.state.LastClickLocation
        }).SetClass("w-full h-full")
            .AttachTo("leafletDiv")

        const layout = State.state.layoutToUse;
        if (layout.lockLocation) {
            if (layout.lockLocation === true) {
                const tile = Tiles.embedded_tile(
                    layout.startLat,
                    layout.startLon,
                    layout.startZoom - 1
                );
                const bounds = Tiles.tile_bounds(tile.z, tile.x, tile.y);
                // We use the bounds to get a sense of distance for this zoom level
                const latDiff = bounds[0][0] - bounds[1][0];
                const lonDiff = bounds[0][1] - bounds[1][1];
                layout.lockLocation = [
                    [layout.startLat - latDiff, layout.startLon - lonDiff],
                    [layout.startLat + latDiff, layout.startLon + lonDiff],
                ];
            }
            console.warn("Locking the bounds to ", layout.lockLocation);
            State.state.leafletMap.addCallbackAndRunD(map => {
                // @ts-ignore
                map.setMaxBounds(layout.lockLocation);
                map.setMinZoom(layout.startZoom);
            })
        }
    }

    private static InitLayers(): void {
        const state = State.state;
        const empty = []

        const flayers: FilteredLayer[] = [];

        for (const layer of state.layoutToUse.layers) {
            let defaultShown = "true"
            if(state.layoutToUse.id === personal.id){
                defaultShown = "false"
            }

            let isDisplayed: UIEventSource<boolean>
            if(state.layoutToUse.id === personal.id){
                isDisplayed = State.state.osmConnection.GetPreference("personal-theme-layer-" + layer.id + "-enabled")
                    .map(value => value === "yes", [], enabled => {
                        return enabled ? "yes" : "";
                    })
                isDisplayed.addCallbackAndRun(d =>console.log("IsDisplayed for layer", layer.id, "is currently", d) )
            }else{
                isDisplayed = QueryParameters.GetQueryParameter(
                    "layer-" + layer.id,
                    defaultShown,
                    "Wether or not layer " + layer.id + " is shown"
                ).map<boolean>(
                    (str) => str !== "false",
                    [],
                    (b) => b.toString()
                );
            }
            const flayer = {
                isDisplayed: isDisplayed,
                layerDef: layer,
                appliedFilters: new UIEventSource<{ filter: FilterConfig, selected: number }[]>([]),
            };

            if (layer.filters.length > 0) {
                const filtersPerName = new Map<string, FilterConfig>()
                layer.filters.forEach(f => filtersPerName.set(f.id, f))
                const qp = QueryParameters.GetQueryParameter("filter-" + layer.id, "","Filtering state for a layer")
                flayer.appliedFilters.map(filters => {
                    filters = filters ?? []
                    return filters.map(f => f.filter.id + "." + f.selected).join(",")
                }, [], textual => {
                    if(textual.length === 0){
                        return empty
                    }
                    return textual.split(",").map(part => {
                        const [filterId, selected] = part.split(".");
                        return {filter: filtersPerName.get(filterId), selected: Number(selected)}
                    }).filter(f => f.filter !== undefined && !isNaN(f.selected))
                }).syncWith(qp, true)
            }

            flayers.push(flayer);
        }
        state.filteredLayers = new UIEventSource<FilteredLayer[]>(flayers);
        
        


        const clusterCounter = TileHierarchyAggregator.createHierarchy()
        new ShowDataLayer({
            features: clusterCounter.getCountsForZoom(State.state.locationControl, State.state.layoutToUse.clustering.minNeededElements),
            leafletMap: State.state.leafletMap,
            layerToShow: ShowTileInfo.styling,
            enablePopups: false
        })

        State.state.featurePipeline = new FeaturePipeline(
            source => {

                clusterCounter.addTile(source)

                const clustering = State.state.layoutToUse.clustering
                const doShowFeatures = source.features.map(
                    f => {
                        const z = State.state.locationControl.data.zoom
                        
                        if(!source.layer.isDisplayed.data){
                            return false;
                        }

                        if (z < source.layer.layerDef.minzoom) {
                            // Layer is always hidden for this zoom level
                            return false;
                        }

                        if (z >= clustering.maxZoom) {
                            return true
                        }

                        if (f.length > clustering.minNeededElements) {
                            // This tile alone already has too much features
                            return false
                        }

                        let [tileZ, tileX, tileY] = Tiles.tile_from_index(source.tileIndex);
                        if (tileZ >= z) {

                            while (tileZ > z) {
                                tileZ--
                                tileX = Math.floor(tileX / 2)
                                tileY = Math.floor(tileY / 2)
                            }

                            if (clusterCounter.getTile(Tiles.tile_index(tileZ, tileX, tileY))?.totalValue > clustering.minNeededElements) {
                                return false
                            }
                        }


                        const bounds = State.state.currentBounds.data
                        if(bounds === undefined){
                            // Map is not yet displayed
                            return false;
                        }
                        if (!source.bbox.overlapsWith(bounds)) {
                            // Not within range
                            return false
                        }

                        return true
                    }, [State.state.currentBounds]
                )

                new ShowDataLayer(
                    {
                        features: source,
                        leafletMap: State.state.leafletMap,
                        layerToShow: source.layer.layerDef,
                        doShowLayer: doShowFeatures
                    }
                );
            }, state
        );
    }

    private static setupAllLayerElements() {
        // ------------- Setup the layers -------------------------------

        InitUiElements.InitLayers();

        new LeftControls(State.state).AttachTo("bottom-left");
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
