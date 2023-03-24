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
    constructor(state: MapState & { featurePipeline: FeaturePipeline }) {
        const levelSelector = new LevelSelector(state)
        super([levelSelector].map((el) => el.SetClass("m-0.5 md:m-1")))
        this.SetClass("flex flex-col items-center")
    }
}
