import Title from "../../Base/Title"
import Combine from "../../Base/Combine"
import { Validator } from "../Validator"
import Table from "../../Base/Table"

export default class NameSuggestionIndexValidator extends Validator {
    constructor() {
        super(
            "nsi",
            new Combine([
                "Gives a list of possible suggestions for a brand or operator tag.",
                new Title("Helper arguments"),
                new Table(
                    ["name", "doc"],
                    [
                        [
                            "options",
                            new Combine([
                                "A JSON-object of type `{ main: string, key: string }`. ",
                                new Table(
                                    ["subarg", "doc"],
                                    [
                                        [
                                            "main",
                                            "The main tag to give suggestions for, e.g. `amenity=restaurant`.",
                                        ],
                                        ["key", "The key to give suggestions for, e.g. `brand`."],
                                    ]
                                ),
                            ]),
                        ],
                    ]
                ),
            ])
        )
    }
}
