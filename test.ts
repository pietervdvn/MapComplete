import {UIEventSource} from "./Logic/UIEventSource";
import SpecialVisualizations from "./UI/SpecialVisualizations";
import State from "./State";
import Combine from "./UI/Base/Combine";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import OpeningHoursVisualization from "./UI/OpeningHours/OpeningHoursVisualization";
import OpeningHoursPickerTable from "./UI/OpeningHours/OpeningHoursPickerTable";
import OpeningHoursPicker from "./UI/OpeningHours/OpeningHoursPicker";
import {OH, OpeningHour} from "./UI/OpeningHours/OpeningHours";
import {VariableUiElement} from "./UI/Base/VariableUIElement";


const tagsSource = new UIEventSource({
    id: 'id',
    name: 'name',
    surface: 'asphalt',
    image: "https://i.imgur.com/kX3rl3v.jpg",
    "image:1": "https://i.imgur.com/oHAJqMB.jpg",
    "opening_hours": "mo-fr 09:00-18:00",
    _country: "be",
})

const state = new State(undefined)
State.state = state

const ohData = new UIEventSource<OpeningHour[]>([{
    weekday: 1,
    startHour: 10,
    startMinutes: 0
    , endHour: 12,
    endMinutes: 0
}])
new OpeningHoursPicker(ohData).AttachTo("maindiv")
new VariableUiElement(ohData.map(OH.ToString)).AttachTo("extradiv")
/*
const allSpecials = SpecialVisualizations.specialVisualizations.map(spec => {
    try{

        return new Combine([spec.funcName, spec.constr(state, tagsSource, spec.args.map(a => a.defaultValue ?? "")).SetClass("block")])
            .SetClass("flex flex-col border border-black p-2 m-2");   
    }catch(e){
        console.error(e)
        return new FixedUiElement("Could not construct "+spec.funcName+" due to "+e).SetClass("alert")
    }
})
new Combine(allSpecials).AttachTo("maindiv")*/