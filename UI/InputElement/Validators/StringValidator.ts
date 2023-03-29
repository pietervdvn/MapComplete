import { Validator } from "../ValidatedTextField"

export default class StringValidator extends Validator {
    constructor() {
        super("string", "A simple piece of text")
    }

}
