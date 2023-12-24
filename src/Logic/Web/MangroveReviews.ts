import { ImmutableStore, Store, UIEventSource } from "../UIEventSource"
import { MangroveReviews, Review } from "mangrove-reviews-typescript"
import { Utils } from "../../Utils"
import { Feature, Position } from "geojson"
import { GeoOperations } from "../GeoOperations"

export class MangroveIdentity {
    public readonly keypair: Store<CryptoKeyPair>
    public readonly key_id: Store<string>

    constructor(mangroveIdentity: UIEventSource<string>) {
        const key_id = new UIEventSource<string>(undefined)
        this.key_id = key_id
        const keypairEventSource = new UIEventSource<CryptoKeyPair>(undefined)
        this.keypair = keypairEventSource
        mangroveIdentity.addCallbackAndRunD(async (data) => {
            if (!data) {
                return
            }
            const keypair = await MangroveReviews.jwkToKeypair(JSON.parse(data))
            keypairEventSource.setData(keypair)
            const pem = await MangroveReviews.publicToPem(keypair.publicKey)
            key_id.setData(pem)
        })

        try {
            if (!Utils.runningFromConsole && (mangroveIdentity.data ?? "") === "") {
                MangroveIdentity.CreateIdentity(mangroveIdentity).then((_) => {})
            }
        } catch (e) {
            console.error("Could not create identity: ", e)
        }
    }

    /**
     * Creates an identity if none exists already.
     * Is written into the UIEventsource, which was passed into the constructor
     * @constructor
     */
    private static async CreateIdentity(identity: UIEventSource<string>): Promise<void> {
        const keypair = await MangroveReviews.generateKeypair()
        const jwk = await MangroveReviews.keypairToJwk(keypair)
        if ((identity.data ?? "") !== "") {
            // Identity has been loaded via osmPreferences by now - we don't overwrite
            return
        }
        identity.setData(JSON.stringify(jwk))
    }
}

/**
 * Tracks all reviews of a given feature, allows to create a new review
 */
export default class FeatureReviews {
    private static readonly _featureReviewsCache: Record<string, FeatureReviews> = {}
    public readonly subjectUri: Store<string>
    public readonly average: Store<number | null>
    private readonly _reviews: UIEventSource<
        (Review & { kid: string; signature: string; madeByLoggedInUser: Store<boolean> })[]
    > = new UIEventSource([])
    public readonly reviews: Store<(Review & { madeByLoggedInUser: Store<boolean> })[]> =
        this._reviews
    private readonly _lat: number
    private readonly _lon: number
    private readonly _uncertainty: number
    private readonly _name: Store<string>
    private readonly _identity: MangroveIdentity

    private constructor(
        feature: Feature,
        tagsSource: UIEventSource<Record<string, string>>,
        mangroveIdentity?: MangroveIdentity,
        options?: {
            nameKey?: "name" | string
            fallbackName?: string
            uncertaintyRadius?: number
        }
    ) {
        const centerLonLat = GeoOperations.centerpointCoordinates(feature)
        ;[this._lon, this._lat] = centerLonLat
        this._identity =
            mangroveIdentity ?? new MangroveIdentity(new UIEventSource<string>(undefined))
        const nameKey = options?.nameKey ?? "name"

        if (feature.geometry.type === "Point") {
            this._uncertainty = options?.uncertaintyRadius ?? 10
        } else {
            let coordss: Position[][]
            if (feature.geometry.type === "LineString") {
                coordss = [feature.geometry.coordinates]
            } else if (
                feature.geometry.type === "MultiLineString" ||
                feature.geometry.type === "Polygon"
            ) {
                coordss = feature.geometry.coordinates
            }
            let maxDistance = 0
            for (const coords of coordss) {
                for (const coord of coords) {
                    maxDistance = Math.max(
                        maxDistance,
                        GeoOperations.distanceBetween(centerLonLat, coord)
                    )
                }
            }

            this._uncertainty = options?.uncertaintyRadius ?? maxDistance
        }
        this._name = tagsSource.map((tags) => tags[nameKey] ?? options?.fallbackName)

        this.subjectUri = this.ConstructSubjectUri()

        const self = this
        this.subjectUri.addCallbackAndRunD(async (sub) => {
            const reviews = await MangroveReviews.getReviews({ sub })
            self.addReviews(reviews.reviews)
        })
        /* We also construct all subject queries _without_ encoding the name to work around a previous bug
         * See https://github.com/giggls/opencampsitemap/issues/30
         */
        this.ConstructSubjectUri(true).addCallbackAndRunD(async (sub) => {
            try {
                const reviews = await MangroveReviews.getReviews({ sub })
                self.addReviews(reviews.reviews)
            } catch (e) {
                console.log("Could not fetch reviews for partially incorrect query ", sub)
            }
        })
        this.average = this._reviews.map((reviews) => {
            if (!reviews) {
                return null
            }
            if (reviews.length === 0) {
                return null
            }
            let sum = 0
            let count = 0
            for (const review of reviews) {
                if (review.rating !== undefined) {
                    count++
                    sum += review.rating
                }
            }
            return Math.round(sum / count)
        })
    }

    /**
     * Construct a featureReviewsFor or fetches it from the cache
     */
    public static construct(
        feature: Feature,
        tagsSource: UIEventSource<Record<string, string>>,
        mangroveIdentity?: MangroveIdentity,
        options?: {
            nameKey?: "name" | string
            fallbackName?: string
            uncertaintyRadius?: number
        }
    ) {
        const key = feature.properties.id
        const cached = FeatureReviews._featureReviewsCache[key]
        if (cached !== undefined) {
            return cached
        }
        const featureReviews = new FeatureReviews(feature, tagsSource, mangroveIdentity, options)
        FeatureReviews._featureReviewsCache[key] = featureReviews
        return featureReviews
    }

    /**
     * The given review is uploaded to mangrove.reviews and added to the list of known reviews
     */
    public async createReview(review: Omit<Review, "sub">): Promise<void> {
        const r: Review = {
            sub: this.subjectUri.data,
            ...review,
        }
        const keypair: CryptoKeyPair = this._identity.keypair.data
        const jwt = await MangroveReviews.signReview(keypair, r)
        const kid = await MangroveReviews.publicToPem(keypair.publicKey)
        await MangroveReviews.submitReview(jwt)
        this._reviews.data.push({
            ...r,
            kid,
            signature: jwt,
            madeByLoggedInUser: new ImmutableStore(true),
        })
        this._reviews.ping()
    }

    /**
     * Adds given reviews to the 'reviews'-UI-eventsource
     * @param reviews
     * @private
     */
    private addReviews(reviews: { payload: Review; kid: string; signature: string }[]) {
        const self = this
        const alreadyKnown = new Set(self._reviews.data.map((r) => r.rating + " " + r.opinion))

        let hasNew = false
        for (const reviewData of reviews) {
            const review = reviewData.payload

            try {
                const url = new URL(review.sub)
                if (url.protocol === "geo:") {
                    const coordinate = <[number, number]>(
                        url.pathname.split(",").map((n) => Number(n))
                    )
                    const distance = GeoOperations.distanceBetween(
                        [this._lat, this._lon],
                        coordinate
                    )
                    if (distance > this._uncertainty) {
                        continue
                    }
                }
            } catch (e) {
                console.warn(e)
            }

            const key = review.rating + " " + review.opinion
            if (alreadyKnown.has(key)) {
                continue
            }
            self._reviews.data.push({
                ...review,
                kid: reviewData.kid,
                signature: reviewData.signature,
                madeByLoggedInUser: this._identity.key_id.map((user_key_id) => {
                    return reviewData.kid === user_key_id
                }),
            })
            hasNew = true
        }
        if (hasNew) {
            self._reviews.data.sort((a, b) => b.iat - a.iat) // Sort with most recent first

            self._reviews.ping()
        }
    }

    /**
     * Gets an URI which represents the item in a mangrove-compatible way
     *
     * See https://mangrove.reviews/standard#mangrove-core-uri-schemes
     * @constructor
     */
    private ConstructSubjectUri(dontEncodeName: boolean = false): Store<string> {
        // https://www.rfc-editor.org/rfc/rfc5870#section-3.4.2
        // `u` stands for `uncertainty`, https://www.rfc-editor.org/rfc/rfc5870#section-3.4.3
        const self = this
        return this._name.map(function (name) {
            let uri = `geo:${self._lat},${self._lon}?u=${self._uncertainty}`
            if (name) {
                uri += "&q=" + (dontEncodeName ? name : encodeURIComponent(name))
            }
            return uri
        })
    }
}
