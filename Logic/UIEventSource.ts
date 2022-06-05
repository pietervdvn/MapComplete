import {Utils} from "../Utils";

/**
 * Various static utils
 */
export class Stores {
    public static Chronic(millis: number, asLong: () => boolean = undefined): Store<Date> {
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

    public static FromPromiseWithErr<T>(promise: Promise<T>): Store<{ success: T } | { error: any }>{
        return UIEventSource.FromPromiseWithErr(promise);
    }

    /**
     * Converts a promise into a UIVentsource, sets the UIEVentSource when the result is calculated.
     * If the promise fails, the value will stay undefined
     * @param promise
     * @constructor
     */
    public static FromPromise<T>(promise: Promise<T>): Store<T> {
        const src = new UIEventSource<T>(undefined)
        promise?.then(d => src.setData(d))
        promise?.catch(err => console.warn("Promise failed:", err))
        return src
    }

    public static flatten<X>(source: Store<Store<X>>, possibleSources?: Store<any>[]): Store<X> {
        return UIEventSource.flatten(source, possibleSources);
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
    public static ListStabilized<T>(src: Store<T[]>): Store<T[]> {

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
}

export abstract class Store<T> {
    abstract readonly data: T;

    /**
     * OPtional value giving a title to the UIEventSource, mainly used for debugging
     */
    public readonly tag: string | undefined;
    

    constructor(tag: string = undefined) {
        this.tag = tag;
        if ((tag === undefined || tag === "")) {
            let createStack = Utils.runningFromConsole;
            if(!Utils.runningFromConsole) {
                createStack = window.location.hostname === "127.0.0.1"
            }
            if(createStack) {
                const callstack = new Error().stack.split("\n")
                this.tag = callstack[1]
            }
        }
    }

    abstract map<J>(f: ((t: T) => J)): Store<J>
    abstract map<J>(f: ((t: T) => J), extraStoresToWatch: Store<any>[]): Store<J>

    /**
     * Add a callback function which will run on future data changes
     */
    abstract addCallback(callback: (data: T) => void);

    /**
     * Adds a callback function, which will be run immediately.
     * Only triggers if the current data is defined
     */
    abstract addCallbackAndRunD(callback: (data: T) => void);

    /**
     * Add a callback function which will run on future data changes
     * Only triggers if the data is defined
     */
    abstract addCallbackD(callback: (data: T) => void);

    /**
     * Adds a callback function, which will be run immediately.
     * Only triggers if the current data is defined
     */
    abstract addCallbackAndRun(callback: (data: T) => void);

    public withEqualityStabilized(comparator: (t: T | undefined, t1: T | undefined) => boolean): Store<T> {
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
     * Monadic bind function
     */
    public bind<X>(f: ((t: T) => Store<X>)): Store<X> {
        const mapped = this.map(f)
        const sink = new UIEventSource<X>(undefined)
        const seenEventSources = new Set<Store<X>>();
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

    public stabilized(millisToStabilize): Store<T> {
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
    public AsPromise(condition?: ((t: T) => boolean)): Promise<T> {
        const self = this;
        condition = condition ?? (t => t !== undefined)
        return new Promise((resolve) => {
            if (condition(self.data)) {
                resolve(self.data)
            } else {
                self.addCallbackD(data => {
                    resolve(data)
                    return true; // return true to unregister as we only need to be called once
                })
            }
        })
    }
    
}

export class ImmutableStore<T> extends Store<T> {
    public readonly data: T;

    constructor(data: T) {
        super();
        this.data = data;
    }

    addCallback(callback: (data: T) => void) {
        // pass: data will never change
    }

    addCallbackAndRun(callback: (data: T) => void) {
        callback(this.data)
        // no callback registry: data will never change
    }

    addCallbackAndRunD(callback: (data: T) => void) {
        if(this.data !== undefined){
            callback(this.data)
        }
        // no callback registry: data will never change
    }

    addCallbackD(callback: (data: T) => void) {
        // pass: data will never change
    }


    map<J>(f: (t: T) => J): ImmutableStore<J> {
        return new ImmutableStore<J>(f(this.data));
    }

}


export class UIEventSource<T> extends Store<T> {

    private static allSources: UIEventSource<any>[] = UIEventSource.PrepPerf();
    public data: T;
    private _callbacks: ((t: T) => (boolean | void | any)) [] = [];

    constructor(data: T, tag: string = "") {
        super(tag);
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

    public static flatten<X>(source: Store<Store<X>>, possibleSources?: Store<any>[]): UIEventSource<X> {
        const sink = new UIEventSource<X>(source.data?.data);

        source.addCallback((latestData) => {
            sink.setData(latestData?.data);
            latestData.addCallback(data => {
                if (source.data !== latestData) {
                    return true;
                }
                sink.setData(data)
            })
        });

        for (const possibleSource of possibleSources ?? []) {
            possibleSource?.addCallback(() => {
                sink.setData(source.data?.data);
            })
        }

        return sink;
    }

    /**
     * Converts a promise into a UIVentsource, sets the UIEVentSource when the result is calculated.
     * If the promise fails, the value will stay undefined, but 'onError' will be called
     */
    public static FromPromise<T>(promise: Promise<T>, onError :( (e: any) => void) = undefined): UIEventSource<T> {
        const src = new UIEventSource<T>(undefined)
        promise?.then(d => src.setData(d))
        promise?.catch(err => {
            if(onError !== undefined){
                onError(err)
            }else{
                console.warn("Promise failed:", err);
            }
        })
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

    public static asFloat(source: UIEventSource<string>): UIEventSource<number> {
        return source.sync(
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
        let startTime = new Date().getTime() / 1000;
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
        let endTime = new Date().getTime() / 1000
        if ((endTime - startTime) > 500) {
            console.trace("Warning: a ping of ", this.tag, " took more then 500ms; this is probably a performance issue")
        }
        if (toDelete !== undefined) {
            for (const toDeleteElement of toDelete) {
                this._callbacks.splice(this._callbacks.indexOf(toDeleteElement), 1)
            }
        }
    }

    /**
     * Monoidal map which results in a read-only store
     * Given a function 'f', will construct a new UIEventSource where the contents will always be "f(this.data)'
     * @param f: The transforming function
     * @param extraSources: also trigger the update if one of these sources change
     */
    public map<J>(f: ((t: T) => J),
                   extraSources: Store<any>[] = []): Store<J> {
        const self = this;

        const stack = new Error().stack.split("\n");
        const callee = stack[1]

        const newSource = new UIEventSource<J>(
            f(this.data),
            "map(" + this.tag + ")@" + callee
        );

        const update = function () {
            newSource.setData(f(self.data));
            return false;
        }

        this.addCallback(update);
        for (const extraSource of extraSources) {
            extraSource?.addCallback(update);
        }

        return newSource;
    }
    
    /**
     * Two way sync with functions in both directions
     * Given a function 'f', will construct a new UIEventSource where the contents will always be "f(this.data)'
     * @param f: The transforming function
     * @param extraSources: also trigger the update if one of these sources change
     * @param g: a 'backfunction to let the sync run in two directions. (data of the new UIEVEntSource, currentData) => newData
     * @param allowUnregister: if set, the update will be halted if no listeners are registered
     */
    public sync<J>(f: ((t: T) => J),
                  extraSources: Store<any>[],
                  g: ((j: J, t: T) => T) ,
                  allowUnregister = false): UIEventSource<J> {
        const self = this;

        const stack = new Error().stack.split("\n");
        const callee = stack[1]

        const newSource = new UIEventSource<J>(
            f(this.data),
            "map(" + this.tag + ")@" + callee
        );

        const update = function () {
            newSource.setData(f(self.data));
            return allowUnregister && newSource._callbacks.length === 0
        }

        this.addCallback(update);
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
        if (reverseOverride) {
            if (otherSource.data !== undefined) {
                this.setData(otherSource.data);
            }
        } else if (this.data === undefined) {
            this.setData(otherSource.data);
        } else {
            otherSource.setData(this.data);
        }
        return this;
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