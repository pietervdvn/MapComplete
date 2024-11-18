import { ImageUploader, UploadResult } from "./ImageUploader"
import LinkImageAction from "../Osm/Actions/LinkImageAction"
import FeaturePropertiesStore from "../FeatureSource/Actors/FeaturePropertiesStore"
import { OsmId, OsmTags } from "../../Models/OsmFeature"
import ThemeConfig from "../../Models/ThemeConfig/ThemeConfig"
import { Store, UIEventSource } from "../UIEventSource"
import { OsmConnection } from "../Osm/OsmConnection"
import { Changes } from "../Osm/Changes"
import Translations from "../../UI/i18n/Translations"
import { Translation } from "../../UI/i18n/Translation"
import { IndexedFeatureSource } from "../FeatureSource/FeatureSource"
import { GeoOperations } from "../GeoOperations"
import { Feature } from "geojson"

/**
 * The ImageUploadManager has a
 */
export class ImageUploadManager {
    private readonly _uploader: ImageUploader
    private readonly _featureProperties: FeaturePropertiesStore
    private readonly _theme: ThemeConfig
    private readonly _indexedFeatures: IndexedFeatureSource
    private readonly _gps: Store<GeolocationCoordinates | undefined>
    private readonly _uploadStarted: Map<string, UIEventSource<number>> = new Map()
    private readonly _uploadFinished: Map<string, UIEventSource<number>> = new Map()
    private readonly _uploadFailed: Map<string, UIEventSource<number>> = new Map()
    private readonly _uploadRetried: Map<string, UIEventSource<number>> = new Map()
    private readonly _uploadRetriedSuccess: Map<string, UIEventSource<number>> = new Map()
    private readonly _osmConnection: OsmConnection
    private readonly _changes: Changes
    public readonly isUploading: Store<boolean>
    private readonly _reportError: (
        message: string | Error | XMLHttpRequest,
        extramessage?: string
    ) => Promise<void>

    constructor(
        layout: ThemeConfig,
        uploader: ImageUploader,
        featureProperties: FeaturePropertiesStore,
        osmConnection: OsmConnection,
        changes: Changes,
        gpsLocation: Store<GeolocationCoordinates | undefined>,
        allFeatures: IndexedFeatureSource,
        reportError: (
            message: string | Error | XMLHttpRequest,
            extramessage?: string
        ) => Promise<void>
    ) {
        this._uploader = uploader
        this._featureProperties = featureProperties
        this._theme = layout
        this._osmConnection = osmConnection
        this._changes = changes
        this._indexedFeatures = allFeatures
        this._gps = gpsLocation
        this._reportError = reportError

        const failed = this.getCounterFor(this._uploadFailed, "*")
        const done = this.getCounterFor(this._uploadFinished, "*")

        this.isUploading = this.getCounterFor(this._uploadStarted, "*").map(
            (startedCount) => {
                return startedCount > failed.data + done.data
            },
            [failed, done]
        )
    }

    /**
     * Gets various counters.
     * Note that counters can only increase
     * If a retry was a success, both 'retrySuccess' _and_ 'uploadFinished' will be increased
     * @param featureId the id of the feature you want information for. '*' has a global counter
     */
    public getCountsFor(featureId: string | "*"): {
        retried: Store<number>
        uploadStarted: Store<number>
        retrySuccess: Store<number>
        failed: Store<number>
        uploadFinished: Store<number>
    } {
        return {
            uploadStarted: this.getCounterFor(this._uploadStarted, featureId),
            uploadFinished: this.getCounterFor(this._uploadFinished, featureId),
            retried: this.getCounterFor(this._uploadRetried, featureId),
            failed: this.getCounterFor(this._uploadFailed, featureId),
            retrySuccess: this.getCounterFor(this._uploadRetriedSuccess, featureId),
        }
    }

    public canBeUploaded(file: File): true | { error: Translation } {
        const sizeInBytes = file.size
        if (sizeInBytes > this._uploader.maxFileSizeInMegabytes * 1000000) {
            const error = Translations.t.image.toBig.Subs({
                actual_size: Math.floor(sizeInBytes / 1000000) + "MB",
                max_size: this._uploader.maxFileSizeInMegabytes + "MB",
            })
            return { error }
        }
        return true
    }

    /**
     * Uploads the given image, applies the correct title and license for the known user.
     * Will then add this image to the OSM-feature or the OSM-note
     * @param file a jpg file to upload
     * @param tagsStore The tags of the feature
     * @param targetKey Use this key to save the attribute under. Default: 'image'
     */
    public async uploadImageAndApply(
        file: File,
        tagsStore: UIEventSource<OsmTags>,
        targetKey: string,
        noblur: boolean
    ): Promise<void> {
        const canBeUploaded = this.canBeUploaded(file)
        if (canBeUploaded !== true) {
            throw canBeUploaded.error
        }

        const tags = tagsStore.data

        const featureId = <OsmId>tags.id

        const author = this._osmConnection.userDetails.data.name

        const uploadResult = await this.uploadImageWithLicense(
            featureId,
            author,
            file,
            targetKey,
            noblur
        )
        if (!uploadResult) {
            return
        }
        const properties = this._featureProperties.getStore(featureId)

        const action = new LinkImageAction(
            featureId,
            uploadResult.key,
            uploadResult.value,
            properties,
            {
                theme: tags?.data?.["_orig_theme"] ?? this._theme.id,
                changeType: "add-image",
            }
        )

        await this._changes.applyAction(action)
    }

    public async uploadImageWithLicense(
        featureId: string,
        author: string,
        blob: File,
        targetKey: string | undefined,
        noblur: boolean,
        feature?: Feature
    ): Promise<UploadResult> {
        this.increaseCountFor(this._uploadStarted, featureId)
        let key: string
        let value: string
        let absoluteUrl: string
        let location: [number, number] = undefined
        if (this._gps.data) {
            location = [this._gps.data.longitude, this._gps.data.latitude]
        }
        if (location === undefined || location?.some((l) => l === undefined)) {
            feature ??= this._indexedFeatures.featuresById.data.get(featureId)
            location = GeoOperations.centerpointCoordinates(feature)
        }
        try {
            ;({ key, value, absoluteUrl } = await this._uploader.uploadImage(
                blob,
                location,
                author,
                noblur
            ))
        } catch (e) {
            this.increaseCountFor(this._uploadRetried, featureId)
            console.error("Could not upload image, trying again:", e)
            try {
                ;({ key, value, absoluteUrl } = await this._uploader.uploadImage(
                    blob,
                    location,
                    author,
                    noblur
                ))
                this.increaseCountFor(this._uploadRetriedSuccess, featureId)
            } catch (e) {
                console.error("Could again not upload image due to", e)
                this.increaseCountFor(this._uploadFailed, featureId)
                await this._reportError(
                    e,
                    JSON.stringify({
                        ctx: "While uploading an image in the Image Upload Manager",
                        featureId,
                        author,
                        targetKey,
                    })
                )
                return undefined
            }
        }
        console.log("Uploading image done, creating action for", featureId)
        key = targetKey ?? key
        if (targetKey) {
            // This is a non-standard key, so we use the image link directly
            value = absoluteUrl
        }
        this.increaseCountFor(this._uploadFinished, featureId)
        return { key, absoluteUrl, value }
    }

    private getCounterFor(collection: Map<string, UIEventSource<number>>, key: string | "*") {
        if (this._featureProperties.aliases.has(key)) {
            key = this._featureProperties.aliases.get(key)
        }
        if (!collection.has(key)) {
            collection.set(key, new UIEventSource<number>(0))
        }
        return collection.get(key)
    }

    private increaseCountFor(collection: Map<string, UIEventSource<number>>, key: string | "*") {
        {
            const counter = this.getCounterFor(collection, key)
            counter.setData(counter.data + 1)
        }
        {
            const global = this.getCounterFor(collection, "*")
            global.setData(global.data + 1)
        }
    }
}
