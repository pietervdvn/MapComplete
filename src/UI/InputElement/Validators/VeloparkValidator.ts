import { Translation } from "../../i18n/Translation"
import UrlValidator from "./UrlValidator"

export default class VeloparkValidator extends UrlValidator {
    constructor() {
        super("velopark", "A special URL-validator that checks the domain name and rewrites to the correct velopark format.")
    }

    getFeedback(s: string): Translation {
        const superF = super.getFeedback(s)
        if (superF) {
            return superF
        }
        const url = new URL(s)
        if (
            url.hostname !== "velopark.be" &&
            url.hostname !== "www.velopark.be" &&
            url.hostname !== "data.velopark.be"
        ) {
            return new Translation({ "*": "Invalid hostname, expected velopark.be" })
        }

        if (
            !s.startsWith("https://data.velopark.be/data/") &&
            !s.startsWith("https://www.velopark.be/static/data/")
        ) {
            return new Translation({
                "*": "A valid URL should either start with https://data.velopark.be/data/ or https://www.velopark.be/static/data/",
            })
        }
    }

    public isValid(str: string) {
        return super.isValid(str)
    }

    reformat(str: string): string {
        const url = new URL(super.reformat(str))
        if (url.pathname.startsWith("/static/data/")) {
            const id = str.substring(str.lastIndexOf("/") + 1)
            return "https://data.velopark.be/data/" + id
        }
        return super.reformat(str)
    }
}
