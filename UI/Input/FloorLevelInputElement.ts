import { InputElement } from "./InputElement"
import { Store, Stores, UIEventSource } from "../../Logic/UIEventSource"
import Combine from "../Base/Combine"
import Slider from "./Slider"
import { ClickableToggle } from "./Toggle"
import { FixedUiElement } from "../Base/FixedUiElement"
import { VariableUiElement } from "../Base/VariableUIElement"
import BaseUIElement from "../BaseUIElement"

export default class FloorLevelInputElement
    extends VariableUiElement
    implements InputElement<string>
{
    private readonly _value: UIEventSource<string>

    constructor(
        currentLevels: Store<Record<string, number>>,
        options?: {
            value?: UIEventSource<string>
        }
    ) {
        const value = options?.value ?? new UIEventSource<string>("0")
        super(
            currentLevels.map((levels) => {
                const allLevels = Object.keys(levels)
                allLevels.sort((a, b) => {
                    const an = Number(a)
                    const bn = Number(b)
                    if (isNaN(an) || isNaN(bn)) {
                        return a < b ? -1 : 1
                    }
                    return an - bn
                })
                return FloorLevelInputElement.constructPicker(allLevels, value)
            })
        )

        this._value = value
    }

    private static constructPicker(levels: string[], value: UIEventSource<string>): BaseUIElement {
        let slider = new Slider(0, levels.length - 1, { vertical: true })
        const toggleClass =
            "flex border-2 border-blue-500 w-10 h-10 place-content-center items-center border-box"
        slider
            .SetClass("flex elevator w-10")
            .SetStyle(`height: ${2.5 * levels.length}rem; background: #00000000`)

        const values = levels.map((data, i) =>
            new ClickableToggle(
                new FixedUiElement(data).SetClass("font-bold active bg-subtle " + toggleClass),
                new FixedUiElement(data).SetClass("normal-background " + toggleClass),
                slider.GetValue().sync(
                    (sliderVal) => {
                        return sliderVal === i
                    },
                    [],
                    (isSelected) => {
                        return isSelected ? i : slider.GetValue().data
                    }
                )
            )
                .ToggleOnClick()
                .SetClass("flex w-10 h-10")
        )

        values.reverse(/* This is a new list, no side-effects */)
        const combine = new Combine([new Combine(values), slider])
        combine.SetClass("flex flex-row overflow-hidden")

        slider.GetValue().addCallbackD((i) => {
            if (levels === undefined) {
                return
            }
            if (levels[i] == undefined) {
                return
            }
            value.setData(levels[i])
        })
        value.addCallbackAndRunD((level) => {
            const i = levels.findIndex((l) => l === level)
            slider.GetValue().setData(i)
        })
        return combine
    }

    GetValue(): UIEventSource<string> {
        return this._value
    }

    IsValid(t: string): boolean {
        return false
    }
}
