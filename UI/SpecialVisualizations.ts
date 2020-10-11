import {UIElement} from "./UIElement";
import OpeningHoursVisualization from "./OhVisualization";
import {UIEventSource} from "../Logic/UIEventSource";

export default class SpecialVisualizations {

    public static specialVisualizations: {
        funcName: string,
        constr: ((tagSource: UIEventSource<any>, argument: string[]) => UIElement),
        docs: string,
        args: {name: string, defaultValue: string, doc: string}[]
    }[] =

        [{
            funcName: "opening_hours_table",
            docs: "Creates an opening-hours table. Usage: {opening_hours_table(opening_hours)} to create a table of the tag 'opening_hours'.",
            args:[{name:"key", defaultValue: "opening_hours", doc: "The tag from which the table is constructed"}],
            constr: (tagSource: UIEventSource<any>, args) => {
                let keyname = args[0];
                if (keyname === undefined || keyname === "") {
                    keyname = keyname ?? "opening_hours"
                }
                return new OpeningHoursVisualization(tagSource, keyname)
            }
        },

        ]

}