import {Layout} from "./Customizations/Layout";
import Locale from "./UI/i18n/Locale";
import Translations from "./UI/i18n/Translations";
import {TabbedComponent} from "./UI/Base/TabbedComponent";
import {ShareScreen} from "./UI/ShareScreen";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {CheckBox} from "./UI/Input/CheckBox";
import Combine from "./UI/Base/Combine";
import {UIElement} from "./UI/UIElement";
import {MoreScreen} from "./UI/MoreScreen";
import {Tag} from "./Logic/TagsFilter";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {FeatureInfoBox} from "./UI/FeatureInfoBox";
import {ElementStorage} from "./Logic/ElementStorage";
import {Changes} from "./Logic/Osm/Changes";
import {OsmConnection} from "./Logic/Osm/OsmConnection";
import {BaseLayers, Basemap} from "./Logic/Leaflet/Basemap";
import {State} from "./State";
import {WelcomeMessage} from "./UI/WelcomeMessage";
import {Img} from "./UI/Img";
import {DropDown} from "./UI/Input/DropDown";
import {LayerSelection} from "./UI/LayerSelection";
import {CustomLayersPanel} from "./Logic/CustomLayersPanel";
import {CustomLayout} from "./Logic/CustomLayers";
import {Preset} from "./Customizations/LayerDefinition";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {LayerUpdater} from "./Logic/LayerUpdater";
import {UIEventSource} from "./Logic/UIEventSource";
import {QueryParameters} from "./Logic/Web/QueryParameters";

export class InitUiElements {


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
        if (layoutToUse.name === CustomLayout.NAME) {
            welcome = new CustomLayersPanel();
        }

        const tabs = [
            {header: Img.AsImageElement(layoutToUse.icon), content: welcome},
            {header: `<img src='${'./assets/osm-logo.svg'}'>`, content: Translations.t.general.openStreetMapIntro},

        ]

        if (State.state.featureSwitchShareScreen.data) {
            tabs.push({header: `<img src='${'./assets/share.svg'}'>`, content: new ShareScreen()});
        }

        if (State.state.featureSwitchMoreQuests.data) {
            tabs.push({header: `<img src='${'./assets/add.svg'}'>`, content: new MoreScreen()});
        }


        const fullOptions = new TabbedComponent(tabs);

        return fullOptions;

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
        let dontCloseYet = true;
        const openedTime = new Date().getTime();
        State.state.locationControl.addCallback(() => {
            if (new Date().getTime() - openedTime < 15 * 1000) {
                // Don't autoclose the first 15 secs
                return;
            }
            checkbox.isEnabled.setData(false);
        })


        const fullOptions2 = this.CreateWelcomePane();
        State.state.fullScreenMessage.setData(fullOptions2)
        new FixedUiElement(`<div class='collapse-button-img' class="shadow"><img src='assets/help.svg'  alt='help'></div>`).onClick(() => {
            State.state.fullScreenMessage.setData(fullOptions2)
        }).AttachTo("help-button-mobile");


    }

    static InitLayerSelection() {
        const closedFilterButton = `<button id="filter__button" class="filter__button shadow">${Img.closedFilterButton}</button>`;

        const openFilterButton = `<button id="filter__button" class="filter__button">${Img.openFilterButton}</button>`;

        let baseLayerOptions = BaseLayers.baseLayers.map((layer) => {
            return {value: layer, shown: layer.name}
        });
        const backgroundMapPicker = new Combine([new DropDown(`Background map`, baseLayerOptions, State.state.bm.CurrentLayer), openFilterButton]);
        const layerSelection = new Combine([`<p class="filter__label">Maplayers</p>`, new LayerSelection()]);
        let layerControl = backgroundMapPicker;
        if (State.state.filteredLayers.data.length > 1) {
            layerControl = new Combine([layerSelection, backgroundMapPicker]);
        }

        InitUiElements.OnlyIf(State.state.featureSwitchLayers, () => {

            const checkbox = new CheckBox(layerControl, closedFilterButton,
                QueryParameters.GetQueryParameter("layer-control-toggle", "false")
                    .map((str) => str !== "false", [], b => "" + b)
            );
            checkbox.AttachTo("filter__selection");
            State.state.bm.Location.addCallback(() => {
                checkbox.isEnabled.setData(false);
            });

        });
    }
    
    static InitBaseMap(){
        const bm = new Basemap("leafletDiv", State.state.locationControl, new VariableUiElement(
            State.state.locationControl.map((location) => {
                const mapComplete = `<a href='https://github.com/pietervdvn/MapComplete' target='_blank'>Mapcomplete ${State.vNumber}</a>  <a href='https://github.com/pietervdvn/MapComplete/issues' target='_blank'><img src='./assets/bug.svg' alt='Report bug'  class='small-userbadge-icon'></a>`;
                let editHere = "";
                if (location !== undefined) {
                    editHere = " | " +
                        "<a href='https://www.openstreetmap.org/edit?editor=id#map=" + location.zoom + "/" + location.lat + "/" + location.lon + "' target='_blank'>" +
                        "<img src='./assets/pencil.svg' alt='edit here' class='small-userbadge-icon'>" +
                        "</a>"
                }
                return mapComplete + editHere;

            })
        ));
        State.state.bm = bm;
        State.state.layerUpdater = new LayerUpdater(State.state);
        const queryParam = QueryParameters.GetQueryParameter("background", State.state.layoutToUse.data.defaultBackground);
        const queryParamMapped: UIEventSource<{ id: string, name: string, layer: any }> =
            queryParam.map<{ id: string, name: string, layer: any }>((id) => {
                for (const layer of BaseLayers.baseLayers) {
                    if (layer.id === id) {
                        return layer;
                    }
                }
                return undefined;
            }, [], (layerInfo) => {
                return layerInfo.id
            });

        queryParamMapped.syncWith(bm.CurrentLayer);

    }


    static InitLayers() {

        const flayers: FilteredLayer[] = []
        const presets: Preset[] = [];

        let minZoom = 0;
        const state = State.state;
        for (const layer of state.layoutToUse.data.layers) {

            const generateInfo = (tagsES, feature) => {

                return new FeatureInfoBox(
                    feature,
                    tagsES,
                    layer.title,
                    layer.elementsToShow,
                )
            };

            minZoom = Math.max(minZoom, layer.minzoom);


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