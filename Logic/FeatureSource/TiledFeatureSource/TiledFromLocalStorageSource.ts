import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import TileHierarchy from "./TileHierarchy";
import SaveTileToLocalStorageActor from "../Actors/SaveTileToLocalStorageActor";
import {Tiles} from "../../../Models/TileRange";
import {BBox} from "../../BBox";
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";

export default class TiledFromLocalStorageSource implements TileHierarchy<FeatureSourceForLayer & Tiled> {
    public readonly loadedTiles: Map<number, FeatureSourceForLayer & Tiled> = new Map<number, FeatureSourceForLayer & Tiled>();
    private readonly layer: FilteredLayer;
    private readonly handleFeatureSource: (src: FeatureSourceForLayer & Tiled, index: number) => void;
    private readonly undefinedTiles: Set<number>;

    public static GetFreshnesses(layerId: string): Map<number, Date> {
        const prefix = SaveTileToLocalStorageActor.storageKey + "-" + layerId + "-"
        const freshnesses = new Map<number, Date>()
        for (const key of Object.keys(localStorage)) {
            if (!(key.startsWith(prefix) && key.endsWith("-time"))) {
                continue
            }
            const index = Number(key.substring(prefix.length, key.length - "-time".length))
            const time = Number(localStorage.getItem(key))
            const freshness = new Date()
            freshness.setTime(time)
            freshnesses.set(index, freshness)
        }
        return freshnesses
    }


    static cleanCacheForLayer(layer: LayerConfig) {
        const now = new Date()
        const prefix = SaveTileToLocalStorageActor.storageKey + "-" + layer.id + "-"
        console.log("Cleaning tiles of ", prefix, "with max age",layer.maxAgeOfCache)
        for (const key of Object.keys(localStorage)) {
            if (!(key.startsWith(prefix) && key.endsWith("-time"))) {
                continue
            }
            const index = Number(key.substring(prefix.length, key.length - "-time".length))
            const time = Number(localStorage.getItem(key))
            const timeDiff = (now.getTime() - time) / 1000
            
            if(timeDiff >= layer.maxAgeOfCache){
                const k = prefix+index;
                localStorage.removeItem(k)
                localStorage.removeItem(k+"-format")
                localStorage.removeItem(k+"-time")
            }
        }
    }

    constructor(layer: FilteredLayer,
                handleFeatureSource: (src: FeatureSourceForLayer & Tiled, index: number) => void,
                state: {
                    currentBounds: UIEventSource<BBox>
                }) {
        this.layer = layer;
        this.handleFeatureSource = handleFeatureSource;


        this.undefinedTiles = new Set<number>()
        const prefix = SaveTileToLocalStorageActor.storageKey + "-" + layer.layerDef.id + "-"
        const knownTiles: number[] = Object.keys(localStorage)
            .filter(key => {
                return key.startsWith(prefix) && !key.endsWith("-time") && !key.endsWith("-format");
            })
            .map(key => {
                return Number(key.substring(prefix.length));
            })
            .filter(i => !isNaN(i))

        console.debug("Layer", layer.layerDef.id, "has following tiles in available in localstorage", knownTiles.map(i => Tiles.tile_from_index(i).join("/")).join(", "))
        for (const index of knownTiles) {

            const prefix = SaveTileToLocalStorageActor.storageKey + "-" + layer.layerDef.id + "-" + index;
            const version = localStorage.getItem(prefix + "-format")
            if (version === undefined || version !== SaveTileToLocalStorageActor.formatVersion) {
                // Invalid version! Remove this tile from local storage
                localStorage.removeItem(prefix)
                localStorage.removeItem(prefix + "-time")
                localStorage.removeItem(prefix + "-format")
                this.undefinedTiles.add(index)
                console.log("Dropped old format tile", prefix)
            }
        }

        const self = this
        state.currentBounds.map(bounds => {

            if (bounds === undefined) {
                return;
            }
            for (const knownTile of knownTiles) {

                if (this.loadedTiles.has(knownTile)) {
                    continue;
                }
                if (this.undefinedTiles.has(knownTile)) {
                    continue;
                }

                if (!bounds.overlapsWith(BBox.fromTileIndex(knownTile))) {
                    continue;
                }
                self.loadTile(knownTile)
            }
        })

    }

    private loadTile(neededIndex: number) {
        try {
            const key = SaveTileToLocalStorageActor.storageKey + "-" + this.layer.layerDef.id + "-" + neededIndex
            const data = localStorage.getItem(key)
            const features = JSON.parse(data)
            const src = {
                layer: this.layer,
                features: new UIEventSource<{ feature: any; freshness: Date }[]>(features),
                name: "FromLocalStorage(" + key + ")",
                tileIndex: neededIndex,
                bbox: BBox.fromTileIndex(neededIndex)
            }
            this.handleFeatureSource(src, neededIndex)
            this.loadedTiles.set(neededIndex, src)
        } catch (e) {
            console.error("Could not load data tile from local storage due to", e)
            this.undefinedTiles.add(neededIndex)
        }
    }


}