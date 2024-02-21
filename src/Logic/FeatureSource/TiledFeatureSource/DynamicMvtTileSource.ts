import { Store } from "../../UIEventSource"
import { UpdatableDynamicTileSource } from "./DynamicTileSource"
import { Utils } from "../../../Utils"
import { BBox } from "../../BBox"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import MvtSource from "../Sources/MvtSource"
import { Tiles } from "../../../Models/TileRange"
import Constants from "../../../Models/Constants"
import { UpdatableFeatureSourceMerger } from "../Sources/FeatureSourceMerger"
import { LineSourceMerger } from "./LineSourceMerger"
import { PolygonSourceMerger } from "./PolygonSourceMerger"

class PolygonMvtSource extends PolygonSourceMerger {
    constructor(
        layer: LayerConfig,
        mapProperties: {
            zoom: Store<number>
            bounds: Store<BBox>
        },
        options?: {
            isActive?: Store<boolean>
        }
    ) {
        const roundedZoom = mapProperties.zoom.mapD((z) => Math.min(Math.floor(z / 2) * 2, 14))
        super(
            roundedZoom,
            layer.minzoom,
            (zxy) => {
                const [z, x, y] = Tiles.tile_from_index(zxy)
                const url = Utils.SubstituteKeys(Constants.VectorTileServer, {
                    z,
                    x,
                    y,
                    layer: layer.id,
                    type: "polygons",
                })
                return new MvtSource(url, x, y, z)
            },
            mapProperties,
            {
                isActive: options?.isActive,
            }
        )
    }
}

class LineMvtSource extends LineSourceMerger {
    constructor(
        layer: LayerConfig,
        mapProperties: {
            zoom: Store<number>
            bounds: Store<BBox>
        },
        options?: {
            isActive?: Store<boolean>
        }
    ) {
        const roundedZoom = mapProperties.zoom.mapD((z) => Math.min(Math.floor(z / 2) * 2, 14))
        super(
            roundedZoom,
            layer.minzoom,
            (zxy) => {
                const [z, x, y] = Tiles.tile_from_index(zxy)
                const url = Utils.SubstituteKeys(Constants.VectorTileServer, {
                    z,
                    x,
                    y,
                    layer: layer.id,
                    type: "lines",
                })
                return new MvtSource(url, x, y, z)
            },
            mapProperties,
            {
                isActive: options?.isActive,
            }
        )
    }
}

class PointMvtSource extends UpdatableDynamicTileSource {
    constructor(
        layer: LayerConfig,
        mapProperties: {
            zoom: Store<number>
            bounds: Store<BBox>
        },
        options?: {
            isActive?: Store<boolean>
        }
    ) {
        const roundedZoom = mapProperties.zoom.mapD((z) => Math.min(Math.floor(z / 2) * 2, 14))
        super(
            roundedZoom,
            layer.minzoom,
            (zxy) => {
                const [z, x, y] = Tiles.tile_from_index(zxy)
                const url = Utils.SubstituteKeys(Constants.VectorTileServer, {
                    z,
                    x,
                    y,
                    layer: layer.id,
                    type: "pois",
                })
                return new MvtSource(url, x, y, z)
            },
            mapProperties,
            {
                isActive: options?.isActive,
            }
        )
    }
}

export default class DynamicMvtileSource extends UpdatableFeatureSourceMerger {
    constructor(
        layer: LayerConfig,
        mapProperties: {
            zoom: Store<number>
            bounds: Store<BBox>
        },
        options?: {
            isActive?: Store<boolean>
        }
    ) {
        super(
            new PointMvtSource(layer, mapProperties, options),
            new LineMvtSource(layer, mapProperties, options),
            new PolygonMvtSource(layer, mapProperties, options)
        )
    }
}
