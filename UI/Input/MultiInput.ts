import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";

export class MultiInput<T> extends InputElement<T[]> {

    private readonly _value: UIEventSource<T[]>;
    IsSelected: UIEventSource<boolean>;
    private elements: UIElement[] = [];
    private inputElements: InputElement<T>[] = [];
    private addTag: UIElement;
    private _options: { allowMovement?: boolean };

    constructor(
        addAElement: string,
        newElement: (() => T),
        createInput: (() => InputElement<T>),
        value: UIEventSource<T[]> = undefined,
        options?: {
            allowMovement?: boolean
        }) {
        super(undefined);
        this._value = value ?? new UIEventSource<T[]>([]);
        value = this._value;
        this.ListenTo(value.map((latest : T[]) => latest.length));
        this._options = options ?? {};

        this.addTag = new SubtleButton(Svg.addSmall_ui(), addAElement)
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
            this.inputElements[i].GetValue().setData(tags[i]);
        }
    }
    
    private UpdateIsSelected(){
        this.IsSelected.setData(this.inputElements.map(input => input.IsSelected.data).reduce((a,b) => a && b))
    }

    private createElements(createInput: (() => InputElement<T>)) {
        this.inputElements.splice(0, this.inputElements.length);
        this.elements = [];
        const self = this;
        for (let i = 0; i < this._value.data.length; i++) {
            const input = createInput();
            input.GetValue().addCallback(tag => {
                    self._value.data[i] = tag;
                    self._value.ping();
                }
            );
            this.inputElements.push(input);
            input.IsSelected.addCallback(() => this.UpdateIsSelected());

            const moveUpBtn = Svg.up_ui()
                .SetClass('small-image').onClick(() => {
                    const v = self._value.data[i];
                    self._value.data[i] = self._value.data[i - 1];
                    self._value.data[i - 1] = v;
                    self._value.ping();
                });

            const moveDownBtn = 
                Svg.down_ui()
                    .SetClass('small-image') .onClick(() => {
                    const v = self._value.data[i];
                    self._value.data[i] = self._value.data[i + 1];
                    self._value.data[i + 1] = v;
                    self._value.ping();
                });

            const controls = [];
            if (i > 0 && this._options.allowMovement) {
                controls.push(moveUpBtn);
            }

            if (i + 1 < this._value.data.length && this._options.allowMovement) {
                controls.push(moveDownBtn);
            }


            const deleteBtn =
                Svg.delete_icon_ui().SetClass('small-image')
                .onClick(() => {
                    self._value.data.splice(i, 1);
                    self._value.ping();
                });
            controls.push(deleteBtn);
            this.elements.push(new Combine([input.SetStyle("width: calc(100% - 2em - 5px)"), new Combine(controls).SetStyle("display:flex;flex-direction:column;width:min-content;")]).SetClass("tag-input-row"))
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