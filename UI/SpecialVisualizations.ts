import {UIElement} from "./UIElement";
import OpeningHoursVisualization from "./OhVisualization";
import {UIEventSource} from "../Logic/UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";
import LiveQueryHandler from "../Logic/Web/LiveQueryHandler";

export default class SpecialVisualizations {

    public static specialVisualizations: {
        funcName: string,
        constr: ((tagSource: UIEventSource<any>, argument: string[]) => UIElement),
        docs: string,
        args: { name: string, defaultValue?: string, doc: string }[]
    }[] =

        [{
            funcName: "opening_hours_table",
            docs: "Creates an opening-hours table. Usage: {opening_hours_table(opening_hours)} to create a table of the tag 'opening_hours'.",
            args: [{name: "key", defaultValue: "opening_hours", doc: "The tag from which the table is constructed"}],
            constr: (tagSource: UIEventSource<any>, args) => {
                let keyname = args[0];
                if (keyname === undefined || keyname === "") {
                    keyname = keyname ?? "opening_hours"
                }
                return new OpeningHoursVisualization(tagSource, keyname)
            }
        },

            {
                funcName: "live",
                docs: "Downloads a JSON from the given URL, e.g. '{live(example.org/data.json, shorthand:x.y.z, other:a.b.c, shorthand)}' will download the given file, will create an object {shorthand: json[x][y][z], other: json[a][b][c] out of it and will return 'other' or 'json[a][b][c]. This is made to use in combination with tags, e.g. {live({url}, {url:format}, needed_value)}",
                args: [{
                    name: "Url", doc: "The URL to load"
                }, {
                    name: "Shorthands",
                    doc: "A list of shorthands, of the format 'shorthandname:path.path.path'. Seperated by ;"
                }, {
                    name: "path", doc: "The path (or shorthand) that should be returned"
                }],
                constr: (tagSource: UIEventSource<any>, args) => {
                    const url = args[0];
                    const shorthands = args[1];
                    const neededValue = args[2];
                    const source = LiveQueryHandler.FetchLiveData(url, shorthands.split(";"));
                    return new VariableUiElement(source.map(data => data[neededValue] ?? "Loading..."));
                }
            }

        ]

}