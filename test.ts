//*


import {UIEventSource} from "./Logic/UIEventSource";
import OpeningHoursInput from "./UI/Input/OpeningHours/OpeningHoursInput";

const oh = "Sep 1-Feb 28 Mo-Th 08:00-12:00, 13:30-17:30; Mar 1-Aug 31 Mo-Fr 07:00-12:00, 13:30-17:30; PH off"

const source = new UIEventSource<string>("")
new OpeningHoursInput(source).AttachTo('maindiv')
console.log("SEtting ",oh)
source.setData(oh)


/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/