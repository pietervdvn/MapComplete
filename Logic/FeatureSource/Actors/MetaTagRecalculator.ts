import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import MetaTagging from "../../MetaTagging";
import {ElementStorage} from "../../ElementStorage";
import {ExtraFuncParams} from "../../ExtraFunctions";
import FeaturePipeline from "../FeaturePipeline";
import {BBox} from "../../BBox";
import {UIEventSource} from "../../UIEventSource";

/****
 * Concerned with the logic of updating the right layer at the right time
 */
class MetatagUpdater {
    public readonly neededLayerBboxes = new Map<string /*layerId*/, BBox>()
    private source: FeatureSourceForLayer & Tiled;
    private readonly params: ExtraFuncParams
    private state: { allElements?: ElementStorage };

    private readonly isDirty = new UIEventSource(false)

    constructor(source: FeatureSourceForLayer & Tiled, state: { allElements?: ElementStorage }, featurePipeline: FeaturePipeline) {
        this.state = state;
        this.source = source;
        const self = this;
        this.params = {
            getFeatureById(id) {
                return state.allElements.ContainingFeatures.get(id)
            },
            getFeaturesWithin(layerId, bbox) {
                // We keep track of the BBOX that this source needs
                let oldBbox: BBox = self.neededLayerBboxes.get(layerId)
                if (oldBbox === undefined) {
                    self.neededLayerBboxes.set(layerId, bbox);
                } else if (!bbox.isContainedIn(oldBbox)) {
                    self.neededLayerBboxes.set(layerId, oldBbox.unionWith(bbox))
                }
                return featurePipeline.GetFeaturesWithin(layerId, bbox)
            },
            memberships: featurePipeline.relationTracker
        }
        this.isDirty.stabilized(100).addCallback(dirty => {
            if (dirty) {
                self.updateMetaTags()
            }
        })
        this.source.features.addCallbackAndRunD(_ => self.isDirty.setData(true))

    }

    public requestUpdate() {
        this.isDirty.setData(true)
    }

    public updateMetaTags() {
        const features = this.source.features.data

        if (features.length === 0) {
            this.isDirty.setData(false)
            return
        }
        MetaTagging.addMetatags(
            features,
            this.params,
            this.source.layer.layerDef,
            this.state)
        this.isDirty.setData(false)

    }

}

export default class MetaTagRecalculator {
    private _state: {
        allElements?: ElementStorage
    };
    private _featurePipeline: FeaturePipeline;
    private readonly _alreadyRegistered: Set<FeatureSourceForLayer & Tiled> = new Set<FeatureSourceForLayer & Tiled>()
    private readonly _notifiers: MetatagUpdater[] = []

    /**
     * The meta tag recalculator receives tiles of layers via the 'registerSource'-function.
     * It keeps track of which sources have had their share calculated, and which should be re-updated if some other data is loaded
     */
    constructor(state: { allElements?: ElementStorage, currentView: FeatureSourceForLayer & Tiled }, featurePipeline: FeaturePipeline) {
        this._featurePipeline = featurePipeline;
        this._state = state;
        
        if(state.currentView !== undefined){
        const currentViewUpdater = new MetatagUpdater(state.currentView, this._state, this._featurePipeline)
        this._alreadyRegistered.add(state.currentView)
        this._notifiers.push(currentViewUpdater)
        state.currentView.features.addCallback(_ => {
            console.debug("Requesting an update for currentView")
            currentViewUpdater.updateMetaTags();
        })
        }

    }

    public registerSource(source: FeatureSourceForLayer & Tiled, recalculateOnEveryChange = false) {
        if (source === undefined) {
            return;
        }
        if (this._alreadyRegistered.has(source)) {
            return;
        }
        this._alreadyRegistered.add(source)
        this._notifiers.push(new MetatagUpdater(source, this._state, this._featurePipeline))
        const self = this;
        source.features.addCallbackAndRunD(_ => {
            const layerName = source.layer.layerDef.id
            for (const updater of self._notifiers) {
                const neededBbox = updater.neededLayerBboxes.get(layerName)
                if (neededBbox == undefined) {
                    continue
                }
                if (source.bbox === undefined || neededBbox.overlapsWith(source.bbox)) {
                    updater.requestUpdate()
                }
            }
        })

    }

}