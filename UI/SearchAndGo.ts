import Locale from "./i18n/Locale";
import {UIEventSource} from "./UIEventSource";
import {UIElement} from "./UIElement";
import Translation from "./i18n/Translation";
import {VariableUiElement} from "./Base/VariableUIElement";
import {FixedUiElement} from "./Base/FixedUiElement";
import {TextField} from "./Input/TextField";
import {Geocoding} from "../Logic/Osm/Geocoding";
import Translations from "./i18n/Translations";
import {Basemap} from "../Logic/Leaflet/Basemap";
import {State} from "../State";


export class SearchAndGo extends UIElement {

    private _placeholder = new UIEventSource<Translation>(Translations.t.general.search.search)
    private _searchField = new TextField<string>({
            placeholder: new VariableUiElement(
                this._placeholder.map(uiElement => uiElement.InnerRender(), [Locale.language])
            ),
            fromString: str => str,
            toString: str => str
        }
    );

    private _foundEntries = new UIEventSource([]);
    private _goButton = new FixedUiElement("<img class='search-go' src='./assets/search.svg' alt='GO'>");

    constructor() {
        super(undefined);
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
        const searchString = this._searchField.GetValue().data;
        this._searchField.Clear();
        this._placeholder.setData(Translations.t.general.search.searching);
        const self = this;
        Geocoding.Search(searchString,  (result) => {

                if (result.length == 0) {
                    this._placeholder.setData(Translations.t.general.search.nothing);
                    return;
                }

                const bb = result[0].boundingbox;
                const bounds = [
                    [bb[0], bb[2]],
                    [bb[1], bb[3]]
                ]
                State.state.bm.map.fitBounds(bounds);
                this._placeholder.setData(Translations.t.general.search.search);
            },
            () => {
                this._placeholder.setData(Translations.t.general.search.error);
            });

    }

    InnerRender(): string {
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