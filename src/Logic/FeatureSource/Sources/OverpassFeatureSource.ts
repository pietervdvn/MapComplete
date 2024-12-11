import { Feature, Geometry } from "geojson"
import { UpdatableFeatureSource } from "../FeatureSource"
import { ImmutableStore, Store, UIEventSource } from "../../UIEventSource"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import { Or } from "../../Tags/Or"
import { Overpass } from "../../Osm/Overpass"
import { Utils } from "../../../Utils"
import { TagsFilter } from "../../Tags/TagsFilter"
import { BBox } from "../../BBox"
import { FeatureCollection } from "@turf/turf"
import { OsmTags } from "../../../Models/OsmFeature"
"use strict";

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
    private _lastRequestedLayers: LayerConfig[]
    private readonly _layersToDownload: Store<LayerConfig[]>

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
            ignoreZoom?: boolean
        }
    ) {
        this.state = state
        this._isActive = options?.isActive ?? new ImmutableStore(true)
        this.padToZoomLevel = options?.padToTiles
        this._layersToDownload = options?.ignoreZoom
            ? new ImmutableStore(state.layers)
            : state.zoom.map((zoom) => this.layersToDownload(zoom))

        state.bounds.mapD(
            () => {
                this.updateAsyncIfNeeded()
            },
            [this._layersToDownload]
        )
    }

    private layersToDownload(zoom: number): LayerConfig[] {
        const layersToDownload: LayerConfig[] = []
        for (const layer of this.state.layers) {
            if (typeof layer === "string") {
                throw "A layer was not expanded!"
            }
            if (layer.source === undefined) {
                continue
            }
            if (zoom < layer.minzoom) {
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

        return layersToDownload
    }

    /**
     * Download the relevant data from overpass. Attempt to use a different server if one fails; only downloads the relevant layers
     * Will always attempt to download, even is 'options.isActive.data' is 'false', the zoom level is incorrect, ...
     * @private
     */
    public async updateAsync(overrideBounds?: BBox): Promise<void> {
        let data: FeatureCollection<Geometry, OsmTags> = undefined
        let lastUsed = 0
        const start = new Date()
        const layersToDownload = this._layersToDownload.data

        if (layersToDownload.length == 0) {
            return
        }

        const overpassUrls = this.state.overpassUrl.data
        if (overpassUrls === undefined || overpassUrls.length === 0) {
            throw "Panic: overpassFeatureSource didn't receive any overpassUrls"
        }
        // Note: the bounds are updated between attempts, in case that the user zoomed around
        let bounds: BBox
        do {
            try {
                bounds =
                    overrideBounds ??
                    this.state.bounds.data
                        ?.pad(this.state.widenFactor)
                        ?.expandToTileBounds(this.padToZoomLevel?.data)
                if (!bounds) {
                    return
                }

                const overpass = this.GetFilter(overpassUrls[lastUsed], layersToDownload)

                if (overpass === undefined) {
                    return undefined
                }
                this.runningQuery.setData(true)
                console.trace("Overpass feature source: querying geojson")
                data = (await overpass.queryGeoJson(bounds))[0]
            } catch (e) {
                this.retries.data++
                this.retries.ping()
                console.error(`QUERY FAILED due to`, e)

                await Utils.waitFor(1000)

                if (lastUsed + 1 < overpassUrls.length) {
                    lastUsed++
                    console.log("Trying next time with", overpassUrls[lastUsed])
                } else {
                    lastUsed = 0
                    this.timeout.setData(this.retries.data * 5)

                    while (this.timeout.data > 0) {
                        await Utils.waitFor(1000)
                        this.timeout.data--
                        this.timeout.ping()
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

            const end = new Date()
            const timeNeeded = (end.getTime() - start.getTime()) / 1000
            console.log(
                "Overpass returned",
                data.features.length,
                "features in",
                timeNeeded,
                "seconds"
            )
            this.features.setData(data.features)
            this._lastQueryBBox = bounds
            this._lastRequestedLayers = layersToDownload
        } catch (e) {
            console.error("Got the overpass response, but could not process it: ", e, e.stack)
        } finally {
            this.retries.setData(0)
            this.runningQuery.setData(false)
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
            Utils.sameList(this._layersToDownload.data, this._lastRequestedLayers) &&
            requestedBounds.isContainedIn(this._lastQueryBBox)
        ) {
            return undefined
        }
        await this.updateAsync()
    }
}
