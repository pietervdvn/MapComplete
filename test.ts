//*


import LiveQueryHandler from "./Logic/Web/LiveQueryHandler";
import {VariableUiElement} from "./UI/Base/VariableUIElement";

const source = LiveQueryHandler.FetchLiveData("https://data.mobility.brussels/bike/api/counts/?request=live&featureID=CJM90",
    "hour:data.hour_cnt;day:data.day_cnt;year:data.year_cnt".split(";"))
source.addCallback((data) => {console.log(data)})
new VariableUiElement(source.map(data => {
    return ["Data is:", data.hour, "last hour;", data.day, "last day; ", data.year, "last year;"].join(" ")
})).AttachTo('maindiv')

/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/