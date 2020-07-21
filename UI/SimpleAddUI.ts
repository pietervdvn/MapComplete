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
                new Button(new FixedUiElement("Add a " + option.name.Render() + " here"),
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
        const header = "<h2>No data here</h2>" +
            "You clicked somewhere where no data is known yet.<br/>";
        if (!this._userDetails.data.loggedIn) {
            return header + "<a class='activate-osm-authentication'>Please log in to add a new point</a>"
        }

        if (this._zoomlevel.data.zoom < 19) {
            return header + "Zoom in further to add a point.";
        }

        if (this._dataIsLoading.data) {
            return header + "The data is still loading. Please wait a bit before you add a new point";
        }

        var html = "";
        for (const button of this._addButtons) {
            html += button.Render();
        }
        return header + html;
    }

    InnerUpdate(htmlElement: HTMLElement) {
        this._userDetails.data.osmConnection.registerActivateOsmAUthenticationClass();
    }

}