import {UIElement} from "./UIElement";
import {TextField} from "./Base/TextField";
import {UIEventSource} from "./UIEventSource";
import {FixedUiElement} from "./Base/FixedUiElement";
import {Geocoding} from "../Logic/Geocoding";
import {Basemap} from "../Logic/Basemap";


export class SearchAndGo extends UIElement {

    private _placeholder = new UIEventSource("Search a location...")
    private _searchField = new TextField(this._placeholder, undefined);

    private _foundEntries = new UIEventSource([]);
    private _map: Basemap;
    private _goButton = new FixedUiElement("<img class='search-go' src='./assets/search.svg' alt='GO'>");

    constructor(map: Basemap) {
        super(undefined);
        this._map = map;
        this.ListenTo(this._foundEntries);

        const self = this;
        this._searchField.enterPressed.addCallback(() => {
            self.RunSearch();
        });

        this._goButton.onClick(function () {
            self.RunSearch();
        });

    }

    // Triggered by 'enter' or onclick
    private RunSearch() {
        const searchString = this._searchField.value.data;
        this._searchField.Clear();
        this._placeholder.setData("Searching...");
        const self = this;
        Geocoding.Search(searchString, this._map, (result) => {

                if (result.length == 0) {
                    this._placeholder.setData("Niets gevonden");
                    return;
                }

                const bb = result[0].boundingbox;
                const bounds = [
                    [bb[0], bb[2]],
                    [bb[1], bb[3]]
                ]
                self._map.map.fitBounds(bounds);
                this._placeholder.setData("Search a location...");
            },
            () => {
                this._placeholder.setData("Something went wrong. Try again.");
            });

    }

    protected InnerRender(): string {
        // "<img class='search' src='./assets/search.svg' alt='Search'> " +
        return this._searchField.Render() +
            this._goButton.Render();

    }

    Update() {
        super.Update();
        this._searchField.Update();
        this._goButton.Update();
    }

    Activate() {
        super.Activate();
        this._searchField.Activate();
        this._goButton.Activate();
    }
}