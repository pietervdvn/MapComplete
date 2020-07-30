import {Layout, WelcomeMessage} from "./Customizations/Layout";
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
import {Basemap} from "./Logic/Leaflet/Basemap";

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


    private static CreateWelcomePane(layoutToUse: Layout, osmConnection: OsmConnection, bm: Basemap) {

        const welcome = new WelcomeMessage(layoutToUse,
            Locale.CreateLanguagePicker(layoutToUse, Translations.t.general.pickLanguage),
            osmConnection)

        const fullOptions = new TabbedComponent([
            {header: `<img src='${layoutToUse.icon}'>`, content: welcome},
            {header: `<img src='${'./assets/osm-logo.svg'}'>`, content: Translations.t.general.openStreetMapIntro},
            {header: `<img src='${'./assets/share.svg'}'>`, content: new ShareScreen(layoutToUse, bm.Location)},
            {header: `<img src='${'./assets/add.svg'}'>`, content: new MoreScreen(layoutToUse.name, bm.Location)}
        ])

        return fullOptions;

    }


    static InitWelcomeMessage(layoutToUse: Layout, osmConnection: OsmConnection, bm: Basemap,
                              fullScreenMessage: UIEventSource<UIElement>) {

        const fullOptions = this.CreateWelcomePane(layoutToUse, osmConnection, bm);

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
        bm.Location.addCallback(() => {
            if(dontCloseYet){
                dontCloseYet = false;
                return;
            }
            checkbox.isEnabled.setData(false);
        })


        const fullOptions2 = this.CreateWelcomePane(layoutToUse, osmConnection, bm);
        fullScreenMessage.setData(fullOptions2)
        new FixedUiElement(`<div class='collapse-button-img' class="shadow"><img src='assets/help.svg'  alt='help'></div>`).onClick(() => {
            fullScreenMessage.setData(fullOptions2)
        }).AttachTo("help-button-mobile");


    }


    static InitLayers(layoutToUse: Layout, osmConnection: OsmConnection,
                      changes: Changes,
                      allElements: ElementStorage,
                      bm: Basemap,
                      fullScreenMessage: UIEventSource<UIElement>,
                      selectedElement: UIEventSource<any>): {
        minZoom: number
        flayers: FilteredLayer[],
        presets: Preset[]
    } {
        const addButtons:Preset[]
            = [];

        const flayers: FilteredLayer[] = []

        let minZoom = 0;

        for (const layer of layoutToUse.layers) {

            const generateInfo = (tagsES, feature) => {

                return new FeatureInfoBox(
                    feature,
                    tagsES,
                    layer.title,
                    layer.elementsToShow,
                    changes,
                    osmConnection.userDetails
                )
            };

            minZoom = Math.max(minZoom, layer.minzoom);

            const flayer = FilteredLayer.fromDefinition(layer, bm, allElements, changes, osmConnection.userDetails, selectedElement, generateInfo);

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