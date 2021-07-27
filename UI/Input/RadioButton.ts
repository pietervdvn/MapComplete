import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {Utils} from "../../Utils";

export class RadioButton<T> extends InputElement<T> {
    private static _nextId = 0;
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly value: UIEventSource<T>;
    private _elements: InputElement<T>[];
    private _selectFirstAsDefault: boolean;
    private _dontStyle: boolean

    constructor(
        elements: InputElement<T>[],
        options?: {
            selectFirstAsDefault?: boolean,
            dontStyle?: boolean
        }
    ) {
        super();
        options = options ?? {}
        this._selectFirstAsDefault = options.selectFirstAsDefault ?? true;
        this._elements = Utils.NoNull(elements);
        this.value = new UIEventSource<T>(undefined);
        this._dontStyle = options.dontStyle ?? false
    }

    protected InnerConstructElement(): HTMLElement {
        const elements = this._elements;
        const selectFirstAsDefault = this._selectFirstAsDefault;

        const selectedElementIndex: UIEventSource<number> =
            new UIEventSource<number>(null);

        const value = UIEventSource.flatten(
            selectedElementIndex.map((selectedIndex) => {
                if (selectedIndex !== undefined && selectedIndex !== null) {
                    return elements[selectedIndex].GetValue();
                }
            }),
            elements.map((e) => e?.GetValue())
        );
        value.syncWith(this.value);

        if (selectFirstAsDefault) {
            value.addCallbackAndRun((selected) => {
                if (selected === undefined) {
                    for (const element of elements) {
                        const v = element.GetValue().data;
                        if (v !== undefined) {
                            value.setData(v);
                            break;
                        }
                    }
                }
            });
        }

        for (let i = 0; i < elements.length; i++) {
            // If an element is clicked, the radio button corresponding with it should be selected as well
            elements[i]?.onClick(() => {
                selectedElementIndex.setData(i);
            });
            elements[i].IsSelected.addCallback((isSelected) => {
                if (isSelected) {
                    selectedElementIndex.setData(i);
                }
            });
            elements[i].GetValue().addCallback(() => {
                selectedElementIndex.setData(i);
            });
        }

        const groupId = "radiogroup" + RadioButton._nextId;
        RadioButton._nextId++;

        const form = document.createElement("form");

        const inputs = [];
        const wrappers: HTMLElement[] = [];

        for (let i1 = 0; i1 < elements.length; i1++) {
            let element = elements[i1];
            const labelHtml = element.ConstructElement();
            if (labelHtml === undefined) {
                continue;
            }

            const input = document.createElement("input");
            input.id = "radio" + groupId + "-" + i1;
            input.name = groupId;
            input.type = "radio";
            input.classList.add(
                "cursor-pointer",
                "p-1",
                "mr-2"
            );


            if (!this._dontStyle) {
                input.classList.add(
                    "p-1",
                    "ml-2",
                    "pl-2",
                    "pr-0",
                    "m-3",
                    "mr-0"
                );
            }
            input.onchange = () => {
                if (input.checked) {
                    selectedElementIndex.setData(i1);
                }
            };

            inputs.push(input);

            const label = document.createElement("label");
            label.appendChild(labelHtml);
            label.htmlFor = input.id;
            label.classList.add("flex", "w-full", "cursor-pointer", "bg-red");

            if (!this._dontStyle) {
                labelHtml.classList.add("p-2")
            }

            const block = document.createElement("div");
            block.appendChild(input);
            block.appendChild(label);
            block.classList.add(
                "flex",
                "w-full",
            );
            if (!this._dontStyle) {
                block.classList.add(
                    "m-1",
                    "border",
                    "rounded-3xl",
                    "border-gray-400",
                )
            }
            wrappers.push(block);

            form.appendChild(block);
        }

        value.addCallbackAndRun((selected) => {
            let somethingChecked = false;
            for (let i = 0; i < inputs.length; i++) {
                let input = inputs[i];
                input.checked = !somethingChecked && elements[i].IsValid(selected);
                somethingChecked = somethingChecked || input.checked;

                if (input.checked) {
                    wrappers[i].classList.remove("border-gray-400");
                    wrappers[i].classList.add("border-black");
                } else {
                    wrappers[i].classList.add("border-gray-400");
                    wrappers[i].classList.remove("border-black");
                }
            }
        });

        this.SetClass("flex flex-col");

        return form;
    }

    IsValid(t: T): boolean {
        for (const inputElement of this._elements) {
            if (inputElement.IsValid(t)) {
                return true;
            }
        }
        return false;
    }

    GetValue(): UIEventSource<T> {
        return this.value;
    }

    /*
      public ShowValue(t: T): boolean {
          if (t === undefined) {
              return false;
          }
          if (!this.IsValid(t)) {
              return false;
          }
          // We check that what is selected matches the previous rendering
          for (let i = 0; i < this._elements.length; i++) {
              const e = this._elements[i];
              if (e.IsValid(t)) {
                  this._selectedElementIndex.setData(i);
                  e.GetValue().setData(t);
                  const radio = document.getElementById(this.IdFor(i));
                  // @ts-ignore
                  radio?.checked = true;
                  return;
              }
  
          }
      }*/
}
