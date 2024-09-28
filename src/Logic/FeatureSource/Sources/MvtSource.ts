import { Feature as GeojsonFeature, Geometry } from "geojson"

import { Store, UIEventSource } from "../../UIEventSource"
import { FeatureSourceForTile, UpdatableFeatureSource } from "../FeatureSource"
import { MvtToGeojson } from "mvt-to-geojson"


export default class MvtSource implements FeatureSourceForTile, UpdatableFeatureSource {
    public readonly features: Store<GeojsonFeature<Geometry, { [name: string]: any }>[]>
    public readonly x: number
    public readonly y: number
    public readonly z: number
    private readonly _url: string
    private readonly _layerName: string
    private readonly _features: UIEventSource<
        GeojsonFeature<
            Geometry,
            {
                [name: string]: any
            }
        >[]
    > = new UIEventSource<GeojsonFeature<Geometry, { [p: string]: any }>[]>([])
    private currentlyRunning: Promise<any>

    constructor(
        url: string,
        x: number,
        y: number,
        z: number,
        layerName?: string,
        isActive?: Store<boolean>,
    ) {
        this._url = url
        this._layerName = layerName
        this.x = x
        this.y = y
        this.z = z
        this.updateAsync()
        this.features = this._features.map(
            (fs) => {
                if (fs === undefined || isActive?.data === false) {
                    return []
                }
                return fs
            },
            [isActive],
        )
    }

    async updateAsync() {
        if (!this.currentlyRunning) {
            this.currentlyRunning = this.download()
        }
        await this.currentlyRunning
    }


    private async download(): Promise<void> {
        try {
            const result = await fetch(this._url)
            if (result.status !== 200) {
                console.error("Could not download tile " + this._url)
                return
            }
            const buffer = await result.arrayBuffer()
            const features = await MvtToGeojson.fromBuffer(buffer, this.x, this.y, this.z)
            this._features.setData(features)
        } catch (e) {
            console.error("Could not download MVT " + this._url + " tile due to", e)
        }
    }


}
