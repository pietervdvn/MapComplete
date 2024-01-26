import { Store } from "../../UIEventSource"
import DynamicTileSource, { PolygonSourceMerger } from "./DynamicTileSource"
import { Utils } from "../../../Utils"
import { BBox } from "../../BBox"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import MvtSource from "../Sources/MvtSource"
import { Tiles } from "../../../Models/TileRange"
import Constants from "../../../Models/Constants"
import FeatureSourceMerger from "../Sources/FeatureSourceMerger"


class PolygonMvtSource extends PolygonSourceMerger{
    constructor( layer: LayerConfig,
                 mapProperties: {
                     zoom: Store<number>
                     bounds: Store<BBox>
                 },
                 options?: {
                     isActive?: Store<boolean>
                 }) {
        const roundedZoom = mapProperties.zoom.mapD(z => Math.min(Math.floor(z/2)*2, 14))
        super(
            roundedZoom,
            layer.minzoom,
            (zxy) => {
                const [z, x, y] = Tiles.tile_from_index(zxy)
                const url = Utils.SubstituteKeys(Constants.VectorTileServer,
                    {
                        z, x, y, layer: layer.id,
                        type: "polygons",
                    })
                return new MvtSource(url, x, y, z)
            },
            mapProperties,
            {
                isActive: options?.isActive,
            })
    }
}


class PointMvtSource extends DynamicTileSource {

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
        const roundedZoom = mapProperties.zoom.mapD(z => Math.min(Math.floor(z/2)*2, 14))
        super(
            roundedZoom,
            layer.minzoom,
            (zxy) => {
                const [z, x, y] = Tiles.tile_from_index(zxy)
                const url = Utils.SubstituteKeys(Constants.VectorTileServer,
                    {
                        z, x, y, layer: layer.id,
                        type: "pois",
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

export default class DynamicMvtileSource extends FeatureSourceMerger {

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
        const roundedZoom = mapProperties.zoom.mapD(z => Math.floor(z))
        super(
            new PointMvtSource(layer, mapProperties, options),
            new PolygonMvtSource(layer, mapProperties, options)

        )
    }
}
