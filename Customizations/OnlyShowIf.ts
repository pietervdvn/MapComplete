/**
 * Wrapper around another TagDependandElement, which only shows if the filters match
 */
import {TagDependantUIElement, TagDependantUIElementConstructor} from "./UIElementConstructor";
import {TagsFilter, TagUtils} from "../Logic/TagsFilter";
import {UIElement} from "../UI/UIElement";
import {UIEventSource} from "../UI/UIEventSource";
import {Changes} from "../Logic/Changes";


export class OnlyShowIfConstructor implements TagDependantUIElementConstructor{
    private _tagsFilter: TagsFilter;
    private _embedded: TagDependantUIElementConstructor;
    
    constructor(tagsFilter : TagsFilter, embedded: TagDependantUIElementConstructor) {
        this._tagsFilter = tagsFilter;
        this._embedded = embedded;
    }

    construct(dependencies): TagDependantUIElement {
        return new OnlyShowIf(dependencies.tags, 
            this._embedded.construct(dependencies),
            this._tagsFilter);
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
      
    private Matches(properties: any) : boolean{
        return this._tagsFilter.matches(TagUtils.proprtiesToKV(properties));
    } 
    
}

class OnlyShowIf extends UIElement implements TagDependantUIElement {
    private _embedded: TagDependantUIElement;
    private _filter: TagsFilter;

    constructor(
        tags: UIEventSource<any>,
        embedded: TagDependantUIElement, filter: TagsFilter) {
        super(tags);
        this._filter = filter;
        this._embedded = embedded;

    }
    
    private Matches() : boolean{
        return this._filter.matches(TagUtils.proprtiesToKV(this._source.data));
    } 

    protected InnerRender(): string {
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