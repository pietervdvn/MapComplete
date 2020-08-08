import L from "leaflet";
import {UIEventSource} from "../../UI/UIEventSource";
import {UIElement} from "../../UI/UIElement";
import {State} from "../../State";
import {Utils} from "../../Utils";
import {Basemap} from "./Basemap";

export class GeoLocationHandler extends UIElement {

    private _isActive: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private _permission: UIEventSource<string> = new UIEventSource<string>("");
    private _marker: any;
    private _hasLocation: UIEventSource<boolean>;

    constructor() {
        super(undefined);
        this._hasLocation = State.state.currentGPSLocation.map((location) => location !== undefined);
        this.ListenTo(this._hasLocation);
        this.ListenTo(this._isActive);
        this.ListenTo(this._permission);

        const self = this;


        function onAccuratePositionProgress(e) {
            console.log(e.accuracy);
            console.log(e.latlng);
            State.state.currentGPSLocation.setData({latlng: e.latlng, accuracy: e.accuracy});
        }

        function onAccuratePositionFound(e) {
            console.log(e.accuracy);
            console.log(e.latlng);
            State.state.currentGPSLocation.setData({latlng: e.latlng, accuracy: e.accuracy});
        }

        function onAccuratePositionError(e) {
            console.log("onerror", e.message);

        }

        const bm : Basemap = State.state.bm;
        const map = bm.map;
        map.on('accuratepositionprogress', onAccuratePositionProgress);
        map.on('accuratepositionfound', onAccuratePositionFound);
        map.on('accuratepositionerror', onAccuratePositionError);


        const icon = L.icon(
            {
                iconUrl: './assets/crosshair-blue.svg',
                iconSize: [40, 40], // size of the icon
                iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
            })

        State.state.currentGPSLocation.addCallback((location) => {
            const newMarker = L.marker(location.latlng, {icon: icon});
            newMarker.addTo(map);

            if (self._marker !== undefined) {
                map.removeLayer(self._marker);
            }
            self._marker = newMarker;
        });

        navigator?.permissions?.query({name: 'geolocation'})
            ?.then(function (status) {
                console.log("Geolocation is already", status)
                if (status.state === "granted") {
                    self.StartGeolocating();
                }
                self._permission.setData(status.state);
                status.onchange = function () {
                    self._permission.setData(status.state);
                }
            });

        this.HideOnEmpty(true);
    }

    InnerRender(): string {
        if(!State.state.featureSwitchGeolocation.data){
            return "";
        }
        
        if (this._hasLocation.data) {
            return "<img src='assets/crosshair-blue.svg' alt='locate me'>";
        }
        if (this._isActive.data) {
            return "<img src='assets/crosshair-blue-center.svg' alt='locate me'>";
        }

        return "<img src='assets/crosshair.svg' alt='locate me'>";
    }

    
    private StartGeolocating() {
        const self = this;
        const map = State.state.bm.map;
        if (self._permission.data === "denied") {
            return "";
        }
        if (State.state.currentGPSLocation.data !== undefined) {
            map.flyTo(State.state.currentGPSLocation.data.latlng, 18);
        }


        console.log("Searching location using GPS")
        map.findAccuratePosition({
            maxWait: 10000, // defaults to 10000
            desiredAccuracy: 50 // defaults to 20
        });
        
        
        if (!self._isActive.data) {
            self._isActive.setData(true);
            Utils.DoEvery(60000, () => {

                if (document.visibilityState !== "visible") {
                    console.log("Not starting gps: document not visible")
                    return;
                }

                map.findAccuratePosition({
                    maxWait: 10000, // defaults to 10000
                    desiredAccuracy: 50 // defaults to 20
                });
            })
        }
    }
    
    InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);

        const self = this;
        htmlElement.onclick = function () {
            self.StartGeolocating();
        }
    }

}