import {FixedUiElement} from "./Base/FixedUiElement";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import Title from "./Base/Title";
import Toggleable, {Accordeon} from "./Base/Toggleable";
import List from "./Base/List";
import BaseUIElement from "./BaseUIElement";
import Link from "./Base/Link";

class TableOfContents extends Combine {

    /**
     * All the padding levels. Note that these are written out so that tailwind-generate-css can detect them
     * @private
     */
    private static readonly paddings: string[] = ["pl-0, pl-2", "pl-4", "pl-6", "pl-8", "pl-10", "pl-12", "pl-14"]
    private readonly titles: Title[]

    constructor(elements: Combine | Title[]) {
        let titles: Title[]
        if (elements instanceof Combine) {
            titles = elements.getToC()
        } else {
            titles = elements
        }

        const minLevel = Math.min(...titles.map(t => t.level))

        const els: BaseUIElement[] = []
        for (const title of titles) {
            const l = title.level - minLevel
            const padding = TableOfContents.paddings[l]
            const text = title.title.ConstructElement().innerText
            const vis = new Link(new FixedUiElement(text), "#" + text).SetClass(padding)
            els.push(vis)
        }
        super(els);
        this.SetClass("flex flex-col")
        this.titles = titles;
    }

    AsMarkdown(): string {
        return super.AsMarkdown();
    }
}

class Snippet extends Toggleable {
    constructor(translations) {
        super(
            new Title(translations.title, 3),
            new Combine([
                translations.intro,
                new List([
                    translations.li0,
                    translations.li1,
                    translations.li2,
                    translations.li3,
                    translations.li4,
                    translations.li5,
                    translations.li6,
                ]),
                translations.outro
            ]).SetClass("flex flex-col")
        )
    }
}

export default class ProfessionalGui {


    constructor() {
        const t = Translations.t.professional

        //  LanguagePicker.CreateLanguagePicker(Translations.t.index.title.SupportedLanguages()).SetClass("flex absolute top-2 right-3"),
        const content = new Combine([
            new Combine([
                new FixedUiElement(`<img class="w-12 h-12 sm:h-24 sm:w-24" src="./assets/svg/logo.svg" alt="MapComplete Logo">`)
                    .SetClass("flex-none m-3"),
                new Combine([

                    new Title(t.title, 1).SetClass("font-bold text-3xl"),
                    t.intro
                ]).SetClass("flex flex-col")

            ]).SetClass("flex"),

            new Title(t.osmTitle, 2).SetClass("text-2xl"),
            t.text0,
            t.text1,
            new Accordeon([
                new Snippet(t.aboutOsm.aboutOsm),
                new Snippet(t.aboutOsm.benefits),
                new Snippet(t.aboutOsm.license),
                new Snippet(t.aboutOsm.vandalism),
            ]).SetClass("flex flex-col"),

            new Title(t.aboutMc.title, 2).SetClass("text-2xl"),
            t.aboutMc.text0,
            t.aboutMc.text1,
            t.aboutMc.text2


        ]).SetClass("flex flex-col pb-12 m-3 lg:w-3/4 lg:ml-10")

        const toc = new TableOfContents(content)
        new Combine([toc, content]).SetClass("flex").AttachTo("main")

    }


}

new FixedUiElement("").AttachTo("decoration-desktop")
new ProfessionalGui()