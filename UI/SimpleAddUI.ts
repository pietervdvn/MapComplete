import {UIElement} from "./UIElement";
import {Tag, TagUtils} from "../Logic/Tags";
import {FilteredLayer} from "../Logic/FilteredLayer";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import {SubtleButton} from "./Base/SubtleButton";
import Locale from "./i18n/Locale";
import State from "../State";

import {UIEventSource} from "../Logic/UIEventSource";
import Svg from "../Svg";
import {FixedUiElement} from "./Base/FixedUiElement";
import Constants from "../Models/Constants";

/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
export class SimpleAddUI extends UIElement {
    private readonly _addButtons: UIElement[];
    
    private _loginButton : UIElement;
    
    private _confirmPreset: UIEventSource<{
        description: string | UIElement,
        name: string | UIElement,
        icon: UIElement,
        tags: Tag[],
        layerToAddTo: FilteredLayer
    }>
        = new UIEventSource(undefined);
    private confirmButton: UIElement = undefined;
    private _confirmDescription: UIElement = undefined;
    private openLayerControl: UIElement;
    private cancelButton: UIElement;
    private goToInboxButton: UIElement = new SubtleButton(Svg.envelope_ui(), 
        Translations.t.general.goToInbox, {url:"https://www.openstreetmap.org/messages/inbox", newTab: false});

    constructor() {
        super(State.state.locationControl);
        this.ListenTo(Locale.language);
        this.ListenTo(State.state.osmConnection.userDetails);
        this.ListenTo(State.state.layerUpdater.runningQuery);
        this.ListenTo(this._confirmPreset);
        this.ListenTo(State.state.locationControl);
        
        this._loginButton = Translations.t.general.add.pleaseLogin.Clone().onClick(() => State.state.osmConnection.AttemptLogin());
        
        this._addButtons = [];
        this.SetStyle("font-size:large");
        
        const self = this;
        for (const layer of State.state.filteredLayers.data) {

            this.ListenTo(layer.isDisplayed);

            const presets = layer.layerDef.presets;
            for (const preset of presets) {
                const tags = TagUtils.KVtoProperties(preset.tags ?? []);
                let icon: UIElement = new FixedUiElement(layer.layerDef.GenerateLeafletStyle(new UIEventSource<any>(tags), false).icon.html.Render()).SetClass("simple-add-ui-icon");

                const csCount = State.state.osmConnection.userDetails.data.csCount;
                let tagInfo = "";
                if (csCount > Constants.userJourney.tagsVisibleAt) {
                    tagInfo = preset.tags.map(t => t.asHumanString(false, true)).join("&");
                    tagInfo = `<br/><span class='subtle'>${tagInfo}</span>`
                }
                const button: UIElement =
                    new SubtleButton(
                        icon,
                        new Combine([
                            "<b>",
                            preset.title,
                            "</b>",
                            preset.description !== undefined ? new Combine(["<br/>", preset.description.FirstSentence()]) : "",
                            tagInfo
                        ])
                    ).onClick(
                        () => {
                            self.confirmButton = new SubtleButton(icon,
                                new Combine([
                                    "<b>",
                                    Translations.t.general.add.confirmButton.Subs({category: preset.title}),
                                    "</b>"]));
                            self.confirmButton.onClick(self.CreatePoint(preset.tags, layer));
                            self._confirmDescription = preset.description;
                            self._confirmPreset.setData({
                                tags: preset.tags,
                                layerToAddTo: layer,
                                name: preset.title,
                                description: preset.description,
                                icon: icon
                            });
                            self.Update();
                        }
                    )


                this._addButtons.push(button);
            }
        }

        this.cancelButton = new SubtleButton(Svg.close_ui(),
            Translations.t.general.cancel
        ).onClick(() => {
            self._confirmPreset.setData(undefined);
        })

        this.openLayerControl = new SubtleButton(Svg.layers_ui(),
            Translations.t.general.add.openLayerControl
        ).onClick(() => {
            State.state.layerControlIsOpened.setData(true);
        })
    }

    private CreatePoint(tags: Tag[], layerToAddTo: FilteredLayer) {
        return () => {

            const loc = State.state.LastClickLocation.data;
            let feature = State.state.changes.createElement(tags, loc.lat, loc.lon);
            State.state.selectedElement.setData(feature);
            layerToAddTo.AddNewElement(feature);
        }
    }

    InnerRender(): string {

        const userDetails = State.state.osmConnection.userDetails;

        if (this._confirmPreset.data !== undefined) {
            
            if(!this._confirmPreset.data.layerToAddTo.isDisplayed.data){
                return new Combine([
                    Translations.t.general.add.layerNotEnabled.Subs({layer: this._confirmPreset.data.layerToAddTo.layerDef.name})
                        .SetClass("alert"),
                    this.openLayerControl,
                    
                    this.cancelButton
                ]).Render();
            }

            let tagInfo = "";
            const csCount = State.state.osmConnection.userDetails.data.csCount;
            if (csCount > Constants.userJourney.tagsVisibleAt) {
                tagInfo = this._confirmPreset.data .tags.map(t => t.asHumanString(csCount > Constants.userJourney.tagsVisibleAndWikiLinked, true)).join("&");
                tagInfo = `<br/>More information about the preset: ${tagInfo}`
            }

            return new Combine([
                Translations.t.general.add.confirmIntro.Subs({title: this._confirmPreset.data.name}),
                userDetails.data.dryRun ? "<span class='alert'>TESTING - changes won't be saved</span>" : "",
                this.confirmButton,
                this.cancelButton,
                this._confirmDescription,
                tagInfo

            ]).Render();


        }


        let header: UIElement = Translations.t.general.add.header;


        if (userDetails === undefined) {
            return header.Render();
        }

        if (!userDetails.data.loggedIn) {
            return new Combine([header, this._loginButton]).Render()
        }

        if (userDetails.data.unreadMessages > 0 && userDetails.data.csCount < Constants.userJourney.addNewPointWithUnreadMessagesUnlock) {
            return new Combine([header,
                Translations.t.general.readYourMessages.Clone().SetClass("alert"),
                this.goToInboxButton
            ]).Render();

        }

        if (userDetails.data.dryRun) {
            header = new Combine([header,
                "<span class='alert'>",
                "Test mode - changes won't be saved",
                "</span>"
            ]);
        }

        if (userDetails.data.csCount < Constants.userJourney.addNewPointsUnlock) {
            return new Combine([header, "<span class='alert'>",
                Translations.t.general.fewChangesBefore,
                "</span>"]).Render();
        }

        if (State.state.locationControl.data.zoom < Constants.userJourney.minZoomLevelToAddNewPoints) {
            return new Combine([header, Translations.t.general.add.zoomInFurther.SetClass("alert")]).Render()
        }

        if (State.state.layerUpdater.runningQuery.data) {
            return new Combine([header, Translations.t.general.add.stillLoading]).Render()
        }

        return header.Render() + new Combine(this._addButtons).SetClass("add-popup-all-buttons").Render();
    }


}