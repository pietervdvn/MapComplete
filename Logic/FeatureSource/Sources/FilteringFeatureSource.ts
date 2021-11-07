import {UIEventSource} from "../../UIEventSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import Hash from "../../Web/Hash";
import {BBox} from "../../BBox";
import {ElementStorage} from "../../ElementStorage";
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";

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

    constructor(
        state: {
            locationControl: UIEventSource<{ zoom: number }>,
            selectedElement: UIEventSource<any>,
            allElements: ElementStorage
        },
        tileIndex,
        upstream: FeatureSourceForLayer
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

        this.update();
    }

    public update() {
        const self = this;
        const layer = this.upstream.layer;
        const features: { feature: any; freshness: Date }[] = this.upstream.features.data;
        const newFeatures = features.filter((f) => {

            self.registerCallback(f.feature, layer.layerDef)

            if (
                this.state.selectedElement.data?.id === f.feature.id ||
                f.feature.id === Hash.hash.data) {
                // This is the selected object - it gets a free pass even if zoom is not sufficient or it is filtered away
                return true;
            }

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

            const tagsFilter = layer.appliedFilters.data;
            for (const filter of tagsFilter ?? []) {
                const neededTags = filter.filter.options[filter.selected].osmTags
                if (!neededTags.matchesProperties(f.feature.properties)) {
                    // Hidden by the filter on the layer itself - we want to hide it no matter wat
                    return false;
                }
            }


            return true;
        });

        this.features.setData(newFeatures);
        this._is_dirty.setData(false)
    }

    private registerCallback(feature: any, layer: LayerConfig) {
        const src = this.state.allElements.addOrGetElement(feature)
        if (this._alreadyRegistered.has(src)) {
            return
        }
        this._alreadyRegistered.add(src)
        if (layer.isShown !== undefined) {

            const self = this;
            src.map(tags => layer.isShown?.GetRenderValue(tags, "yes").txt).addCallbackAndRunD(isShown => {
                self._is_dirty.setData(true)
            })
        }
    }

}
