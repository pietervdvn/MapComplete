import {TagRenderingConfigJson} from "../Json/TagRenderingConfigJson";
import {LayerConfigJson} from "../Json/LayerConfigJson";
import {Utils} from "../../../Utils";

export interface DesugaringContext {
    tagRenderings: Map<string, TagRenderingConfigJson>
    sharedLayers: Map<string, LayerConfigJson>
}

export abstract class Conversion<TIn, TOut> {
    public readonly modifiedAttributes: string[];
    protected readonly doc: string;
    public readonly name: string
    
    constructor(doc: string, modifiedAttributes: string[] = [], name?: string) {
        this.modifiedAttributes = modifiedAttributes;
        this.doc = doc + "\n\nModified attributes are\n" + modifiedAttributes.join(", ");
        this.name = name ?? this.constructor.name
    }

    public static strict<T>(fixed: { errors?: string[], warnings?: string[], result?: T }): T {
        if (fixed?.errors !== undefined &&  fixed?.errors?.length > 0) {
            throw fixed.errors.join("\n\n");
        }
        fixed.warnings?.forEach(w => console.warn(w))
        return fixed.result;
    }

    public convertStrict(json: TIn, context: string): TOut {
        const fixed = this.convert(json, context)
        return DesugaringStep.strict(fixed)
    }

    abstract convert(json: TIn, context: string): { result: TOut, errors?: string[], warnings?: string[] }

    public convertAll(jsons: TIn[], context: string): { result: TOut[], errors: string[], warnings: string[] } {
        if(jsons === undefined){
            throw "convertAll received undefined - don't do this (at "+context+")"
        }
        const result = []
        const errors = []
        const warnings = []
        for (let i = 0; i < jsons.length; i++) {
            const json = jsons[i];
            const r = this.convert(json, context + "[" + i + "]")
            result.push(r.result)
            errors.push(...r.errors ?? [])
            warnings.push(...r.warnings ?? [])
        }
        return {
            result,
            errors,
            warnings
        }
    }

}

export abstract class DesugaringStep<T> extends Conversion<T, T> {
}

export class OnEvery<X, T> extends DesugaringStep<T> {
    private readonly key: string;
    private readonly step: DesugaringStep<X>;

    constructor(key: string, step: DesugaringStep<X>) {
        super("Applies " + step.constructor.name + " onto every object of the list `key`", [key]);
        this.step = step;
        this.key = key;
    }

    convert(json: T, context: string): { result: T; errors?: string[]; warnings?: string[] } {
        json = {...json}
        const step = this.step
        const key = this.key;
        const r = step.convertAll((<X[]>json[key]), context + "." + key)
        json[key] = r.result
        return {
            result: json,
            errors: r.errors,
            warnings: r.warnings
        };
    }
}

export class OnEveryConcat<X, T> extends DesugaringStep<T> {
    private readonly key: string;
    private readonly step: Conversion<X, X[]>;

    constructor(key: string, step: Conversion<X, X[]>) {
        super(`Applies ${step.constructor.name} onto every object of the list \`${key}\`. The results are concatenated and used as new list`, [key], 
            "OnEveryConcat("+step.name+")");
        this.step = step;
        this.key = key;
    }

    convert(json: T, context: string): { result: T; errors: string[]; warnings: string[] } {
        json = {...json}
        const step = this.step
        const key = this.key;
        const values = json[key]
        if (values === undefined) {
            // Move on - nothing to see here!
            return {
                result: json,
                errors: [],
                warnings: []
            }
        }
        const r = step.convertAll((<X[]>values), context + "." + key)
        const vals: X[][] = r.result
        json[key] = [].concat(...vals)
        return {
            result: json,
            errors: r.errors,
            warnings: r.warnings
        };

    }
}

export class Fuse<T> extends DesugaringStep<T> {
    private readonly steps: DesugaringStep<T>[];

    constructor(doc: string, ...steps: DesugaringStep<T>[]) {
        super((doc ?? "") + "This fused pipeline of the following steps: " + steps.map(s => s.constructor.name).join(", "),
            Utils.Dedup([].concat(...steps.map(step => step.modifiedAttributes)))
        );
        this.steps = steps;
    }

    convert(json: T, context: string): { result: T; errors: string[]; warnings: string[] } {
        const errors = []
        const warnings = []
        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            let r = step.convert(json, "While running step " +step.name + ": " + context)
            errors.push(...r.errors ?? [])
            warnings.push(...r.warnings ?? [])
            json = r.result
            if (errors.length > 0) {
                break;
            }
        }
        return {
            result: json,
            errors,
            warnings
        };
    }

}

export class SetDefault<T> extends DesugaringStep<T> {
    private readonly value: any;
    private readonly key: string;
    private readonly _overrideEmptyString: boolean;

    constructor(key: string, value: any, overrideEmptyString = false) {
        super("Sets " + key + " to a default value if undefined");
        this.key = key;
        this.value = value;
        this._overrideEmptyString = overrideEmptyString;
    }

    convert(json: T, context: string): { result: T; errors: string[]; warnings: string[] } {
        if (json[this.key] === undefined || (json[this.key] === "" && this._overrideEmptyString)) {
            json = {...json}
            json[this.key] = this.value
        }

        return {
            errors: [], warnings: [],
            result: json
        };
    }
}