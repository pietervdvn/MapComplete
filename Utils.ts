import {UIElement} from "./UI/UIElement";
import * as $ from "jquery"
import {FixedUiElement} from "./UI/Base/FixedUiElement";

export class Utils {


    static EncodeXmlValue(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
    }

    /**
     * Gives a clean float, or undefined if parsing fails
     * @param str
     */
    static asFloat(str): number {
        if (str) {
            const i = parseFloat(str);
            if (isNaN(i)) {
                return undefined;
            }
            return i;
        }
        return undefined;
    }

    public static Upper(str: string) {
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    }

    public static TwoDigits(i: number) {
        if (i < 10) {
            return "0" + i;
        }
        return "" + i;
    }

    public static Round(i: number) {
        if(i < 0){
            return "-" + Utils.Round(-i);
        }
        const j = "" + Math.floor(i * 10);
        if (j.length == 1) {
            return "0." + j;
        }
        return j.substr(0, j.length - 1) + "." + j.substr(j.length - 1, j.length);
    }

    public static Times(f: ((i: number) => string), count: number): string {
        let res = "";
        for (let i = 0; i < count; i++) {
            res += f(i);
        }
        return res;
    }

    static DoEvery(millis: number, f: (() => void)) {
        if (UIElement.runningFromConsole) {
            return;
        }
        window.setTimeout(
            function () {
                f();
                Utils.DoEvery(millis, f);
            }
            , millis)
    }

    public static NoNull<T>(array: T[]): T[] {
        const ls: T[] = [];
        for (const t of array) {
            if (t === undefined || t === null) {
                continue;
            }
            ls.push(t);
        }
        return ls;
    }
    
    public static NoEmpty(array: string[]): string[]{
        const ls: string[] = [];
        for (const t of array) {
            if (t === "") {
                continue;
            }
            ls.push(t);
        }
        return ls;
    }

    public static EllipsesAfter(str : string, l : number = 100){
        if(str === undefined){
            return undefined;
        }
        if(str.length <= l){
            return str;
        }
        return str.substr(0, l - 3)+"...";
    }
    
    public static Dedup(arr: string[]):string[]{
        if(arr === undefined){
            return undefined;
        }
        const newArr = [];
        for (const string of arr) {
            if (newArr.indexOf(string) < 0) {
                newArr.push(string);
            }
        }
        return newArr;
    }

    public static MergeTags(a: any, b: any) {
        const t = {};
        for (const k in a) {
            t[k] = a[k];
        }
        for (const k in b) {
            t[k] = b[k];
        }
        return t;
    }

    public static SplitFirst(a: string, sep: string): string[] {
        const index = a.indexOf(sep);
        if (index < 0) {
            return [a];
        }
        return [a.substr(0, index), a.substr(index + sep.length)];
    }

    public static isRetina(): boolean {
        if (UIElement.runningFromConsole) {
            return;
        }
        // The cause for this line of code: https://github.com/pietervdvn/MapComplete/issues/115
        // See https://stackoverflow.com/questions/19689715/what-is-the-best-way-to-detect-retina-support-on-a-device-using-javascript
        return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2));
    }

    // Date will be undefined on failure
    public static changesetDate(id: number, action: ((isFound: Date) => void)): void {
        $.getJSON("https://www.openstreetmap.org/api/0.6/changeset/" + id,
            function (data) {
                console.log(data)
                action(new Date(data.elements[0].created_at));
            })
            .fail(() => {
                action(undefined);
            });

    }

    public static generateStats(action:(stats:string) => void) {
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

}
