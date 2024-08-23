import StringValidator from "./StringValidator"

export default class TextValidator extends StringValidator {
    constructor() {
        super(
            "text",
            "A longer piece of text. Uses an textArea instead of a textField",
            "text",
            true
        )
    }
}
