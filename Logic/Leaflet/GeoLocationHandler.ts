import * as L from "leaflet";
import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../../UI/UIElement";
import State from "../../State";
import {Utils} from "../../Utils";
import {Basemap} from "./Basemap";
import Svg from "../../Svg";
import {Img} from "../../UI/Img";

export class GeoLocationHandler extends UIElement {

    private readonly _isActive: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _permission: UIEventSource<string> = new UIEventSource<string>("");
    private _marker: any;
    private readonly _hasLocation: UIEventSource<boolean>;

    constructor() {
        super(undefined);
        this._hasLocation = State.state.currentGPSLocation.map((location) => location !== undefined);
        var self = this;
        import("../../vendor/Leaflet.AccuratePosition.js").then(() => {
            self.init();
        })
    }


    public init() {
        this.ListenTo(this._hasLocation);
        this.ListenTo(this._isActive);
        this.ListenTo(this._permission);

        const self = this;


        function onAccuratePositionProgress(e) {
            State.state.currentGPSLocation.setData({latlng: e.latlng, accuracy: e.accuracy});
        }

        function onAccuratePositionFound(e) {
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



        State.state.currentGPSLocation.addCallback((location) => {

            const color = getComputedStyle(document.body).getPropertyValue("--catch-detail-color")
            const icon = L.icon(
                {
                    iconUrl: Img.AsData(Svg.crosshair.replace(/#000000/g, color)),
                    iconSize: [40, 40], // size of the icon
                    iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
                })
            
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
            return Svg.crosshair_blue_img;
        }
        if (this._isActive.data) {
            return Svg.crosshair_blue_center_img;
        }

        return Svg.crosshair_img;
    }

    
    private StartGeolocating(zoomlevel = 19) {
        const self = this;
        const map = State.state.bm.map;
        if (self._permission.data === "denied") {
            return "";
        }
        if (State.state.currentGPSLocation.data !== undefined) {
            State.state.bm.map.setView(
                State.state.currentGPSLocation.data.latlng, zoomlevel
            );
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
            self.StartGeolocating(19);
        }

        htmlElement.oncontextmenu = function (e) {
            self.StartGeolocating(15);
            e.preventDefault();
            return false;
        }

    }

}