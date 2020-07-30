import {Or, TagsFilter} from "./TagsFilter";
import {UIEventSource} from "../UI/UIEventSource";
import {FilteredLayer} from "./FilteredLayer";
import {Bounds} from "./Bounds";
import {Overpass} from "./Osm/Overpass";
import {Basemap} from "./Leaflet/Basemap";
import {State} from "../State";

export class LayerUpdater {
    private _layers: FilteredLayer[];
    private widenFactor: number;

    public readonly runningQuery: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    public readonly retries: UIEventSource<number> = new UIEventSource<number>(0);
     /**
     * The previous bounds for which the query has been run
     */
    private previousBounds: Bounds;

    private _overpass: Overpass;
    private _minzoom: number;

    /**
     * The most important layer should go first, as that one gets first pick for the questions
     * @param map
     * @param minzoom
     * @param layers
     */
    constructor(minzoom: number,
                widenFactor: number,
                layers: FilteredLayer[]) {
        this.widenFactor = widenFactor;
        this._layers = layers;
        this._minzoom = minzoom;
        var filters: TagsFilter[] = [];
        for (const layer of layers) {
            filters.push(layer.filters);
        }
        this._overpass = new Overpass(new Or(filters));

        const self = this;
        State.state.locationControl.addCallback(function () {
            self.update();
        });
        self.update();

    }

    private handleData(geojson: any) {
        const self = this;
        function renderLayers(layers: FilteredLayer[]) {
            if (layers.length === 0) {
                self.runningQuery.setData(false);

                if (geojson.features.length > 0) {
                    console.log("Got some leftovers: ", geojson)
                }
                return;
            }
            window.setTimeout(() => {

                const layer = layers[0];
                const rest = layers.slice(1, layers.length);
                geojson = layer.SetApplicableData(geojson);
                renderLayers(rest);
            }, 50)
        }
        renderLayers(this._layers);
    }

    private handleFail(reason: any) {
        console.log(`QUERY FAILED (retrying in ${5 * this.retries.data} sec)`, reason);
        this.previousBounds = undefined;
        this.retries.data ++;
        this.retries.ping();
        const self = this;
        window?.setTimeout(
            function(){self.update()}, this.retries.data * 5000
        )
        
    }


    private update(): void {
        if (this.IsInBounds()) {
            return;
        }
        console.log("Zoom level: ",State.state.bm.map.getZoom(), "Least needed zoom:", this._minzoom)
        if (State.state.bm.map.getZoom() < this._minzoom || State.state.bm.Location.data.zoom < this._minzoom) {
            return;
        }

        if (this.runningQuery.data) {
            console.log("Still running a query, skip");
        }
        
        const bounds = State.state.bm.map.getBounds();

        const diff = this.widenFactor;

        const n = bounds.getNorth() + diff;
        const e = bounds.getEast() +  diff;
        const s = bounds.getSouth() - diff;
        const w = bounds.getWest() -  diff;

        this.previousBounds = {north: n, east: e, south: s, west: w};
        
        this.runningQuery.setData(true);
        const self = this;
        this._overpass.queryGeoJson(this.previousBounds,
            function (data) {
                self.handleData(data)
            },
            function (reason) {
                self.handleFail(reason)
            }
        );

    }

   

    private IsInBounds(): boolean {

        if (this.previousBounds === undefined) {
            return false;
        }


        const b = State.state.bm.map.getBounds();
        if (b.getSouth() < this.previousBounds.south) {
            return false;
        }

        if (b.getNorth() > this.previousBounds.north) {
            return false;
        }

        if (b.getEast() > this.previousBounds.east) {
            return false;
        }
        if (b.getWest() < this.previousBounds.west) {
            return false;
        }

        return true;
    }

}