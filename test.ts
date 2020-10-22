//*



import OpeningHoursPickerTable from "./UI/Input/OpeningHours/OpeningHoursPickerTable";
import {UIElement} from "./UI/UIElement";
import {UIEventSource} from "./Logic/UIEventSource";
import {OpeningHour} from "./Logic/OpeningHours";

new OpeningHoursPickerTable(new UIEventSource<UIElement[]>([]), new UIEventSource<OpeningHour[]>([]))
    .AttachTo("maindiv")


/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/