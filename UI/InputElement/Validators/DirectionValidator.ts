import IntValidator from "./IntValidator"
import { Validator } from "../Validator"

export default class DirectionValidator extends IntValidator {
    constructor() {
        super(
            "direction",
            "A geographical direction, in degrees. 0° is north, 90° is east, ... Will return a value between 0 (incl) and 360 (excl)"
        )
    }

    reformat(str): string {
        const n = Number(str) % 360
        return "" + n
    }
}
