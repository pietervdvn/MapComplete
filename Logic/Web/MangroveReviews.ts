import * as mangrove from 'mangrove-reviews'
import {UIEventSource} from "../UIEventSource";

export default class MangroveReviews {

    constructor() {
    }

    /**
     * Gives a UIEVentsource with all reviews.
     * Note: rating is between 1 and 100
     */
    public static GetReviewsFor(lon: number, lat: number, name: string): UIEventSource<{
        comment?: string,
        author: string,
        date: Date,
        rating: number
    }[]> {

        let uri = `geo:${lat},${lon}?u=50`;
        if (name !== undefined && name !== null) {
            uri += "&q=" + name;
        }
        const reviewsSource : UIEventSource< {
            comment?: string,
            author: string,
            date: Date,
            rating: number
        }[]> = new UIEventSource([]);
        
        mangrove.getReviews({sub: uri}).then(
            (data) => {
                const reviews = [{
                    date: new Date(),
                    comment: "Short",
                    rating: 1,
                    author: "Troll"
                },{
                    date: new Date(),
                    comment: "Not good",
                    rating: 10,
                    author: "Troll"
                },{
                    date: new Date(),
                    comment: "Not soo good",
                    rating: 20,
                    author: "Troll"
                },{
                    date: new Date(),
                    comment: "Meh",
                    rating: 30,
                    author: "Troll"
                },
                    {
                    date: new Date(),
                    comment: "Lorum ipsum lorem qsmldkfj qsdfmqmsd qmlsdmlkjazmeliq dmqlsdkf amldkfjqmlskdbmaize qsmdl fka mqlsnkd azie qmxbilqmslef amlzdf qsmdlfk afdml kqbnqsdlkf m",
                    rating: 50,
                    author: "Troll"
                }];
                for (const review of data.reviews) {
                    const r = review.payload;
                    reviews.push({
                        date: new Date(r.iat * 1000),
                        comment: r.opinion,
                        author: r.metadata.nickname,
                        rating: r.rating // percentage points
                    })
                }
                reviewsSource.setData(reviews)
            }
        );
        return reviewsSource;
    }


}