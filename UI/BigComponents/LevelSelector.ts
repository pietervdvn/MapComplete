import FloorLevelInputElement from "../Input/FloorLevelInputElement";
import MapState, {GlobalFilter} from "../../Logic/State/MapState";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import {RegexTag} from "../../Logic/Tags/RegexTag";
import {Or} from "../../Logic/Tags/Or";
import {Tag} from "../../Logic/Tags/Tag";
import Translations from "../i18n/Translations";
import Combine from "../Base/Combine";
import {OsmFeature} from "../../Models/OsmFeature";
import {BBox} from "../../Logic/BBox";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import {Store} from "../../Logic/UIEventSource";

/***
 * The element responsible for the level input element and picking the right level, showing and hiding at the right time, ...
 */
export default class LevelSelector extends Combine {

    constructor(state: MapState & { featurePipeline: FeaturePipeline }) {
        
        const levelsInView : Store< Record<string, number>> = state.currentBounds.map(bbox => {
            if (bbox === undefined) {
                return {}
            }
            const allElementsUnfiltered: OsmFeature[] = [].concat(...state.featurePipeline.GetAllFeaturesAndMetaWithin(bbox).map(ff => ff.features))
            const allElements = allElementsUnfiltered.filter(f => BBox.get(f).overlapsWith(bbox))
            const allLevelsRaw: string[] = allElements.map(f => f.properties["level"])
            
            const levels : Record<string, number> = {"0": 0}
            for (const levelDescription of allLevelsRaw) {
                if(levelDescription === undefined){
                    levels["0"] ++
                }
                for (const level of TagUtils.LevelsParser(levelDescription)) {
                    levels[level] = (levels[level] ?? 0) + 1
                }
            }

            return levels
        })

        const levelSelect = new FloorLevelInputElement(levelsInView)

        state.globalFilters.data.push({
            filter: {
                currentFilter: undefined,
                state: undefined,

            },
            id: "level",
            onNewPoint: undefined
        })
        const isShown = levelsInView.map(levelsInView => {
                if (state.locationControl.data.zoom <= 16) {
                    return false;
                }
                if (Object.keys(levelsInView).length == 1) {
                    return false;
                }
     
                return true;
            },
            [state.locationControl])

        function setLevelFilter() {
            console.log("Updating levels filter to ", levelSelect.GetValue().data, " is shown:", isShown.data)
            const filter: GlobalFilter = state.globalFilters.data.find(gf => gf.id === "level")
            if (!isShown.data) {
                filter.filter = {
                    state: "*",
                    currentFilter: undefined,
                }
                filter.onNewPoint = undefined
                state.globalFilters.ping();
                return
            }

            const l = levelSelect.GetValue().data
            if(l === undefined){
                return
            }

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


        levelsInView.addCallbackAndRun(levels => {
            if(!isShown.data){
                return
            }
            const value = levelSelect.GetValue()
            if (!(levels[value.data] === undefined || levels[value.data] === 0)) {
                return;
            }
            // Nothing in view. Lets switch to a different level (the level with the most features)
            let mostElements = 0
            let mostElementsLevel = undefined
            for (const level in levels) {
                const count = levels[level]
                if(mostElementsLevel === undefined || mostElements < count){
                    mostElementsLevel = level
                    mostElements = count
                }
            }
            console.log("Force switching to a different level:", mostElementsLevel,"as it has",mostElements,"elements on that floor",levels,"(old level: "+value.data+")")
            value.setData(mostElementsLevel )

        })
        levelSelect.GetValue().addCallback(_ => setLevelFilter())
        super([levelSelect])
    }

}