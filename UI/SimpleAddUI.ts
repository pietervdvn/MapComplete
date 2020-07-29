import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import {Tag} from "../Logic/TagsFilter";
import {FilteredLayer} from "../Logic/FilteredLayer";
import {Changes} from "../Logic/Changes";
import {FixedUiElement} from "./Base/FixedUiElement";
import {Button} from "./Base/Button";
import {UserDetails} from "../Logic/OsmConnection";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import {SubtleButton} from "./Base/SubtleButton";
import {VerticalCombine} from "./Base/VerticalCombine";

interface Preset {
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
    private _zoomlevel: UIEventSource<{ zoom: number }>;
    private _addButtons: UIElement[];
    private _lastClickLocation: UIEventSource<{ lat: number; lon: number }>;
    private _changes: Changes;
    private _selectedElement: UIEventSource<{ feature: any }>;
    private _dataIsLoading: UIEventSource<boolean>;
    private _userDetails: UIEventSource<UserDetails>;

    private _confirmPreset: UIEventSource<Preset>
        = new UIEventSource<Preset>(undefined);
    private confirmButton: UIElement = undefined;
    private cancelButton: UIElement;

    constructor(zoomlevel: UIEventSource<{ zoom: number }>,
                lastClickLocation: UIEventSource<{ lat: number, lon: number }>,
                changes: Changes,
                selectedElement: UIEventSource<{ feature: any }>,
                dataIsLoading: UIEventSource<boolean>,
                userDetails: UIEventSource<UserDetails>,
                addButtons: { description: string | UIElement, name: string | UIElement; icon: string; tags: Tag[]; layerToAddTo: FilteredLayer }[],
    ) {
        super(zoomlevel);
        this._zoomlevel = zoomlevel;
        this._lastClickLocation = lastClickLocation;
        this._changes = changes;
        this._selectedElement = selectedElement;
        this._dataIsLoading = dataIsLoading;
        this._userDetails = userDetails;
        this.ListenTo(userDetails);
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
            "/assets/close.svg",
            Translations.t.general.cancel
        ).onClick(() => {
            self._confirmPreset.setData(undefined);
        })
    }

    private CreatePoint(option: { tags: Tag[]; layerToAddTo: FilteredLayer }) {
        const self = this;
        return () => {

            const loc = self._lastClickLocation.data;
            let feature = self._changes.createElement(option.tags, loc.lat, loc.lon);
            option.layerToAddTo.AddNewElement(feature);
            self._selectedElement.setData({feature: feature});
        }
    }

    InnerRender(): string {


        if (this._confirmPreset.data !== undefined) {


            return new Combine([
                Translations.t.general.add.confirmIntro.Subs({title: this._confirmPreset.data.name}),
                this._userDetails.data.dryRun ? "<span class='alert'>TESTING - changes won't be saved</span>":"",
                this.confirmButton,
                this.cancelButton

            ]).Render();


        }


        let header: UIElement = Translations.t.general.add.header;

        if (!this._userDetails.data.loggedIn) {
            return new Combine([header, Translations.t.general.add.pleaseLogin]).Render()
        }

        if (this._userDetails.data.unreadMessages > 0) {
            return new Combine([header, "<span class='alert'>",
                Translations.t.general.readYourMessages,
                "</span>"]).Render();
        }

        if (this._userDetails.data.dryRun) {
            header = new Combine([header,
                "<span class='alert'>",
                "Test mode - changes won't be saved",
                "</span>"
            ]);
        }

        if (this._userDetails.data.csCount < 5) {
            return new Combine([header, "<span class='alert'>",
                Translations.t.general.fewChangesBefore,
                "</span>"]).Render();
        }

        if (this._zoomlevel.data.zoom < 19) {
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
        this._userDetails.data.osmConnection.registerActivateOsmAUthenticationClass();
    }

}