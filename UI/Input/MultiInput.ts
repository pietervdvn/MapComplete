import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import {FixedUiElement} from "../Base/FixedUiElement";

export class MultiInput<T> extends InputElement<T[]> {

    private readonly _value: UIEventSource<T[]>;
    IsSelected: UIEventSource<boolean>;
    private elements: UIElement[] = [];
    private inputELements: InputElement<T>[] = [];
    private addTag: UIElement;

    constructor(
        addAElement: string,
        newElement: (() => T),
        createInput: (() => InputElement<T>),
        value: UIEventSource<T[]> = new UIEventSource<T[]>([])) {
        super(undefined);
        this._value = value;

        this.addTag = new SubtleButton("./assets/addSmall.svg", addAElement)
            .SetClass("small-button")
            .onClick(() => {
                this.IsSelected.setData(true);
                value.data.push(newElement());
                value.ping();
            });
        const self = this;
        value.map<number>((tags: string[]) => tags.length).addCallback(() => self.createElements(createInput));
        this.createElements(createInput);

        this._value.addCallback(tags => self.load(tags));
        this.IsSelected = new UIEventSource<boolean>(false);
    }

    private load(tags: T[]) {
        if (tags === undefined) {
            return;
        }
        for (let i = 0; i < tags.length; i++) {
            this.inputELements[i].GetValue().setData(tags[i]);
        }
    }
    
    private UpdateIsSelected(){
        this.IsSelected.setData(this.inputELements.map(input => input.IsSelected.data).reduce((a,b) => a && b))
    }

    private createElements(createInput: (() => InputElement<T>)) {
        this.inputELements.splice(0, this.inputELements.length);
        this.elements = [];
        const self = this;
        for (let i = 0; i < this._value.data.length; i++) {
            let tag = this._value.data[i];
            const input = createInput();
            input.GetValue().addCallback(tag => {
                    self._value.data[i] = tag;
                    self._value.ping();
                }
            );
            this.inputELements.push(input);
            input.IsSelected.addCallback(() => this.UpdateIsSelected());
            const deleteBtn = new FixedUiElement("<img src='./assets/delete.svg' style='max-width: 1.5em; margin-left: 5px;'>")
                .onClick(() => {
                    self._value.data.splice(i, 1);
                    self._value.ping();
                });
            this.elements.push(new Combine([input, deleteBtn, "<br/>"]).SetClass("tag-input-row"))
        }
        
        this.Update();
    }

    InnerRender(): string {
        return new Combine([...this.elements, this.addTag]).Render();
    }

    IsValid(t: T[]): boolean {
        return false;
    }

    GetValue(): UIEventSource<T[]> {
        return this._value;
    }

}