import {InputElement} from "./InputElement";
import {Store, Stores, UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import Slider from "./Slider";
import {ClickableToggle} from "./Toggle";
import {FixedUiElement} from "../Base/FixedUiElement";
import {VariableUiElement} from "../Base/VariableUIElement";

export default class LevelSelector extends VariableUiElement implements InputElement<string> {

    private readonly _value: UIEventSource<string>;

    constructor(currentLevels: Store<string[]>, options?: {
        value?: UIEventSource<string>
    }) {
        const value = options?.value ?? new UIEventSource<string>(undefined)
        super(Stores.ListStabilized(currentLevels).map(levels => {
            console.log("CUrrent levels are", levels)
            let slider = new Slider(0, levels.length - 1, {vertical: true});
            const toggleClass = "flex border-2 border-blue-500 w-10 h-10 place-content-center items-center border-box"
            slider.SetClass("flex elevator w-10").SetStyle(`height: ${2.5 * levels.length}rem; background: #00000000`)
            
            const values = levels.map((data, i) => new ClickableToggle(
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
                ))
                .ToggleOnClick()
                .SetClass("flex w-10 h-10"))

            values.reverse(/* This is a new list, no side-effects */)
            const combine = new Combine([new Combine(values), slider])
            combine.SetClass("flex flex-row overflow-hidden");

            
            slider.GetValue().addCallbackAndRun(i => {
                if (currentLevels?.data === undefined) {
                    return
                }
                value.setData(currentLevels?.data[i]);
            })
            value.addCallback(level => {
                const i = currentLevels?.data?.findIndex(l => l === level)
                slider.GetValue().setData(i)
            })
            return combine
        }))
        
        this._value = value

    }

    GetValue(): UIEventSource<string> {
        return this._value;
    }

    IsValid(t: string): boolean {
        return false;
    }



}