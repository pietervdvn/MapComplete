//*
import MangroveReviews from "./Logic/Web/MangroveReviews";
import ReviewElement from "./UI/ReviewElement";

const review = MangroveReviews.GetReviewsFor(3.22000, 51.21576, "Pietervdvn Software Consultancy")
new ReviewElement(review).AttachTo("maindiv");
/*
mangrove.getReviews({sub: 'geo:,?q=&u=15'}).then(
    (data) => {
        for (const review of data.reviews) {
            console.log(review.payload);
            // .signature
            // .kid
            // .jwt
        }
    }
);*/

/*
mangrove.generateKeypair().then(
    keypair => {
        mangrove.keypairToJwk(keypair).then(jwk => {
            console.log(jwk)
            //   const restoredKeypair = await mangrove.jwkToKeypair(jwk).
// Sign and submit a review (reviews of this example subject are removed from the database).
            mangrove.signAndSubmitReview(keypair, {
                // Lat,lon!
                sub: "geo:51.21576,3.22000?q=Pietervdvn Software Consultancy&u=15",
                rating: 100,
                opinion: "Excellent knowledge about OSM",
                metadata: {
                    nickname: "Pietervdvn",
                }
            })
        })
    }
)
*/

/*
// Given by a particular user since certain time.
const userReviews = await getReviews({
    kid: '-----BEGIN PUBLIC KEY-----MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEDo6mN4kY6YFhpvF0u3hfVWD1RnDElPweX3U3KiUAx0dVeFLPAmeKdQY3J5agY3VspnHo1p/wH9hbZ63qPbCr6g==-----END PUBLIC KEY-----',
    gt_iat: 1580860800
})*/


/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";


function generateStats(action: (stats: string) => void) {
    // Binary searches the latest changeset
    function search(lowerBound: number,
                    upperBound: number,
                    onCsFound: ((id: number, lastDate: Date) => void),
                    depth = 0) {
        if (depth > 30) {
            return;
        }
        const tested = Math.floor((lowerBound + upperBound) / 2);
        console.log("Testing", tested)
        Utils.changesetDate(tested, (createdAtDate: Date) => {
            new FixedUiElement(`Searching, value between ${lowerBound} and ${upperBound}. Queries till now: ${depth}`).AttachTo('maindiv')
            if (lowerBound + 1 >= upperBound) {
                onCsFound(lowerBound, createdAtDate);
                return;
            }
            if (createdAtDate !== undefined) {
                search(tested, upperBound, onCsFound, depth + 1)
            } else {
                search(lowerBound, tested, onCsFound, depth + 1);
            }
        })

    }


    search(91000000, 100000000, (last, lastDate: Date) => {
            const link = "http://osm.org/changeset/" + last;

            const delta = 100000;

            Utils.changesetDate(last - delta, (prevDate) => {


                const diff = (lastDate.getTime() - prevDate.getTime()) / 1000;

                // Diff: seconds needed/delta changesets
                const secsPerCS = diff / delta;

                const stillNeeded = 1000000 - (last % 1000000);
                const timeNeededSeconds = Math.floor(secsPerCS * stillNeeded);

                const secNeeded = timeNeededSeconds % 60;
                const minNeeded = Math.floor(timeNeededSeconds / 60) % 60;
                const hourNeeded = Math.floor(timeNeededSeconds / (60 * 60)) % 24;
                const daysNeeded = Math.floor(timeNeededSeconds / (24 * 60 * 60));

                const result = `Last changeset: <a href='${link}'>${link}</a><br/>We needed ${(Math.floor(diff / 60))} minutes for the last ${delta} changesets.<br/>
This is around ${secsPerCS} seconds/changeset.<br/> The next million (still ${stillNeeded} away) will be broken in around ${daysNeeded} days ${hourNeeded}:${minNeeded}:${secNeeded}`
                action(result);
            })

        }
    );

}

generateStats((stats) => {
    new FixedUiElement(stats).AttachTo('maindiv')
})


//*/