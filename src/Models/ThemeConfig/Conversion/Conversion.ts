import { LayerConfigJson } from "../Json/LayerConfigJson"
import { Utils } from "../../../Utils"
import { QuestionableTagRenderingConfigJson } from "../Json/QuestionableTagRenderingConfigJson"
import { ConversionContext } from "./ConversionContext"

export interface DesugaringContext {
    tagRenderings: Map<string, QuestionableTagRenderingConfigJson>
    sharedLayers: Map<string, LayerConfigJson>
    publicLayers?: Set<string>
}

export type ConversionMsgLevel = "debug" | "information" | "warning" | "error"

export interface ConversionMessage {
    readonly context: ConversionContext
    readonly message: string
    readonly level: ConversionMsgLevel
}

export abstract class Conversion<TIn, TOut> {
    public readonly modifiedAttributes: string[]
    public readonly name: string
    protected readonly doc: string

    constructor(doc: string, modifiedAttributes: string[] = [], name: string) {
        this.modifiedAttributes = modifiedAttributes
        this.doc = doc + "\n\nModified attributes are\n" + modifiedAttributes.join(", ")
        this.name = name
    }

    public convertStrict(json: TIn, context?: ConversionContext): TOut {
        context ??= ConversionContext.construct([], [])
        context = context.inOperation(this.name)
        const fixed = this.convert(json, context)
        for (const msg of context.messages) {
            if (msg.level === "debug") {
                continue
            }
            ConversionContext.print(msg)
        }
        if (context.hasErrors()) {
            throw new Error(["Detected one or more errors, stopping now:", context.getAll("error").map(e => e.context.path.join(".")+": "+e.message)].join("\n\t"))
        }
        return fixed
    }

    public andThenF<X>(f: (tout: TOut) => X): Conversion<TIn, X> {
        return new Pipe(this, new Pure(f))
    }

    public abstract convert(json: TIn, context: ConversionContext): TOut
}

export abstract class DesugaringStep<T> extends Conversion<T, T> {}

export class Pipe<TIn, TInter, TOut> extends Conversion<TIn, TOut> {
    private readonly _step0: Conversion<TIn, TInter>
    private readonly _step1: Conversion<TInter, TOut>

    constructor(step0: Conversion<TIn, TInter>, step1: Conversion<TInter, TOut>) {
        super("Merges two steps with different types", [], `Pipe(${step0.name}, ${step1.name})`)
        this._step0 = step0
        this._step1 = step1
    }

    convert(json: TIn, context: ConversionContext): TOut {
        const r0 = this._step0.convert(json, context.inOperation(this._step0.name))
        return this._step1.convert(r0, context.inOperation(this._step1.name))
    }
}

export class Pure<TIn, TOut> extends Conversion<TIn, TOut> {
    private readonly _f: (t: TIn) => TOut

    constructor(f: (t: TIn) => TOut) {
        super("Wrapper around a pure function", [], "Pure")
        this._f = f
    }

    convert(json: TIn, context: ConversionContext): TOut {
        return this._f(json)
    }
}

export class Bypass<T> extends DesugaringStep<T> {
    private readonly _applyIf: (t: T) => boolean
    private readonly _step: DesugaringStep<T>

    constructor(applyIf: (t: T) => boolean, step: DesugaringStep<T>) {
        super("Applies the step on the object, if the object satisfies the predicate", [], "Bypass")
        this._applyIf = applyIf
        this._step = step
    }

    convert(json: T, context: ConversionContext): T {
        if (!this._applyIf(json)) {
            return json
        }
        return this._step.convert(json, context)
    }
}

export class Each<X, Y> extends Conversion<X[], Y[]> {
    private readonly _step: Conversion<X, Y>
    private readonly _msg: string

    constructor(step: Conversion<X, Y>, options?: { msg?: string }) {
        super(
            "Applies the given step on every element of the list",
            [],
            "OnEach(" + step.name + ")"
        )
        this._step = step
        this._msg = options?.msg
    }

    convert(values: X[], context: ConversionContext): Y[] {
        if (values === undefined || values === null) {
            return <undefined | null>values
        }
        const step = this._step
        const result: Y[] = []
        const c = context.inOperation("each")
        for (let i = 0; i < values.length; i++) {
            if (this._msg) {
                console.log(
                    this._msg,
                    `: ${i + 1}/${values.length}`,
                    values[i]?.["id"] !== undefined ? values[i]?.["id"] : ""
                )
            }
            const r = step.convert(values[i], c.enter(i))
            result.push(r)
        }
        return result
    }
}

export class On<P, T> extends DesugaringStep<T> {
    private readonly key: string
    private readonly step: (t: T) => Conversion<P, P>

    constructor(key: string, step: Conversion<P, P> | ((t: T) => Conversion<P, P>)) {
        super(
            "Applies " + step.name + " onto property `" + key + "`",
            [key],
            `On(${key}, ${step.name})`
        )
        if (typeof step === "function") {
            this.step = step
        } else {
            this.step = (_) => step
        }
        this.key = key
    }

    convert(json: T, context: ConversionContext): T {
        const key = this.key
        const value: P = json?.[key]
        if (value === undefined || value === null) {
            return json
        }

        json = { ...json }
        const step = this.step(json)
        json[key] = step.convert(value, context.enter(key).inOperation("on[" + key + "]"))
        return json
    }
}

export class Pass<T> extends Conversion<T, T> {
    constructor(message?: string) {
        super(message ?? "Does nothing, often to swap out steps in testing", [], "Pass")
    }

    convert(json: T, _: ConversionContext): T {
        return json
    }
}

export class Concat<X, T> extends Conversion<X[], T[]> {
    private readonly _step: Conversion<X, T[]>

    constructor(step: Conversion<X, T[]>) {
        super(
            "Executes the given step, flattens the resulting list",
            [],
            "Concat(" + step.name + ")"
        )
        this._step = step
    }

    convert(values: X[], context: ConversionContext): T[] {
        if (values === undefined || values === null) {
            // Move on - nothing to see here!
            return <undefined | null>values
        }
        const vals: T[][] = new Each(this._step).convert(values, context.inOperation("concat"))
        return [].concat(...vals)
    }
}

export class FirstOf<T, X> extends Conversion<T, X> {
    private readonly _conversion: Conversion<T, X[]>

    constructor(conversion: Conversion<T, X[]>) {
        super(
            "Picks the first result of the conversion step",
            [],
            "FirstOf(" + conversion.name + ")"
        )
        this._conversion = conversion
    }

    convert(json: T, context: ConversionContext): X {
        const values = this._conversion.convert(json, context.inOperation("firstOf"))
        if (values.length === 0) {
            return undefined
        }
        return values[0]
    }
}

export class Cached<TIn, TOut> extends Conversion<TIn, TOut> {
    private _step: Conversion<TIn, TOut>
    private readonly key: string

    constructor(step: Conversion<TIn, TOut>) {
        super("Secretly caches the output for the given input", [], "cached")
        this._step = step
        this.key = "__super_secret_caching_key_" + step.name
    }

    convert(json: TIn, context: ConversionContext): TOut {
        if (json[this.key]) {
            return json[this.key]
        }
        const converted = this._step.convert(json, context)
        Object.defineProperty(json, this.key, {
            value: converted,
            enumerable: false,
        })
        return converted
    }
}

export class Fuse<T> extends DesugaringStep<T> {
    protected debug = false
    private readonly steps: DesugaringStep<T>[]

    constructor(doc: string, ...steps: DesugaringStep<T>[]) {
        super(
            (doc ?? "") +
                "This fused pipeline of the following steps: " +
                steps.map((s) => s.name).join(", "),
            Utils.Dedup([].concat(...steps.map((step) => step.modifiedAttributes))),
            "Fuse(" + steps.map((s) => s.name).join(", ") + ")"
        )
        this.steps = Utils.NoNull(steps)
    }

    public enableDebugging(): Fuse<T> {
        this.debug = true
        return this
    }

    convert(json: T, context: ConversionContext): T {
        const timings = []
        for (let i = 0; i < this.steps.length; i++) {
            const start = new Date()
            const step = this.steps[i]
            try {
                const r = step.convert(json, context.inOperation(step.name))
                if (r === undefined || r === null) {
                    break
                }
                json = r
            } catch (e) {
                console.error("Step " + step.name + " failed due to ", e, e.stack)
                throw e
            }
            if (this.debug) {
                const stop = new Date()
                const timeNeededMs = stop.getTime() - start.getTime()
                timings.push(timeNeededMs)
            }
        }
        if (this.debug) {
            console.log("Time needed,", timings.join(", "))
        }
        return json
    }
}

export class SetDefault<T> extends DesugaringStep<T> {
    private readonly value: any
    private readonly key: string
    private readonly _overrideEmptyString: boolean

    constructor(key: string, value: any, overrideEmptyString = false) {
        super("Sets " + key + " to a default value if undefined", [], "SetDefault of " + key)
        this.key = key
        this.value = value
        this._overrideEmptyString = overrideEmptyString
    }

    convert(json: T, _: ConversionContext): T {
        if (json === undefined) {
            return undefined
        }
        if (json[this.key] === undefined || (json[this.key] === "" && this._overrideEmptyString)) {
            json = { ...json }
            json[this.key] = this.value
        }

        return json
    }
}
