import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import TagInput from "./TagInput";
import {FixedUiElement} from "../Base/FixedUiElement";
import {MultiInput} from "./MultiInput";

export class MultiTagInput extends MultiInput<string> {
    

    constructor(value: UIEventSource<string[]> = new UIEventSource<string[]>([])) {
        super("Add a new tag",
            () => "",
            () => new TagInput(),
            value
        );
    }

}