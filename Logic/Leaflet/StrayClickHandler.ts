import L from "leaflet";
import {UIElement} from "../../UI/UIElement";
import {State} from "../../State";

/**
 * The stray-click-hanlders adds a marker to the map if no feature was clicked.
 * Shows the given uiToShow-element in the messagebox
 */
export class StrayClickHandler {
    private _lastMarker;
    private _uiToShow: (() => UIElement);

    constructor(
        uiToShow: (() => UIElement)) {
        this._uiToShow = uiToShow;
        const self = this;
        const map = State.state.bm.map;
        State.state.bm.LastClickLocation.addCallback(function (lastClick) {
            State.state.selectedElement.setData(undefined);

            if (self._lastMarker !== undefined) {
                map.removeLayer(self._lastMarker);
            }
            self._lastMarker = L.marker([lastClick.lat, lastClick.lon], {
                icon: L.icon({
                    iconUrl: "./assets/add.svg",
                    iconSize: [50, 50],
                    iconAnchor: [25, 50],
                    popupAnchor: [0, -45]
                })
            });
            const uiElement = uiToShow();
            const popup = L.popup().setContent(uiElement.Render());
            self._lastMarker.addTo(map);
            self._lastMarker.bindPopup(popup);

            self._lastMarker.on("click", () => {
                State.state.fullScreenMessage.setData(self._uiToShow());
            });
        });

        State.state.selectedElement.addCallback(() => {
            if (self._lastMarker !== undefined) {
                map.removeLayer(self._lastMarker);
                this._lastMarker = undefined;
            }
        })

    }


}