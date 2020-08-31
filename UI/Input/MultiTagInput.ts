import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import TagInput from "./TagInput";
import {FixedUiElement} from "../Base/FixedUiElement";

export class MultiTagInput extends InputElement<string[]> {

    public static tagExplanation: UIElement =
        new FixedUiElement("<h3>How to use the tag-element</h3>")

    private readonly _value: UIEventSource<string[]>;
    IsSelected: UIEventSource<boolean>;
    private elements: UIElement[] = [];
    private inputELements: InputElement<string>[] = [];
    private addTag: UIElement;

    constructor(value: UIEventSource<string[]> = new UIEventSource<string[]>([])) {
        super(undefined);
        this._value = value;

        this.addTag = new SubtleButton("./assets/addSmall.svg", "Add a tag")
            .SetClass("small-button")
            .onClick(() => {
                this.IsSelected.setData(true);
                value.data.push("");
                value.ping();
            });
        const self = this;
        value.map<number>((tags: string[]) => tags.length).addCallback(() => self.createElements());
        this.createElements();


        this._value.addCallback(tags => self.load(tags));
        this.IsSelected = new UIEventSource<boolean>(false);
    }

    private load(tags: string[]) {
        if (tags === undefined) {
            return;
        }
        for (let i = 0; i < tags.length; i++) {
            console.log("Setting tag ", i)
            this.inputELements[i].GetValue().setData(tags[i]);
        }
    }
    
    private UpdateIsSelected(){
        this.IsSelected.setData(this.inputELements.map(input => input.IsSelected.data).reduce((a,b) => a && b))
    }

    private createElements() {
        this.inputELements = [];
        this.elements = [];
        for (let i = 0; i < this._value.data.length; i++) {
            let tag = this._value.data[i];
            const input = new TagInput(new UIEventSource<string>(tag));
            input.GetValue().addCallback(tag => {
                    console.log("Writing ", tag)
                    this._value.data[i] = tag;
                    this._value.ping();
                }
            );
            this.inputELements.push(input);
            input.IsSelected.addCallback(() => this.UpdateIsSelected());
            const deleteBtn = new FixedUiElement("<img src='./assets/delete.svg' style='max-width: 1.5em; margin-left: 5px;'>")
                .onClick(() => {
                    this._value.data.splice(i, 1);
                    this._value.ping();
                });
            this.elements.push(new Combine([input, deleteBtn, "<br/>"]).SetClass("tag-input-row"))
        }
        
        this.Update();
    }

    InnerRender(): string {
        return new Combine([...this.elements, this.addTag]).SetClass("bordered").Render();
    }


    IsValid(t: string[]): boolean {
        return false;
    }

    GetValue(): UIEventSource<string[]> {
        return this._value;
    }

}