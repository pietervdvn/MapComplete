import {UIEventSource} from "../UIEventSource";
import Loc from "../../Models/Loc";
import {Or} from "../Tags/Or";
import {Overpass} from "../Osm/Overpass";
import FeatureSource from "../FeatureSource/FeatureSource";
import {Utils} from "../../Utils";
import {TagsFilter} from "../Tags/TagsFilter";
import SimpleMetaTagger from "../SimpleMetaTagger";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import RelationsTracker from "../Osm/RelationsTracker";
import {BBox} from "../BBox";


export default class OverpassFeatureSource implements FeatureSource {

    public readonly name = "OverpassFeatureSource"

    /**
     * The last loaded features of the geojson
     */
    public readonly features: UIEventSource<{ feature: any, freshness: Date }[]> = new UIEventSource<any[]>(undefined);


    public readonly runningQuery: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    public readonly timeout: UIEventSource<number> = new UIEventSource<number>(0);

    public readonly relationsTracker: RelationsTracker;


    private readonly retries: UIEventSource<number> = new UIEventSource<number>(0);
    /**
     * The previous bounds for which the query has been run at the given zoom level
     *
     * Note that some layers only activate on a certain zoom level.
     * If the map location changes, we check for each layer if it is loaded:
     * we start checking the bounds at the first zoom level the layer might operate. If in bounds - no reload needed, otherwise we continue walking down
     */
    private readonly _previousBounds: Map<number, BBox[]> = new Map<number, BBox[]>();
    private readonly state: {
        readonly locationControl: UIEventSource<Loc>,
        readonly layoutToUse: LayoutConfig,
        readonly overpassUrl: UIEventSource<string[]>;
        readonly overpassTimeout: UIEventSource<number>;
        readonly currentBounds: UIEventSource<BBox>
    }
    private readonly _isActive: UIEventSource<boolean>;
    private _onUpdated?: (bbox: BBox, dataFreshness: Date) => void;

    /**
     * The most important layer should go first, as that one gets first pick for the questions
     */
    constructor(
        state: {
            readonly locationControl: UIEventSource<Loc>,
            readonly layoutToUse: LayoutConfig,
            readonly overpassUrl: UIEventSource<string[]>;
            readonly overpassTimeout: UIEventSource<number>;
            readonly overpassMaxZoom: UIEventSource<number>,
            readonly currentBounds: UIEventSource<BBox>
        },
        options?: {
            isActive?: UIEventSource<boolean>,
            onUpdated?: (bbox: BBox, freshness: Date) => void,
            relationTracker: RelationsTracker
        }) {

        this.state = state
        this._isActive = options.isActive;
        this._onUpdated = options.onUpdated;
        this.relationsTracker = options.relationTracker
        const location = state.locationControl
        const self = this;

        for (let i = 0; i < 25; i++) {
            // This update removes all data on all layers -> erase the map on lower levels too
            this._previousBounds.set(i, []);
        }

        location.addCallback(() => {
            self.update()
        });

        state.currentBounds.addCallback(_ => {
            self.update()
        })

    }

    private GetFilter(interpreterUrl: string): Overpass {
        let filters: TagsFilter[] = [];
        let extraScripts: string[] = [];
        for (const layer of this.state.layoutToUse.layers) {
            if (typeof (layer) === "string") {
                throw "A layer was not expanded!"
            }
            if (this.state.locationControl.data.zoom < layer.minzoom) {
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
                    previouslyLoaded = previouslyLoaded || this.state.currentBounds.data.isContainedIn(previousLoadedBound);
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
        return new Overpass(new Or(filters), extraScripts, interpreterUrl, this.state.overpassTimeout, this.relationsTracker);
    }

    private update() {
        if (!this._isActive.data) {
            return;
        }
        const self = this
        this.updateAsync().then(bboxAndDate => {
            if (bboxAndDate === undefined || self._onUpdated === undefined) {
                return;
            }
            const [bbox, date] = bboxAndDate
            self._onUpdated(bbox, date);
        })
    }

    private async updateAsync(): Promise<[BBox, Date]> {
        if (this.runningQuery.data) {
            console.log("Still running a query, not updating");
            return undefined;
        }

        if (this.timeout.data > 0) {
            console.log("Still in timeout - not updating")
            return undefined;
        }

        const bounds = this.state.currentBounds.data?.pad(this.state.layoutToUse.widenFactor)?.expandToTileBounds(14);

        if (bounds === undefined) {
            return undefined;
        }
        const self = this;

        let data: any = undefined
        let date: Date = undefined
        const overpassUrls = self.state.overpassUrl.data
        let lastUsed = 0;

        do {
            try {
                const overpass = this.GetFilter(overpassUrls[lastUsed]);

                if (overpass === undefined) {
                    return undefined;
                }
                this.runningQuery.setData(true);

                [data, date] = await overpass.queryGeoJson(bounds)
                console.log("Querying overpass is done", data)
            } catch (e) {
                self.retries.data++;
                self.retries.ping();
                console.error(`QUERY FAILED due to`, e);

                await Utils.waitFor(1000)

                if (lastUsed + 1 < overpassUrls.length) {
                    lastUsed++
                    console.log("Trying next time with", overpassUrls[lastUsed])
                } else {
                    lastUsed = 0
                    self.timeout.setData(self.retries.data * 5);

                    while (self.timeout.data > 0) {
                        await Utils.waitFor(1000)
                        console.log(self.timeout.data)
                        self.timeout.data--
                        self.timeout.ping();
                    }
                }
            }
        } while (data === undefined);

        const z = Math.floor(this.state.locationControl.data.zoom ?? 0);
        self._previousBounds.get(z).push(bounds);
        self.retries.setData(0);

        try {
            data.features.forEach(feature => SimpleMetaTagger.objectMetaInfo.applyMetaTagsOnFeature(feature, date));
            self.features.setData(data.features.map(f => ({feature: f, freshness: date})));
            return [bounds, date];
        } catch (e) {
            console.error("Got the overpass response, but could not process it: ", e, e.stack)
        } finally {
            self.runningQuery.setData(false);
        }


    }
}