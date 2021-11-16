import {UIEventSource} from "../UIEventSource";
import {Or} from "../Tags/Or";
import {Overpass} from "../Osm/Overpass";
import FeatureSource from "../FeatureSource/FeatureSource";
import {Utils} from "../../Utils";
import {TagsFilter} from "../Tags/TagsFilter";
import SimpleMetaTagger from "../SimpleMetaTagger";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import RelationsTracker from "../Osm/RelationsTracker";
import {BBox} from "../BBox";
import Loc from "../../Models/Loc";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import AllKnownLayers from "../../Customizations/AllKnownLayers";


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

    private readonly state: {
        readonly locationControl: UIEventSource<Loc>,
        readonly layoutToUse: LayoutConfig,
        readonly overpassUrl: UIEventSource<string[]>;
        readonly overpassTimeout: UIEventSource<number>;
        readonly currentBounds: UIEventSource<BBox>
    }
    private readonly _isActive: UIEventSource<boolean>;
    private readonly onBboxLoaded: (bbox: BBox, date: Date, layers: LayerConfig[], zoomlevel: number) => void;

    constructor(
        state: {
            readonly locationControl: UIEventSource<Loc>,
            readonly layoutToUse: LayoutConfig,
            readonly overpassUrl: UIEventSource<string[]>;
            readonly overpassTimeout: UIEventSource<number>;
            readonly overpassMaxZoom: UIEventSource<number>,
            readonly currentBounds: UIEventSource<BBox>
        },
        options: {
            padToTiles: UIEventSource<number>,
            isActive?: UIEventSource<boolean>,
            relationTracker: RelationsTracker,
            onBboxLoaded?: (bbox: BBox, date: Date, layers: LayerConfig[], zoomlevel: number) => void
        }) {

        this.state = state
        this._isActive = options.isActive;
        this.onBboxLoaded = options.onBboxLoaded
        this.relationsTracker = options.relationTracker
        const self = this;
        state.currentBounds.addCallback(_ => {
            self.update(options.padToTiles.data)
        })

    }

    private GetFilter(interpreterUrl: string, layersToDownload: LayerConfig[]): Overpass {
        let filters: TagsFilter[] = [];
        let extraScripts: string[] = [];
        for (const layer of layersToDownload) {
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

    private update(paddedZoomLevel: number) {
        if (!this._isActive.data) {
            return;
        }
        const self = this;
        this.updateAsync(paddedZoomLevel).then(bboxDate => {
            if (bboxDate === undefined || self.onBboxLoaded === undefined) {
                return;
            }
            const [bbox, date, layers] = bboxDate
            self.onBboxLoaded(bbox, date, layers, paddedZoomLevel)
        })
    }

    private async updateAsync(padToZoomLevel: number): Promise<[BBox, Date, LayerConfig[]]> {
        if (this.runningQuery.data) {
            console.log("Still running a query, not updating");
            return undefined;
        }

        if (this.timeout.data > 0) {
            console.log("Still in timeout - not updating")
            return undefined;
        }

        let data: any = undefined
        let date: Date = undefined
        let lastUsed = 0;


        const layersToDownload = []
        for (const layer of this.state.layoutToUse.layers) {

            if (typeof (layer) === "string") {
                throw "A layer was not expanded!"
            }
            if(AllKnownLayers.priviliged_layers.indexOf(layer.id) >= 0){
                continue
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
            layersToDownload.push(layer)
        }

        const self = this;
        const overpassUrls = self.state.overpassUrl.data
        let bounds: BBox
        do {
            try {

                bounds = this.state.currentBounds.data?.pad(this.state.layoutToUse.widenFactor)?.expandToTileBounds(padToZoomLevel);

                if (bounds === undefined) {
                    return undefined;
                }

                const overpass = this.GetFilter(overpassUrls[lastUsed], layersToDownload);

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
        } while (data === undefined && this._isActive.data);


        try {
            if (data === undefined) {
                return undefined
            }
            data.features.forEach(feature => SimpleMetaTagger.objectMetaInfo.applyMetaTagsOnFeature(feature, date, undefined));
            self.features.setData(data.features.map(f => ({feature: f, freshness: date})));
            return [bounds, date, layersToDownload];
        } catch (e) {
            console.error("Got the overpass response, but could not process it: ", e, e.stack)
            return undefined
        } finally {
            self.retries.setData(0);
            self.runningQuery.setData(false);
        }


    }
}