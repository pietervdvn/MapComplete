import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import Loc from "../../../Models/Loc";
import TileHierarchy from "./TileHierarchy";
import SaveTileToLocalStorageActor from "../Actors/SaveTileToLocalStorageActor";
import {Tiles} from "../../../Models/TileRange";
import {BBox} from "../../BBox";

export default class TiledFromLocalStorageSource implements TileHierarchy<FeatureSourceForLayer & Tiled> {
    public loadedTiles: Map<number, FeatureSourceForLayer & Tiled> = new Map<number, FeatureSourceForLayer & Tiled>();

    public static GetFreshnesses(layerId: string): Map<number, Date> {
        const prefix = SaveTileToLocalStorageActor.storageKey + "-" + layerId + "-"
        const freshnesses = new Map<number, Date>()
        for (const key of Object.keys(localStorage)) {
            if(!(key.startsWith(prefix) && key.endsWith("-time"))){
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

    constructor(layer: FilteredLayer,
                handleFeatureSource: (src: FeatureSourceForLayer & Tiled, index: number) => void,
                state: {
                    locationControl: UIEventSource<Loc>
                    leafletMap: any
                }) {

        const undefinedTiles = new Set<number>()
        const prefix = SaveTileToLocalStorageActor.storageKey + "-" + layer.layerDef.id + "-"
        // @ts-ignore
        const indexes: number[] = Object.keys(localStorage)
            .filter(key => {
                return key.startsWith(prefix) && !key.endsWith("-time") && !key.endsWith("-format");
            })
            .map(key => {
                return Number(key.substring(prefix.length));
            })
            .filter(i => !isNaN(i))

        console.debug("Layer", layer.layerDef.id, "has following tiles in available in localstorage", indexes.map(i => Tiles.tile_from_index(i).join("/")).join(", "))
        for (const index of indexes) {

            const prefix = SaveTileToLocalStorageActor.storageKey + "-" + layer.layerDef.id + "-" + index;
            const version = localStorage.getItem(prefix + "-format")
            if (version === undefined || version !== SaveTileToLocalStorageActor.formatVersion) {
                // Invalid version! Remove this tile from local storage
                localStorage.removeItem(prefix)
                localStorage.removeItem(prefix+"-time")
                localStorage.removeItem(prefix+"-format")
                undefinedTiles.add(index)
                console.log("Dropped old format tile", prefix)
            }
        }

        const zLevels = indexes.map(i => i % 100)
        const indexesSet = new Set(indexes)
        const maxZoom = Math.max(...zLevels)
        const minZoom = Math.min(...zLevels)
        const self = this;

        const neededTiles = state.locationControl.map(
            location => {
                if (!layer.isDisplayed.data) {
                    // No need to download! - the layer is disabled
                    return undefined;
                }

                if (location.zoom < layer.layerDef.minzoom) {
                    // No need to download! - the layer is disabled
                    return undefined;
                }

                // Yup, this is cheating to just get the bounds here
                const bounds = state.leafletMap.data?.getBounds()
                if (bounds === undefined) {
                    // We'll retry later
                    return undefined
                }

                const needed = []
                for (let z = minZoom; z <= maxZoom; z++) {

                    const tileRange = Tiles.TileRangeBetween(z, bounds.getNorth(), bounds.getEast(), bounds.getSouth(), bounds.getWest())
                    const neededZ = Tiles.MapRange(tileRange, (x, y) => Tiles.tile_index(z, x, y))
                        .filter(i => !self.loadedTiles.has(i) && !undefinedTiles.has(i) && indexesSet.has(i))
                    needed.push(...neededZ)
                }

                if (needed.length === 0) {
                    return undefined
                }
                return needed
            }
            , [layer.isDisplayed, state.leafletMap]).stabilized(50);

        neededTiles.addCallbackAndRunD(neededIndexes => {
            for (const neededIndex of neededIndexes) {
                // We load the features from localStorage
                try {
                    const key = SaveTileToLocalStorageActor.storageKey + "-" + layer.layerDef.id + "-" + neededIndex
                    const data = localStorage.getItem(key)
                    const features = JSON.parse(data)
                    const src = {
                        layer: layer,
                        features: new UIEventSource<{ feature: any; freshness: Date }[]>(features),
                        name: "FromLocalStorage(" + key + ")",
                        tileIndex: neededIndex,
                        bbox: BBox.fromTileIndex(neededIndex)
                    }
                    handleFeatureSource(src, neededIndex)
                    self.loadedTiles.set(neededIndex, src)
                } catch (e) {
                    console.error("Could not load data tile from local storage due to", e)
                    undefinedTiles.add(neededIndex)
                }
            }


        })

    }


}