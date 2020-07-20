import {UIEventSource} from "../UI/UIEventSource";
import {Changes} from "../Logic/Changes";
import {UIElement} from "../UI/UIElement";


export interface TagDependantUIElementConstructor {

    construct(dependencies: {tags: UIEventSource<any>, changes: Changes}): TagDependantUIElement;
    IsKnown(properties: any): boolean;
    IsQuestioning(properties: any): boolean;
    Priority(): number;
}

export abstract class TagDependantUIElement extends UIElement {

    abstract IsKnown(): boolean;

    abstract IsQuestioning(): boolean;
    
    abstract Priority() : number;

}