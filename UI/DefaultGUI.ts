import FeaturePipelineState from "../Logic/State/FeaturePipelineState";
import State from "../State";
import {Utils} from "../Utils";
import {UIEventSource} from "../Logic/UIEventSource";
import FullWelcomePaneWithTabs from "./BigComponents/FullWelcomePaneWithTabs";
import MapControlButton from "./MapControlButton";
import Svg from "../Svg";
import Toggle from "./Input/Toggle";
import Hash from "../Logic/Web/Hash";
import {QueryParameters} from "../Logic/Web/QueryParameters";
import Constants from "../Models/Constants";
import UserBadge from "./BigComponents/UserBadge";
import SearchAndGo from "./BigComponents/SearchAndGo";
import Link from "./Base/Link";
import BaseUIElement from "./BaseUIElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import LeftControls from "./BigComponents/LeftControls";
import RightControls from "./BigComponents/RightControls";
import CenterMessageBox from "./CenterMessageBox";
import ShowDataLayer from "./ShowDataLayer/ShowDataLayer";
import AllKnownLayers from "../Customizations/AllKnownLayers";
import ScrollableFullScreen from "./Base/ScrollableFullScreen";
import Translations from "./i18n/Translations";
import SimpleAddUI from "./BigComponents/SimpleAddUI";
import StrayClickHandler from "../Logic/Actors/StrayClickHandler";

export class DefaultGuiState {
    public readonly welcomeMessageIsOpened;
    public readonly downloadControlIsOpened: UIEventSource<boolean>;
    public readonly filterViewIsOpened: UIEventSource<boolean>;
    public readonly welcomeMessageOpenedTab

    constructor() {
        this.filterViewIsOpened = QueryParameters.GetQueryParameter(
            "filter-toggle",
            "false",
            "Whether or not the filter view is shown"
        ).map<boolean>(
            (str) => str !== "false",
            [],
            (b) => "" + b
        );
        this.welcomeMessageIsOpened = new UIEventSource<boolean>(Hash.hash.data === undefined ||
            Hash.hash.data === "" ||
            Hash.hash.data == "welcome");

        this.welcomeMessageOpenedTab = QueryParameters.GetQueryParameter(
            "tab",
            "0",
            `The tab that is shown in the welcome-message. 0 = the explanation of the theme,1 = OSM-credits, 2 = sharescreen, 3 = more themes, 4 = about mapcomplete (user must be logged in and have >${Constants.userJourney.mapCompleteHelpUnlock} changesets)`
        ).map<number>(
            (str) => (isNaN(Number(str)) ? 0 : Number(str)),
            [],
            (n) => "" + n
        );
        this.downloadControlIsOpened =
            QueryParameters.GetQueryParameter(
                "download-control-toggle",
                "false",
                "Whether or not the download panel is shown"
            ).map<boolean>(
                (str) => str !== "false",
                [],
                (b) => "" + b
            );

    }
}


/**
 * The default MapComplete GUI initializor
 *
 * Adds a welcome pane, contorl buttons, ... etc to index.html
 */
export default class DefaultGUI {
    private readonly _guiState: DefaultGuiState;
    private readonly state: FeaturePipelineState;


    constructor(state: FeaturePipelineState, guiState: DefaultGuiState) {
        this.state = state;
        this._guiState = guiState;
        const self = this;

        if (state.layoutToUse.customCss !== undefined) {
            Utils.LoadCustomCss(state.layoutToUse.customCss);
        }

        // Attach the map
        state.mainMapObject.SetClass("w-full h-full")
            .AttachTo("leafletDiv")

        this.setupClickDialogOnMap(
            guiState.filterViewIsOpened,
            state
        )

        this.InitWelcomeMessage();

        Toggle.If(state.featureSwitchUserbadge,
            () => new UserBadge(state)
        ).AttachTo("userbadge")

        Toggle.If(state.featureSwitchSearch,
            () => new SearchAndGo(state))
            .AttachTo("searchbox");


        let iframePopout: () => BaseUIElement = undefined;

        if (window !== window.top) {
            // MapComplete is running in an iframe
            iframePopout = () => new VariableUiElement(state.locationControl.map(loc => {
                const url = `${window.location.origin}${window.location.pathname}?z=${loc.zoom ?? 0}&lat=${loc.lat ?? 0}&lon=${loc.lon ?? 0}`;
                const link = new Link(Svg.pop_out_img, url, true).SetClass("block w-full h-full p-1.5")
                return new MapControlButton(link)
            }))

        }

        new Toggle(self.InitWelcomeMessage(),
            Toggle.If(state.featureSwitchIframePopoutEnabled,  iframePopout),
            state.featureSwitchWelcomeMessage
        ).AttachTo("messagesbox");

        new LeftControls(state, guiState).AttachTo("bottom-left");
        new RightControls(state).AttachTo("bottom-right");
        State.state.locationControl.ping();
        new CenterMessageBox(state).AttachTo("centermessage");
        document
            .getElementById("centermessage")
            .classList.add("pointer-events-none");
        
        
        new ShowDataLayer({
            leafletMap: state.leafletMap,
            layerToShow: AllKnownLayers.sharedLayers.get("home_location"),
            features:            state.homeLocation,
            enablePopups: false,
        })
        
        state.leafletMap.addCallbackAndRunD(_ => {
            // Lets assume that all showDataLayers are initialized at this point
            state.selectedElement.ping()
            return true;
        })

    }

    private InitWelcomeMessage() {
        const isOpened = this._guiState.welcomeMessageIsOpened
        const fullOptions = new FullWelcomePaneWithTabs(isOpened, this._guiState.welcomeMessageOpenedTab, this.state);

        // ?-Button on Desktop, opens panel with close-X.
        const help = new MapControlButton(Svg.help_svg());
        help.onClick(() => isOpened.setData(true));


        const openedTime = new Date().getTime();
        this.state.locationControl.addCallback(() => {
            if (new Date().getTime() - openedTime < 15 * 1000) {
                // Don't autoclose the first 15 secs when the map is moving
                return;
            }
            isOpened.setData(false);
        });

        this.state.selectedElement.addCallbackAndRunD((_) => {
            isOpened.setData(false);
        });

        return new Toggle(
            fullOptions.SetClass("welcomeMessage pointer-events-auto"),
            help.SetClass("pointer-events-auto"),
            isOpened
        )

    }

    public setupClickDialogOnMap(filterViewIsOpened: UIEventSource<boolean>, state: FeaturePipelineState) {

        function setup(){
            let presetCount = 0;
            for (const layer of state.layoutToUse.layers) {
                for (const preset of layer.presets) {
                    presetCount++;
                }
            }
            if (presetCount == 0) {
                return;
            }

            const newPointDialogIsShown = new UIEventSource<boolean>(false);
            const addNewPoint = new ScrollableFullScreen(
                () => Translations.t.general.add.title.Clone(),
                () => new SimpleAddUI(newPointDialogIsShown, filterViewIsOpened, state),
                "new",
                newPointDialogIsShown
            );
            addNewPoint.isShown.addCallback((isShown) => {
                if (!isShown) {
                    state.LastClickLocation.setData(undefined);
                }
            });

            new StrayClickHandler(
                state.LastClickLocation,
                state.selectedElement,
                state.filteredLayers,
                state.leafletMap,
                addNewPoint
            );
        }

        state.featureSwitchAddNew.addCallbackAndRunD(addNewAllowed => {
            if (addNewAllowed) {
                setup()
                return true;
            }
        })

    }

}