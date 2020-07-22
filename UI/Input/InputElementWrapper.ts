import {InputElement} from "./InputElement";
import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";


export class InputElementWrapper<T> extends InputElement<T>{
    private pre: UIElement ;
    private input: InputElement<T>;
    private post: UIElement ;
    
    constructor(
        pre: UIElement | string,
        input: InputElement<T>,
        post: UIElement | string
        
    ) {
        super(undefined);
        this.pre = typeof(pre) === 'string' ?  new FixedUiElement(pre) : pre
        this.input = input;
        this.post =typeof(post) === 'string' ?  new FixedUiElement(post) : post
    }
    
    
    GetValue(): UIEventSource<T> {
        return this.input.GetValue();
    }
    
    ShowValue(t: T) {
        return this.input.ShowValue(t);
    }

    InnerRender(): string {
        return this.pre.Render() + this.input.Render() + this.post.Render();
    }

    IsValid(t: T): boolean {
        return this.input.IsValid(t);
    }
    
}