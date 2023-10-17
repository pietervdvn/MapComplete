import { LayerConfigJson } from "../Json/LayerConfigJson"
import { Utils } from "../../../Utils"
import { QuestionableTagRenderingConfigJson } from "../Json/QuestionableTagRenderingConfigJson"

export interface DesugaringContext {
    tagRenderings: Map<string, QuestionableTagRenderingConfigJson>
    sharedLayers: Map<string, LayerConfigJson>
    publicLayers?: Set<string>
}

export class ConversionContext {
    /**
     *  The path within the data structure where we are currently operating
     */
    readonly path: ReadonlyArray<string | number>
    /**
     * Some information about the current operation
     */
    readonly operation: ReadonlyArray<string>
    readonly messages: ConversionMessage[]

    private constructor(
        messages: ConversionMessage[],
        path: ReadonlyArray<string | number>,
        operation?: ReadonlyArray<string>
    ) {
        this.path = path
        this.operation = operation ?? []
        // Messages is shared by reference amonst all 'context'-objects for performance
        this.messages = messages
    }

    public static construct(path: (string | number)[], operation: string[]) {
        return new ConversionContext([], [...path], [...operation])
    }

    public static test(msg?: string) {
        return new ConversionContext([], msg ? [msg] : [], ["test"])
    }

    static print(msg: ConversionMessage) {
        const noString = msg.context.path.filter(
            (p) => typeof p !== "string" && typeof p !== "number"
        )
        if (noString.length > 0) {
            console.warn("Non-string value in path:", ...noString)
        }
        if (msg.level === "error") {
            console.error(
                ConversionContext.red("ERR "),
                msg.context.path.join("."),
                ConversionContext.red(msg.message),
                msg.context.operation.join(".")
            )
        } else if (msg.level === "warning") {
            console.warn(
                ConversionContext.red("<!> "),
                msg.context.path.join("."),
                ConversionContext.yellow(msg.message),
                msg.context.operation.join(".")
            )
        } else {
            console.log("    ", msg.context.path.join("."), msg.message)
        }
    }

    private static yellow(s) {
        return "\x1b[33m" + s + "\x1b[0m"
    }

    private static red(s) {
        return "\x1b[31m" + s + "\x1b[0m"
    }

    public enter(key: string | number | (string | number)[]) {
        if (!Array.isArray(key)) {
            return new ConversionContext(this.messages, [...this.path, key], this.operation)
        }
        return new ConversionContext(this.messages, [...this.path, ...key], this.operation)
    }

    public enters(...key: (string | number)[]) {
        return this.enter(key)
    }

    public inOperation(key: string) {
        return new ConversionContext(this.messages, this.path, [...this.operation, key])
    }

    warn(message: string) {
        this.messages.push({ context: this, level: "warning", message })
    }

    err(message: string) {
        this.messages.push({ context: this, level: "error", message })
    }

    info(message: string) {
        this.messages.push({ context: this, level: "information", message })
    }

    getAll(mode: ConversionMsgLevel): ConversionMessage[] {
        return this.messages.filter((m) => m.level === mode)
    }
    public hasErrors() {
        return this.messages?.find((m) => m.level === "error") !== undefined
    }
}

export type ConversionMsgLevel = "debug" | "information" | "warning" | "error"
export interface ConversionMessage {
    context: ConversionContext
    message: string
    level: ConversionMsgLevel
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
            ConversionContext.print(msg)
        }
        if (context.hasErrors()) {
            throw "Detected one or more errors, stopping now"
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

export class Each<X, Y> extends Conversion<X[], Y[]> {
    private readonly _step: Conversion<X, Y>

    constructor(step: Conversion<X, Y>) {
        super(
            "Applies the given step on every element of the list",
            [],
            "OnEach(" + step.name + ")"
        )
        this._step = step
    }

    convert(values: X[], context: ConversionContext): Y[] {
        if (values === undefined || values === null) {
            return <undefined | null>values
        }
        const step = this._step
        const result: Y[] = []
        const c = context.inOperation("each")
        for (let i = 0; i < values.length; i++) {
            const context_ = c.enter(i - 1)
            const r = step.convert(values[i], context_)
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
        const value: P = json[key]
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

    convert(json: T, context: ConversionContext): T {
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

export class Fuse<T> extends DesugaringStep<T> {
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

    convert(json: T, context: ConversionContext): T {
        for (let i = 0; i < this.steps.length; i++) {
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

    convert(json: T, context: ConversionContext): T {
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
