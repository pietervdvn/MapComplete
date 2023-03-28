import Combine from "../Base/Combine"
import MapState from "../../Logic/State/MapState"
import LevelSelector from "./LevelSelector"

export default class RightControls extends Combine {
    constructor(state: MapState & { featurePipeline: FeaturePipeline }) {
        const levelSelector = new LevelSelector(state)
        super([levelSelector].map((el) => el.SetClass("m-0.5 md:m-1")))
        this.SetClass("flex flex-col items-center")
    }
}
