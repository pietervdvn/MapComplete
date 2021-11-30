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
        if(tag === undefined || tag === ""){
            const callstack = new Error().stack.split("\n")
            this.tag = callstack[1]
        }
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

    public static flatten<X>(source: UIEventSource<UIEventSource<X>>, possibleSources?: UIEventSource<any>[]): UIEventSource<X> {
        const sink = new UIEventSource<X>(source.data?.data);

        source.addCallback((latestData) => {
            sink.setData(latestData?.data);
        });

        for (const possibleSource of possibleSources ?? []) {
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
     * Converts a promise into a UIVentsource, sets the UIEVentSource when the result is calculated.
     * If the promise fails, the value will stay undefined
     * @param promise
     * @constructor
     */
    public static FromPromise<T>(promise: Promise<T>): UIEventSource<T> {
        const src = new UIEventSource<T>(undefined)
        promise?.then(d => src.setData(d))
        promise?.catch(err => console.warn("Promise failed:", err))
        return src
    }

    /**
     * Converts a promise into a UIVentsource, sets the UIEVentSource when the result is calculated.
     * If the promise fails, the value will stay undefined
     * @param promise
     * @constructor
     */
    public static FromPromiseWithErr<T>(promise: Promise<T>): UIEventSource<{ success: T } | { error: any }> {
        const src = new UIEventSource<{ success: T } | { error: any }>(undefined)
        promise?.then(d => src.setData({success: d}))
        promise?.catch(err => src.setData({error: err}))
        return src
    }

    /**
     * Given a UIEVentSource with a list, returns a new UIEventSource which is only updated if the _contents_ of the list are different.
     * E.g.
     * const src = new UIEventSource([1,2,3])
     * const stable = UIEventSource.ListStabilized(src)
     * src.addCallback(_ => console.log("src pinged"))
     * stable.addCallback(_ => console.log("stable pinged))
     * src.setDate([...src.data])
     *
     * This will only trigger 'src pinged'
     *
     * @param src
     * @constructor
     */
    public static ListStabilized<T>(src: UIEventSource<T[]>): UIEventSource<T[]> {

        const stable = new UIEventSource<T[]>(src.data)
        src.addCallback(list => {
            if (list === undefined) {
                stable.setData(undefined)
                return;
            }
            const oldList = stable.data
            if (oldList === list) {
                return;
            }
            if (oldList === undefined || oldList.length !== list.length) {
                stable.setData(list);
                return;
            }

            for (let i = 0; i < list.length; i++) {
                if (oldList[i] !== list[i]) {
                    stable.setData(list);
                    return;
                }
            }

            // No actual changes, so we don't do anything
            return;
        })
        return stable
    }

    public static asFloat(source: UIEventSource<string>): UIEventSource<number> {
        return source.map(
            (str) => {
                let parsed = parseFloat(str);
                return isNaN(parsed) ? undefined : parsed;
            },
            [],
            (fl) => {
                if (fl === undefined || isNaN(fl)) {
                    return undefined;
                }
                return ("" + fl).substr(0, 8);
            }
        )
    }

    public AsPromise(): Promise<T> {
        const self = this;
        return new Promise((resolve, reject) => {
            if (self.data !== undefined) {
                resolve(self.data)
            } else {
                self.addCallbackD(data => {
                    resolve(data)
                    return true; // return true to unregister as we only need to be called once
                })
            }
        })
    }

    public WaitForPromise(promise: Promise<T>, onFail: ((any) => void)): UIEventSource<T> {
        const self = this;
        promise?.then(d => self.setData(d))
        promise?.catch(err => onFail(err))
        return this
    }

    public withEqualityStabilized(comparator: (t: T | undefined, t1: T | undefined) => boolean): UIEventSource<T> {
        let oldValue = undefined;
        return this.map(v => {
            if (v == oldValue) {
                return oldValue
            }
            if (comparator(oldValue, v)) {
                return oldValue
            }
            oldValue = v;
            return v;
        })
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

    public addCallbackAndRun(callback: ((latestData: T) => (boolean | void | any))): UIEventSource<T> {
        const doDeleteCallback = callback(this.data);
        if (doDeleteCallback !== true) {
            this.addCallback(callback);
        }
        return this;
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
                // Note: it has to return precisely true in order to avoid accidental deletions
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
     * Monadic bind function
     */
    public bind<X>(f: ((t: T) => UIEventSource<X>)): UIEventSource<X> {
        const mapped = this.map(f)
        const sink = new UIEventSource<X>(undefined)
        const seenEventSources = new Set<UIEventSource<X>>();
        mapped.addCallbackAndRun(newEventSource => {
            if (newEventSource === null) {
                sink.setData(null)
            } else if (newEventSource === undefined) {
                sink.setData(undefined)
            } else if (!seenEventSources.has(newEventSource)) {
                seenEventSources.add(newEventSource)
                newEventSource.addCallbackAndRun(resultData => {
                    if (mapped.data === newEventSource) {
                        sink.setData(resultData);
                    }
                })
            } else {
                // Already seen, so we don't have to add a callback, just update the value
                sink.setData(newEventSource.data)
            }
        })

        return sink;
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

        const stack = new Error().stack.split("\n");
        const callee = stack[1]
        const newSource = new UIEventSource<J>(
            f(this.data),
            "map(" + this.tag + ")@"+callee
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
        if (Utils.runningFromConsole) {
            return this;
        }

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
                return callback(data)
            }
        })
    }

    addCallbackD(callback: (data: T) => void) {
        this.addCallback(data => {
            if (data !== undefined && data !== null) {
                return callback(data)
            }
        })
    }
}