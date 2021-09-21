import FeatureSource, {Tiled} from "../FeatureSource";
import {BBox} from "../../GeoOperations";

export default interface TileHierarchy<T extends FeatureSource & Tiled> {

    /**
     * A mapping from 'tile_index' to the actual tile featrues
     */
    loadedTiles: Map<number, T>

}

export class TileHierarchyTools {

    public static getTiles<T extends FeatureSource & Tiled>(hierarchy: TileHierarchy<T>, bbox: BBox): T[] {
        const result = []
        hierarchy.loadedTiles.forEach((tile) => {
            if (tile.bbox.overlapsWith(bbox)) {
                result.push(tile)
            }
        })
        return result;
    }

}