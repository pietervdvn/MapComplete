import FeaturePipelineState from "../Logic/State/FeaturePipelineState";
import State from "../State";
import {Utils} from "../Utils";
import {UIEventSource} from "../Logic/UIEventSource";
import FullWelcomePaneWithTabs from "./BigComponents/FullWelcomePaneWithTabs";
import MapControlButton from "./MapControlButton";
import Svg from "../Svg";
import Toggle from "./Input/Toggle";
import UserBadge from "./BigComponents/UserBadge";
import SearchAndGo from "./BigComponents/SearchAndGo";
import Link from "./Base/Link";
import BaseUIElement from "./BaseUIElement";
import {VariableUiElement} from "./Base/VariableUIElement";
import LeftControls from "./BigComponents/LeftControls";
import RightControls from "./BigComponents/RightControls";
import CenterMessageBox from "./CenterMessageBox";
import ShowDataLayer from "./ShowDataLayer/ShowDataLayer";
import ScrollableFullScreen from "./Base/ScrollableFullScreen";
import Translations from "./i18n/Translations";
import SimpleAddUI from "./BigComponents/SimpleAddUI";
import StrayClickHandler from "../Logic/Actors/StrayClickHandler";
import Lazy from "./Base/Lazy";
import {DefaultGuiState} from "./DefaultGuiState";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import * as home_location_json from "../assets/layers/home_location/home_location.json";
import NewNoteUi from "./Popup/NewNoteUi";
import Combine from "./Base/Combine";
import AddNewMarker from "./BigComponents/AddNewMarker";


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

        if (state.layoutToUse.customCss !== undefined) {
            Utils.LoadCustomCss(state.layoutToUse.customCss);
        }

        this.SetupUIElements();
        this.SetupMap()
        
        
        if(state.layoutToUse.customCss !== undefined && window.location.pathname.indexOf("index") >= 0){
            Utils.LoadCustomCss(state.layoutToUse.customCss)
        }
    }

    public setupClickDialogOnMap(filterViewIsOpened: UIEventSource<boolean>, state: FeaturePipelineState) {

        const hasPresets = state.layoutToUse.layers.some(layer => layer.presets.length > 0);
        const noteLayer=        state.filteredLayers.data.filter(l => l.layerDef.id === "note")[0]
        let addNewNoteDialog : () => BaseUIElement = undefined;
        if(noteLayer !== undefined){
            addNewNoteDialog = () => new NewNoteUi(state.LastClickLocation, state)
        }
        
        function setup() {

            console.warn("Settuping ")
            if(!hasPresets && addNewNoteDialog === undefined){
                return; // nothing to do
            }
            
            
            const newPointDialogIsShown = new UIEventSource<boolean>(false);
            const addNewPoint = new ScrollableFullScreen(
                () => hasPresets ? Translations.t.general.add.title : Translations.t.notes.createNoteTitle,
                () => {
                    let addNew = undefined; 
                    if(hasPresets){
                        addNew = new SimpleAddUI(newPointDialogIsShown, filterViewIsOpened, state);
                    }
                    let addNote = undefined;
                    if(noteLayer !== undefined){
                        addNote = addNewNoteDialog()
                    }
                    return new Combine([addNew, addNote]).SetClass("flex flex-col font-lg text-lg")
                },
                "new",
                newPointDialogIsShown
            );
            
            addNewPoint.isShown.addCallback((isShown) => {
                if (!isShown) {
                    // Clear the 'last-click'-location when the dialog is closed - this causes the popup and the marker to be removed
                    state.LastClickLocation.setData(undefined);
                }
            });

            new StrayClickHandler(
                state,
                addNewPoint,
               hasPresets ? new AddNewMarker(state.filteredLayers) : new Combine([Svg.note_svg().SetStyle("height: 40px"), Svg.addSmall_svg().SetClass("absolute bottom-0 right-0 w-6 animate-pulse")]).SetClass("block relative")
            );
        }

        if(noteLayer !== undefined){
            setup()
        }else{
            state.featureSwitchAddNew.addCallbackAndRunD(addNewAllowed => {
                if (addNewAllowed) {
                    setup()
                    return true;
                }
            })
        }

    }

    private SetupMap() {
        const state = this.state;
        const guiState = this._guiState;

        // Attach the map
        state.mainMapObject.SetClass("w-full h-full")
            .AttachTo("leafletDiv")

        this.setupClickDialogOnMap(
            guiState.filterViewIsOpened,
            state
        )


        new ShowDataLayer({
            leafletMap: state.leafletMap,
            layerToShow: new LayerConfig(home_location_json, "all_known_layers", true),
            features: state.homeLocation,
            enablePopups: false,
        })

        state.leafletMap.addCallbackAndRunD(_ => {
            // Lets assume that all showDataLayers are initialized at this point
            state.selectedElement.ping()
            State.state.locationControl.ping();
            return true;
        })

    }

    private SetupUIElements() {
        const state = this.state;
        const guiState = this._guiState;

        const self = this
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

        new Toggle(new Lazy(() => self.InitWelcomeMessage()),
            Toggle.If(state.featureSwitchIframePopoutEnabled, iframePopout),
            state.featureSwitchWelcomeMessage
        ).AttachTo("messagesbox");


        new LeftControls(state, guiState).AttachTo("bottom-left");
        new RightControls(state).AttachTo("bottom-right");

        new CenterMessageBox(state).AttachTo("centermessage");
        document
            .getElementById("centermessage")
            .classList.add("pointer-events-none");

        // We have to ping the welcomeMessageIsOpened and other isOpened-stuff to activate the FullScreenMessage if needed
        for (const state of guiState.allFullScreenStates) {
            if (state.data) {
                state.ping()
            }
        }

        /**
         * At last, if the map moves or an element is selected, we close all the panels just as well
         */

        state.selectedElement.addCallbackAndRunD((_) => {
            guiState.allFullScreenStates.forEach(s => s.setData(false))
        });
    }

    private InitWelcomeMessage(): BaseUIElement {
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
            return true; // Unregister this caller - we only autoclose once
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

}