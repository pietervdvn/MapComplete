import {Basemap} from "./Basemap";
import {Overpass} from "./Overpass";
import {Or, TagsFilter} from "./TagsFilter";
import {UIEventSource} from "../UI/UIEventSource";
import {FilteredLayer} from "./FilteredLayer";


export class LayerUpdater {
    private _map: Basemap;
    private _layers: FilteredLayer[];

    public readonly runningQuery: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    /**
     * The previous bounds for which the query has been run
     */
    private previousBounds: { north: number, east: number, south: number, west: number };

    private _overpass: Overpass;
    private _minzoom: number;

    /**
     * The most important layer should go first, as that one gets first pick for the questions
     * @param map
     * @param minzoom
     * @param layers
     */
    constructor(map: Basemap,
                minzoom: number,
                layers: FilteredLayer[]) {
        this._map = map;
        this._layers = layers;
        this._minzoom = minzoom;
        var filters: TagsFilter[] = [];
        for (const layer of layers) {
            filters.push(layer.filters);
        }
        this._overpass = new Overpass(new Or(filters));

        const self = this;
        map.Location.addCallback(function () {
            self.update();
        });

    }

    private handleData(geojson: any) {
        this.runningQuery.setData(false);

        for (const layer of this._layers) {
            geojson = layer.SetApplicableData(geojson);
        }

        if (geojson.features.length > 0) {
            console.log("Got some leftovers: ", geojson)
        }
    }

    private handleFail(reason: any) {
        this.runningQuery.setData(false);
        console.log("QUERY FAILED", reason);
        // TODO
    }


    private update(): void {
        if (this.IsInBounds()) {
            return;
        }
        if (this._map.map.getZoom() < this._minzoom) {
            console.log("Not running query: zoom not sufficient");
            return;
        }

        if (this.runningQuery.data) {
            console.log("Still running a query, skip");
        }
        var bbox = this.buildBboxFor();
        this.runningQuery.setData(true);
        const self = this;
        this._overpass.queryGeoJson(bbox,
            function (data) {
                self.handleData(data)
            },
            function (reason) {
                self.handleFail(reason)
            }
        );

    }

    buildBboxFor(): string {
        const b = this._map.map.getBounds();
        const latDiff = Math.abs(b.getNorth() - b.getSouth());
        const lonDiff = Math.abs(b.getEast() - b.getWest());
        const extra = 0.5;
        const n = b.getNorth() + latDiff * extra;
        const e = b.getEast() + lonDiff * extra;
        const s = b.getSouth() - latDiff * extra;
        const w = b.getWest() - lonDiff * extra;

        this.previousBounds = {north: n, east: e, south: s, west: w};

        const bbox = "[bbox:" + s + "," + w + "," + n + "," + e + "]";
        return bbox;
    }

    private IsInBounds(): boolean {

        if (this.previousBounds === undefined) {
            return false;
        }


        const b = this._map.map.getBounds();
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