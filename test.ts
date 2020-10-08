//*

import OpeningHoursVisualization from "./UI/OhVisualization";
import {UIEventSource} from "./Logic/UIEventSource";

new OpeningHoursVisualization(new UIEventSource<any>({
        opening_hours: "mo-fr 09:00-17:00; Sa 09:00-17:00 'by appointment'; PH off; Th[1] off;",
        _country: "be",
        _lat: "51.2",
        _lon: "3.2"
    }
)).AttachTo("maindiv")


/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/