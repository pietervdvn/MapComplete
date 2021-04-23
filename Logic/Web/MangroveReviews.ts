import * as mangrove from 'mangrove-reviews'
import {UIEventSource} from "../UIEventSource";
import {Review} from "./Review";

export class MangroveIdentity {
    public keypair: any = undefined;
    public readonly kid: UIEventSource<string> = new UIEventSource<string>(undefined);
    private readonly _mangroveIdentity: UIEventSource<string>;

    constructor(mangroveIdentity: UIEventSource<string>) {
        const self = this;
        this._mangroveIdentity = mangroveIdentity;
        mangroveIdentity.addCallbackAndRun(str => {
            if (str === undefined || str === "") {
                return;
            }
            mangrove.jwkToKeypair(JSON.parse(str)).then(keypair => {
                self.keypair = keypair;
                mangrove.publicToPem(keypair.publicKey).then(pem => {
                    console.log("Identity loaded")
                    self.kid.setData(pem);
                })
            })
        })
        try {
            if ((mangroveIdentity.data ?? "") === "") {
                this.CreateIdentity();
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
    private CreateIdentity() {
        if ("" !== (this._mangroveIdentity.data ?? "")) {
            throw "Identity already defined - not creating a new one"
        }
        const self = this;
        mangrove.generateKeypair().then(
            keypair => {
                self.keypair = keypair;
                mangrove.keypairToJwk(keypair).then(jwk => {
                    self._mangroveIdentity.setData(JSON.stringify(jwk));
                })
            });
    }

}

export default class MangroveReviews {
    private static _reviewsCache = {};
    private static didWarn = false;
    private readonly _lon: number;
    private readonly _lat: number;
    private readonly _name: string;
    private readonly _reviews: UIEventSource<Review[]> = new UIEventSource<Review[]>([]);
    private _dryRun: boolean;
    private _mangroveIdentity: MangroveIdentity;
    private _lastUpdate: Date = undefined;

    private constructor(lon: number, lat: number, name: string,
                        identity: MangroveIdentity,
                        dryRun?: boolean) {

        this._lon = lon;
        this._lat = lat;
        this._name = name;
        this._mangroveIdentity = identity;
        this._dryRun = dryRun;
        if (dryRun && !MangroveReviews.didWarn) {
            MangroveReviews.didWarn = true;
            console.warn("Mangrove reviews will _not_ be saved as dryrun is specified")
        }

    }

    public static Get(lon: number, lat: number, name: string,
                      identity: MangroveIdentity,
                      dryRun?: boolean) {
        const newReviews = new MangroveReviews(lon, lat, name, identity, dryRun);

        const uri = newReviews.GetSubjectUri();
        const cached = MangroveReviews._reviewsCache[uri];
        if (cached !== undefined) {
            return cached;
        }
        MangroveReviews._reviewsCache[uri] = newReviews;

        return newReviews;
    }

    /**
     * Gets an URI which represents the item in a mangrove-compatible way
     * @constructor
     */
    public GetSubjectUri() {
        let uri = `geo:${this._lat},${this._lon}?u=50`;
        if (this._name !== undefined && this._name !== null) {
            uri += "&q=" + this._name;
        }
        return uri;
    }


    /**
     * Gives a UIEVentsource with all reviews.
     * Note: rating is between 1 and 100
     */
    public GetReviews(): UIEventSource<Review[]> {

        if (this._lastUpdate !== undefined && this._reviews.data !== undefined &&
            (new Date().getTime() - this._lastUpdate.getTime()) < 15000
        ) {
            // Last update was pretty recent
            return this._reviews;
        }
        this._lastUpdate = new Date();

        const self = this;
        mangrove.getReviews({sub: this.GetSubjectUri()}).then(
            (data) => {
                const reviews = [];
                const reviewsByUser = [];
                for (const review of data.reviews) {
                    const r = review.payload;


                    console.log("PublicKey is ", self._mangroveIdentity.kid.data, "reviews.kid is", review.kid);
                    const byUser = self._mangroveIdentity.kid.map(data => data === review.signature);
                    const rev: Review = {
                        made_by_user: byUser,
                        date: new Date(r.iat * 1000),
                        comment: r.opinion,
                        author: r.metadata.nickname,
                        affiliated: r.metadata.is_affiliated,
                        rating: r.rating // percentage points
                    };


                    (rev.made_by_user ? reviewsByUser : reviews).push(rev);
                }
                self._reviews.setData(reviewsByUser.concat(reviews))
            }
        );
        return this._reviews;
    }

    AddReview(r: Review, callback?: (() => void)) {


        callback = callback ?? (() => {
            return undefined;
        });

        const payload = {
            sub: this.GetSubjectUri(),
            rating: r.rating,
            opinion: r.comment,
            metadata: {
                nickname: r.author,
            }
        };
        if (r.affiliated) {
            // @ts-ignore
            payload.metadata.is_affiliated = true;
        }
        if (this._dryRun) {
            console.warn("DRYRUNNING mangrove reviews: ", payload);
            if (callback) {
                if (callback) {
                    callback();
                }
                this._reviews.data.push(r);
                this._reviews.ping();

            }
        } else {
            mangrove.signAndSubmitReview(this._mangroveIdentity.keypair, payload).then(() => {
                if (callback) {
                    callback();
                }
                this._reviews.data.push(r);
                this._reviews.ping();

            })
        }


    }


}