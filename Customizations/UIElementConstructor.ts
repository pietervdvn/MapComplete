import {UIElement} from "../UI/UIElement";
import {UIEventSource} from "../Logic/UIEventSource";


export interface Dependencies {
    tags: UIEventSource<any>
}

export interface TagDependantUIElementConstructor {

    construct(dependencies: Dependencies): TagDependantUIElement;
    IsKnown(properties: any): boolean;
    IsQuestioning(properties: any): boolean;
    Priority(): number;
    GetContent(tags: any): string;

}

export abstract class TagDependantUIElement extends UIElement {

    abstract IsKnown(): boolean;

    abstract IsQuestioning(): boolean;
    
    abstract Priority() : number;

    abstract IsSkipped() : boolean;
}