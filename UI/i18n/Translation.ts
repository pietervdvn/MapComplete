import {UIElement} from "../UIElement"
import Locale from "./Locale"
import {FixedUiElement} from "../Base/FixedUiElement";
import {TagUtils} from "../../Logic/TagsFilter";
import Combine from "../Base/Combine";


export default class Translation extends UIElement {

    private static forcedLanguage = undefined;

    public Subs(text: any /*Map<string, string | UIElement>*/) {
        const newTranslations = {};
        for (const lang in this.translations) {
            let template: string = this.translations[lang];
            for (const k in text) {
                const combined = [];
                const parts = template.split("{" + k + "}");
                const el: string | UIElement = text[k];
                let rtext: string = "";
                if (typeof (el) === "string") {
                    rtext = el;
                } else {
                    Translation.forcedLanguage = lang; // This is a very dirty hack - it'll bite me one day
                    rtext = el.InnerRender();
                }
                for (let i = 0; i < parts.length - 1; i++) {
                    combined.push(parts[i]);
                    combined.push(rtext)
                }
                combined.push(parts[parts.length - 1]);
                template = new Combine(combined).InnerRender();
            }
            newTranslations[lang] = template;
        }
        Translation.forcedLanguage = undefined;
        return new Translation(newTranslations);

    }


    get txt(): string {
        const txt = this.translations[Translation.forcedLanguage ?? Locale.language.data];
        if (txt !== undefined) {
            return txt;
        }
        const en = this.translations["en"];
        console.warn("No translation for language ", Locale.language.data, "for", en);
        if (en !== undefined) {
            return en;
        }
        for (const i in this.translations) {
            return this.translations[i]; // Return a random language
        }
        return "Missing translation"
    }

    InnerRender(): string {
        return this.txt
    }

    public readonly translations: object

    constructor(translations: object) {
        super(Locale.language)
        this.translations = translations
    }


    public R(): string {
        return new Translation(this.translations).Render();
    }

    public Clone() {
        return new Translation(this.translations)
    }

 
}
