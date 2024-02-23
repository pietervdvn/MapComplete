import { Feature } from "geojson"
import { UpdatableFeatureSource } from "../FeatureSource"
import { ImmutableStore, Store, UIEventSource } from "../../UIEventSource"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import { Or } from "../../Tags/Or"
import { Overpass } from "../../Osm/Overpass"
import { Utils } from "../../../Utils"
import { TagsFilter } from "../../Tags/TagsFilter"
import { BBox } from "../../BBox"

/**
 * A wrapper around the 'Overpass'-object.
 * It has more logic and will automatically fetch the data for the right bbox and the active layers
 */
export default class OverpassFeatureSource implements UpdatableFeatureSource {
    /**
     * The last loaded features, as geojson
     */
    public readonly features: UIEventSource<Feature[]> = new UIEventSource(undefined)

    public readonly runningQuery: UIEventSource<boolean> = new UIEventSource<boolean>(false)
    public readonly timeout: UIEventSource<number> = new UIEventSource<number>(0)

    private readonly retries: UIEventSource<number> = new UIEventSource<number>(0)

    private readonly state: {
        readonly zoom: Store<number>
        readonly layers: LayerConfig[]
        readonly widenFactor: number
        readonly overpassUrl: Store<string[]>
        readonly overpassTimeout: Store<number>
        readonly bounds: Store<BBox>
    }
    private readonly _isActive: Store<boolean>
    private readonly padToZoomLevel?: Store<number>
    private _lastQueryBBox: BBox

    constructor(
        state: {
            readonly layers: LayerConfig[]
            readonly widenFactor: number
            readonly zoom: Store<number>
            readonly overpassUrl: Store<string[]>
            readonly overpassTimeout: Store<number>
            readonly overpassMaxZoom: Store<number>
            readonly bounds: Store<BBox>
        },
        options?: {
            padToTiles?: Store<number>
            isActive?: Store<boolean>
        }
    ) {
        this.state = state
        this._isActive = options?.isActive ?? new ImmutableStore(true)
        this.padToZoomLevel = options?.padToTiles
        const self = this
        state.bounds.addCallbackD((_) => {
            self.updateAsyncIfNeeded()
        })
    }

    /**
     * Download the relevant data from overpass. Attempt to use a different server; only downloads the relevant layers
     * @private
     */
    public async updateAsync(): Promise<void> {
        let data: any = undefined
        let lastUsed = 0

        const layersToDownload = []
        for (const layer of this.state.layers) {
            if (typeof layer === "string") {
                throw "A layer was not expanded!"
            }
            if (layer.source === undefined) {
                continue
            }
            if (this.state.zoom.data < layer.minzoom) {
                continue
            }
            if (layer.doNotDownload) {
                continue
            }
            if (layer.source === null) {
                // This is a special layer. Should not have been here
                console.warn(
                    "OverpassFeatureSource received a layer for which the source is null:",
                    layer.id
                )
                continue
            }
            if (layer.source.geojsonSource !== undefined) {
                // Not our responsibility to download this layer!
                continue
            }
            layersToDownload.push(layer)
        }

        if (layersToDownload.length == 0) {
            return
        }

        const self = this
        const overpassUrls = self.state.overpassUrl.data
        if (overpassUrls === undefined || overpassUrls.length === 0) {
            throw "Panic: overpassFeatureSource didn't receive any overpassUrls"
        }
        // Note: the bounds are updated between attempts, in case that the user zoomed around
        let bounds: BBox
        do {
            try {
                bounds = this.state.bounds.data
                    ?.pad(this.state.widenFactor)
                    ?.expandToTileBounds(this.padToZoomLevel?.data)

                if (bounds === undefined) {
                    return undefined
                }

                const overpass = this.GetFilter(overpassUrls[lastUsed], layersToDownload)

                if (overpass === undefined) {
                    return undefined
                }
                this.runningQuery.setData(true)
                data = (await overpass.queryGeoJson(bounds))[0]
            } catch (e) {
                self.retries.data++
                self.retries.ping()
                console.error(`QUERY FAILED due to`, e)

                await Utils.waitFor(1000)

                if (lastUsed + 1 < overpassUrls.length) {
                    lastUsed++
                    console.log("Trying next time with", overpassUrls[lastUsed])
                } else {
                    lastUsed = 0
                    self.timeout.setData(self.retries.data * 5)

                    while (self.timeout.data > 0) {
                        await Utils.waitFor(1000)
                        self.timeout.data--
                        self.timeout.ping()
                    }
                }
            }
        } while (data === undefined && this._isActive.data)

        try {
            if (data === undefined) {
                return undefined
            }
            // Some metatags are delivered by overpass _without_ underscore-prefix; we fix them below
            // TODO FIXME re-enable this data.features.forEach((f) => SimpleMetaTaggers.objectMetaInfo.applyMetaTagsOnFeature(f))

            console.log("Overpass returned", data.features.length, "features")
            self.features.setData(data.features)
            this._lastQueryBBox = bounds
        } catch (e) {
            console.error("Got the overpass response, but could not process it: ", e, e.stack)
        } finally {
            self.retries.setData(0)
            self.runningQuery.setData(false)
        }
    }

    /**
     * Creates the 'Overpass'-object for the given layers
     * @param interpreterUrl
     * @param layersToDownload
     * @constructor
     * @private
     */
    private GetFilter(interpreterUrl: string, layersToDownload: LayerConfig[]): Overpass {
        let filters: TagsFilter[] = layersToDownload.map((layer) => layer.source.osmTags)
        filters = Utils.NoNull(filters)
        if (filters.length === 0) {
            return undefined
        }
        return new Overpass(new Or(filters), [], interpreterUrl, this.state.overpassTimeout)
    }

    /**
     *
     * @private
     */
    private async updateAsyncIfNeeded(): Promise<void> {
        if (!this._isActive?.data) {
            return
        }
        if (this.runningQuery.data) {
            console.log("Still running a query, not updating")
            return undefined
        }

        if (this.timeout.data > 0) {
            console.log("Still in timeout - not updating")
            return undefined
        }
        const requestedBounds = this.state.bounds.data
        if (
            this._lastQueryBBox !== undefined &&
            requestedBounds.isContainedIn(this._lastQueryBBox)
        ) {
            return undefined
        }
        await this.updateAsync()
    }
}
