import { Validator } from "../Validator"

export default class TextValidator extends Validator {
    constructor() {
        super("text", "A longer piece of text. Uses an textArea instead of a textField", "text", true)
    }
}
