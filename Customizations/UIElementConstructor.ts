import {UIEventSource} from "../UI/UIEventSource";
import {Changes} from "../Logic/Osm/Changes";
import {UIElement} from "../UI/UIElement";


export interface Dependencies {
    tags: UIEventSource<any>
}

export interface TagDependantUIElementConstructor {

    construct(dependencies: Dependencies): TagDependantUIElement;
    IsKnown(properties: any): boolean;
    IsQuestioning(properties: any): boolean;
    Priority(): number;
}

export abstract class TagDependantUIElement extends UIElement {

    abstract IsKnown(): boolean;

    abstract IsQuestioning(): boolean;
    
    abstract Priority() : number;

    abstract IsSkipped() : boolean;
}