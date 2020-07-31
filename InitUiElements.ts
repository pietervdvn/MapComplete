import {Layout} from "./Customizations/Layout";
import Locale from "./UI/i18n/Locale";
import Translations from "./UI/i18n/Translations";
import {TabbedComponent} from "./UI/Base/TabbedComponent";
import {ShareScreen} from "./UI/ShareScreen";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {CheckBox} from "./UI/Input/CheckBox";
import Combine from "./UI/Base/Combine";
import {UIEventSource} from "./UI/UIEventSource";
import {UIElement} from "./UI/UIElement";
import {MoreScreen} from "./UI/MoreScreen";
import {Tag} from "./Logic/TagsFilter";
import {FilteredLayer} from "./Logic/FilteredLayer";
import {FeatureInfoBox} from "./UI/FeatureInfoBox";
import {ElementStorage} from "./Logic/ElementStorage";
import {Preset} from "./UI/SimpleAddUI";
import {Changes} from "./Logic/Osm/Changes";
import {OsmConnection} from "./Logic/Osm/OsmConnection";
import {BaseLayers, Basemap} from "./Logic/Leaflet/Basemap";
import {State} from "./State";
import {WelcomeMessage} from "./UI/WelcomeMessage";
import {Img} from "./UI/Img";
import {DropDown} from "./UI/Input/DropDown";
import {LayerSelection} from "./UI/LayerSelection";
import {CustomLayersPanel} from "./Logic/CustomLayersPanel";

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

        const welcome = new WelcomeMessage()

        const layoutToUse = State.state.layoutToUse.data;
        const fullOptions = new TabbedComponent([
            {header: `<img src='${layoutToUse.icon}'>`, content: welcome},
            {header: `<img src='${'./assets/osm-logo.svg'}'>`, content: Translations.t.general.openStreetMapIntro},
            {header: `<img src='${'./assets/share.svg'}'>`, content: new ShareScreen()},
            {header: `<img src='${'./assets/add.svg'}'>`, content: new MoreScreen()},
            {header: `<img src='${'./assets/star.svg'}'>`, content: new CustomLayersPanel()},
        ])

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

    static InitLayerSelection(layerSetup) {
        const closedFilterButton = `<button id="filter__button" class="filter__button shadow">${Img.closedFilterButton}</button>`;

        const openFilterButton = `<button id="filter__button" class="filter__button">${Img.openFilterButton}</button>`;

        let baseLayerOptions = BaseLayers.baseLayers.map((layer) => {
            return {value: layer, shown: layer.name}
        });
        const backgroundMapPicker = new Combine([new DropDown(`Background map`, baseLayerOptions, State.state.bm.CurrentLayer), openFilterButton]);
        const layerSelection = new Combine([`<p class="filter__label">Maplayers</p>`, new LayerSelection(layerSetup.flayers)]);
        let layerControl = backgroundMapPicker;
        if (layerSetup.flayers.length > 1) {
            layerControl = new Combine([layerSelection, backgroundMapPicker]);
        }

        InitUiElements.OnlyIf(State.state.featureSwitchLayers, () => {

            const checkbox = new CheckBox(layerControl, closedFilterButton);
            checkbox.AttachTo("filter__selection");
            State.state.bm.Location.addCallback(() => {
                checkbox.isEnabled.setData(false);
            });

        });
    }

    static InitLayers(): {
        minZoom: number
        flayers: FilteredLayer[],
        presets: Preset[]
    } {
        const addButtons: Preset[] = [];

        const flayers: FilteredLayer[] = []

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

            const flayer = FilteredLayer.fromDefinition(layer, generateInfo);

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

                const addButton = {
                    name: preset.title,
                    description: preset.description,
                    icon: preset.icon,
                    tags: preset.tags,
                    layerToAddTo: flayer
                }
                addButtons.push(addButton);
            }
            flayers.push(flayer);
        }

        
        
        return {
            minZoom: minZoom,
            flayers: flayers,
            presets: addButtons
        }
    }

}