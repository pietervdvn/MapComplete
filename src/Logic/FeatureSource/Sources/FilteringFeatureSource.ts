import { Store, UIEventSource } from "../../UIEventSource"
import FilteredLayer from "../../../Models/FilteredLayer"
import { FeatureSource } from "../FeatureSource"
import { Feature } from "geojson"
import { GlobalFilter } from "../../../Models/GlobalFilter"

export default class FilteringFeatureSource implements FeatureSource {
    public features: UIEventSource<Feature[]> = new UIEventSource([])
    private readonly upstream: FeatureSource
    private readonly _fetchStore?: (id: string) => Store<Record<string, string>>
    private readonly _globalFilters?: Store<GlobalFilter[]>
    private readonly _alreadyRegistered = new Set<Store<any>>()
    private readonly _is_dirty = new UIEventSource(false)
    private readonly _layer: FilteredLayer
    private previousFeatureSet: Set<any> = undefined

    constructor(
        layer: FilteredLayer,
        upstream: FeatureSource,
        fetchStore?: (id: string) => Store<Record<string, string>>,
        globalFilters?: Store<GlobalFilter[]>,
        metataggingUpdated?: Store<any>
    ) {
        this.upstream = upstream
        this._fetchStore = fetchStore
        this._layer = layer
        this._globalFilters = globalFilters

        const self = this
        upstream.features.addCallback(() => {
            self.update()
        })
        layer.isDisplayed.addCallback(() => {
            self.update()
        })

        layer.appliedFilters.forEach((value) =>
            value.addCallback((_) => {
                self.update()
            })
        )

        this._is_dirty.stabilized(1000).addCallbackAndRunD((dirty) => {
            if (dirty) {
                self.update()
            }
        })

        metataggingUpdated?.addCallback((_) => {
            self._is_dirty.setData(true)
        })

        globalFilters?.addCallback((_) => {
            self.update()
        })

        this.update()
    }

    private update() {
        const self = this
        const layer = this._layer
        const features: Feature[] = this.upstream.features.data ?? []
        const includedFeatureIds = new Set<string>()
        const globalFilters = self._globalFilters?.data?.map((f) => f)
        const newFeatures = (features ?? []).filter((f) => {
            self.registerCallback(f.properties.id)

            if (!layer.isShown(f.properties, globalFilters)) {
                return false
            }

            includedFeatureIds.add(f.properties.id)
            return true
        })

        const previousSet = this.previousFeatureSet
        this._is_dirty.setData(false)

        // Is there any difference between the two sets?
        if (previousSet !== undefined && previousSet.size === includedFeatureIds.size) {
            // The size of the sets is the same - they _might_ be identical
            const newItemFound = Array.from(includedFeatureIds).some((id) => !previousSet.has(id))
            if (!newItemFound) {
                // We know that:
                // - The sets have the same size
                // - Every item from the new set has been found in the old set
                // which means they are identical!
                return
            }
        }

        // Something new has been found (or something was deleted)!
        this.features.setData(newFeatures)
    }

    private registerCallback(featureId: string) {
        if (this._fetchStore === undefined) {
            return
        }
        const src = this._fetchStore(featureId)
        if (src == undefined) {
            return
        }
        if (this._alreadyRegistered.has(src)) {
            return
        }
        this._alreadyRegistered.add(src)

        const self = this
        // Add a callback as a changed tag might change the filter
        src.addCallbackAndRunD((_) => {
            self._is_dirty.setData(true)
        })
    }
}
