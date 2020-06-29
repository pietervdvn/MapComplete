import {Basemap} from "./Basemap";
import L from "leaflet";
import {UIEventSource} from "../UI/UIEventSource";
import {UIElement} from "../UI/UIElement";

/**
 * The stray-click-hanlders adds a marker to the map if no feature was clicked.
 * Shows the given uiToShow-element in the messagebox
 */
export class StrayClickHandler {
    private _basemap: Basemap;
    private _lastMarker;
    private _leftMessage: UIEventSource<() => UIElement>;
    private _uiToShow: (() => UIElement);

    constructor(
        basemap: Basemap,
        selectElement: UIEventSource<any>,
        leftMessage: UIEventSource<() => UIElement>, 
        uiToShow: (() => UIElement)) {
        this._basemap = basemap;
        this._leftMessage = leftMessage;
        this._uiToShow = uiToShow;
        const self = this;
        const map = basemap.map;
        basemap.LastClickLocation.addCallback(function (lastClick) {

            if (self._lastMarker !== undefined) {
                map.removeLayer(self._lastMarker);
            }

            self._lastMarker = L.marker([lastClick.lat, lastClick.lon]);
            self._lastMarker.addTo(map);

            leftMessage.setData(self._uiToShow);

        });

        selectElement.addCallback(() => {
            if (self._lastMarker !== undefined) {
                map.removeLayer(self._lastMarker);
                this._lastMarker = undefined;
            }
        })

    }


}