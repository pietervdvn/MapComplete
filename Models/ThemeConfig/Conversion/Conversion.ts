import {TagRenderingConfigJson} from "../Json/TagRenderingConfigJson";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import {Utils} from "../../../Utils";

export interface DesugaringContext {
    tagRenderings: Map<string, TagRenderingConfigJson>
    sharedLayers: Map<string, LayerConfigJson>
}

export abstract class Conversion<TIn, TOut> {
    public readonly modifiedAttributes: string[];
    public readonly name: string
    protected readonly doc: string;

    constructor(doc: string, modifiedAttributes: string[] = [], name: string) {
        this.modifiedAttributes = modifiedAttributes;
        this.doc = doc + "\n\nModified attributes are\n" + modifiedAttributes.join(", ");
        this.name = name
    }

    public static strict<T>(fixed: { errors?: string[], warnings?: string[], information?: string[], result?: T }): T {

        fixed.information?.forEach(i => console.log("    ", i))
        const yellow = (s) => "\x1b[33m" + s + "\x1b[0m"
        const red = s => '\x1b[31m' + s + '\x1b[0m'
        fixed.warnings?.forEach(w => console.warn(red(`<!> `), yellow(w)))

        if (fixed?.errors !== undefined && fixed?.errors?.length > 0) {
            fixed.errors?.forEach(e => console.error(red(`ERR ` + e)))
            throw "Detected one or more errors, stopping now"
        }

        return fixed.result;
    }

    public convertStrict(json: TIn, context: string): TOut {
        const fixed = this.convert(json, context)
        return DesugaringStep.strict(fixed)
    }

    public andThenF<X>(f: (tout:TOut) => X ): Conversion<TIn, X>{
        return new Pipe(
            this,
            new Pure(f)
        )
    }
    
    abstract convert(json: TIn, context: string): { result: TOut, errors?: string[], warnings?: string[], information?: string[] }
}

export abstract class DesugaringStep<T> extends Conversion<T, T> {
    
}

class Pipe<TIn, TInter, TOut> extends Conversion<TIn, TOut> {
    private readonly _step0: Conversion<TIn, TInter>;
    private readonly _step1: Conversion<TInter, TOut>;
    constructor(step0: Conversion<TIn, TInter>, step1: Conversion<TInter,TOut>) {
        super("Merges two steps with different types", [], `Pipe(${step0.name}, ${step1.name})`);
        this._step0 = step0;
        this._step1 = step1;
    }

    convert(json: TIn, context: string): { result: TOut; errors?: string[]; warnings?: string[]; information?: string[] } {
        
        const r0 = this._step0.convert(json, context);
        const {result, errors, information, warnings } = r0;
        if(result === undefined && errors.length > 0){
            return {
                ...r0,
                result: undefined
            };
        }
        
        const r = this._step1.convert(result, context);
        errors.push(...r.errors)
        information.push(...r.information)
        warnings.push(...r.warnings)
        return {
            result: r.result,
            errors,
            warnings,
            information
        }
    }
}

class Pure<TIn, TOut> extends Conversion<TIn, TOut> {
    private readonly _f: (t: TIn) => TOut;
    constructor(f: ((t:TIn) => TOut)) {
        super("Wrapper around a pure function",[], "Pure");
        this._f = f;
    }
    
    convert(json: TIn, context: string): { result: TOut; errors?: string[]; warnings?: string[]; information?: string[] } {
        return {result: this._f(json)};
    }
    
}

export class Each<X, Y> extends Conversion<X[], Y[]> {
    private readonly _step: Conversion<X, Y>;

    constructor(step: Conversion<X, Y>) {
        super("Applies the given step on every element of the list", [], "OnEach(" + step.name + ")");
        this._step = step;
    }

    convert(values: X[], context: string): { result: Y[]; errors?: string[]; warnings?: string[]; information?: string[] } {
        if (values === undefined || values === null) {
            return {result: undefined}
        }
        const information: string[] = []
        const warnings: string[] = []
        const errors: string[] = []
        const step = this._step
        const result: Y[] = []
        for (let i = 0; i < values.length; i++) {
            const r = step.convert(values[i], context + "[" + i + "]")
            information.push(...r.information)
            warnings.push(...r.warnings)
            errors.push(...r.errors)
            result.push(r.result)
        }
        return {
            information, errors, warnings,
            result
        };
    }

}

export class On<P, T> extends DesugaringStep<T> {
    private readonly key: string;
    private readonly step: Conversion<P, P>;

    constructor(key: string, step: Conversion<P, P>) {
        super("Applies " + step.name + " onto property `"+key+"`", [key], `On(${key}, ${step.name})`);
        this.step = step;
        this.key = key;
    }

    convert(json: T, context: string): { result: T; errors?: string[]; warnings?: string[], information?: string[] } {
        json = {...json}
        const step = this.step
        const key = this.key;
        const value: P = json[key]
        if (value === undefined || value === null) {
            return {                result: json            };
        }
        const r = step.convert(value, context + "." + key)
        json[key] = r.result
        return {
            ...r,
            result: json,
        };

    }
}

export class Concat<X, T> extends Conversion<X[], T[]> {
    private readonly _step: Conversion<X, T[]>;

    constructor(step: Conversion<X, T[]>) {
        super("Executes the given step, flattens the resulting list", [], "Concat(" + step.name + ")");
        this._step = step;
    }

    convert(values: X[], context: string): { result: T[]; errors?: string[]; warnings?: string[]; information?: string[] } {
        if (values === undefined || values === null) {
            // Move on - nothing to see here!
            return {
                result: undefined,
            }
        }
        const r = new Each(this._step).convert(values, context)
        const vals: T[][] = r.result

        const flattened: T[] = [].concat(...vals)

        return {
            ...r,
            result: flattened,
        };
    }
}

export class Fuse<T> extends DesugaringStep<T> {
    private readonly steps: DesugaringStep<T>[];

    constructor(doc: string, ...steps: DesugaringStep<T>[]) {
        super((doc ?? "") + "This fused pipeline of the following steps: " + steps.map(s => s.name).join(", "),
            Utils.Dedup([].concat(...steps.map(step => step.modifiedAttributes))),
            "Fuse of " + steps.map(s => s.name).join(", ")
        );
        this.steps = Utils.NoNull(steps);
    }

    convert(json: T, context: string): { result: T; errors: string[]; warnings: string[], information: string[] } {
        const errors = []
        const warnings = []
        const information = []
        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            let r = step.convert(json, "While running step " + step.name + ": " + context)
            errors.push(...r.errors ?? [])
            warnings.push(...r.warnings ?? [])
            information.push(...r.information ?? [])
            json = r.result
            if (errors.length > 0) {
                break;
            }
        }
        return {
            result: json,
            errors,
            warnings,
            information
        };
    }

}

export class SetDefault<T> extends DesugaringStep<T> {
    private readonly value: any;
    private readonly key: string;
    private readonly _overrideEmptyString: boolean;

    constructor(key: string, value: any, overrideEmptyString = false) {
        super("Sets " + key + " to a default value if undefined", [], "SetDefault of " + key);
        this.key = key;
        this.value = value;
        this._overrideEmptyString = overrideEmptyString;
    }

    convert(json: T, context: string): { result: T } {
        if (json[this.key] === undefined || (json[this.key] === "" && this._overrideEmptyString)) {
            json = {...json}
            json[this.key] = this.value
        }

        return {
            result: json
        };
    }
}