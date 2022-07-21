import {InputElement} from "./InputElement";
import {Store, UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import Slider from "./Slider";
import {ClickableToggle} from "./Toggle";
import {FixedUiElement} from "../Base/FixedUiElement";
import {Utils} from "../../Utils";

export default class LevelSelector extends Combine implements InputElement<string>{
    
    private readonly _value : UIEventSource<string>;
    
    constructor(currentLevels: Store<string[]>, options?:{
        value?: UIEventSource<string>
    }) {

        const testData = ["-1", "0", "0.5", "1", "1.5", "2"]
        let slider = new Slider(0, testData.length - 1, {vertical: true});
        slider.SetClass("flex m-1 elevatorslider mb-0 mt-8").SetStyle("height: "+2.5*testData.length+"rem ")
        const toggleClass = "flex border-2 border-blue-500 w-10 h-10 place-content-center items-center"
        const values = testData.map((data, i) => new ClickableToggle(
            new FixedUiElement(data).SetClass("active bg-subtle " + toggleClass), new FixedUiElement(data).SetClass(toggleClass), slider.GetValue().sync(
                (sliderVal) => {
                    return sliderVal === i
                },
                [],
                (isSelected) => {
                    return isSelected ? i : slider.GetValue().data
                }
            ))
            .ToggleOnClick()
            .SetClass("flex flex-column ml-5 bg-slate-200 w-10 h-10 valuesContainer"))

        super([new Combine(values.reverse()).SetClass("mt-8"), slider])
        this.SetClass("flex flex-row h-14");
        
        const value = this._value = options?.value ?? new UIEventSource<string>(undefined)
        slider.GetValue().addCallbackAndRun(i => {
            if(currentLevels?.data === undefined){
                return
            }
            value.setData(currentLevels?.data[i]);
        })
        value.addCallback(level => {
            const i = currentLevels?.data?.findIndex(l => l === level)
            slider.GetValue().setData(i)
        })
    }

    GetValue(): UIEventSource<string> {
        return this._value;
    }

    protected InnerConstructElement(): HTMLElement {
        return undefined;
    }

    IsValid(t: string): boolean {
        return false;
    }


    /**
     * Parses a level specifier to the various available levels
     * 
     * LevelSelector.LevelsParser("0") // => ["0"]
     * LevelSelector.LevelsParser("1") // => ["1"]
     * LevelSelector.LevelsParser("0;2") // => ["0","2"]
     * LevelSelector.LevelsParser("0-5") // => ["0","1","2","3","4","5"]
     * LevelSelector.LevelsParser("0") // => ["0"]
     */
    public static LevelsParser(level: string): string[] {
        let spec = [level]
        spec = [].concat(...spec.map(s => s.split(";")))
        spec = [].concat(...spec.map(s => {
            s = s.trim()
            if(s.indexOf("-") < 0){
                return s
            }
            const [start, end] = s.split("-").map(s => Number(s.trim()))
            if(isNaN(start) || isNaN(end)){
                return undefined
            }
            const values = []
            for (let i = start; i <= end; i++) {
                values.push(i+"")
            }
            return values
        }))
        return Utils.NoNull(spec);
    }
    
    
}