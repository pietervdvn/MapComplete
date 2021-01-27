import Locale from "../i18n/Locale";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import {Translation} from "../i18n/Translation";
import {VariableUiElement} from "../Base/VariableUIElement";
import Svg from "../../Svg";
import State from "../../State";
import {TextField} from "../Input/TextField";
import {Geocoding} from "../../Logic/Osm/Geocoding";
import Translations from "../i18n/Translations";
import Hash from "../../Logic/Web/Hash";

export default class SearchAndGo extends UIElement {

    private _placeholder = new UIEventSource<Translation>(Translations.t.general.search.search)
    private _searchField = new TextField({
            placeholder: new VariableUiElement(
                this._placeholder.map(uiElement => uiElement.InnerRender(), [Locale.language])
            ),
            value: new UIEventSource<string>("")
        }
    );

    private _foundEntries = new UIEventSource([]);
    private _goButton = Svg.search_ui().SetClass('w-8 h-8 full-rounded border-black float-right');

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

    InnerRender(): string {
        return this._searchField.Render() +
            this._goButton.Render();

    }

    // Triggered by 'enter' or onclick
    private RunSearch() {
        const searchString = this._searchField.GetValue().data;
        if (searchString === undefined || searchString === "") {
            return;
        }
        this._searchField.GetValue().setData("");
        this._placeholder.setData(Translations.t.general.search.searching);
        const self = this;
        Geocoding.Search(searchString, (result) => {

                console.log("Search result", result)
                if (result.length == 0) {
                    self._placeholder.setData(Translations.t.general.search.nothing);
                    return;
                }

                const poi = result[0];
                const bb = poi.boundingbox;
                const bounds: [[number, number], [number, number]] = [
                    [bb[0], bb[2]],
                    [bb[1], bb[3]]
                ]
            State.state.selectedElement. setData(undefined);
                Hash.hash.setData(poi.osm_type+"/"+poi.osm_id);
                State.state.leafletMap.data.fitBounds(bounds);
                self._placeholder.setData(Translations.t.general.search.search);
            },
            () => {
                self._searchField.GetValue().setData("");
                self._placeholder.setData(Translations.t.general.search.error);
            });

    }


}