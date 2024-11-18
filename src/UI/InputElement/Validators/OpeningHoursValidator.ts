import { Validator } from "../Validator"
import MarkdownUtils from "../../../Utils/MarkdownUtils"

export default class OpeningHoursValidator extends Validator {
    constructor() {
        super(
            "opening_hours",
            [
                "Has extra elements to easily input when a POI is opened.",
                "### Helper arguments",
                "Only one helper argument named `options` can be provided. It is a JSON-object of type `{ prefix: string, postfix: string }`:",
                MarkdownUtils.table(
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
                "### Example usage",
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
            ].join("\n")
        )
    }
}
