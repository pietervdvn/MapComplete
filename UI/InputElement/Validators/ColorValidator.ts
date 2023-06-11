import { Validator } from "../Validator"

export default class ColorValidator extends Validator {
    constructor() {
        super("color", "Shows a color picker")
    }
}
