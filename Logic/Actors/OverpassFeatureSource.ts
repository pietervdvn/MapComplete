import {UIEventSource} from "../UIEventSource";
import Loc from "../../Models/Loc";
import {Or} from "../Tags/Or";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import {Overpass} from "../Osm/Overpass";
import Bounds from "../../Models/Bounds";
import FeatureSource from "../FeatureSource/FeatureSource";
import {Utils} from "../../Utils";
import {TagsFilter} from "../Tags/TagsFilter";
import SimpleMetaTagger from "../SimpleMetaTagger";


export default class OverpassFeatureSource implements FeatureSource {

    public readonly name = "OverpassFeatureSource"
    
    /**
     * The last loaded features of the geojson
     */
    public readonly features: UIEventSource<{ feature: any, freshness: Date }[]> = new UIEventSource<any[]>(undefined);


    public readonly sufficientlyZoomed: UIEventSource<boolean>;
    public readonly runningQuery: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    public readonly timeout: UIEventSource<number> = new UIEventSource<number>(0);
    private readonly retries: UIEventSource<number> = new UIEventSource<number>(0);
    /**
     * The previous bounds for which the query has been run at the given zoom level
     *
     * Note that some layers only activate on a certain zoom level.
     * If the map location changes, we check for each layer if it is loaded:
     * we start checking the bounds at the first zoom level the layer might operate. If in bounds - no reload needed, otherwise we continue walking down
     */
    private readonly _previousBounds: Map<number, Bounds[]> = new Map<number, Bounds[]>();
    private readonly _location: UIEventSource<Loc>;
    private readonly _layoutToUse: UIEventSource<LayoutConfig>;
    private readonly _leafletMap: UIEventSource<L.Map>;

    /**
     * The most important layer should go first, as that one gets first pick for the questions
     */
    constructor(
        location: UIEventSource<Loc>,
        layoutToUse: UIEventSource<LayoutConfig>,
        leafletMap: UIEventSource<L.Map>) {
        this._location = location;
        this._layoutToUse = layoutToUse;
        this._leafletMap = leafletMap;
        const self = this;

        this.sufficientlyZoomed = location.map(location => {
                if (location?.zoom === undefined) {
                    return false;
                }
                let minzoom = Math.min(...layoutToUse.data.layers.map(layer => layer.minzoom ?? 18));
                console.debug("overpass source: minzoom is ", minzoom)
                return location.zoom >= minzoom;
            }, [layoutToUse]
        );
        for (let i = 0; i < 25; i++) {
            // This update removes all data on all layers -> erase the map on lower levels too
            this._previousBounds.set(i, []);
        }

        layoutToUse.addCallback(() => {
            self.update()
        });
        location.addCallback(() => {
            self.update()
        });
    }

    public ForceRefresh() {
        for (let i = 0; i < 25; i++) {
            this._previousBounds.set(i, []);
        }
        this.update();
    }

    private GetFilter(): Overpass {
        let filters: TagsFilter[] = [];
        let extraScripts: string[] = [];
        for (const layer of this._layoutToUse.data.layers) {
            if (typeof (layer) === "string") {
                throw "A layer was not expanded!"
            }
            if (this._location.data.zoom < layer.minzoom) {
                continue;
            }
            if (layer.doNotDownload) {
                continue;
            }
            if (layer.source.geojsonSource !== undefined) {
                // Not our responsibility to download this layer!
                continue;
            }


            // Check if data for this layer has already been loaded
            let previouslyLoaded = false;
            for (let z = layer.minzoom; z < 25 && !previouslyLoaded; z++) {
                const previousLoadedBounds = this._previousBounds.get(z);
                if (previousLoadedBounds === undefined) {
                    continue;
                }
                for (const previousLoadedBound of previousLoadedBounds) {
                    previouslyLoaded = previouslyLoaded || this.IsInBounds(previousLoadedBound);
                    if (previouslyLoaded) {
                        break;
                    }
                }
            }
            if (previouslyLoaded) {
                continue;
            }
            if (layer.source.overpassScript !== undefined) {
                extraScripts.push(layer.source.overpassScript)
            } else {
                filters.push(layer.source.osmTags);
            }
        }
        filters = Utils.NoNull(filters)
        extraScripts = Utils.NoNull(extraScripts)
        if (filters.length + extraScripts.length === 0) {
            return undefined;
        }
        return new Overpass(new Or(filters), extraScripts);
    }

    private update(): void {
        if (this.runningQuery.data) {
            console.log("Still running a query, not updating");
            return;
        }

        if (this.timeout.data > 0) {
            console.log("Still in timeout - not updating")
            return;
        }

        const bounds = this._leafletMap.data.getBounds();

        const diff = this._layoutToUse.data.widenFactor;

        const n = Math.min(90, bounds.getNorth() + diff);
        const e = Math.min(180, bounds.getEast() + diff);
        const s = Math.max(-90, bounds.getSouth() - diff);
        const w = Math.max(-180, bounds.getWest() - diff);
        const queryBounds = {north: n, east: e, south: s, west: w};

        const z = Math.floor(this._location.data.zoom ?? 0);

        const self = this;
        const overpass = this.GetFilter();
        if (overpass === undefined) {
            return;
        }
        this.runningQuery.setData(true);
        overpass.queryGeoJson(queryBounds,
            function (data, date) {
                self._previousBounds.get(z).push(queryBounds);
                self.retries.setData(0);
                const features = data.features.map(f => ({feature: f, freshness: date}));
                SimpleMetaTagger.objectMetaInfo.addMetaTags(features)

                self.features.setData(features);
                self.runningQuery.setData(false);
            },
            function (reason) {
                self.retries.data++;
                self.ForceRefresh();
                self.timeout.setData(self.retries.data * 5);
                console.log(`QUERY FAILED (retrying in ${5 * self.retries.data} sec) due to ${reason}`);
                self.retries.ping();
                self.runningQuery.setData(false);

                function countDown() {
                    window?.setTimeout(
                        function () {
                            console.log("Countdown: ", self.timeout.data)
                            if (self.timeout.data > 1) {
                                self.timeout.setData(self.timeout.data - 1);
                                window.setTimeout(
                                    countDown,
                                    1000
                                )
                            } else {
                                self.timeout.setData(0);
                                self.update()
                            }
                        }, 1000
                    )
                }

                countDown();

            }
        );


    }

    private IsInBounds(bounds: Bounds): boolean {
        if (this._previousBounds === undefined) {
            return false;
        }

        const b = this._leafletMap.data.getBounds();
        return b.getSouth() >= bounds.south &&
            b.getNorth() <= bounds.north &&
            b.getEast() <= bounds.east &&
            b.getWest() >= bounds.west;
    }


}