import { Store } from "../../UIEventSource"
import DynamicTileSource from "./DynamicTileSource"
import { Utils } from "../../../Utils"
import { BBox } from "../../BBox"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import MvtSource from "../Sources/MvtSource"
import { Tiles } from "../../../Models/TileRange"
import Constants from "../../../Models/Constants"

export default class DynamicMvtileSource extends DynamicTileSource {

    constructor(
        layer: LayerConfig,
        mapProperties: {
            zoom: Store<number>
            bounds: Store<BBox>
        },
        options?: {
            isActive?: Store<boolean>
        },
    ) {
        super(
            mapProperties.zoom,
            layer.minzoom,
            (zxy) => {
                const [z, x, y] = Tiles.tile_from_index(zxy)
                const url = Utils.SubstituteKeys(Constants.VectorTileServer,
                    {
                        z, x, y, layer: layer.id,
                    })
                return new MvtSource(url, x, y, z)
            },
            mapProperties,
            {
                isActive: options?.isActive,
            },
        )
    }
}
