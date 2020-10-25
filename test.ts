/*


import OpeningHoursPickerTable from "./UI/Input/OpeningHours/OpeningHoursPickerTable";
import {UIElement} from "./UI/UIElement";
import {UIEventSource} from "./Logic/UIEventSource";
import {OpeningHour} from "./Logic/OpeningHours";
import {TagRendering} from "./UI/Popup/TagRendering";
import {Tag} from "./Logic/Tags";


const tr = new TagRendering(
    new UIEventSource<any>({
        id: "node/-1",
        amenity: "bench"
    }),
    {
        question: "Does this bench have a backrest?",
        mappings: [{
            k: new Tag("backrest", "yes"),
            txt: "Has backrest"
        },
            {
                k: new Tag("backrest", "no"),
                txt: "Has no backrest"
            }]
    }
)
tr.AttachTo("maindiv")

/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/