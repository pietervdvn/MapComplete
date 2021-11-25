import Combine from "../Base/Combine";
import * as welcome_messages from "../../assets/welcome_message.json"
import BaseUIElement from "../BaseUIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import MoreScreen from "./MoreScreen";
import {AllKnownLayouts} from "../../Customizations/AllKnownLayouts";
import Translations from "../i18n/Translations";
import Title from "../Base/Title";

export default class FeaturedMessage extends Combine {


    constructor() {
        const now = new Date()
        let welcome_message = undefined;
        for (const wm of FeaturedMessage.WelcomeMessages()) {
            if (wm.start_date >= now) {
                continue
            }
            if (wm.end_date <= now) {
                continue
            }

            if (welcome_message !== undefined) {
                console.warn("Multiple applicable messages today:", welcome_message.featured_theme)
            }
            welcome_message = wm;
        }
        welcome_message = welcome_message ?? undefined

        super([FeaturedMessage.CreateFeaturedBox(welcome_message)]);
    }

    public static WelcomeMessages(): { start_date: Date, end_date: Date, message: string, featured_theme?: string }[] {
        const all_messages: { start_date: Date, end_date: Date, message: string, featured_theme?: string }[] = []
        for (const i in welcome_messages) {
            if (isNaN(Number(i))) {
                continue
            }
            const wm = welcome_messages[i]
            if (wm === null) {
                continue
            }
            if (AllKnownLayouts.allKnownLayouts.get(wm.featured_theme) === undefined) {
                console.error("Unkown featured theme for ", wm)
                continue
            }

            if (!wm.message) {
                console.error("Featured message is missing for", wm)
                continue
            }

            all_messages.push({
                start_date: new Date(wm.start_date),
                end_date: new Date(wm.end_date),
                message: wm.message,
                featured_theme: wm.featured_theme
            })

        }
        return all_messages
    }

    public static CreateFeaturedBox(welcome_message: { message: string, featured_theme?: string }): BaseUIElement {
        const els: BaseUIElement[] = []
        if (welcome_message === undefined) {
            return undefined;
        }
        const title = new Title(Translations.t.index.featuredThemeTitle.Clone())
        const msg = new FixedUiElement(welcome_message.message).SetClass("link-underline font-lg")
        els.push(new Combine([title, msg]).SetClass("m-4"))
        if (welcome_message.featured_theme !== undefined) {
            els.push(MoreScreen.createLinkButton({}, AllKnownLayouts.allKnownLayouts.get(welcome_message.featured_theme))
                .SetClass("m-4 self-center md:w-160")
                .SetStyle("height: min-content;"))


        }
        return new Combine(els).SetClass("border-2 border-grey-400 rounded-xl flex flex-col md:flex-row");
    }

}