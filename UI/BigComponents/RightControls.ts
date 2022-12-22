import Combine from "../Base/Combine"
import Toggle from "../Input/Toggle"
import MapControlButton from "../MapControlButton"
import GeoLocationHandler from "../../Logic/Actors/GeoLocationHandler"
import Svg from "../../Svg"
import MapState from "../../Logic/State/MapState"
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline"
import LevelSelector from "./LevelSelector"
import { GeolocationControl } from "./GeolocationControl"

export default class RightControls extends Combine {
    constructor(
        state: MapState & { featurePipeline: FeaturePipeline },
        geolocationHandler: GeoLocationHandler
    ) {
        const geolocationButton = new Toggle(
            new MapControlButton(new GeolocationControl(geolocationHandler), {
                dontStyle: true,
            }).SetClass("p-1"),
            undefined,
            state.featureSwitchGeolocation
        )

        const plus = new MapControlButton(Svg.plus_svg()).onClick(() => {
            state.locationControl.data.zoom++
            state.locationControl.ping()
        })

        const min = new MapControlButton(Svg.min_svg()).onClick(() => {
            state.locationControl.data.zoom--
            state.locationControl.ping()
        })

        const levelSelector = new LevelSelector(state)
        super(
            [levelSelector, plus, min, geolocationButton].map((el) => el.SetClass("m-0.5 md:m-1"))
        )
        this.SetClass("flex flex-col items-center")
    }
}
