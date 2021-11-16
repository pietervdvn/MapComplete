import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import Title from "../Base/Title";

export default class PrivacyPolicy extends Combine {
    constructor() {
        const t = Translations.t.privacy
        super([
            new Title(t.title, 2),
            t.intro,

            new Title(t.trackingTitle),
            t.tracking,
            new Title(t.geodataTitle),
            t.geodata,
            new Title(t.editingTitle),
            t.editing,
            new Title(t.miscCookiesTitle),
            t.miscCookies,
            new Title(t.whileYoureHere),
            t.surveillance,

        ]);
        this.SetClass("link-underline")
    }
}