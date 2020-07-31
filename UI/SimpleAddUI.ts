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

export interface Preset {
    description: string | UIElement,
    name: string | UIElement,
    icon: string,
    tags: Tag[],
    layerToAddTo: FilteredLayer
}

/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
export class SimpleAddUI extends UIElement {
    private _addButtons: UIElement[];
    
    private _dataIsLoading: UIEventSource<boolean>;

    private _confirmPreset: UIEventSource<Preset>
        = new UIEventSource<Preset>(undefined);
    private confirmButton: UIElement = undefined;
    private cancelButton: UIElement;
    private goToInboxButton: UIElement = new SubtleButton("./assets/envelope.svg", 
        Translations.t.general.goToInbox, {url:"https://www.openstreetmap.org/messages/inbox", newTab: false});

    constructor(
                dataIsLoading: UIEventSource<boolean>,
                addButtons: { description: string | UIElement, name: string | UIElement; icon: string; tags: Tag[]; layerToAddTo: FilteredLayer }[],
    ) {
        super(State.state.locationControl);
        this.ListenTo(Locale.language);
        this.ListenTo(State.state.osmConnection.userDetails);
        
        this._dataIsLoading = dataIsLoading;
        this.ListenTo(dataIsLoading);
        
        this._addButtons = [];
        this.ListenTo(this._confirmPreset);
        this.clss = "add-ui"

        const self = this;
        for (const option of addButtons) {
            // <button type='button'> looks SO retarded
            // the default type of button is 'submit', which performs a POST and page reload
            const button =
                new SubtleButton(
                    option.icon,
                    new Combine([
                        "<b>",
                        option.name,
                        "</b><br/>",
                        option.description !== undefined ? option.description : ""])
                ).onClick(
                    () => {
                        self.confirmButton = new SubtleButton(option.icon,
                            new Combine([
                                "<b>",
                                option.name,
                                "</b><br/>",
                                option.description !== undefined ? option.description : ""]));
                        self.confirmButton.onClick(self.CreatePoint(option));
                        self._confirmPreset.setData(option);
                    }
                )


            this._addButtons.push(button);
        }
        
        this.cancelButton = new SubtleButton(
            "./assets/close.svg",
            Translations.t.general.cancel
        ).onClick(() => {
            self._confirmPreset.setData(undefined);
        })
    }

    private CreatePoint(option: { tags: Tag[]; layerToAddTo: FilteredLayer }) {
        const self = this;
        return () => {

            const loc = State.state.bm.LastClickLocation.data;
            let feature = State.state.changes.createElement(option.tags, loc.lat, loc.lon);
            option.layerToAddTo.AddNewElement(feature);
            State.state.selectedElement.setData({feature: feature});
        }
    }

    InnerRender(): string {

        const userDetails = State.state.osmConnection.userDetails;

        if (this._confirmPreset.data !== undefined) {

            if(userDetails.data.dryRun){
                this.CreatePoint(this._confirmPreset.data)();
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
            return new Combine([header, Translations.t.general.add.pleaseLogin]).Render()
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

        if (this._dataIsLoading.data) {
            return new Combine([header, Translations.t.general.add.stillLoading]).Render()
        }


        var html = "";
        for (const button of this._addButtons) {
            html += button.Render();
        }


        return header.Render() + html;
    }

    InnerUpdate(htmlElement: HTMLElement) {
       State.state.osmConnection.registerActivateOsmAUthenticationClass();
    }

}