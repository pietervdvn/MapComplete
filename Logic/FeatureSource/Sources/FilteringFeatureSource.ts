import {UIEventSource} from "../../UIEventSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {BBox} from "../../BBox";
import {ElementStorage} from "../../ElementStorage";
import {TagsFilter} from "../../Tags/TagsFilter";

export default class FilteringFeatureSource implements FeatureSourceForLayer, Tiled {
    public features: UIEventSource<{ feature: any; freshness: Date }[]> =
        new UIEventSource<{ feature: any; freshness: Date }[]>([]);
    public readonly name;
    public readonly layer: FilteredLayer;
    public readonly tileIndex: number
    public readonly bbox: BBox
    private readonly upstream: FeatureSourceForLayer;
    private readonly state: {
        locationControl: UIEventSource<{ zoom: number }>; selectedElement: UIEventSource<any>,
        allElements: ElementStorage
    };
    private readonly _alreadyRegistered = new Set<UIEventSource<any>>();
    private readonly _is_dirty = new UIEventSource(false)
    private previousFeatureSet : Set<any> = undefined;
    
    constructor(
        state: {
            locationControl: UIEventSource<{ zoom: number }>,
            selectedElement: UIEventSource<any>,
            allElements: ElementStorage
        },
        tileIndex,
        upstream: FeatureSourceForLayer,
        metataggingUpdated: UIEventSource<any>
    ) {
        this.name = "FilteringFeatureSource(" + upstream.name + ")"
        this.tileIndex = tileIndex
        this.bbox = BBox.fromTileIndex(tileIndex)
        this.upstream = upstream
        this.state = state

        this.layer = upstream.layer;
        const layer = upstream.layer;
        const self = this;
        upstream.features.addCallback(() => {
            self.update();
        });


        layer.appliedFilters.addCallback(_ => {
            self.update()
        })

        this._is_dirty.stabilized(250).addCallbackAndRunD(dirty => {
            if (dirty) {
                self.update()
            }
        })
        
        metataggingUpdated.addCallback(_ => {
            self._is_dirty.setData(true)
        })

        this.update();
    }

    private update() {
        const self = this;
        const layer = this.upstream.layer;
        const features: { feature: any; freshness: Date }[] = (this.upstream.features.data ?? []);
        const includedFeatureIds  = new Set<string>(); 
        const newFeatures = (features ?? []).filter((f) => {

            self.registerCallback(f.feature)

            const isShown = layer.layerDef.isShown;
            const tags = f.feature.properties;
            if (isShown.IsKnown(tags)) {
                const result = layer.layerDef.isShown.GetRenderValue(
                    f.feature.properties
                ).txt;
                if (result !== "yes") {
                    return false;
                }
            }

            const tagsFilter = Array.from(layer.appliedFilters?.data?.values() ?? []);
            for (const filter of tagsFilter ?? []) {
                const neededTags : TagsFilter = filter?.currentFilter
                if (neededTags !== undefined && !neededTags.matchesProperties(f.feature.properties)) {
                    // Hidden by the filter on the layer itself - we want to hide it no matter wat
                    return false;
                }
            }

            includedFeatureIds.add(f.feature.properties.id)
            return true;
        });

        const previousSet = this.previousFeatureSet;
        this._is_dirty.setData(false)
        
        // Is there any difference between the two sets?
        if(previousSet !== undefined && previousSet.size === includedFeatureIds.size){
            // The size of the sets is the same - they _might_ be identical
            const newItemFound = Array.from(includedFeatureIds).some(id => !previousSet.has(id))
            if(!newItemFound){
                // We know that: 
                // - The sets have the same size
                // - Every item from the new set has been found in the old set
                // which means they are identical!
                return;
            }
            
        }
        
        // Something new has been found!
        this.features.setData(newFeatures);
     
    }

    private registerCallback(feature: any) {
        const src = this.state?.allElements?.addOrGetElement(feature)
        if(src == undefined){
            return
        }
        if (this._alreadyRegistered.has(src)) {
            return
        }
        this._alreadyRegistered.add(src)

        const self = this;
        // Add a callback as a changed tag migh change the filter
        src.addCallbackAndRunD(_ => {
            self._is_dirty.setData(true)
        })
    }

}
