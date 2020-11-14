import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";

/**
 * Selects a direction in degrees
 */
export default class Direction extends InputElement<number>{
    
    private readonly value: UIEventSource<number>;
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    constructor(value?: UIEventSource<number>) {
        super();
        this.value = value ?? new UIEventSource<number>(undefined);
    }


    GetValue(): UIEventSource<number> {
        return this.value;
    }

    InnerRender(): string {
        return new Combine([
            new FixedUiElement("").SetStyle(
                "position: absolute;top: calc(50% - 0.5em);left: calc(50% - 0.5em);width: 1em;height: 1em;background: red;border-radius: 1em"),
            
        ])
            .SetStyle("position:relative;display:block;width: min(100%, 25em); padding-top: min(100% , 25em); background:white; border: 1px solid black; border-radius: 999em")
            .Render();
    }


    IsValid(t: number): boolean {
        return t >= 0 && t <= 360;
    }
    
}