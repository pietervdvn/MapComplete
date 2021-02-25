import * as L from "leaflet";
import Svg from "../../Svg";
import {UIEventSource} from "../UIEventSource";
import Img from "../../UI/Base/Img";
import ScrollableFullScreen from "../../UI/Base/ScrollableFullScreen";

/**
 * The stray-click-hanlders adds a marker to the map if no feature was clicked.
 * Shows the given uiToShow-element in the messagebox
 */
export default class StrayClickHandler {
    private _lastMarker;

    constructor(
        lastClickLocation: UIEventSource<{ lat: number, lon: number }>,
        selectedElement: UIEventSource<string>,
        filteredLayers: UIEventSource<{ readonly isDisplayed: UIEventSource<boolean> }[]>,
        leafletMap: UIEventSource<L.Map>,
        uiToShow: ScrollableFullScreen) {
        const self = this;
        filteredLayers.data.forEach((filteredLayer) => {
            filteredLayer.isDisplayed.addCallback(isEnabled => {
                if (isEnabled && self._lastMarker && leafletMap.data !== undefined) {
                    // When a layer is activated, we remove the 'last click location' in order to force the user to reclick
                    // This reclick might be at a location where a feature now appeared...
                    leafletMap.data.removeLayer(self._lastMarker);
                }
            })
        })

        lastClickLocation.addCallback(function (lastClick) {
            
            if (self._lastMarker !== undefined) {
                leafletMap.data?.removeLayer(self._lastMarker);
            }
            
            if(lastClick === undefined){
                return;
            }

            selectedElement.setData(undefined);
            self._lastMarker = L.marker([lastClick.lat, lastClick.lon], {
                icon: L.icon({
                    iconUrl: Img.AsData(Svg.add),
                    iconSize: [50, 50],
                    iconAnchor: [25, 50],
                    popupAnchor: [0, -45]
                })
            });
            const popup = L.popup().setContent(uiToShow.Render());
            self._lastMarker.addTo(leafletMap.data);
            self._lastMarker.bindPopup(popup);

            self._lastMarker.on("click", () => {
                uiToShow.Activate();
                uiToShow.Update();
            });
        });

        selectedElement.addCallback(() => {
            if (self._lastMarker !== undefined) {
                leafletMap.data.removeLayer(self._lastMarker);
                this._lastMarker = undefined;
            }
        })

    }


}