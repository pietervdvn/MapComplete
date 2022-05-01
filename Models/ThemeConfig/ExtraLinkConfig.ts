import ExtraLinkConfigJson from "./Json/ExtraLinkConfigJson";
import {Translation} from "../../UI/i18n/Translation";
import Translations from "../../UI/i18n/Translations";

export default class ExtraLinkConfig {
    public readonly icon?: string
    public readonly text?: Translation
    public readonly href: string
    public readonly newTab?: false | boolean
    public readonly requirements?: Set<("iframe" | "no-iframe" | "welcome-message" | "no-welcome-message")>

    constructor(configJson: ExtraLinkConfigJson, context) {
        this.icon = configJson.icon
        this.text = Translations.T(configJson.text, "themes:"+context+".text")
        this.href = configJson.href
        this.newTab = configJson.newTab
        this.requirements = new Set(configJson.requirements)

        for (let requirement of configJson.requirements) {

            if (this.requirements.has(<any>("no-" + requirement))) {
                throw "Conflicting requirements found for " + context + ".extraLink: both '" + requirement + "' and 'no-" + requirement + "' found"
            }
        }

        if (this.icon === undefined && this.text === undefined) {
            throw "At " + context + ".extraLink: define at least an icon or a text to show. Both are undefined, this is not allowed"
        }
    }

}