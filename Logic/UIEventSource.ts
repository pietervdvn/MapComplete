import {Utils} from "../Utils";

export class UIEventSource<T> {

    private static allSources: UIEventSource<any>[] = UIEventSource.PrepPerf();
    public data: T;
    public trace: boolean;
    private readonly tag: string;
    private _callbacks: ((t: T) => (boolean | void | any)) [] = [];

    constructor(data: T, tag: string = "") {
        this.tag = tag;
        this.data = data;
        UIEventSource.allSources.push(this);
    }

    static PrepPerf(): UIEventSource<any>[] {
        if (Utils.runningFromConsole) {
            return [];
        }
        // @ts-ignore
        window.mapcomplete_performance = () => {
            console.log(UIEventSource.allSources.length, "uieventsources created");
            const copy = [...UIEventSource.allSources];
            copy.sort((a, b) => b._callbacks.length - a._callbacks.length);
            console.log("Topten is:")
            for (let i = 0; i < 10; i++) {
                console.log(copy[i].tag, copy[i]);
            }
            return UIEventSource.allSources;
        }
        return [];
    }

    public static flatten<X>(source: UIEventSource<UIEventSource<X>>, possibleSources: UIEventSource<any>[]): UIEventSource<X> {
        const sink = new UIEventSource<X>(source.data?.data);

        source.addCallback((latestData) => {
            sink.setData(latestData?.data);
        });

        for (const possibleSource of possibleSources) {
            possibleSource?.addCallback(() => {
                sink.setData(source.data?.data);
            })
        }

        return sink;
    }

    public static Chronic(millis: number, asLong: () => boolean = undefined): UIEventSource<Date> {
        const source = new UIEventSource<Date>(undefined);

        function run() {
            source.setData(new Date());
            if (asLong === undefined || asLong()) {
                window.setTimeout(run, millis);
            }
        }

        run();
        return source;

    }

    /**
     * Adds a callback
     *
     * If the result of the callback is 'true', the callback is considered finished and will be removed again
     * @param callback
     */
    public addCallback(callback: ((latestData: T) => (boolean | void | any))): UIEventSource<T> {
        if (callback === console.log) {
            // This ^^^ actually works!
            throw "Don't add console.log directly as a callback - you'll won't be able to find it afterwards. Wrap it in a lambda instead."
        }
        if (this.trace) {
            console.trace("Added a callback")
        }
        this._callbacks.push(callback);
        return this;
    }

    public addCallbackAndRun(callback: ((latestData: T) => void)): UIEventSource<T> {
        callback(this.data);
        return this.addCallback(callback);
    }

    public setData(t: T): UIEventSource<T> {
        if (this.data == t) { // MUST COMPARE BY REFERENCE!
            return;
        }
        this.data = t;
        this.ping();
        return this;
    }

    public ping(): void {
        let toDelete = undefined
        for (const callback of this._callbacks) {
            if (callback(this.data) === true) {
                // This callback wants to be deleted
                if (toDelete === undefined) {
                    toDelete = [callback]
                } else {
                    toDelete.push(callback)
                }
            }
        }
        if (toDelete !== undefined) {
            for (const toDeleteElement of toDelete) {
                this._callbacks.splice(this._callbacks.indexOf(toDeleteElement), 1)
            }
        }
    }

    /**
     * Monoidal map:
     * Given a function 'f', will construct a new UIEventSource where the contents will always be "f(this.data)'
     * @param f: The transforming function
     * @param extraSources: also trigger the update if one of these sources change
     * @param g: a 'backfunction to let the sync run in two directions. (data of the new UIEVEntSource, currentData) => newData
     */
    public map<J>(f: ((t: T) => J),
                  extraSources: UIEventSource<any>[] = [],
                  g: ((j: J, t: T) => T) = undefined): UIEventSource<J> {
        const self = this;

        const newSource = new UIEventSource<J>(
            f(this.data),
            "map(" + this.tag + ")"
        );

        const update = function () {
            newSource.setData(f(self.data));
        }

        this.addCallbackAndRun(update);
        for (const extraSource of extraSources) {
            extraSource?.addCallback(update);
        }

        if (g !== undefined) {
            newSource.addCallback((latest) => {
                self.setData(g(latest, self.data));
            })
        }

        return newSource;
    }

    public syncWith(otherSource: UIEventSource<T>, reverseOverride = false): UIEventSource<T> {
        this.addCallback((latest) => otherSource.setData(latest));
        const self = this;
        otherSource.addCallback((latest) => self.setData(latest));
        if (reverseOverride && otherSource.data !== undefined) {
            this.setData(otherSource.data);
        } else if (this.data === undefined) {
            this.setData(otherSource.data);
        } else {
            otherSource.setData(this.data);
        }
        return this;
    }

    public stabilized(millisToStabilize): UIEventSource<T> {

        const newSource = new UIEventSource<T>(this.data);

        let currentCallback = 0;
        this.addCallback(latestData => {
            currentCallback++;
            const thisCallback = currentCallback;
            window.setTimeout(() => {
                if (thisCallback === currentCallback) {
                    newSource.setData(latestData);
                }
            }, millisToStabilize)
        });

        return newSource;
    }

    addCallbackAndRunD(callback: (data: T) => void) {
        this.addCallbackAndRun(data => {
            if (data !== undefined && data !== null) {
              return  callback(data)
            }
        })
    }
}

export class UIEventSourceTools {

    private static readonly _download_cache = new Map<string, UIEventSource<any>>()

    public static downloadJsonCached(url: string): UIEventSource<any>{
        const cached = UIEventSourceTools._download_cache.get(url)
        if(cached !== undefined){
            return cached;
        }
        const src = new UIEventSource<any>(undefined)
        UIEventSourceTools._download_cache.set(url, src)
        Utils.downloadJson(url).then(r => src.setData(r))
        return src;
    }

}