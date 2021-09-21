import TileHierarchy from "./TileHierarchy";
import {UIEventSource} from "../../UIEventSource";
import FeatureSource, {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {Utils} from "../../../Utils";
import {BBox} from "../../GeoOperations";
import FeatureSourceMerger from "../Sources/FeatureSourceMerger";

export class TileHierarchyMerger implements TileHierarchy<FeatureSourceForLayer & Tiled> {
    public readonly loadedTiles: Map<number, FeatureSourceForLayer & Tiled> = new Map<number, FeatureSourceForLayer & Tiled>();
    private readonly sources: Map<number, UIEventSource<FeatureSource[]>> = new Map<number, UIEventSource<FeatureSource[]>>();

    public readonly layer: FilteredLayer;
    private _handleTile: (src: FeatureSourceForLayer, index: number) => void;

    constructor(layer: FilteredLayer, handleTile: (src: FeatureSourceForLayer, index: number) => void) {
        this.layer = layer;
        this._handleTile = handleTile;
    }

    /**
     * Add another feature source for the given tile.
     * Entries for this tile will be merged
     * @param src
     * @param index
     */
    public registerTile(src: FeatureSource  & Tiled) {

        const index = src.tileIndex
        if (this.sources.has(index)) {
            const sources = this.sources.get(index)
            sources.data.push(src)
            sources.ping()
            return;
        }

        // We have to setup
        const sources = new UIEventSource<FeatureSource[]>([src])
        this.sources.set(index, sources)
        const merger = new FeatureSourceMerger(this.layer, index, BBox.fromTile(...Utils.tile_from_index(index)), sources)
        this.loadedTiles.set(index, merger)
        this._handleTile(merger, index)
    }


}