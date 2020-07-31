import {Or, TagsFilter} from "./TagsFilter";
import {UIEventSource} from "../UI/UIEventSource";
import {FilteredLayer} from "./FilteredLayer";
import {Bounds} from "./Bounds";
import {Overpass} from "./Osm/Overpass";
import {Basemap} from "./Leaflet/Basemap";
import {State} from "../State";

export class LayerUpdater {

    public readonly sufficentlyZoomed: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    public readonly runningQuery: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    public readonly retries: UIEventSource<number> = new UIEventSource<number>(0);
     /**
     * The previous bounds for which the query has been run
     */
    private previousBounds: Bounds;


    /**
     * The most important layer should go first, as that one gets first pick for the questions
     * @param map
     * @param minzoom
     * @param layers
     */
    constructor(state: State) {

        const self = this;
        state.locationControl.addCallback(() => {
            self.update(state)
        });
        state.layoutToUse.addCallback(() => {
            self.update(state)
        });
       
        self.update(state);
    }

    private GetFilter(state: State) {
        var filters: TagsFilter[] = [];
        state = state ?? State.state;
        for (const layer of state.layoutToUse.data.layers) {
            if (state.locationControl.data.zoom < layer.minzoom) {
                return undefined;
            }
            filters.push(layer.overpassFilter);
        }
        if (filters.length === 0) {
            return undefined;
        }
        return new Or(filters);
    }

    private handleData(geojson: any) {
        const self = this;

        self.retries.setData(0);
        
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

        renderLayers(State.state.filteredLayers.data);
    }

    private handleFail(state: State, reason: any) {
        this.retries.data++;
        this.ForceRefresh();
        console.log(`QUERY FAILED (retrying in ${5 * this.retries.data} sec)`, reason);
        this.retries.ping();
        const self = this;
        window?.setTimeout(
            function () {
                self.update(state)
            }, this.retries.data * 5000
        )

    }


    private update(state: State): void {
        if (this.IsInBounds(state)) {
            return;
        }


        const filter = this.GetFilter(state);


        this.sufficentlyZoomed.setData(filter !== undefined);
        if (filter === undefined) {
            console.log("Zoom insufficient to run query")
            return;
        }

        if (this.runningQuery.data) {
            console.log("Still running a query, skip");
            return;
        }

        const bounds = state.bm.map.getBounds();

        const diff = state.layoutToUse.data.widenFactor;

        const n = bounds.getNorth() + diff;
        const e = bounds.getEast() + diff;
        const s = bounds.getSouth() - diff;
        const w = bounds.getWest() - diff;

        this.previousBounds = {north: n, east: e, south: s, west: w};

        this.runningQuery.setData(true);
        const self = this;
        const overpass = new Overpass(filter);
        overpass.queryGeoJson(this.previousBounds,
            function (data) {
                self.handleData(data)
            },
            function (reason) {
                self.handleFail(state, reason)
            }
        );

    }


    private IsInBounds(state: State): boolean {

        if (this.previousBounds === undefined) {
            return false;
        }


        const b = state.bm.map.getBounds();
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
    
    public ForceRefresh(){
        this.previousBounds = undefined;
    }

}