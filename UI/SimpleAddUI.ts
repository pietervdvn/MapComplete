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

/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
export class SimpleAddUI extends UIElement {
    private _zoomlevel: UIEventSource<{ zoom: number }>;
    private _addButtons: UIElement[];
    private _lastClickLocation: UIEventSource<{ lat: number; lon: number }>;
    private _changes: Changes;
    private _selectedElement: UIEventSource<{feature: any}>;
    private _dataIsLoading: UIEventSource<boolean>;
    private _userDetails: UIEventSource<UserDetails>;

    constructor(zoomlevel: UIEventSource<{ zoom: number }>,
                lastClickLocation: UIEventSource<{ lat: number, lon: number }>,
                changes: Changes,
                selectedElement: UIEventSource<{feature: any}>,
                dataIsLoading: UIEventSource<boolean>,
                userDetails: UIEventSource<UserDetails>,
                addButtons: { name: UIElement; icon: string; tags: Tag[]; layerToAddTo: FilteredLayer }[],
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

        for (const option of addButtons) {
            // <button type='button'> looks SO retarded
            // the default type of button is 'submit', which performs a POST and page reload
            const button =
                new Button(Translations.t.general.add.addNew.Subs({category: option.name}),
                    this.CreatePoint(option));
            this._addButtons.push(button);
        }
    }

    private CreatePoint(option: {icon: string; tags: Tag[]; layerToAddTo: FilteredLayer }) {
        const self = this;
        return () => {

            const loc = self._lastClickLocation.data;
            let feature = self._changes.createElement(option.tags, loc.lat, loc.lon);
            option.layerToAddTo.AddNewElement(feature);
            self._selectedElement.setData({feature: feature});
        }
    }

    InnerRender(): string {
        const header = Translations.t.general.add.header;
            
        if (!this._userDetails.data.loggedIn) {
            return new Combine([header, Translations.t.general.add.pleaseLogin]).Render()
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