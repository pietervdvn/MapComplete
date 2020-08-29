import {TagDependantUIElement, TagDependantUIElementConstructor} from "./UIElementConstructor";
import {TagsFilter, TagUtils} from "../Logic/Tags";
import {UIElement} from "../UI/UIElement";
import {UIEventSource} from "../Logic/UIEventSource";
import Translation from "../UI/i18n/Translation";

/**
 * Wrapper around another TagDependandElement, which only shows if the filters match
 */
export class OnlyShowIfConstructor implements TagDependantUIElementConstructor{
    private readonly _tagsFilter: TagsFilter;
    private readonly _embedded: TagDependantUIElementConstructor;
    private readonly _invert: boolean;

    constructor(tagsFilter: TagsFilter, embedded: TagDependantUIElementConstructor, invert: boolean = false) {
        this._tagsFilter = tagsFilter;
        this._embedded = embedded;
        this._invert = invert;
    }

    construct(dependencies): TagDependantUIElement {
        return new OnlyShowIf(dependencies.tags, 
            this._embedded.construct(dependencies),
            this._tagsFilter,
            this._invert);
    }

    IsKnown(properties: any): boolean {
        if(!this.Matches(properties)){
            return true;
        }
        return this._embedded.IsKnown(properties);
    }

    IsQuestioning(properties: any): boolean {
        if(!this.Matches(properties)){
            return false;
        }
        return this._embedded.IsQuestioning(properties);
    }

    Priority(): number {
        return this._embedded.Priority();
    }
    
    GetContent(tags: any): Translation {
        if(this.IsKnown(tags)){
            return undefined;
        }
        return this._embedded.GetContent(tags);
    }

    private Matches(properties: any) : boolean{
        return this._tagsFilter.matches(TagUtils.proprtiesToKV(properties)) != this._invert;
    } 
    
}

class OnlyShowIf extends UIElement implements TagDependantUIElement {
    private readonly _embedded: TagDependantUIElement;
    private readonly _filter: TagsFilter;
    private readonly _invert: boolean;

    constructor(
        tags: UIEventSource<any>,
        embedded: TagDependantUIElement, 
        filter: TagsFilter,
        invert: boolean) {
        super(tags);
        this._filter = filter;
        this._embedded = embedded;
        this._invert = invert;

    }
    
    private Matches() : boolean{
        return this._filter.matches(TagUtils.proprtiesToKV(this._source.data)) != this._invert;
    } 

    InnerRender(): string {
        if (this.Matches()) {
            return this._embedded.Render();
        } else {
            return "";
        }
    }

    Priority(): number {
        return this._embedded.Priority();
    }

    IsKnown(): boolean {
        if(!this.Matches()){
            return false;
        }
        return this._embedded.IsKnown();
    }
    
    IsSkipped(): boolean {
        if(!this.Matches()){
            return false;
        }
        return this._embedded.IsSkipped();
    }

    IsQuestioning(): boolean {
        if(!this.Matches()){
            return false;
        }
        return this._embedded.IsQuestioning();
    }

    Activate(): void {
        this._embedded.Activate();
    }

    Update(): void {
        this._embedded.Update();
    }
}