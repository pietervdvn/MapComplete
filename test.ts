//*

import {ImageCarousel} from "./UI/Image/ImageCarousel";
import {UIEventSource} from "./Logic/UIEventSource";

const images = new UIEventSource<{ url: string, key: string }[]>(
    [{url: "https://2.bp.blogspot.com/-fQiZkz9Zlzg/T_xe2X2Ia3I/AAAAAAAAA0Q/VPS8Mb8xtIQ/s1600/cat+15.jpg", key: "image:1"},
        {
            url: "https://www.mapillary.com/map/im/VEOhKqPcJMuT4F2olz_wHQ",
            key: "mapillary"
        },
        {url: "https://i.imgur.com/mWlghx0.jpg", key: "image:1"}])
new ImageCarousel(images, new UIEventSource<any>({"image:1":"https://2.bp.blogspot.com/-fQiZkz9Zlzg/T_xe2X2Ia3I/AAAAAAAAA0Q/VPS8Mb8xtIQ/s1600/cat+15.jpg"}))
    .AttachTo("maindiv")    

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