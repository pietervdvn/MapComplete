import {UIElement} from "./UIElement";
import OpeningHoursVisualization from "./OhVisualization";
import {UIEventSource} from "../Logic/UIEventSource";

export default class SpecialVisualizations {

    public static specialVisualizations: { funcName: string, constr: ((tagSource: UIEventSource<any>, argument: string) => UIElement) }[] =

        [{
            funcName: "opening_hours_table",
            constr: (tagSource: UIEventSource<any>, keyname) => {
                return new OpeningHoursVisualization(tagSource, keyname)
            }
        }]

}