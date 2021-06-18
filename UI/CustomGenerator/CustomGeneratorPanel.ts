import {UIElement} from "../UIElement";
import UserDetails, {OsmConnection} from "../../Logic/Osm/OsmConnection";
import {UIEventSource} from "../../Logic/UIEventSource";
import SingleSetting from "./SingleSetting";
import GeneralSettings from "./GeneralSettings";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";
import {TabbedComponent} from "../Base/TabbedComponent";
import PageSplit from "../Base/PageSplit";
import AllLayersPanel from "./AllLayersPanel";
import SharePanel from "./SharePanel";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import {SubtleButton} from "../Base/SubtleButton";
import {FixedUiElement} from "../Base/FixedUiElement";
import SavePanel from "./SavePanel";
import {LocalStorageSource} from "../../Logic/Web/LocalStorageSource";
import HelpText from "./HelpText";
import Svg from "../../Svg";
import Constants from "../../Models/Constants";
import LZString from "lz-string";
import {Utils} from "../../Utils";

export default class CustomGeneratorPanel extends UIElement {
    private mainPanel: UIElement;
    private loginButton: UIElement;

    private readonly connection: OsmConnection;

    constructor(connection: OsmConnection, layout: LayoutConfigJson) {
        super(connection.userDetails);
        this.connection = connection;
        this.SetClass("main-tabs");
        this.loginButton = new SubtleButton("", "Login to create a custom theme").onClick(() => connection.AttemptLogin())
        const self = this;
        self.mainPanel = new FixedUiElement("Attempting to log in...");
        connection.OnLoggedIn(userDetails => {
            self.InitMainPanel(layout, userDetails, connection);
            self.Update();
        })
    }

    private InitMainPanel(layout: LayoutConfigJson, userDetails: UserDetails, connection: OsmConnection) {
        const es = new UIEventSource(layout);
        const encoded = es.map(config => LZString.compressToBase64(Utils.MinifyJSON(JSON.stringify(config, null, 0))));
        encoded.addCallback(encoded => LocalStorageSource.Get("last-custom-theme"))
        const liveUrl = encoded.map(encoded => `https://mapcomplete.osm.be/index.html?userlayout=${es.data.id}#${encoded}`)
        const testUrl = encoded.map(encoded => `https://mapcomplete.osm.be/index.html?test=true&userlayout=${es.data.id}#${encoded}`)
        const iframe = testUrl.map(url => `<iframe src='${url}' width='100%' height='99%' style="box-sizing: border-box" title='Theme Preview'></iframe>`);
        const currentSetting = new UIEventSource<SingleSetting<any>>(undefined)
        const generalSettings = new GeneralSettings(es, currentSetting);
        const languages = generalSettings.languages;

        const chronic = UIEventSource.Chronic(120 * 1000)
            .map(date => {
                if (es.data.id == undefined) {
                    return undefined
                }
                if (es.data.id === "") {
                    return undefined;
                }
                const pref = connection.GetLongPreference("installed-theme-" + es.data.id);
                pref.setData(encoded.data);
                return date;
            });

        const preview = new Combine([
            new VariableUiElement(iframe)
        ]).SetClass("preview")
        this.mainPanel = new TabbedComponent([
            {
                header: Svg.gear_img,
                content:
                    new PageSplit(
                        generalSettings.SetStyle("width: 50vw;"),
                        new Combine([
                            new HelpText(currentSetting).SetStyle("height:calc(100% - 65vh); width: 100%; display:block; overflow-y: auto"),
                            preview.SetStyle("height:65vh; width:100%; display:block")
                        ]).SetStyle("position:relative; width: 50%;")
                    )
            },
            {
                header: Svg.layers_img,
                content: new AllLayersPanel(es, languages, userDetails)
            },
            {
                header: Svg.floppy_img,
                content: new SavePanel(this.connection, es, chronic)

            },
            {
                header:Svg.share_img,
                content: new SharePanel(es, liveUrl, userDetails)
            }
        ])
    }


    InnerRender(): string {
        const ud = this.connection.userDetails.data;
        if (!ud.loggedIn) {
            return new Combine([
                "<h3>Not Logged in</h3>",
                "You need to be logged in in order to create a custom theme",
                this.loginButton
            ]).Render();
        }
        const journey = Constants.userJourney;
        if (ud.csCount <= journey.themeGeneratorReadOnlyUnlock) {
            return new Combine([
                "<h3>Too little experience</h3>",
                `<p>Creating your own (readonly) themes can only be done if you have more then <b>${journey.themeGeneratorReadOnlyUnlock}</b> changesets made</p>`,
                `<p>Making a theme including survey options can be done at <b>${journey.themeGeneratorFullUnlock}</b> changesets</p>`
            ]).Render();
        }
        return this.mainPanel.Render()
    }

}