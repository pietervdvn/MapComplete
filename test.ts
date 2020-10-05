//*
import OpeningHoursPicker from "./UI/Input/OpeningHours/OpeningHoursPicker";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {OH} from "./Logic/OpeningHours";

const picker = new OpeningHoursPicker();
new VariableUiElement(picker.GetValue().map(OH.ToString)).AttachTo("extradiv");
picker.AttachTo("maindiv");


window.setTimeout(() => {
picker.GetValue().setData([{
    weekday: 1,
    startHour: 11,
    startMinutes: 0,
    endHour: 17,
    endMinutes: 0
}]);
    
}, 1000)
/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/