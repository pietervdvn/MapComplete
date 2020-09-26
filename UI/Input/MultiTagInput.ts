import {UIEventSource} from "../../Logic/UIEventSource";
import TagInput from "./SingleTagInput";
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