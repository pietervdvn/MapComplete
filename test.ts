import { max } from "moment";
import { Store, UIEventSource } from "./Logic/UIEventSource"
import Combine from "./UI/Base/Combine";
import { FixedUiElement } from "./UI/Base/FixedUiElement";
import { VariableUiElement } from "./UI/Base/VariableUIElement";
import { FixedInputElement } from "./UI/Input/FixedInputElement";
import Slider from "./UI/Input/Slider";
import Toggle, { ClickableToggle } from "./UI/Input/Toggle";

const testData = ["-1", "0", "0.5", "1", "1.5", "2"]
let slider = new Slider(0, testData.length - 1);

const toggleClass = "flex border-2 border-blue-500 rounded-full w-10 h-10 place-content-center items-center"

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
  .SetClass("flex flex-column bg-slate-200 m-4 w-10 h-10"))

const valCombine = new Combine(values.reverse())

slider.SetClass("flex vertical m-4 elevatorslider")

new Combine([valCombine, slider]).SetClass("flex flex-row h-10").AttachTo("extradiv")

