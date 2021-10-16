import {Utils} from "../../../Utils";
import * as OsmToGeoJson from "osmtogeojson";
import StaticFeatureSource from "../Sources/StaticFeatureSource";
import PerLayerFeatureSourceSplitter from "../PerLayerFeatureSourceSplitter";
import {UIEventSource} from "../../UIEventSource";
import FilteredLayer from "../../../Models/FilteredLayer";
import {FeatureSourceForLayer, Tiled} from "../FeatureSource";
import {Tiles} from "../../../Models/TileRange";
import {BBox} from "../../BBox";
import {OsmConnection} from "../../Osm/OsmConnection";
import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig";
import {Or} from "../../Tags/Or";
import {TagsFilter} from "../../Tags/TagsFilter";

export default class OsmFeatureSource {
    private readonly _backend: string;

    public readonly isRunning: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    private readonly filteredLayers: UIEventSource<FilteredLayer[]>;
    private readonly handleTile: (fs: (FeatureSourceForLayer & Tiled)) => void;
    private isActive: UIEventSource<boolean>;
    private options: {
        handleTile: (tile: FeatureSourceForLayer & Tiled) => void;
        isActive: UIEventSource<boolean>,
        neededTiles: UIEventSource<number[]>,
        state: {
            readonly osmConnection: OsmConnection;
        },
        markTileVisited?: (tileId: number) => void
    };
    public readonly downloadedTiles = new Set<number>()
    private readonly allowedTags: TagsFilter;

    constructor(options: {
        handleTile: (tile: FeatureSourceForLayer & Tiled) => void;
        isActive: UIEventSource<boolean>,
        neededTiles: UIEventSource<number[]>,
        state: {
            readonly filteredLayers: UIEventSource<FilteredLayer[]>;
            readonly osmConnection: OsmConnection;
            readonly layoutToUse: LayoutConfig
        },
        markTileVisited?: (tileId: number) => void
    }) {
        this.options = options;
        this._backend = options.state.osmConnection._oauth_config.url;
        this.filteredLayers = options.state.filteredLayers.map(layers => layers.filter(layer => layer.layerDef.source.geojsonSource === undefined))
        this.handleTile = options.handleTile
        this.isActive = options.isActive
        const self = this
        options.neededTiles.addCallbackAndRunD(neededTiles => {
            if (options.isActive?.data === false) {
                return;
            }
            
            neededTiles = neededTiles.filter(tile => !self.downloadedTiles.has(tile))

            if(neededTiles.length == 0){
                return;
            }
            
            self.isRunning.setData(true)
            try {

                for (const neededTile of neededTiles) {
                    console.log("Tile download", Tiles.tile_from_index(neededTile).join("/"), "started")
                    self.downloadedTiles.add(neededTile)
                    self.LoadTile(...Tiles.tile_from_index(neededTile)).then(_ => {
                        console.log("Tile ", Tiles.tile_from_index(neededTile).join("/"), "loaded")
                    })
                }
            } catch (e) {
                console.error(e)
            }finally {
                console.log("Done")
                self.isRunning.setData(false)
            }
        })


        const neededLayers = options.state.layoutToUse.layers
            .filter(layer => !layer.doNotDownload)
            .filter(layer => layer.source.geojsonSource === undefined || layer.source.isOsmCacheLayer)
        this.allowedTags = new Or(neededLayers.map(l => l.source.osmTags))
    }

    private async LoadTile(z, x, y): Promise<void> {
        if (z > 20) {
            throw "This is an absurd high zoom level"
        }

        const bbox = BBox.fromTile(z, x, y)
        const url = `${this._backend}/api/0.6/map?bbox=${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`
        try {

            console.log("Attempting to get tile", z, x, y, "from the osm api")
            const osmXml = await Utils.download(url, {"accept": "application/xml"})
            try {
                const parsed = new DOMParser().parseFromString(osmXml, "text/xml");
                console.log("Got tile", z, x, y, "from the osm api")
                const geojson = OsmToGeoJson.default(parsed,
                    // @ts-ignore
                    {
                        flatProperties: true
                    });

                // The geojson contains _all_ features at the given location
                // We only keep what is needed

                geojson.features = geojson.features.filter(feature => this.allowedTags.matchesProperties(feature.properties))

                geojson.features.forEach(f => f.properties["_backend"] = this._backend)
                
                console.log("Tile geojson:", z, x, y, "is", geojson)
                const index = Tiles.tile_index(z, x, y);
                new PerLayerFeatureSourceSplitter(this.filteredLayers,
                    this.handleTile,
                    new StaticFeatureSource(geojson.features, false),
                    {
                        tileIndex: index
                    }
                );
                if (this.options.markTileVisited) {
                    this.options.markTileVisited(index)
                }
            } catch (e) {
                console.error("Weird error: ", e)
            }
        } catch (e) {
            console.error("Could not download tile", z, x, y, "due to", e, "; retrying with smaller bounds")
            if (e === "rate limited") {
                return;
            }
            await this.LoadTile(z + 1, x * 2, y * 2)
            await this.LoadTile(z + 1, 1 + x * 2, y * 2)
            await this.LoadTile(z + 1, x * 2, 1 + y * 2)
            await this.LoadTile(z + 1, 1 + x * 2, 1 + y * 2)
            return;
        }


    }

}