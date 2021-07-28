import Combine from "../Base/Combine";
import Toggle from "../Input/Toggle";
import MapControlButton from "../MapControlButton";
import GeoLocationHandler from "../../Logic/Actors/GeoLocationHandler";
import State from "../../State";
import Svg from "../../Svg";

export default class RightControls extends Combine {

    constructor() {
        const geolocationButton = new Toggle(
            new MapControlButton(
                new GeoLocationHandler(
                    State.state.currentGPSLocation,
                    State.state.leafletMap,
                    State.state.layoutToUse
                ), {
                    dontStyle: true
                }
            ),
            undefined,
            State.state.featureSwitchGeolocation
        );

        const plus = new MapControlButton(
            Svg.plus_zoom_svg()
        ).onClick(() => {
            State.state.locationControl.data.zoom++;
            State.state.locationControl.ping();
        });

        const min = new MapControlButton(
            Svg.min_zoom_svg()
        ).onClick(() => {
            State.state.locationControl.data.zoom--;
            State.state.locationControl.ping();
        });

        super([plus, min, geolocationButton].map(el => el.SetClass("m-0.5 md:m-1")))
        this.SetClass("flex flex-col")
    }

}