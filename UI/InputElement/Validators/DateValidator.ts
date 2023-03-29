import { Validator } from "../ValidatedTextField"

export default class DateValidator extends Validator {
    constructor() {
        super("date", "A date with date picker")
    }

    isValid(str: string): boolean {
        return !isNaN(new Date(str).getTime())
    }

    reformat(str: string) {
        const d = new Date(str)
        let month = "" + (d.getMonth() + 1)
        let day = "" + d.getDate()
        const year = d.getFullYear()

        if (month.length < 2) month = "0" + month
        if (day.length < 2) day = "0" + day

        return [year, month, day].join("-")
    }
}
