//*

import OpeningHoursVisualization from "./UI/OhVisualization";
import {UIEventSource} from "./Logic/UIEventSource";

new OpeningHoursVisualization( new UIEventSource<any>({
        opening_hours: "2000 Dec 21 10:00-12:00;",
        _country: "be",
        _lat: "51.2",
        _lon: "3.2"
    }
),  'opening_hours').AttachTo("maindiv")


/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/