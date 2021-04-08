/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
import Locale from "../i18n/Locale";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Svg from "../../Svg";
import {SubtleButton} from "../Base/SubtleButton";
import State from "../../State";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import Translations from "../i18n/Translations";
import Constants from "../../Models/Constants";
import LayerConfig from "../../Customizations/JSON/LayerConfig";
import {Tag} from "../../Logic/Tags/Tag";
import {TagUtils} from "../../Logic/Tags/TagUtils";

export default class SimpleAddUI extends UIElement {
    private readonly _loginButton: UIElement;

    private readonly _confirmPreset: UIEventSource<{
        description: string | UIElement,
        name: string | UIElement,
        icon: UIElement,
        tags: Tag[],
        layerToAddTo: {
            layerDef: LayerConfig,
            isDisplayed: UIEventSource<boolean>
        }
    }>
        = new UIEventSource(undefined);

    private _component: UIElement;

    private readonly openLayerControl: UIElement;
    private readonly cancelButton: UIElement;
    private readonly goToInboxButton: UIElement = new SubtleButton(Svg.envelope_ui(),
        Translations.t.general.goToInbox, {url: "https://www.openstreetmap.org/messages/inbox", newTab: false});

    constructor(isShown: UIEventSource<boolean>) {
        super(State.state.locationControl.map(loc => loc.zoom));
        const self = this;
        this.ListenTo(Locale.language);
        this.ListenTo(State.state.osmConnection.userDetails);
        this.ListenTo(State.state.layerUpdater.runningQuery);
        this.ListenTo(this._confirmPreset);
        this.ListenTo(State.state.locationControl);
        State.state.filteredLayers.data?.map(layer => {
            self.ListenTo(layer.isDisplayed)
        })

        this._loginButton = Translations.t.general.add.pleaseLogin.Clone().onClick(() => State.state.osmConnection.AttemptLogin());

        this.SetStyle("font-size:large");
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
        
        // IS shown is the state of the dialog - we reset the choice if the dialog dissappears
        isShown.addCallback(isShown => 
        {
            if(!isShown){
                self._confirmPreset.setData(undefined)
            }
        })
        // If the click location changes, we reset the dialog as well
        State.state.LastClickLocation.addCallback(() => {
            self._confirmPreset.setData(undefined)
        })

    }

    InnerRender(): string {
        this._component = this.CreateContent();
        return this._component.Render();

    }

    private CreatePresetsPanel(): UIElement {
        const userDetails = State.state.osmConnection.userDetails;
        if (userDetails === undefined) {
            return undefined;
        }

        if (!userDetails.data.loggedIn) {
            return this._loginButton;
        }

        if (userDetails.data.unreadMessages > 0 && userDetails.data.csCount < Constants.userJourney.addNewPointWithUnreadMessagesUnlock) {
            return new Combine([
                Translations.t.general.readYourMessages.Clone().SetClass("alert"),
                this.goToInboxButton
            ]);

        }

        if (userDetails.data.csCount < Constants.userJourney.addNewPointsUnlock) {
            return new Combine(["<span class='alert'>",
                Translations.t.general.fewChangesBefore,
                "</span>"]);
        }

        if (State.state.locationControl.data.zoom < Constants.userJourney.minZoomLevelToAddNewPoints) {
            return Translations.t.general.add.zoomInFurther.SetClass("alert")
        }

        if (State.state.layerUpdater.runningQuery.data) {
            return Translations.t.general.add.stillLoading
        }

        const presetButtons = this.CreatePresetButtons()
        return new Combine(presetButtons)
    }


    private CreateContent(): UIElement {
        const confirmPanel = this.CreateConfirmPanel();
        if (confirmPanel !== undefined) {
            return confirmPanel;
        }

        let intro: UIElement = Translations.t.general.add.intro;

        let testMode: UIElement = undefined;
        if (State.state.osmConnection?.userDetails?.data?.dryRun) {
            testMode = new Combine([
                "<span class='alert'>",
                "Test mode - changes won't be saved",
                "</span>"
            ]);
        }

        let presets = this.CreatePresetsPanel();
        return new Combine([intro, testMode, presets])


    }

    private CreateConfirmPanel(): UIElement {
        const preset = this._confirmPreset.data;
        if (preset === undefined) {
            return undefined;
        }

        const confirmButton = new SubtleButton(preset.icon,
            new Combine([
                "<b>",
                Translations.t.general.add.confirmButton.Subs({category: preset.name}),
                "</b>"])).SetClass("break-words");
        confirmButton.onClick(
            this.CreatePoint(preset.tags)
        );

        if (!this._confirmPreset.data.layerToAddTo.isDisplayed.data) {
            return new Combine([
                Translations.t.general.add.layerNotEnabled.Subs({layer: this._confirmPreset.data.layerToAddTo.layerDef.name})
                    .SetClass("alert"),
                this.openLayerControl,

                this.cancelButton
            ]);
        }

        let tagInfo = "";
        const csCount = State.state.osmConnection.userDetails.data.csCount;
        if (csCount > Constants.userJourney.tagsVisibleAt) {
            tagInfo = this._confirmPreset.data.tags.map(t => t.asHumanString(csCount > Constants.userJourney.tagsVisibleAndWikiLinked, true)).join("&");
            tagInfo = `<br/>More information about the preset: ${tagInfo}`
        }

        return new Combine([
            Translations.t.general.add.confirmIntro.Subs({title: this._confirmPreset.data.name}),
            State.state.osmConnection.userDetails.data.dryRun ? "<span class='alert'>TESTING - changes won't be saved</span>" : "",
            confirmButton,
            this.cancelButton,
            preset.description,
            tagInfo

        ])

    }

    private CreatePresetButtons() {
        const allButtons = [];
        const self = this;
        for (const layer of State.state.filteredLayers.data) {
            const presets = layer.layerDef.presets;
            for (const preset of presets) {
                const tags = TagUtils.KVtoProperties(preset.tags ?? []);
                let icon: UIElement = new FixedUiElement(layer.layerDef.GenerateLeafletStyle(new UIEventSource<any>(tags), false).icon.html.Render()).SetClass("simple-add-ui-icon");

                const csCount = State.state.osmConnection.userDetails.data.csCount;
                let tagInfo = undefined;
                if (csCount > Constants.userJourney.tagsVisibleAt) {
                    const presets = preset.tags.map(t => new Combine([t.asHumanString(false, true), " "]).SetClass("subtle break-words"))
                    tagInfo = new Combine(presets)
                }
                const button: UIElement =
                    new SubtleButton(
                        icon,
                        new Combine([
                            "<b>",
                            preset.title,
                            "</b>",
                            preset.description !== undefined ? new Combine(["<br/>", preset.description.FirstSentence()]) : "",
                            "<br/>",
                            tagInfo
                        ])
                    ).onClick(
                        () => {
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
                allButtons.push(button);
            }
        }
        return allButtons;
    }

    private CreatePoint(tags: Tag[]) {
        return () => {
            console.log("Create Point Triggered")
            const loc = State.state.LastClickLocation.data;
            let feature = State.state.changes.createElement(tags, loc.lat, loc.lon);
            State.state.selectedElement.setData(feature);
            this._confirmPreset.setData(undefined);
        }
    }

    public OnClose(){
        console.log("On close triggered")
        this._confirmPreset.setData(undefined)
    }

}