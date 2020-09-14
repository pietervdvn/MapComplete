import {UIElement} from "./UIElement";
import {Tag, TagUtils} from "../Logic/Tags";
import {FilteredLayer} from "../Logic/FilteredLayer";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import {SubtleButton} from "./Base/SubtleButton";
import Locale from "./i18n/Locale";
import {State} from "../State";

import {UIEventSource} from "../Logic/UIEventSource";
import {Utils} from "../Utils";

/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
export class SimpleAddUI extends UIElement {
    private readonly _addButtons: UIElement[];
    
    private _loginButton : UIElement;
    
    private _confirmPreset: UIEventSource<{
        description: string | UIElement,
        name: string | UIElement,
        icon: string,
        tags: Tag[],
        layerToAddTo: FilteredLayer
    }>
        = new UIEventSource(undefined);
    private confirmButton: UIElement = undefined;
    private cancelButton: UIElement;
    private goToInboxButton: UIElement = new SubtleButton("./assets/envelope.svg", 
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
            for (const preset of layer.layerDef.presets) {

                let icon: string = "./assets/bug.svg";
                if (preset.icon !== undefined) {

                    if (typeof (preset.icon) !== "string") {
                        const tags = Utils.MergeTags(TagUtils.KVtoProperties(preset.tags), {id:"node/-1"});
                        icon = preset.icon.GetContent(tags).txt;
                        if(icon.startsWith("$")){
                            icon = undefined;
                        }
                    } else {
                        icon = preset.icon;
                    }
                } else {
                    console.warn("No icon defined for preset ", preset, "in layer ", layer.layerDef.id)
                }

                const csCount = State.state.osmConnection.userDetails.data.csCount;
                let tagInfo = "";
                if (csCount > State.userJourney.tagsVisibleAt) {
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
                            preset.description !== undefined ? new Combine(["<br/>", preset.description]) : "",
                            tagInfo
                        ])
                    ).onClick(
                        () => {
                            self.confirmButton = new SubtleButton(icon,
                                new Combine([
                                    "<b>",
                                    Translations.t.general.add.confirmButton.Subs({category: preset.title}),
                                    "</b><br/>",
                                    preset.description !== undefined ? preset.description : ""]));
                            self.confirmButton.onClick(self.CreatePoint(preset.tags, layer));
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
        
        this.cancelButton = new SubtleButton(
            "./assets/close.svg",
            Translations.t.general.cancel
        ).onClick(() => {
            self._confirmPreset.setData(undefined);
        })
    }

    private CreatePoint(tags: Tag[], layerToAddTo: FilteredLayer) {
        return () => {

            const loc = State.state.bm.LastClickLocation.data;
            let feature = State.state.changes.createElement(tags, loc.lat, loc.lon);
            layerToAddTo.AddNewElement(feature);
            State.state.selectedElement.setData({feature: feature});
        }
    }

    InnerRender(): string {

        const userDetails = State.state.osmConnection.userDetails;

        if (this._confirmPreset.data !== undefined) {

            let tagInfo = "";
            const csCount = State.state.osmConnection.userDetails.data.csCount;
            if (csCount > State.userJourney.tagsVisibleAt) {
                tagInfo = this._confirmPreset.data .tags.map(t => t.asHumanString(csCount > State.userJourney.tagsVisibleAndWikiLinked, true)).join("&");
                tagInfo = `<br/>More information about the preset: ${tagInfo}`
            }

            return new Combine([
                Translations.t.general.add.confirmIntro.Subs({title: this._confirmPreset.data.name}),
                userDetails.data.dryRun ? "<span class='alert'>TESTING - changes won't be saved</span>" : "",
                this.confirmButton,
                this.cancelButton,
                tagInfo

            ]).Render();


        }


        let header: UIElement = Translations.t.general.add.header;

        
        if(userDetails === undefined){
            return header.Render();
        }
        
        if (!userDetails.data.loggedIn) {
            return new Combine([header, this._loginButton]).Render()
        }

        if (userDetails.data.unreadMessages > 0) {
            return new Combine([header, "<span class='alert'>",
                Translations.t.general.readYourMessages,
                "</span>",
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

        if (userDetails.data.csCount < 5) {
            return new Combine([header, "<span class='alert'>",
                Translations.t.general.fewChangesBefore,
                "</span>"]).Render();
        }

        if (State.state.locationControl.data.zoom < 19) {
            return new Combine([header, Translations.t.general.add.zoomInFurther]).Render()
        }

        if (State.state.layerUpdater.runningQuery.data) {
            return new Combine([header, Translations.t.general.add.stillLoading]).Render()
        }

        return header.Render() + new Combine(this._addButtons).SetClass("add-popup-all-buttons").Render();
    }


}