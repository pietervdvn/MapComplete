import { max } from "moment";
import { Store, UIEventSource } from "./Logic/UIEventSource"
import Combine from "./UI/Base/Combine";
import { FixedUiElement } from "./UI/Base/FixedUiElement";
import { VariableUiElement } from "./UI/Base/VariableUIElement";
import { FixedInputElement } from "./UI/Input/FixedInputElement";
import Slider from "./UI/Input/Slider";
import Toggle, { ClickableToggle } from "./UI/Input/Toggle";

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

const valCombine = new Combine(values.reverse())

new Combine([valCombine.SetClass("mt-8"), slider]).SetClass("flex flex-row h-14").AttachTo("extradiv")
