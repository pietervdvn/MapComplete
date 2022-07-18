import { max } from "moment";
import { Store, UIEventSource } from "./Logic/UIEventSource"
import Combine from "./UI/Base/Combine";
import { FixedUiElement } from "./UI/Base/FixedUiElement";
import { VariableUiElement } from "./UI/Base/VariableUIElement";
import { FixedInputElement } from "./UI/Input/FixedInputElement";
import Slider from "./UI/Input/Slider";
import Toggle from "./UI/Input/Toggle";

const testData = ["-1", "0", "0.5", "1", "1.5", "2"]

const values = testData.map((data) => new FixedUiElement(data).onClick(() => {
  values.map((val) => {
    val.RemoveClass("active bg-blue-200")
    if (val.content === data) {
      const options = {
        value : new UIEventSource<number>(testData.indexOf(val.content)),
      }
      val.SetClass("active bg-blue-200")
      const newSlider = new Slider(0, testData.length-1, options).SetClass("flex vertical m-4 elevatorslider");
      new Combine([valCombine, newSlider]).SetClass("flex flex-row h-10").AttachTo("extradiv")
      console.log(slider.GetValue())
    }
  })
}).SetClass("flex flex-column bg-slate-200 w-10 h-10 border-2 border-blue-500 border-solid rounded-full place-content-center items-center m-4"))

const valCombine = new Combine(values.reverse())
// valCombine.AttachTo("maindiv")

const slider = new Slider(0, testData.length-1);

slider.SetClass("flex vertical m-4 elevatorslider")

new Combine([valCombine, slider]).SetClass("flex flex-row h-10").AttachTo("extradiv")

console.log(slider)
