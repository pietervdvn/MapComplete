import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer} from "../FeatureSource";
import {UIEventSource} from "../../UIEventSource";
import Loc from "../../../Models/Loc";
import GeoJsonSource from "../GeoJsonSource";
import DynamicTileSource from "./DynamicTileSource";

export default class DynamicGeoJsonTileSource extends DynamicTileSource {
    constructor(layer: FilteredLayer,
                registerLayer: (layer: FeatureSourceForLayer) => void,
                state: {
                    locationControl: UIEventSource<Loc>
                    leafletMap: any
                }) {
        const source = layer.layerDef.source
        if (source.geojsonZoomLevel === undefined) {
            throw "Invalid layer: geojsonZoomLevel expected"
        }
        if (source.geojsonSource === undefined) {
            throw "Invalid layer: geojsonSource expected"
        }

        super(
            layer,
            source.geojsonZoomLevel,
            (xy) => {
                const xyz: [number, number, number] = [xy[0], xy[1], source.geojsonZoomLevel]
                const src = new GeoJsonSource(
                    layer,
                    xyz
                )
                registerLayer(src)
                return src
            },
            state
        );

    }

}