import { FeatureSource } from "../FeatureSource"
import { Feature } from "geojson"
import TileLocalStorage from "./TileLocalStorage"
import { GeoOperations } from "../../GeoOperations"
import FeaturePropertiesStore from "./FeaturePropertiesStore"
import { UIEventSource } from "../../UIEventSource"
import { Utils } from "../../../Utils"
import { Tiles } from "../../../Models/TileRange"
import { BBox } from "../../BBox"

class SingleTileSaver {
    private readonly _storage: UIEventSource<Feature[]>
    private readonly _registeredIds = new Set<string>()
    private readonly _featureProperties: FeaturePropertiesStore
    private readonly _isDirty = new UIEventSource(false)
    constructor(
        storage: UIEventSource<Feature[]> & { flush: () => void },
        featureProperties: FeaturePropertiesStore
    ) {
        this._storage = storage
        this._featureProperties = featureProperties
        this._isDirty.stabilized(1000).addCallbackD((isDirty) => {
            if (!isDirty) {
                return
            }
            // 'isDirty' is set when tags of some object have changed
            storage.flush()
            this._isDirty.setData(false)
        })
    }

    public saveFeatures(features: Feature[]) {
        if (Utils.sameList(features, this._storage.data)) {
            return
        }
        for (const feature of features) {
            const id = feature.properties.id
            if (this._registeredIds.has(id)) {
                continue
            }
            if(id.match(/(node|way|relation)\/-.*/)){
                // We don't cache newly created points
                continue
            }
            this._featureProperties.getStore(id)?.addCallbackAndRunD(() => {
                this._isDirty.setData(true)
            })
            this._registeredIds.add(id)
        }

        this._storage.setData(features)
    }
}

/***
 * Saves all the features that are passed in to localstorage, so they can be retrieved on the next run
 *
 * The data is saved in a tiled way on a fixed zoomlevel and is retrievable per layer.
 *
 * Also see the sibling class
 */
export default class SaveFeatureSourceToLocalStorage {
    public readonly storage: TileLocalStorage<Feature[]>
    private readonly zoomlevel: number
    constructor(
        backend: string,
        layername: string,
        zoomlevel: number,
        features: FeatureSource,
        featureProperties: FeaturePropertiesStore,
        maxCacheAge: number
    ) {
        this.zoomlevel = zoomlevel
        const storage = TileLocalStorage.construct<Feature[]>(backend, layername, maxCacheAge)
        this.storage = storage
        const singleTileSavers: Map<number, SingleTileSaver> = new Map<number, SingleTileSaver>()
        features.features.addCallbackAndRunD((features) => {
            const sliced = GeoOperations.slice(zoomlevel, features)

            sliced.forEach((features, tileIndex) => {
                let tileSaver = singleTileSavers.get(tileIndex)
                if (tileSaver === undefined) {
                    const src = storage.getTileSource(tileIndex)
                    tileSaver = new SingleTileSaver(src, featureProperties)
                    singleTileSavers.set(tileIndex, tileSaver)
                }
                // Don't cache not-uploaded features yet - they'll be cached when the receive their id
                features = features.filter((f) => !f.properties.id.match(/(node|way)\/-[0-9]+/))
                tileSaver.saveFeatures(features)
            })
        })
    }

    public invalidateCacheAround(bbox: BBox) {
        const range = Tiles.tileRangeFrom(bbox, this.zoomlevel)
        Tiles.MapRange(range, (x, y) => {
            const index = Tiles.tile_index(this.zoomlevel, x, y)
            this.storage.invalidate(index)
        })
    }
}
