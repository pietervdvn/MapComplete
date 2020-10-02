/*
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import OpeningHoursPicker from "./UI/Input/OpeningHoursPicker";

let oh = new OpeningHoursPicker();
oh.SetStyle("height:100vh;display:block;").AttachTo('maindiv');

oh.GetValue().addCallback(data => console.log(data))

new VariableUiElement(oh.GetValue().map(oh => {
    if(oh === undefined){
        return "<no value selected>";
    }
    return oh.weekdayStart + " " + oh.startHour + ":" + oh.startMinutes + " --> " +
        oh.weekdayEnd + " " + oh.endHour + ":" + oh.endMinutes
})).AttachTo("extradiv");

 /*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
    new FixedUiElement(stats).AttachTo('maindiv')
})
//*/