import { FeatureSource } from "../FeatureSource"
import { Store, Stores, UIEventSource } from "../../UIEventSource"
import { Feature } from "geojson"
import { GeoOperations } from "../../GeoOperations"
import FilteringFeatureSource from "./FilteringFeatureSource"
import LayerState from "../../State/LayerState"

export default class NearbyFeatureSource implements FeatureSource {
    public readonly features: Store<Feature[]>
    private readonly _targetPoint: Store<{ lon: number; lat: number }>
    private readonly _numberOfNeededFeatures: number
    private readonly _currentZoom: Store<number>

    constructor(
        targetPoint: Store<{ lon: number; lat: number }>,
        sources: ReadonlyMap<string, FilteringFeatureSource>,
        numberOfNeededFeatures?: number,
        layerState?: LayerState,
        currentZoom?: Store<number>
    ) {
        this._targetPoint = targetPoint.stabilized(100)
        this._numberOfNeededFeatures = numberOfNeededFeatures
        this._currentZoom = currentZoom.stabilized(500)

        const allSources: Store<{ feat: Feature; d: number }[]>[] = []
        let minzoom = 999

        const result = new UIEventSource<Feature[]>(undefined)
        this.features = Stores.ListStabilized(result)

        function update() {
            let features: { feat: Feature; d: number }[] = []
            for (const src of allSources) {
                features.push(...src.data)
            }
            features.sort((a, b) => a.d - b.d)
            if (numberOfNeededFeatures !== undefined) {
                features = features.slice(0, numberOfNeededFeatures)
            }
            result.setData(features.map((f) => f.feat))
        }

        sources.forEach((source, layer) => {
            const flayer = layerState?.filteredLayers.get(layer)
            minzoom = Math.min(minzoom, flayer.layerDef.minzoom)
            const calcSource = this.createSource(
                source.features,
                flayer.layerDef.minzoom,
                flayer.isDisplayed
            )
            calcSource.addCallbackAndRunD((features) => {
                update()
            })
            allSources.push(calcSource)
        })
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
            [this._targetPoint, isActive, this._currentZoom]
        )
    }
}
