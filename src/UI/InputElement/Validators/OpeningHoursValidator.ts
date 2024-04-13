import Combine from "../../Base/Combine"
import Title from "../../Base/Title"
import Table from "../../Base/Table"
import { Validator } from "../Validator"

export default class OpeningHoursValidator extends Validator {
    constructor() {
        super(
            "opening_hours",
            new Combine([
                "Has extra elements to easily input when a POI is opened.",
                new Title("Helper arguments"),
                new Table(
                    ["name", "doc"],
                    [
                        [
                            "options",
                            new Combine([
                                "A JSON-object of type `{ prefix: string, postfix: string }`. ",
                                new Table(
                                    ["subarg", "doc"],
                                    [
                                        [
                                            "prefix",
                                            "Piece of text that will always be added to the front of the generated opening hours. If the OSM-data does not start with this, it will fail to parse.",
                                        ],
                                        [
                                            "postfix",
                                            "Piece of text that will always be added to the end of the generated opening hours",
                                        ],
                                    ]
                                ),
                            ]),
                        ],
                    ]
                ),
                new Title("Example usage"),
                "To add a conditional (based on time) access restriction:\n\n```\n" +
                    `
"freeform": {
    "key": "access:conditional",
    "type": "opening_hours",
    "helperArgs": [
        {
          "prefix":"no @ (",
          "postfix":")"
        }
    ]
}` +
                    "\n```\n\n*Don't forget to pass the prefix and postfix in the rendering as well*: `{opening_hours_table(opening_hours,yes @ &LPARENS, &RPARENS )`",
            ])
        )
    }
}
