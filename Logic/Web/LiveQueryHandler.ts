
import {UIEventSource} from "../UIEventSource";
import * as $ from "jquery"
/**
 * Fetches data from random data sources, used in the metatagging
 */
export default class LiveQueryHandler {

    private static neededShorthands = {} // url -> (shorthand:paths)[]

    public static FetchLiveData(url: string, shorthands: string[]): UIEventSource<any /* string -> string */> {

        const shorthandsSet: string[] = LiveQueryHandler.neededShorthands[url] ?? []

        for (const shorthand of shorthands) {
            if (shorthandsSet.indexOf(shorthand) < 0) {
                shorthandsSet.push(shorthand);
            }
        }
        LiveQueryHandler.neededShorthands[url] = shorthandsSet;


        if (LiveQueryHandler[url] === undefined) {
            const source = new UIEventSource({});
            LiveQueryHandler[url] = source;

                console.log("Fetching live data from a third-party (unknown) API:",url)
            $.getJSON(url, function (data) {
                for (const shorthandDescription of shorthandsSet) {

                    const descr = shorthandDescription.trim().split(":");
                    const shorthand = descr[0];
                    const path = descr[1];
                    const parts = path.split(".");
                    let trail = data;
                    for (const part of parts) {
                        if (trail !== undefined) {
                            trail = trail[part];
                        }
                    }
                    source.data[shorthand] = trail;
                }
                source.ping();

            })

        }
        return LiveQueryHandler[url];
    }

}