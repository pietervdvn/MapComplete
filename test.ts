//*
import MangroveReviews from "./Logic/Web/MangroveReviews";
import ReviewElement from "./UI/Reviews/ReviewElement";
import {UIEventSource} from "./Logic/UIEventSource";
import ReviewForm from "./UI/Reviews/ReviewForm";
import Combine from "./UI/Base/Combine";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

const identity = '{"crv":"P-256","d":"6NHPmTFRedjNl-ZfLRAXhOaNKtRR9GYzPHsO1CzN5wQ","ext":true,"key_ops":["sign"],"kty":"EC","x":"Thm_pL5m0m9Jl41z9vgMTHNyja-9H58v0stJWT4KhTI","y":"PjBldCW85b8K6jEZbw0c2UZskpo-rrkwfPnD7s1MXSM","metadata":"Mangrove private key"}'

const mangroveReviews = new MangroveReviews(0, 0, "Null Island",
    new UIEventSource<string>(identity), true)

new ReviewElement(mangroveReviews.GetSubjectUri(), mangroveReviews.GetReviews()).AttachTo("maindiv");
const form = new ReviewForm((r,done) => {
    mangroveReviews.AddReview(r, done);
});
form.AttachTo("extradiv")

form.GetValue().map(r => form.IsValid(r)).addCallback(d => console.log(d))

/*
window.setTimeout(
    () => {
mangroveReviews.AddReview({
    comment: "These are liars - not even an island here!",
    author: "Lost Tourist",
    date: new Date(),
    affiliated: false,
    rating: 10
}, (() => {alert("Review added");return undefined;}));
        
    }, 1000
)

window.setTimeout(
    () => {
        mangroveReviews.AddReview({
            comment: "Excellent conditions to measure weather!!",
            author: "Weather-Boy",
            date: new Date(),
            affiliated: true,
            rating: 90
        }, (() => {
            alert("Review added");
            return undefined;
        }));

    }, 1000
)
*/
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