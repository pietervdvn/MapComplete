import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import {Tag} from "../Logic/TagsFilter";
import {FilteredLayer} from "../Logic/FilteredLayer";
import {FixedUiElement} from "./Base/FixedUiElement";
import {Button} from "./Base/Button";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import {SubtleButton} from "./Base/SubtleButton";
import {VerticalCombine} from "./Base/VerticalCombine";
import Locale from "./i18n/Locale";
import {Changes} from "../Logic/Osm/Changes";
import {UserDetails} from "../Logic/Osm/OsmConnection";
import {State} from "../State";


/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
export class SimpleAddUI extends UIElement {
    private _addButtons: UIElement[];
    
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

        
        this._loginButton = Translations.t.general.add.pleaseLogin.Clone().onClick(() => State.state.osmConnection.AttemptLogin());
        
        this._addButtons = [];
        this.clss = "add-ui"

        
        const self = this;
        for (const layer of State.state.filteredLayers.data) {
            for (const preset of layer.layerDef.presets) {


                // <button type='button'> looks SO retarded
                // the default type of button is 'submit', which performs a POST and page reload
                const button =
                    new SubtleButton(
                        preset.icon,
                        new Combine([
                            "<b>",
                            preset.title,
                            "</b><br/>",
                            preset.description !== undefined ? preset.description : ""])
                    ).onClick(
                        () => {
                            self.confirmButton = new SubtleButton(preset.icon,
                                new Combine([
                                    Translations.t.general.add.confirmButton.Subs({category: preset.title}),
                                    preset.description !== undefined ? preset.description : ""]));
                            self.confirmButton.onClick(self.CreatePoint(preset.tags, layer));
                            self._confirmPreset.setData({
                                tags: preset.tags,
                                layerToAddTo: layer,
                                name: preset.title,
                                description: preset.description,
                                icon: preset.icon
                            });
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
        const self = this;
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

            if(userDetails.data.dryRun){
                this.CreatePoint(this._confirmPreset.data.tags, this._confirmPreset.data.layerToAddTo)();
                return "";
            }

            return new Combine([
                Translations.t.general.add.confirmIntro.Subs({title: this._confirmPreset.data.name}),
                userDetails.data.dryRun ? "<span class='alert'>TESTING - changes won't be saved</span>":"",
                this.confirmButton,
                this.cancelButton

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


        var html = "";
        for (const button of this._addButtons) {
            html += button.Render();
        }


        return header.Render() + html;
    }


}