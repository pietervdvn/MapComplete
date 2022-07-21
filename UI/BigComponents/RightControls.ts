import Combine from "../Base/Combine";
import Toggle from "../Input/Toggle";
import MapControlButton from "../MapControlButton";
import GeoLocationHandler from "../../Logic/Actors/GeoLocationHandler";
import Svg from "../../Svg";
import MapState from "../../Logic/State/MapState";
import LevelSelector from "../Input/LevelSelector";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import {Utils} from "../../Utils";

export default class RightControls extends Combine {

    constructor(state: MapState & { featurePipeline: FeaturePipeline }) {

        const geolocatioHandler = new GeoLocationHandler(
            state
        )

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

        const levelsInView = state.currentBounds.map(bbox => {
            if(bbox === undefined){
                return []
            }
            const allElements = state.featurePipeline.GetAllFeaturesAndMetaWithin(bbox);
            const allLevelsRaw: string[] = [].concat(...allElements.map(allElements => allElements.features.map(f => <string>f.properties["level"])))
            const allLevels = [].concat(...allLevelsRaw.map(l => LevelSelector.LevelsParser(l)))
            allLevels.sort((a,b) => a < b ? -1 : 1)
            return Utils.Dedup(allLevels)
        })
        const levelSelect = new LevelSelector(levelsInView)
        
        levelsInView.addCallbackAndRun(levelsInView => {
            if(levelsInView.length <= 1){
                levelSelect.SetClass("invisible")
            }else{
                levelSelect.RemoveClass("invisible")
            }
        })

        super([levelSelect, plus, min, geolocationButton].map(el => el.SetClass("m-0.5 md:m-1")))
        this.SetClass("flex flex-col items-center")
    }

}