import { Validator } from "../Validator"
import { Translation } from "../../i18n/Translation"
import Translations from "../../i18n/Translations"

export default class FediverseValidator extends Validator {
    public static readonly usernameAtServer: RegExp = /^@?(\w+)@((\w|-|\.)+)$/

    constructor() {
        super(
            "fediverse",
            "Validates fediverse addresses and normalizes them into `@username@server`-format"
        )
    }

    /**
     * Returns an `@username@host`
     * @param s
     */
    reformat(s: string): string {
        s = s.trim()
        if (!s.startsWith("@")) {
            s = "@" + s
        }
        if (s.match(FediverseValidator.usernameAtServer)) {
            return s
        }
        try {
            const url = new URL(s)
            const path = url.pathname
            if (path.match(/^\/\w+$/)) {
                return `@${path.substring(1)}@${url.hostname}`
            }
        } catch (e) {
            // Nothing to do here
        }
        return undefined
    }
    getFeedback(s: string): Translation | undefined {
        s = s.trim()
        const match = s.match(FediverseValidator.usernameAtServer)
        console.log("Match:", match)
        if (match) {
            const host = match[2]
            try {
                new URL("https://" + host)
                return undefined
            } catch (e) {
                return Translations.t.validation.fediverse.invalidHost.Subs({ host })
            }
        }
        try {
            const url = new URL(s)
            const path = url.pathname
            if (path.match(/^\/\w+$/)) {
                return undefined
            }
        } catch (e) {
            // Nothing to do here
        }
        return Translations.t.validation.fediverse.feedback
    }

    isValid(s): boolean {
        return this.getFeedback(s) === undefined
    }
}
