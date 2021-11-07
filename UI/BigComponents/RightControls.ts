import Combine from "../Base/Combine";
import Toggle from "../Input/Toggle";
import MapControlButton from "../MapControlButton";
import GeoLocationHandler from "../../Logic/Actors/GeoLocationHandler";
import Svg from "../../Svg";
import MapState from "../../Logic/State/MapState";
import ShowDataLayer from "../ShowDataLayer/ShowDataLayer";
import AllKnownLayers from "../../Customizations/AllKnownLayers";

export default class RightControls extends Combine {

    constructor(state: MapState) {

        const geolocatioHandler = new GeoLocationHandler(
            state
        )

        new ShowDataLayer({
            layerToShow: AllKnownLayers.sharedLayers.get("gps_location"),
            leafletMap: state.leafletMap,
            enablePopups: true,
            features: geolocatioHandler.currentLocation
        })

        const geolocationButton = new Toggle(
            new MapControlButton(
                geolocatioHandler
                , {
                    dontStyle: true
                }
            ),
            undefined,
            state.featureSwitchGeolocation
        );

        const plus = new MapControlButton(
            Svg.plus_svg()
        ).onClick(() => {
            state.locationControl.data.zoom++;
            state.locationControl.ping();
        });

        const min = new MapControlButton(
            Svg.min_svg()
        ).onClick(() => {
            state.locationControl.data.zoom--;
            state.locationControl.ping();
        });

        super([plus, min, geolocationButton].map(el => el.SetClass("m-0.5 md:m-1")))
        this.SetClass("flex flex-col items-center")
    }

}