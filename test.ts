import OpeningHours, {OpeningHour} from "./UI/Input/OpeningHours";
import {VariableUiElement} from "./UI/Base/VariableUIElement";


let oh = new OpeningHours();
oh.AttachTo('maindiv');

oh.GetValue().addCallback(data => console.log(data))

new VariableUiElement(oh.GetValue().map(ohs => {
    return ohs.map((oh: OpeningHour) => oh.weekdayStart + " " + oh.startHour + ":" + oh.startMinutes + " --> " +
        oh.weekdayEnd + " " + oh.endHour + ":" + oh.endMinutes).join(",")
})).AttachTo("extradiv");
