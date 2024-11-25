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
    private readonly _zoomlevel: Store<number>
    private readonly _selectedElement: Store<Feature>

    constructor(
        layer: FilteredLayer,
        upstream: FeatureSource,
        fetchStore?: (id: string) => Store<Record<string, string>>,
        globalFilters?: Store<GlobalFilter[]>,
        metataggingUpdated?: Store<any>,
        zoomlevel?: Store<number>,
        selectedElement?: Store<Feature>
    ) {
        this.upstream = upstream
        this._fetchStore = fetchStore
        this._layer = layer
        this._globalFilters = globalFilters
        this._zoomlevel = zoomlevel
        this._selectedElement = selectedElement

        upstream.features.addCallback(() => {
            this.update()
        })
        layer.isDisplayed.addCallback(() => {
            this.update()
        })

        layer.appliedFilters.forEach((value) =>
            value.addCallback((_) => {
                this.update()
            })
        )

        this._is_dirty.stabilized(1000).addCallbackAndRunD((dirty) => {
            if (dirty) {
                this.update()
            }
        })

        metataggingUpdated?.addCallback(() => {
            this._is_dirty.setData(true)
        })

        globalFilters?.addCallback(() => {
            this.update()
        })

        selectedElement?.addCallback(() => this.update())

        zoomlevel?.mapD(z => Math.floor(z)).addCallback(() => this.update())

        this.update()
    }

    private update() {
        const layer = this._layer
        const features: Feature[] = this.upstream.features.data ?? []
        const includedFeatureIds = new Set<string>()
        const globalFilters = this._globalFilters?.data?.map((f) => f)
        const zoomlevel = this._zoomlevel?.data
        const selectedElement = this._selectedElement?.data?.properties?.id
        const newFeatures = (features ?? []).filter((f) => {
            this.registerCallback(f.properties.id)

            if(selectedElement === f.properties.id){
                return true
            }

            if (!layer.isShown(f.properties, globalFilters, zoomlevel)) {
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
