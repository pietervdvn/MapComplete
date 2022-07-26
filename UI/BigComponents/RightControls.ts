import Combine from "../Base/Combine";
import Toggle from "../Input/Toggle";
import MapControlButton from "../MapControlButton";
import GeoLocationHandler from "../../Logic/Actors/GeoLocationHandler";
import Svg from "../../Svg";
import MapState, {GlobalFilter} from "../../Logic/State/MapState";
import LevelSelector from "../Input/LevelSelector";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import {Utils} from "../../Utils";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import {RegexTag} from "../../Logic/Tags/RegexTag";
import {Or} from "../../Logic/Tags/Or";
import {Tag} from "../../Logic/Tags/Tag";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import Translations from "../i18n/Translations";
import {BBox} from "../../Logic/BBox";
import {OsmFeature} from "../../Models/OsmFeature";

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
            if (bbox === undefined) {
                return []
            }
            const allElementsUnfiltered: OsmFeature[] = [].concat(... state.featurePipeline.GetAllFeaturesAndMetaWithin(bbox).map(ff => ff.features))
            const allElements = allElementsUnfiltered.filter(f => BBox.get(f).overlapsWith(bbox))
            const allLevelsRaw: string[] = allElements.map(f => f.properties["level"])
            const allLevels = [].concat(...allLevelsRaw.map(l => TagUtils.LevelsParser(l))) 
            if (allLevels.indexOf("0") < 0) {
                allLevels.push("0")
            }
            allLevels.sort((a, b) => a < b ? -1 : 1)
            return Utils.Dedup(allLevels)
        })
        state.globalFilters.data.push({
            filter: {
                currentFilter: undefined,
                state: undefined,

            },
            id: "level",
            onNewPoint: undefined
        })
        const levelSelect = new LevelSelector(levelsInView)

        const isShown = levelsInView.map(levelsInView => {
                if (levelsInView.length == 0) {
                    return false;
                }
                if (state.locationControl.data.zoom <= 16) {
                    return false;
                }
                if (levelsInView.length == 1 && levelsInView[0] == "0") {
                    return false
                }
                return true;
            },
            [state.locationControl])

        function setLevelFilter() {
            console.log("Updating levels filter")
            const filter: GlobalFilter = state.globalFilters.data.find(gf => gf.id === "level")
            if (!isShown.data) {
                filter.filter = {
                    state: "*",
                    currentFilter: undefined,
                }
                filter.onNewPoint = undefined

            } else {

                const l = levelSelect.GetValue().data
                let neededLevel: TagsFilter = new RegexTag("level", new RegExp("(^|;)" + l + "(;|$)"));
                if (l === "0") {
                    neededLevel = new Or([neededLevel, new Tag("level", "")])
                }
                filter.filter = {
                    state: l,
                    currentFilter: neededLevel
                }
                const t = Translations.t.general.levelSelection
                filter.onNewPoint = {
                    confirmAddNew: t.confirmLevel.PartialSubs({level: l}),
                    safetyCheck: t.addNewOnLevel.Subs({level: l}),
                    tags: [new Tag("level", l)]
                }
            }
            state.globalFilters.ping();
            return;
        }


        isShown.addCallbackAndRun(shown => {
            console.log("Is level selector shown?", shown)
            setLevelFilter()
            if (shown) {
                levelSelect.RemoveClass("invisible")
            } else {
                levelSelect.SetClass("invisible")
            }
        })

        levelSelect.GetValue().addCallback(_ => setLevelFilter())

        super([new Combine([levelSelect]).SetClass(""), plus, min, geolocationButton].map(el => el.SetClass("m-0.5 md:m-1")))
        this.SetClass("flex flex-col items-center")
    }

}