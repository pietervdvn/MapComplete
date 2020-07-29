import {Layout, WelcomeMessage} from "./Customizations/Layout";
import Locale from "./UI/i18n/Locale";
import Translations from "./UI/i18n/Translations";
import {TabbedComponent} from "./UI/Base/TabbedComponent";
import {ShareScreen} from "./UI/ShareScreen";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {CheckBox} from "./UI/Input/CheckBox";
import Combine from "./UI/Base/Combine";
import {OsmConnection} from "./Logic/OsmConnection";
import {Basemap} from "./Logic/Basemap";
import {UIEventSource} from "./UI/UIEventSource";
import {UIElement} from "./UI/UIElement";
import {MoreScreen} from "./UI/MoreScreen";

export class InitUiElements {


    static OnlyIf(featureSwitch: UIEventSource<string>, callback: () => void) {
        featureSwitch.addCallback(() => {

            if (featureSwitch.data === "false") {
                return;
            }
            callback();
        });

        if (featureSwitch.data !== "false") {
            callback();
        }

    }


    private static CreateWelcomePane(layoutToUse: Layout, osmConnection: OsmConnection, bm: Basemap) {

        const welcome = new WelcomeMessage(layoutToUse, Locale.CreateLanguagePicker(layoutToUse, Translations.t.general.pickLanguage), osmConnection)

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

}