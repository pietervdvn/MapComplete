import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";
import {Tag} from "../Logic/TagsFilter";
import {FilteredLayer} from "../Logic/FilteredLayer";
import {Changes} from "../Logic/Changes";
import {FixedUiElement} from "./Base/FixedUiElement";
import {Button} from "./Base/Button";
import {UserDetails} from "../Logic/OsmConnection";

/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
export class SimpleAddUI extends UIElement {
    private _zoomlevel: UIEventSource<{ zoom: number }>;
    private _addButtons: UIElement[];
    private _lastClickLocation: UIEventSource<{ lat: number; lon: number }>;
    private _changes: Changes;
    private _selectedElement: UIEventSource<any>;
    private _dataIsLoading: UIEventSource<boolean>;
    private _userDetails: UIEventSource<UserDetails>;

    constructor(zoomlevel: UIEventSource<{ zoom: number }>,
                lastClickLocation: UIEventSource<{ lat: number, lon: number }>,
                changes: Changes,
                selectedElement: UIEventSource<any>,
                dataIsLoading: UIEventSource<boolean>,
                userDetails: UIEventSource<UserDetails>,
                addButtons: { name: string; icon: string; tags: Tag[]; layerToAddTo: FilteredLayer }[],
    ) {
        super(zoomlevel);
        this._zoomlevel = zoomlevel;
        this._lastClickLocation = lastClickLocation;
        this._changes = changes;
        this._selectedElement = selectedElement;
        this._dataIsLoading = dataIsLoading;
        this._userDetails = userDetails;
        this.ListenTo(userDetails);
        this._addButtons = [];

        for (const option of addButtons) {
            // <button type='button'> looks SO retarded
            // the default type of button is 'submit', which performs a POST and page reload
            const button =
                new Button(new FixedUiElement("Voeg hier een " + option.name + " toe"),
                    this.CreatePoint(option));
            this._addButtons.push(button);
        }
    }

    private CreatePoint(option: { name: string; icon: string; tags: Tag[]; layerToAddTo: FilteredLayer }) {
        const self = this;
        return () => {

            console.log("Creating a new ", option.name, " at last click location");
            const loc = self._lastClickLocation.data;
            let feature = self._changes.createElement(option.tags, loc.lat, loc.lon);
            option.layerToAddTo.AddNewElement(feature);
            self._selectedElement.setData(feature.properties);
        }
    }

    protected InnerRender(): string {
        const header = "<h2>Geen selectie</h2>" +
            "Je klikte ergens waar er nog geen gezochte data is.<br/>";
        if (this._zoomlevel.data.zoom < 19) {
            return header + "Zoom verder in om een element toe te voegen.";
        }

        if (this._dataIsLoading.data) {
            return header + "De data is nog aan het laden. Nog even geduld, dan kan je een punt toevoegen";
        }

        if (!this._userDetails.data.loggedIn) {
            return header + "<a class='activate-osm-authentication'>Gelieve je aan te melden om een nieuw punt toe te voegen</a>"
        }

        var html = "";
        for (const button of this._addButtons) {
            html += button.Render();
        }
        return header + html;
    }

    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        for (const button of this._addButtons) {
            button.Update();
        }
        this._userDetails.data.osmConnection.registerActivateOsmAUthenticationClass();
    }

}