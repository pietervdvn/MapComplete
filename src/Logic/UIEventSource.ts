import { Utils } from "../Utils"
import { Readable, Subscriber, Unsubscriber, Updater, Writable } from "svelte/store"

/**
 * Various static utils
 */
export class Stores {
    public static Chronic(millis: number, asLong: () => boolean = undefined): Store<Date> {
        const source = new UIEventSource<Date>(undefined)

        function run() {
            source.setData(new Date())
            if (Utils.runningFromConsole) {
                return
            }
            if (asLong === undefined || asLong()) {
                window.setTimeout(run, millis)
            }
        }

        run()
        return source
    }

    public static FromPromiseWithErr<T>(
        promise: Promise<T>
    ): Store<{ success: T } | { error: any }> {
        return UIEventSource.FromPromiseWithErr(promise)
    }

    /**
     * Converts a promise into a UIVentsource, sets the UIEVentSource when the result is calculated.
     * If the promise fails, the value will stay undefined
     * @param promise
     * @constructor
     */
    public static FromPromise<T>(promise: Promise<T>): Store<T | undefined> {
        const src = new UIEventSource<T>(undefined)
        promise?.then((d) => src.setData(d))
        promise?.catch((err) => console.warn("Promise failed:", err))
        return src
    }

    public static flatten<X>(source: Store<Store<X>>, possibleSources?: Store<any>[]): Store<X> {
        return UIEventSource.flatten(source, possibleSources)
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
        const stable = new UIEventSource<T[]>(undefined)
        src.addCallbackAndRun((list) => {
            if (list === undefined) {
                stable.setData(undefined)
                return
            }
            if (Utils.sameList(stable.data, list)) {
                return
            }
            stable.setData(list)
        })
        return stable
    }
}

export abstract class Store<T> implements Readable<T> {
    abstract readonly data: T

    /**
     * Optional value giving a title to the UIEventSource, mainly used for debugging
     */
    public readonly tag: string | undefined

    constructor(tag: string = undefined) {
        this.tag = tag
        if (tag === undefined || tag === "") {
            let createStack = Utils.runningFromConsole
            if (!Utils.runningFromConsole) {
                createStack = window.location.hostname === "127.0.0.1"
            }
            if (createStack) {
                const callstack = new Error().stack.split("\n")
                this.tag = callstack[1]
            }
        }
    }

    abstract map<J>(f: (t: T) => J): Store<J>
    abstract map<J>(f: (t: T) => J, extraStoresToWatch: Store<any>[]): Store<J>
    abstract map<J>(
        f: (t: T) => J,
        extraStoresToWatch: Store<any>[],
        callbackDestroyFunction: (f: () => void) => void
    ): Store<J>
    M
    public mapD<J>(
        f: (t: Exclude<T, undefined | null>) => J,
        extraStoresToWatch?: Store<any>[],
        callbackDestroyFunction?: (f: () => void) => void
    ): Store<J> {
        return this.map((t) => {
            if (t === undefined) {
                return undefined
            }
            if (t === null) {
                return null
            }
            return f(<Exclude<T, undefined | null>>t)
        }, extraStoresToWatch)
    }

    /**
     * Add a callback function which will run on future data changes
     */
    abstract addCallback(callback: (data: T) => void): () => void

    /**
     * Adds a callback function, which will be run immediately.
     * Only triggers if the current data is defined
     */
    abstract addCallbackAndRunD(callback: (data: T) => void): () => void

    /**
     * Add a callback function which will run on future data changes
     * Only triggers if the data is defined
     */
    abstract addCallbackD(callback: (data: T) => void): () => void

    /**
     * Adds a callback function, which will be run immediately.
     * Only triggers if the current data is defined
     */
    abstract addCallbackAndRun(callback: (data: T) => void): () => void

    public withEqualityStabilized(
        comparator: (t: T | undefined, t1: T | undefined) => boolean
    ): Store<T> {
        let oldValue = undefined
        return this.map((v) => {
            if (v == oldValue) {
                return oldValue
            }
            if (comparator(oldValue, v)) {
                return oldValue
            }
            oldValue = v
            return v
        })
    }

    /**
     * Monadic bind function
     *
     * // simple test with bound and immutablestores
     * const src = new UIEventSource<number>(3)
     * const bound = src.bind(i => new ImmutableStore(i * 2))
     * let lastValue = undefined;
     * bound.addCallbackAndRun(v => lastValue = v);
     * lastValue // => 6
     * src.setData(21)
     * lastValue // => 42
     *
     * // simple test with bind over a mapped value
     * const src = new UIEventSource<number>(0)
     * const srcs : UIEventSource<string>[] = [new UIEventSource<string>("a"), new UIEventSource<string>("b")]
     * const bound = src.map(i => -i).bind(i => srcs[i])
     * let lastValue : string = undefined;
     * bound.addCallbackAndRun(v => lastValue = v);
     * lastValue // => "a"
     * src.setData(-1)
     * lastValue // => "b"
     * srcs[1].setData("xyz")
     * lastValue // => "xyz"
     * srcs[0].setData("def")
     * lastValue // => "xyz"
     * src.setData(0)
     * lastValue // => "def"
     *
     *
     *
     * // advanced test with bound
     * const src = new UIEventSource<number>(0)
     * const srcs : UIEventSource<string>[] = [new UIEventSource<string>("a"), new UIEventSource<string>("b")]
     * const bound = src.bind(i => srcs[i])
     * let lastValue : string = undefined;
     * bound.addCallbackAndRun(v => lastValue = v);
     * lastValue // => "a"
     * src.setData(1)
     * lastValue // => "b"
     * srcs[1].setData("xyz")
     * lastValue // => "xyz"
     * srcs[0].setData("def")
     * lastValue // => "xyz"
     * src.setData(0)
     * lastValue // => "def"
     */
    public bind<X>(f: (t: T) => Store<X>): Store<X> {
        const mapped = this.map(f)
        const sink = new UIEventSource<X>(undefined)
        const seenEventSources = new Set<Store<X>>()
        mapped.addCallbackAndRun((newEventSource) => {
            if (newEventSource === null) {
                sink.setData(null)
                return
            }
            if (newEventSource === undefined) {
                sink.setData(undefined)
                return
            }
            if (seenEventSources.has(newEventSource)) {
                // Already seen, so we don't have to add a callback, just update the value
                sink.setData(newEventSource.data)
                return
            }
            seenEventSources.add(newEventSource)
            newEventSource.addCallbackAndRun((resultData) => {
                if (mapped.data === newEventSource) {
                    sink.setData(resultData)
                }
            })
        })

        return sink
    }

    public bindD<X>(f: (t: Exclude<T, undefined | null>) => Store<X>): Store<X> {
        return this.bind((t) => {
            if (t === null) {
                return null
            }
            if (t === undefined) {
                return undefined
            }
            return f(<Exclude<T, undefined | null>>t)
        })
    }
    public stabilized(millisToStabilize): Store<T> {
        if (Utils.runningFromConsole) {
            return this
        }

        const newSource = new UIEventSource<T>(this.data)

        const self = this
        this.addCallback((latestData) => {
            window.setTimeout(() => {
                if (self.data == latestData) {
                    // compare by reference.
                    // Note that 'latestData' and 'self.data' are both from the same UIEVentSource, but both are dereferenced at a different time
                    newSource.setData(latestData)
                }
            }, millisToStabilize)
        })

        return newSource
    }

    /**
     * Converts the uiEventSource into a promise.
     * The promise will return the value of the store if the given condition evaluates to true
     * @param condition an optional condition, default to 'store.value !== undefined'
     * @constructor
     */
    public AsPromise(condition?: (t: T) => boolean): Promise<T> {
        const self = this
        condition = condition ?? ((t) => t !== undefined)
        return new Promise((resolve) => {
            const data = self.data
            if (condition(data)) {
                resolve(data)
            } else {
                self.addCallbackD((data) => {
                    if (condition(data)) {
                        resolve(data)
                        return true // return true to unregister as we only need to be called once
                    } else {
                        return false // We didn't resolve yet, wait for the next ping
                    }
                })
            }
        })
    }

    /**
     * Same as 'addCallbackAndRun', added to be compatible with Svelte
     */
    public subscribe(run: Subscriber<T> & ((value: T) => void), _?): Unsubscriber {
        // We don't need to do anything with 'invalidate', see
        // https://github.com/sveltejs/svelte/issues/3859

        // Note: run is wrapped in an anonymous function. 'Run' returns the value. If this value happens to be true, it would unsubscribe
        return this.addCallbackAndRun((v) => {
            run(v)
        })
    }
}

export class ImmutableStore<T> extends Store<T> {
    public readonly data: T
    static FALSE = new ImmutableStore<boolean>(false)
    static TRUE = new ImmutableStore<boolean>(true)
    constructor(data: T) {
        super()
        this.data = data
    }

    private static readonly pass: () => void = () => {}

    addCallback(_: (data: T) => void): () => void {
        // pass: data will never change
        return ImmutableStore.pass
    }

    addCallbackAndRun(callback: (data: T) => void): () => void {
        callback(this.data)
        // no callback registry: data will never change
        return ImmutableStore.pass
    }

    addCallbackAndRunD(callback: (data: T) => void): () => void {
        if (this.data !== undefined) {
            callback(this.data)
        }
        // no callback registry: data will never change
        return ImmutableStore.pass
    }

    addCallbackD(_: (data: T) => void): () => void {
        // pass: data will never change
        return ImmutableStore.pass
    }

    map<J>(
        f: (t: T) => J,
        extraStores: Store<any>[] = undefined,
        ondestroyCallback?: (f: () => void) => void
    ): ImmutableStore<J> {
        if (extraStores?.length > 0) {
            return new MappedStore(this, f, extraStores, undefined, f(this.data), ondestroyCallback)
        }
        return new ImmutableStore<J>(f(this.data))
    }
}

/**
 * Keeps track of the callback functions
 */
class ListenerTracker<T> {
    public pingCount = 0
    private readonly _callbacks: ((t: T) => boolean | void | any)[] = []

    /**
     * Adds a callback which can be called; a function to unregister is returned
     */
    public addCallback(callback: (t: T) => boolean | void | any): () => void {
        if (callback === console.log) {
            // This ^^^ actually works!
            throw "Don't add console.log directly as a callback - you'll won't be able to find it afterwards. Wrap it in a lambda instead."
        }
        this._callbacks.push(callback)

        // Give back an unregister-function!
        return () => {
            const index = this._callbacks.indexOf(callback)
            if (index >= 0) {
                this._callbacks.splice(index, 1)
            }
        }
    }

    /**
     * Call all the callbacks.
     * Returns the number of registered callbacks
     */
    public ping(data: T): number {
        this.pingCount++
        let toDelete = undefined
        let startTime = new Date().getTime() / 1000
        for (const callback of this._callbacks) {
            try {
                if (callback(data) === true) {
                    // This callback wants to be deleted
                    // Note: it has to return precisely true in order to avoid accidental deletions
                    if (toDelete === undefined) {
                        toDelete = [callback]
                    } else {
                        toDelete.push(callback)
                    }
                }
            } catch (e) {
                console.error("Got an error while running a callback:", e)
            }
        }
        let endTime = new Date().getTime() / 1000
        if (endTime - startTime > 500) {
            console.trace(
                "Warning: a ping took more then 500ms; this is probably a performance issue"
            )
        }
        if (toDelete !== undefined) {
            for (const toDeleteElement of toDelete) {
                this._callbacks.splice(this._callbacks.indexOf(toDeleteElement), 1)
            }
        }
        return this._callbacks.length
    }

    length() {
        return this._callbacks.length
    }
}

/**
 * The mapped store is a helper type which does the mapping of a function.
 */
class MappedStore<TIn, T> extends Store<T> {
    private static readonly pass: () => {}
    private readonly _upstream: Store<TIn>
    private readonly _upstreamCallbackHandler: ListenerTracker<TIn> | undefined
    private _upstreamPingCount: number = -1
    private _unregisterFromUpstream: () => void
    private readonly _f: (t: TIn) => T
    private readonly _extraStores: Store<any>[] | undefined
    private _unregisterFromExtraStores: (() => void)[] | undefined
    private _callbacks: ListenerTracker<T> = new ListenerTracker<T>()
    private _callbacksAreRegistered = false

    constructor(
        upstream: Store<TIn>,
        f: (t: TIn) => T,
        extraStores: Store<any>[],
        upstreamListenerHandler: ListenerTracker<TIn> | undefined,
        initialState: T,
        onDestroy?: (f: () => void) => void
    ) {
        super()
        this._upstream = upstream
        this._upstreamCallbackHandler = upstreamListenerHandler
        this._f = f
        this._data = initialState
        this._upstreamPingCount = upstreamListenerHandler?.pingCount
        this._extraStores = extraStores
        this.registerCallbacksToUpstream()
        if (onDestroy !== undefined) {
            onDestroy(() => this.unregisterFromUpstream())
        }
    }

    private _data: T

    /**
     * Gets the current data from the store
     *
     * const src = new UIEventSource(21)
     * const mapped = src.map(i => i * 2)
     * src.setData(3)
     * mapped.data // => 6
     */
    get data(): T {
        if (!this._callbacksAreRegistered) {
            // Callbacks are not registered, so we haven't been listening for updates from the upstream which might have changed
            if (this._upstreamCallbackHandler?.pingCount != this._upstreamPingCount) {
                // Upstream has pinged - let's update our data first
                this._data = this._f(this._upstream.data)
            }
            return this._data
        }
        return this._data
    }

    map<J>(
        f: (t: T) => J,
        extraStores: Store<any>[] = undefined,
        ondestroyCallback?: (f: () => void) => void
    ): Store<J> {
        let stores: Store<any>[] = undefined
        if (extraStores?.length > 0 || this._extraStores?.length > 0) {
            stores = []
        }
        if (extraStores?.length > 0) {
            stores?.push(...extraStores)
        }
        if (this._extraStores?.length > 0) {
            this._extraStores?.forEach((store) => {
                if (stores.indexOf(store) < 0) {
                    stores.push(store)
                }
            })
        }
        return new MappedStore(
            this,
            f, // we could fuse the functions here (e.g. data => f(this._f(data), but this might result in _f being calculated multiple times, breaking things
            stores,
            this._callbacks,
            f(this.data),
            ondestroyCallback
        )
    }

    addCallback(callback: (data: T) => any | boolean | void): () => void {
        if (!this._callbacksAreRegistered) {
            // This is the first callback that is added
            // We register this 'map' to the upstream object and all the streams
            this.registerCallbacksToUpstream()
        }
        const unregister = this._callbacks.addCallback(callback)
        return () => {
            unregister()
            if (this._callbacks.length() == 0) {
                this.unregisterFromUpstream()
            }
        }
    }

    addCallbackAndRun(callback: (data: T) => any | boolean | void): () => void {
        const unregister = this.addCallback(callback)
        const doRemove = callback(this.data)
        if (doRemove === true) {
            unregister()
            return MappedStore.pass
        }
        return unregister
    }

    addCallbackAndRunD(callback: (data: T) => any | boolean | void): () => void {
        return this.addCallbackAndRun((data) => {
            if (data !== undefined) {
                return callback(data)
            }
        })
    }

    addCallbackD(callback: (data: T) => any | boolean | void): () => void {
        return this.addCallback((data) => {
            if (data !== undefined) {
                return callback(data)
            }
        })
    }

    private unregisterFromUpstream() {
        this._callbacksAreRegistered = false
        this._unregisterFromUpstream()
        this._unregisterFromExtraStores?.forEach((unr) => unr())
    }

    private registerCallbacksToUpstream() {
        const self = this

        this._unregisterFromUpstream = this._upstream.addCallback((_) => self.update())
        this._unregisterFromExtraStores = this._extraStores?.map((store) =>
            store?.addCallback((_) => self.update())
        )
        this._callbacksAreRegistered = true
    }

    private update(): void {
        const newData = this._f(this._upstream.data)
        this._upstreamPingCount = this._upstreamCallbackHandler?.pingCount
        if (this._data === newData) {
            return
        }
        this._data = newData
        this._callbacks.ping(this._data)
    }
}

export class UIEventSource<T> extends Store<T> implements Writable<T> {
    private static readonly pass: () => {}
    public data: T
    _callbacks: ListenerTracker<T> = new ListenerTracker<T>()

    constructor(data: T, tag: string = "") {
        super(tag)
        this.data = data
    }

    public static flatten<X>(
        source: Store<Store<X>>,
        possibleSources?: Store<any>[]
    ): UIEventSource<X> {
        const sink = new UIEventSource<X>(source.data?.data)

        source.addCallback((latestData) => {
            sink.setData(latestData?.data)
            latestData.addCallback((data) => {
                if (source.data !== latestData) {
                    return true
                }
                sink.setData(data)
            })
        })

        for (const possibleSource of possibleSources ?? []) {
            possibleSource?.addCallback(() => {
                sink.setData(source.data?.data)
            })
        }

        return sink
    }

    /**
     * Converts a promise into a UIVentsource, sets the UIEVentSource when the result is calculated.
     * If the promise fails, the value will stay undefined, but 'onError' will be called
     */
    public static FromPromise<T>(
        promise: Promise<T>,
        onError: (e: any) => void = undefined
    ): UIEventSource<T> {
        const src = new UIEventSource<T>(undefined)
        promise?.then((d) => src.setData(d))
        promise?.catch((err) => {
            if (onError !== undefined) {
                onError(err)
            } else {
                console.warn("Promise failed:", err)
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
    public static FromPromiseWithErr<T>(
        promise: Promise<T>
    ): UIEventSource<{ success: T } | { error: any } | undefined> {
        const src = new UIEventSource<{ success: T } | { error: any }>(undefined)
        promise
            ?.then((d) => src.setData({ success: d }))
            ?.catch((err) => src.setData({ error: err }))
        return src
    }

    /**
     *
     * @param source
     * UIEventSource.asInt(new UIEventSource("123")).data // => 123
     * UIEventSource.asInt(new UIEventSource("123456789")).data // => 123456789
     *
     * const srcStr = new UIEventSource("123456789"))
     * const srcInt = UIEventSource.asInt(srcStr)
     * srcInt.setData(987654321)
     * srcStr.data // => "987654321"
     */
    public static asInt(source: UIEventSource<string>): UIEventSource<number> {
        return source.sync(
            (str) => {
                let parsed = parseInt(str)
                return isNaN(parsed) ? undefined : parsed
            },
            [],
            (fl) => {
                if (fl === undefined || isNaN(fl)) {
                    return undefined
                }
                return "" + fl
            }
        )
    }

    /**
     * UIEventSource.asFloat(new UIEventSource("123")).data // => 123
     * UIEventSource.asFloat(new UIEventSource("123456789")).data // => 123456789
     * UIEventSource.asFloat(new UIEventSource("0.5")).data // => 0.5
     * UIEventSource.asFloat(new UIEventSource("0.125")).data // => 0.125
     * UIEventSource.asFloat(new UIEventSource("0.0000000001")).data // => 0.0000000001
     *
     *
     * const srcStr = new UIEventSource("123456789"))
     * const srcInt = UIEventSource.asFloat(srcStr)
     * srcInt.setData(987654321)
     * srcStr.data // => "987654321"
     * @param source
     */

    public static asFloat(source: UIEventSource<string>): UIEventSource<number> {
        return source.sync(
            (str) => {
                let parsed = parseFloat(str)
                return isNaN(parsed) ? undefined : parsed
            },
            [],
            (fl) => {
                if (fl === undefined || isNaN(fl)) {
                    return undefined
                }
                return "" + fl
            }
        )
    }

    static asBoolean(stringUIEventSource: UIEventSource<string>): UIEventSource<boolean> {
        return stringUIEventSource.sync(
            (str) => str === "true",
            [],
            (b) => "" + b
        )
    }

    /**
     * Create a new UIEVentSource. Whenever 'source' changes, the returned UIEventSource will get this value as well.
     * However, this value can be overriden without affecting source
     */
    static feedFrom<T>(store: Store<T>): UIEventSource<T> {
        const src = new UIEventSource(store.data)
        store.addCallback((t) => src.setData(t))
        return src
    }

    /**
     * Adds a callback
     *
     * If the result of the callback is 'true', the callback is considered finished and will be removed again
     * @param callback
     */
    public addCallback(callback: (latestData: T) => boolean | void | any): () => void {
        return this._callbacks.addCallback(callback)
    }

    public addCallbackAndRun(callback: (latestData: T) => boolean | void | any): () => void {
        const doDeleteCallback = callback(this.data)
        if (doDeleteCallback !== true) {
            return this.addCallback(callback)
        } else {
            return UIEventSource.pass
        }
    }

    public addCallbackAndRunD(callback: (data: T) => void): () => void {
        return this.addCallbackAndRun((data) => {
            if (data !== undefined && data !== null) {
                return callback(data)
            }
        })
    }

    public addCallbackD(callback: (data: T) => void): () => void {
        return this.addCallback((data) => {
            if (data !== undefined && data !== null) {
                return callback(data)
            }
        })
    }

    public setData(t: T): UIEventSource<T> {
        if (this.data == t) {
            // MUST COMPARE BY REFERENCE!
            return
        }
        this.data = t
        this._callbacks.ping(t)
        return this
    }

    public ping(): void {
        this._callbacks.ping(this.data)
    }

    /**
     * Monoidal map which results in a read-only store
     * Given a function 'f', will construct a new UIEventSource where the contents will always be "f(this.data)'
     * @param f The transforming function
     * @param extraSources also trigger the update if one of these sources change
     * @param onDestroy a callback that can trigger the destroy function
     *
     * const src = new UIEventSource<number>(10)
     * const store = src.map(i => i * 2)
     * store.data // => 20
     * let srcSeen = undefined;
     * src.addCallback(v => {
     *     console.log("Triggered")
     *     srcSeen = v
     * })
     * let lastSeen = undefined
     * store.addCallback(v => {
     *     console.log("Triggered!")
     *     lastSeen = v
     * })
     * src.setData(21)
     * srcSeen // => 21
     * lastSeen // => 42
     */
    public map<J>(
        f: (t: T) => J,
        extraSources: Store<any>[] = [],
        onDestroy?: (f: () => void) => void
    ): Store<J> {
        return new MappedStore(this, f, extraSources, this._callbacks, f(this.data), onDestroy)
    }

    /**
     * Monoidal map which results in a read-only store. 'undefined' is passed 'as is'
     * Given a function 'f', will construct a new UIEventSource where the contents will always be "f(this.data)'
     */
    public mapD<J>(
        f: (t: Exclude<T, undefined | null>) => J,
        extraSources: Store<any>[] = [],
        callbackDestroyFunction?: (f: () => void) => void
    ): Store<J | undefined> {
        return new MappedStore(
            this,
            (t) => {
                if (t === undefined) {
                    return undefined
                }
                if (t === null) {
                    return null
                }
                return f(<Exclude<T, undefined | null>>t)
            },
            extraSources,
            this._callbacks,
            this.data === undefined || this.data === null
                ? <undefined | null>this.data
                : f(<any>this.data),
            callbackDestroyFunction
        )
    }

    public mapAsyncD<J>(f: (t: T) => Promise<J>): Store<J> {
        return this.bindD(t => UIEventSource.FromPromise(f(t)))
    }

    /**
     * Two way sync with functions in both directions
     * Given a function 'f', will construct a new UIEventSource where the contents will always be "f(this.data)'
     * @param f The transforming function
     * @param extraSources also trigger the update if one of these sources change
     * @param g a 'backfunction to let the sync run in two directions. (data of the new UIEVEntSource, currentData) => newData
     * @param allowUnregister if set, the update will be halted if no listeners are registered
     */
    public sync<J>(
        f: (t: T) => J,
        extraSources: Store<any>[],
        g: (j: J, t: T) => T,
        allowUnregister = false
    ): UIEventSource<J> {
        const self = this

        const stack = new Error().stack.split("\n")
        const callee = stack[1]

        const newSource = new UIEventSource<J>(f(this.data), "map(" + this.tag + ")@" + callee)

        const update = function () {
            newSource.setData(f(self.data))
            return allowUnregister && newSource._callbacks.length() === 0
        }

        this.addCallback(update)
        for (const extraSource of extraSources) {
            extraSource?.addCallback(update)
        }

        if (g !== undefined) {
            newSource.addCallback((latest) => {
                self.setData(g(latest, self.data))
            })
        }

        return newSource
    }

    public syncWith(otherSource: UIEventSource<T>, reverseOverride = false): UIEventSource<T> {
        this.addCallback((latest) => otherSource.setData(latest))
        const self = this
        otherSource.addCallback((latest) => self.setData(latest))
        if (reverseOverride) {
            if (otherSource.data !== undefined) {
                this.setData(otherSource.data)
            }
        } else if (this.data === undefined) {
            this.setData(otherSource.data)
        } else {
            otherSource.setData(this.data)
        }
        return this
    }

    set(value: T): void {
        this.setData(value)
    }

    update(f: Updater<T> & ((value: T) => T)): void {
        this.setData(f(this.data))
    }

}
