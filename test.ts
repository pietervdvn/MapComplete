//*


import {UIEventSource} from "./Logic/UIEventSource";
import OpeningHoursVisualization from "./UI/OhVisualization";

const oh = "Tu-Fr 09:00-17:00 'as usual'; mo off 'yyy'; su off 'xxx'"

new OpeningHoursVisualization(new UIEventSource<any>({opening_hours:oh}), 'opening_hours').AttachTo('maindiv')


/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/