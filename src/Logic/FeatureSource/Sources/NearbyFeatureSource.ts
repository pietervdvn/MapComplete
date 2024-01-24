import { FeatureSource } from "../FeatureSource"
import { Store, Stores, UIEventSource } from "../../UIEventSource"
import { Feature } from "geojson"
import { GeoOperations } from "../../GeoOperations"
import FilteringFeatureSource from "./FilteringFeatureSource"
import LayerState from "../../State/LayerState"
import { BBox } from "../../BBox"

export default class NearbyFeatureSource implements FeatureSource {
    public readonly features: Store<Feature[]>
    private readonly _result = new UIEventSource<Feature[]>(undefined)
    private readonly _targetPoint: Store<{ lon: number; lat: number }>
    private readonly _numberOfNeededFeatures: number
    private readonly _layerState?: LayerState
    private readonly _currentZoom: Store<number>
    private readonly _allSources: Store<{ feat: Feature; d: number }[]>[] = []
    private readonly _bounds: Store<BBox> | undefined
    constructor(
        targetPoint: Store<{ lon: number; lat: number }>,
        sources: ReadonlyMap<string, FilteringFeatureSource>,
        options?: {
            bounds?: Store<BBox>
            numberOfNeededFeatures?: number
            layerState?: LayerState
            currentZoom?: Store<number>
        }
    ) {
        this._layerState = options?.layerState
        this._targetPoint = targetPoint.stabilized(100)
        this._numberOfNeededFeatures = options?.numberOfNeededFeatures
        this._currentZoom = options?.currentZoom.stabilized(500)
        this._bounds = options?.bounds

        this.features = Stores.ListStabilized(this._result)

        sources.forEach((source, layer) => {
            this.registerSource(source, layer)
        })
    }

    public registerSource(source: FeatureSource, layerId: string) {
        const flayer = this._layerState?.filteredLayers.get(layerId)
        if (!flayer) {
            return
        }
        const calcSource = this.createSource(
            source.features,
            flayer.layerDef.minzoom,
            flayer.isDisplayed
        )
        calcSource.addCallbackAndRunD(() => {
            this.update()
        })
        this._allSources.push(calcSource)
    }

    private update() {
        let features: { feat: Feature; d: number }[] = []
        for (const src of this._allSources) {
            if (src.data === undefined) {
                this._result.setData(undefined)
                return // We cannot yet calculate all the features
            }
            features.push(...src.data)
        }
        features.sort((a, b) => a.d - b.d)
        if (this._numberOfNeededFeatures !== undefined) {
            features = features.slice(0, this._numberOfNeededFeatures)
        }
        this._result.setData(features.map((f) => f.feat))
    }

    /**
     * Sorts the given source by distance, slices down to the required number
     */
    private createSource(
        source: Store<Feature[]>,
        minZoom: number,
        isActive?: Store<boolean>
    ): Store<{ feat: Feature; d: number }[]> {
        const empty = []
        return source.stabilized(100).map(
            (feats) => {
                if (isActive && !isActive.data) {
                    return empty
                }

                if (this._currentZoom.data < minZoom) {
                    return empty
                }
                if (this._bounds) {
                    const bbox = this._bounds.data
                    if (!bbox) {
                        // We have a 'bounds' store, but the bounds store itself is still empty
                        // As such, we cannot yet calculate which features are within the store
                        return undefined
                    }
                    feats = feats.filter((f) => bbox.overlapsWithFeature(f))
                }
                const point = this._targetPoint.data
                const lonLat = <[number, number]>[point.lon, point.lat]
                const withDistance = feats.map((feat) => ({
                    d: GeoOperations.distanceBetween(
                        lonLat,
                        GeoOperations.centerpointCoordinates(feat)
                    ),
                    feat,
                }))
                withDistance.sort((a, b) => a.d - b.d)
                if (this._numberOfNeededFeatures !== undefined) {
                    return withDistance.slice(0, this._numberOfNeededFeatures)
                }
                return withDistance
            },
            [this._targetPoint, isActive, this._currentZoom, this._bounds]
        )
    }
}
