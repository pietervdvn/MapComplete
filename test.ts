//*


import {UIEventSource} from "./Logic/UIEventSource";
import OpeningHoursVisualization from "./UI/OhVisualization";

const oh = "Tu-Fr 09:00-17:00 'as usual'; mo off 'yyy'; su off 'xxx'"
const tags = new UIEventSource<any>({opening_hours:oh});
new OpeningHoursVisualization(tags, 'opening_hours').AttachTo('maindiv')


window.setTimeout(() => {tags.data._country = "be"; }, 5000)
/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/