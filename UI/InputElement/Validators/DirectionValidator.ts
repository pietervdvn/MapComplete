import IntValidator from "./IntValidator"
import { Validator } from "../Validator"

export default class DirectionValidator extends IntValidator {
    constructor() {
        super(
            "direction",
            "A geographical direction, in degrees. 0° is north, 90° is east, ... Will return a value between 0 (incl) and 360 (excl)"
        )
    }

    isValid(str): boolean {
        if (str.endsWith("°")) {
            str = str.substring(0, str.length - 1)
        }
        return super.isValid(str)
    }

    reformat(str): string {
        if (str.endsWith("°")) {
            str = str.substring(0, str.length - 1)
        }
        const n = Number(str) % 360
        return "" + n
    }
}
