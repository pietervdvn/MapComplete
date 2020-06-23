import {UIElement} from "./UIElement";
import {UIEventSource} from "./UIEventSource";


export class TagMappingOptions {
    key: string;// The key to show
    mapping?: any;// dictionary for specific values, the values are substituted 
    template?: string; // The template, where {key} will be substituted
    missing?: string// What to show when the key is not there

    constructor(options: {
        key: string,
        mapping?: any,
        template?: string,
        missing?: string
    }) {
        this.key = options.key;
        this.mapping = options.mapping;
        this.template = options.template;
        this.missing = options.missing;
    }

}

export class TagMapping extends UIElement {

    private readonly tags;
    private readonly options: TagMappingOptions;

    constructor(
        options: TagMappingOptions,
        tags: UIEventSource<any>) {
        super(tags);
        this.tags = tags.data;
        this.options = options;
    }

    IsEmpty(): boolean {
        const o = this.options;
        return this.tags[o.key] === undefined && o.missing === undefined;
    }

    protected InnerRender(): string {

        const o = this.options;
        const v = this.tags[o.key];

        if (v === undefined) {
            if (o.missing === undefined) {
                return "";
            }
            return o.missing;
        }

        if (o.mapping !== undefined) {

            const mapped = o.mapping[v];
            if (mapped !== undefined) {
                return mapped;
            }
        }

        if (o.template === undefined) {
            console.log("Warning: no match for " + o.key + "=" + v);
            return v;
        }

        return o.template.replace("{" + o.key + "}", v);
    }
    InnerUpdate(htmlElement: HTMLElement) {
    }

}