import NatValidator from "./NatValidator"

export default class SlopeValidator extends NatValidator {
    constructor() {
        super("slope", "Validates that the slope is a valid number")
    }
    isValid(str: string): boolean {
        if (str.endsWith("%") || str.endsWith("°")) {
            str = str.substring(0, str.length - 1)
        }
        return super.isValid(str)
    }
}
