import NatValidator from "./NatValidator"
import FloatValidator from "./FloatValidator"

export default class SlopeValidator extends FloatValidator {
    constructor() {
        super(
            "slope",
            "Validates that the slope is a valid number." +
                "The accompanying input element uses the gyroscope and the compass to determine the correct incline. The sign of the incline will be set automatically. The bearing of the way is compared to the bearing of the compass, as such, the device knows if it is measuring in the forward or backward direction."
        )
    }
    isValid(str: string): boolean {
        if (str.endsWith("%") || str.endsWith("°")) {
            str = str.substring(0, str.length - 1)
        }
        return super.isValid(str)
    }
}
