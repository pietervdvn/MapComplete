import {UIElement} from "../UI/UIElement";
import {UIEventSource} from "../Logic/UIEventSource";
import Translation from "../UI/i18n/Translation";


export interface Dependencies {
    tags: UIEventSource<any>
}

export interface TagDependantUIElementConstructor {

    construct(dependencies: Dependencies): TagDependantUIElement;
    IsKnown(properties: any): boolean;
    IsQuestioning(properties: any): boolean;
    GetContent(tags: any): Translation;

}

export abstract class TagDependantUIElement extends UIElement {

    abstract IsKnown(): boolean;

    abstract IsQuestioning(): boolean;
    
    abstract IsSkipped() : boolean;
}