import { ImmutableStore, Store, UIEventSource } from "../UIEventSource"
import { MangroveReviews, Review } from "mangrove-reviews-typescript"
import { Utils } from "../../Utils"
import { Feature, Position } from "geojson"
import { GeoOperations } from "../GeoOperations"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"

export class MangroveIdentity {
    private readonly keypair: UIEventSource<CryptoKeyPair> = new UIEventSource<CryptoKeyPair>(
        undefined
    )
    /**
     * Same as the one in the user settings
     */
    public readonly mangroveIdentity: UIEventSource<string>
    private readonly key_id: UIEventSource<string> = new UIEventSource<string>(undefined)
    private readonly _mangroveIdentityCreationDate: UIEventSource<string>

    constructor(
        mangroveIdentity: UIEventSource<string>,
        mangroveIdentityCreationDate: UIEventSource<string>
    ) {
        this.mangroveIdentity = mangroveIdentity
        this._mangroveIdentityCreationDate = mangroveIdentityCreationDate
        mangroveIdentity.addCallbackAndRunD(async (data) => {
            if (data === "") {
                return
            }
            await this.setKeypair(data)
        })
    }

    private async setKeypair(data: string) {
        console.debug("Setting keypair from", data)
        const keypair = await MangroveReviews.jwkToKeypair(JSON.parse(data))
        this.keypair.setData(keypair)
        const pem = await MangroveReviews.publicToPem(keypair.publicKey)
        this.key_id.setData(pem)
    }

    /**
     * Creates an identity if none exists already.
     * Is written into the UIEventsource, which was passed into the constructor
     * @constructor
     */
    private async CreateIdentity(): Promise<void> {
        const keypair = await MangroveReviews.generateKeypair()
        const jwk = await MangroveReviews.keypairToJwk(keypair)
        if ((this.mangroveIdentity.data ?? "") !== "") {
            // Identity has been loaded via osmPreferences by now - we don't overwrite
            return
        }
        this.keypair.setData(keypair)
        const pem = await MangroveReviews.publicToPem(keypair.publicKey)
        this.key_id.setData(pem)
        this.mangroveIdentity.setData(JSON.stringify(jwk))
        this._mangroveIdentityCreationDate.setData(new Date().toISOString())
    }

    /**
     * Only called to create a review.
     */
    async getKeypair(): Promise<CryptoKeyPair> {
        if (this.keypair.data === undefined) {
            // We want to create a review, but it seems like no key has been setup at this moment
            // We create the key
            try {
                if (!Utils.runningFromConsole && (this.mangroveIdentity.data ?? "") === "") {
                    await this.CreateIdentity()
                }
            } catch (e) {
                console.error("Could not create identity: ", e)
            }
        }
        return this.keypair.data
    }

    getKeyId(): Store<string> {
        return this.key_id
    }

    private geoReviewsById: Store<(Review & { kid: string; signature: string })[]> = undefined

    /**
     * Subset of `getAllReviews()` which contains all reviews which use the `geo:` as URL
     */
    public getGeoReviews(): Store<(Review & { kid: string; signature: string })[] | undefined> {
        if (!this.geoReviewsById) {
            this.geoReviewsById = this.getAllReviews().mapD((reviews) =>
                reviews.filter((review) => {
                    try {
                        const subjectUrl = new URL(review.sub)
                        return subjectUrl.protocol === "geo:"
                    } catch (e) {
                        return false
                    }
                })
            )
        }
        return this.geoReviewsById
    }

    private allReviewsById: UIEventSource<(Review & { kid: string; signature: string })[]> =
        undefined

    /**
     * Gets all reviews that are made for the current identity.
     * The returned store will contain `undefined` if still loading
     */
    public getAllReviews(): Store<(Review & { kid: string; signature: string })[] | undefined> {
        if (this.allReviewsById !== undefined) {
            return this.allReviewsById
        }
        this.allReviewsById = new UIEventSource(undefined)
        this.key_id.map(async (pem) => {
            if (pem === undefined) {
                return []
            }
            const allReviews = await MangroveReviews.getReviews({
                kid: pem
            })
            this.allReviewsById.setData(
                allReviews.reviews.map((r) => ({
                    ...r,
                    ...r.payload
                }))
            )
        })
        return this.allReviewsById
    }

    addReview(review: Review & { kid; signature }) {
        this.allReviewsById?.setData(this.allReviewsById?.data?.concat([review]))
    }
}

/**
 * Tracks all reviews of a given feature, allows to create a new review (and inserts this into the list)
 *
 * This object will start fetching the reviews as soon as it is constructed
 */
export default class FeatureReviews {
    /**
     * See https://gitlab.com/open-reviews/mangrove/-/blob/master/servers/reviewer/src/review.rs#L269 and https://github.com/pietervdvn/MapComplete/issues/1775
     */
    public static readonly REVIEW_OPINION_MAX_LENGTH = 1000
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
    private readonly _testmode: Store<boolean>
    public loadingAllowed: UIEventSource<boolean | null>

    private constructor(
        feature: Feature,
        tagsSource: UIEventSource<Record<string, string>>,
        mangroveIdentity: MangroveIdentity,
        options?: {
            nameKey?: "name" | string
            fallbackName?: string
            uncertaintyRadius?: number
        },
        testmode?: Store<boolean>,
        loadingAllowed?: UIEventSource<boolean | null>
    ) {
        this.loadingAllowed = loadingAllowed
        const centerLonLat = GeoOperations.centerpointCoordinates(feature)
        ;[this._lon, this._lat] = centerLonLat
        this._identity = mangroveIdentity
        this._testmode = testmode ?? new ImmutableStore(false)
        const nameKey = options?.nameKey ?? "name"

        if (options.uncertaintyRadius) {
            this._uncertainty = options.uncertaintyRadius
        } else if (feature.geometry.type === "Point") {
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
            } else if (feature.geometry.type === "MultiPolygon") {
                coordss = feature.geometry.coordinates[0]
            } else {
                throw "Invalid feature type: " + feature.geometry.type
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

            this._uncertainty = maxDistance
        }
        this._name = tagsSource.map((tags) => tags[nameKey] ?? options?.fallbackName)

        this.subjectUri = this.ConstructSubjectUri()

        this.subjectUri.mapD(
            async (sub) => {
                const reviews = await MangroveReviews.getReviews({ sub })
                console.debug("Got reviews for", feature, reviews, sub)
                this.addReviews(reviews.reviews, this._name.data)
            },
            [this._name]
        )
        /* We also construct all subject queries _without_ encoding the name to work around a previous bug
         * See https://github.com/giggls/opencampsitemap/issues/30
         */
        this.ConstructSubjectUri(true).mapD(
            async (sub) => {
                if (!loadingAllowed.data) {
                    return
                }
                try {
                    const reviews = await MangroveReviews.getReviews({ sub })
                    console.debug("Got reviews (no-encode) for", feature, reviews, sub)
                    this.addReviews(reviews.reviews, this._name.data)
                } catch (e) {
                    console.log("Could not fetch reviews for partially incorrect query ", sub)
                }
            },
            [this._name, loadingAllowed]
        )
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
     *
     * @param feature The feature that we want reviews of. Various properties are used to link reviews to the feature, namely the centerpoint and size and optionally the name
     * @param tagsSource Dynamic tags of the feature
     * @param mangroveIdentity Identity with which new REviews will be mad
     * @param options If options.nameKey is given, this key will be used as subject to fetch reviews
     */
    public static construct(
        feature: Feature,
        tagsSource: UIEventSource<Record<string, string>>,
        mangroveIdentity: MangroveIdentity,
        options: {
            nameKey?: "name" | string
            fallbackName?: string
            uncertaintyRadius?: number
        },
        state: SpecialVisualizationState
    ): FeatureReviews {
        const key = feature.properties.id
        const cached = FeatureReviews._featureReviewsCache[key]
        if (cached !== undefined) {
            return cached
        }
        const themeIsSensitive = state.theme?.enableMorePrivacy
        const settings = state.osmConnection.getPreference<"always" | "yes" | "ask" | "hidden">("reviews-allowed")
        const loadingAllowed = new UIEventSource(false)
        settings.addCallbackAndRun((s) => {
            console.log("Reviews allowed is", s)
            if (s === "hidden") {
                loadingAllowed.set(null)
                return
            }
            if (s === "always") {
                loadingAllowed.set(true)
                return
            }
            if (themeIsSensitive || s === "ask") {
                loadingAllowed.set(false)
                return
            }
            loadingAllowed.set(true)
        })
        const featureReviews = new FeatureReviews(
            feature,
            tagsSource,
            mangroveIdentity,
            options,
            state.featureSwitchIsTesting,
            loadingAllowed
        )
        FeatureReviews._featureReviewsCache[key] = featureReviews
        return featureReviews
    }

    /**
     * The given review is uploaded to mangrove.reviews and added to the list of known reviews
     */
    public async createReview(review: Omit<Review, "sub">): Promise<void> {
        if (
            review.opinion !== undefined &&
            review.opinion.length > FeatureReviews.REVIEW_OPINION_MAX_LENGTH
        ) {
            throw (
                "Opinion too long, should be at most " +
                FeatureReviews.REVIEW_OPINION_MAX_LENGTH +
                " characters long"
            )
        }
        const r: Review = {
            sub: this.subjectUri.data,
            ...review
        }
        const keypair: CryptoKeyPair = await this._identity.getKeypair()
        const jwt = await MangroveReviews.signReview(keypair, r)
        const kid = await MangroveReviews.publicToPem(keypair.publicKey)
        if (!this._testmode.data) {
            await MangroveReviews.submitReview(jwt)
        } else {
            console.log("Testmode enabled - not uploading review")
            await Utils.waitFor(1000)
        }
        const reviewWithKid = {
            ...r,
            kid,
            signature: jwt,
            madeByLoggedInUser: new ImmutableStore(true)
        }
        this._reviews.data.push(reviewWithKid)
        this._reviews.ping()
        this._identity.addReview(reviewWithKid)
    }

    /**
     * Adds given reviews to the 'reviews'-UI-eventsource, if they match close enough.
     * We assume only geo-reviews are passed in (as they should be queried using the 'geo'-part)
     * @param reviews
     * @private
     */
    private addReviews(
        reviews: { payload: Review; kid: string; signature: string }[],
        expectedName: string
    ) {
        const alreadyKnown = new Set(this._reviews.data.map((r) => r.rating + " " + r.opinion))

        let hasNew = false
        for (const reviewData of reviews) {
            const review = reviewData.payload

            try {
                const url = new URL(review.sub)
                if (url.protocol !== "geo:") {
                    continue
                }
                const coordinate = <[number, number]>url.pathname.split(",").map((n) => Number(n))
                const distance = GeoOperations.distanceBetween([this._lat, this._lon], coordinate)
                if (distance > this._uncertainty) {
                    continue
                }
                const nameUrl = url.searchParams.get("q")
                const distanceName =
                    Utils.levenshteinDistance(nameUrl.toLowerCase(), expectedName.toLowerCase()) /
                    expectedName.length

                if (distanceName > 0.25) {
                    // Then name is wildly different
                    continue
                }
            } catch (e) {
                console.warn(e)
                // Not a valid URL, ignore this review
                continue
            }

            const key = review.rating + " " + review.opinion
            if (alreadyKnown.has(key)) {
                continue
            }
            this._reviews.data.push({
                ...review,
                kid: reviewData.kid,
                signature: reviewData.signature,
                madeByLoggedInUser: this._identity.getKeyId().map((user_key_id) => {
                    return reviewData.kid === user_key_id
                })
            })
            hasNew = true
        }
        if (hasNew) {
            this._reviews.data.sort((a, b) => b.iat - a.iat) // Sort with most recent first

            this._reviews.ping()
        }
    }

    /**
     * Gets an URI which represents the item in a mangrove-compatible way
     *
     * See https://mangrove.reviews/standard#mangrove-core-uri-schemes
     */
    private ConstructSubjectUri(dontEncodeName: boolean = false): Store<string> {
        // https://www.rfc-editor.org/rfc/rfc5870#section-3.4.2
        // `u` stands for `uncertainty`, https://www.rfc-editor.org/rfc/rfc5870#section-3.4.3
        return this._name.map((name) => {
            let uri = `geo:${this._lat},${this._lon}?u=${Math.round(this._uncertainty)}`
            if (name) {
                uri += "&q=" + (dontEncodeName ? name : encodeURIComponent(name))
            } else if (this._uncertainty > 1000) {
                console.error(
                    "Not fetching reviews. Only got a point and a very big uncertainty range (" +
                    this._uncertainty +
                    "), so you'd probably only get garbage. Specify a name"
                )
                return undefined
            }
            return uri
        })
    }
}
