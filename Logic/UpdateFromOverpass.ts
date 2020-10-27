import {Or, TagsFilter} from "./Tags";
import {UIEventSource} from "./UIEventSource";
import {FilteredLayer} from "./FilteredLayer";
import {Bounds} from "./Bounds";
import {Overpass} from "./Osm/Overpass";
import State from "../State";
import MetaTagging from "./MetaTagging";

export class UpdateFromOverpass {

    public readonly sufficentlyZoomed: UIEventSource<boolean>;
    public readonly runningQuery: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    public readonly retries: UIEventSource<number> = new UIEventSource<number>(0);
    /**
     * The previous bounds for which the query has been run at the given zoom level
     *
     * Note that some layers only activate on a certain zoom level.
     * If the map location changes, we check for each layer if it is loaded:
     * we start checking the bounds at the first zoom level the layer might operate. If in bounds - no reload needed, otherwise we continue walking down
     */
    private readonly previousBounds: Map<number, Bounds[]> = new Map<number, Bounds[]>();

    private readonly state: State;
    
    /**
     * The most important layer should go first, as that one gets first pick for the questions
     */
    constructor(state: State) {
        this.state = state;
        const self = this;

        this.sufficentlyZoomed = State.state.locationControl.map(location => {
                if(location?.zoom === undefined){
                    return false;
                }
                let minzoom = Math.min(...state.layoutToUse.data.layers.map(layer => layer.minzoom ?? 18));
                return location.zoom >= minzoom;
            }, [state.layoutToUse]
        );
        for (let i = 0; i < 25; i++) {
            // This update removes all data on all layers -> erase the map on lower levels too
            this.previousBounds.set(i, []);
        }
        state.locationControl.addCallback(() => {
            self.update(state)
        });
        state.layoutToUse.addCallback(() => {
            self.update(state)
        });

        self.update(state);
        
    }q

    private GetFilter(state: State) {
        const filters: TagsFilter[] = [];
        state = state ?? State.state;
        for (const layer of state.layoutToUse.data.layers) {
            if(typeof(layer) === "string"){
                continue;
            }
            if (state.locationControl.data.zoom < layer.minzoom) {
                continue;
            }
            // Check if data for this layer has already been loaded
            let previouslyLoaded = false;
            for (let z = layer.minzoom; z < 25 && !previouslyLoaded; z++) {
                const previousLoadedBounds = this.previousBounds.get(z);
                if (previousLoadedBounds === undefined) {
                    continue;
                }
                for (const previousLoadedBound of previousLoadedBounds) {
                    previouslyLoaded = previouslyLoaded || this.IsInBounds(state, previousLoadedBound);
                    if(previouslyLoaded){
                        break;
                    }
                }
            }
            if (previouslyLoaded) {
                continue;
            }
            filters.push(layer.overpassTags);
        }
        if (filters.length === 0) {
            return undefined;
        }
        return new Or(filters);
    }

    private handleData(geojson: any) {
        const self = this;

        self.retries.setData(0);
        
        let newIds = 1;
        for (const feature of geojson.features) {
            if(feature.properties.id === undefined){
                feature.properties.id = "ext/"+newIds;
                newIds++;
            }
        }
        
        MetaTagging.addMetatags(geojson.features);
        
        function renderLayers(layers: FilteredLayer[]) {
            if (layers.length === 0) {
                self.runningQuery.setData(false);

                if (geojson.features.length > 0) {
                    console.warn("Got some leftovers: ", geojson)
                }
                return;
            }
            // We use window.setTimeout to give JS some time to update everything and make the interface not too laggy
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
        const filter = this.GetFilter(state);
        if (filter === undefined) {
            return;
        }

        if (this.runningQuery.data) {
            console.log("Still running a query, skip");
            return;
        }

        const bounds = state.bm.map.getBounds();

        const diff = state.layoutToUse.data.widenFactor;

        const n = Math.min(90, bounds.getNorth() + diff);
        const e = Math.min(180, bounds.getEast() + diff);
        const s = Math.max(-90, bounds.getSouth() - diff);
        const w = Math.max(-180, bounds.getWest() - diff);
        const queryBounds = {north: n, east: e, south: s, west: w};

        const z = Math.floor(state.locationControl.data.zoom);

        this.runningQuery.setData(true);
        const self = this;
        const overpass = new Overpass(filter);
        overpass.queryGeoJson(queryBounds,
            function (data) {
                self.previousBounds.get(z).push(queryBounds);
                self.handleData(data)
            },
            function (reason) {
                self.handleFail(state, reason)
            }
        );
        
        
        

    }


    private IsInBounds(state: State, bounds: Bounds): boolean {
        if (this.previousBounds === undefined) {
            return false;
        }

        const b = state.bm.map.getBounds();
        return b.getSouth() >= bounds.south &&
            b.getNorth() <= bounds.north &&
            b.getEast() <= bounds.east &&
            b.getWest() >= bounds.west;
    }
    
    public ForceRefresh() {
        for (let i = 0; i < 25; i++) {
            this.previousBounds.set(i, []);
        }
        this.update(this.state);
    }

}