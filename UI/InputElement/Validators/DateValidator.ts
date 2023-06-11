import { Validator } from "../Validator"

export default class DateValidator extends Validator {
    constructor() {
        super("date", "A date with date picker")
    }

    isValid(str: string): boolean {
        return !isNaN(new Date(str).getTime())
    }

    reformat(str: string) {
        console.log("Reformatting", str)
        if (!this.isValid(str)) {
            // The date is invalid - we return the string as is
            return str
        }
        const d = new Date(str)
        let month = "" + (d.getMonth() + 1)
        let day = "" + d.getDate()
        const year = d.getFullYear()

        if (month.length < 2) month = "0" + month
        if (day.length < 2) day = "0" + day

        return [year, month, day].join("-")
    }
}
