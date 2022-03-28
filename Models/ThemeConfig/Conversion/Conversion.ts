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
    
    constructor(doc: string, modifiedAttributes: string[] = [], name: string) {
        this.modifiedAttributes = modifiedAttributes;
        this.doc = doc + "\n\nModified attributes are\n" + modifiedAttributes.join(", ");
        this.name = name 
    }

    public static strict<T>(fixed: { errors?: string[], warnings?: string[], information?: string[], result?: T }): T {
       
        fixed.information?.forEach(i => console.log("    ", i))
        const yellow = (s) => "\x1b[33m"+s+"\x1b[0m"
        const red = s => '\x1b[31m'+s+'\x1b[0m'
        fixed.warnings?.forEach(w => console.warn(red(`<!> `), yellow (w)))

        if (fixed?.errors !== undefined &&  fixed?.errors?.length > 0) {
            fixed.errors?.forEach(e => console.error(red(`ERR `+e)))
            throw "Detected one or more errors, stopping now"
        }
        
        return fixed.result;
    }

    public convertStrict(json: TIn, context: string): TOut {
        const fixed = this.convert(json, context)
        return DesugaringStep.strict(fixed)
    }

    abstract convert(json: TIn, context: string): { result: TOut, errors?: string[], warnings?: string[], information?: string[] }

    public convertAll(jsons: TIn[], context: string): { result: TOut[], errors: string[], warnings: string[], information?: string[] } {
        if(jsons === undefined || jsons === null){
            throw `Detected a bug in the preprocessor pipeline: ${this.name}.convertAll received undefined or null - don't do this (at ${context})`
        }
        const result = []
        const errors = []
        const warnings = []
        const information = []
        for (let i = 0; i < jsons.length; i++) {
            const json = jsons[i];
            const r = this.convert(json, context + "[" + i + "]")
            result.push(r.result)
            errors.push(...r.errors ?? [])
            warnings.push(...r.warnings ?? [])
            information.push(...r.information ?? [])
        }
        return {
            result,
            errors,
            warnings,
            information
        }
    }

}

export abstract class DesugaringStep<T> extends Conversion<T, T> {
}

export class OnEvery<X, T> extends DesugaringStep<T> {
    private readonly key: string;
    private readonly step: DesugaringStep<X>;
    private _options: { ignoreIfUndefined: boolean };

    constructor(key: string, step: DesugaringStep<X>, options?: {
        ignoreIfUndefined: false | boolean
    }) {
        super("Applies " + step.name + " onto every object of the list `key`", [key], "OnEvery("+step.name+")");
        this.step = step;
        this.key = key;
        this._options = options;
    }

    convert(json: T, context: string): { result: T; errors?: string[]; warnings?: string[], information?: string[] } {
        json = {...json}
        const step = this.step
        const key = this.key;
        if( this._options?.ignoreIfUndefined  && json[key] === undefined){
            return {
                result: json,
            };
        }else{
            const r = step.convertAll((<X[]>json[key]), context + "." + key)
            json[key] = r.result
            return {
                ...r,
                result: json,
            };
        }
       
    }
}

export class OnEveryConcat<X, T> extends DesugaringStep<T> {
    private readonly key: string;
    private readonly step: Conversion<X, X[]>;

    constructor(key: string, step: Conversion<X, X[]>) {
        super(`Applies ${step.name} onto every object of the list \`${key}\`. The results are concatenated and used as new list`, [key], 
            "OnEvery("+key+").Concat("+step.name+")");
        this.step = step;
        this.key = key;
    }

    convert(json: T, context: string): { result: T; errors?: string[]; warnings?: string[], information?: string[] } {
        json = {...json}
        const step = this.step
        const key = this.key;
        const values = json[key]
        if (values === undefined || values === null) {
            // Move on - nothing to see here!
            return {
                result: json,
            }
        }
        const r = step.convertAll((<X[]>values), context + "." + key)
        const vals: X[][] = r.result
        
        json[key] = [].concat(...vals)
        
        return {
            ...r,
            result: json,
        };

    }
}

export class Fuse<T> extends DesugaringStep<T> {
    private readonly steps: DesugaringStep<T>[];

    constructor(doc: string, ...steps: DesugaringStep<T>[]) {
        super((doc ?? "") + "This fused pipeline of the following steps: " + steps.map(s => s.name).join(", "),
            Utils.Dedup([].concat(...steps.map(step => step.modifiedAttributes))),
            "Fuse of "+steps.map(s => s.name).join(", ")
        );
        this.steps = Utils.NoNull(steps);
    }

    convert(json: T, context: string): { result: T; errors: string[]; warnings: string[], information: string[] } {
        const errors = []
        const warnings = []
        const information = []
        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            let r = step.convert(json, "While running step " +step.name + ": " + context)
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
        super("Sets " + key + " to a default value if undefined", [], "SetDefault of "+key);
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