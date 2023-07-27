import { Validator } from "../Validator"

export default class StringValidator extends Validator {
    constructor() {
        super("string", "A simple piece of text")
    }
}
