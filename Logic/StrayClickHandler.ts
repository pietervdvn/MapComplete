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
    private _fullScreenMessage: UIEventSource<UIElement>;
    private _uiToShow: (() => UIElement);

    constructor(
        basemap: Basemap,
        selectElement: UIEventSource<{ feature: any }>,
        fullScreenMessage: UIEventSource<UIElement>, 
        uiToShow: (() => UIElement)) {
        this._basemap = basemap;
        this._fullScreenMessage = fullScreenMessage;
        this._uiToShow = uiToShow;
        const self = this;
        const map = basemap.map;
        basemap.LastClickLocation.addCallback(function (lastClick) {
            selectElement.setData(undefined);

            if (self._lastMarker !== undefined) {
                map.removeLayer(self._lastMarker);
            }
            self._lastMarker = L.marker([lastClick.lat, lastClick.lon], {
                icon: L.icon({
                    iconUrl: "./assets/add.svg",
                    iconSize: [50,50],
                    iconAnchor: [25,50],
                    popupAnchor: [0,-45]
                })
            });
            const uiElement = uiToShow();
            const popup = L.popup().setContent(uiElement.Render());
            uiElement.Update();
            uiElement.Activate();
            self._lastMarker.addTo(map);
            self._lastMarker.bindPopup(popup).openPopup();

            self._lastMarker.on("click", () => {
                fullScreenMessage.setData(self._uiToShow());
            });
            uiElement.Update();
            uiElement.Activate();
        });

        selectElement.addCallback(() => {
            if (self._lastMarker !== undefined) {
                map.removeLayer(self._lastMarker);
                this._lastMarker = undefined;
            }
        })

    }


}