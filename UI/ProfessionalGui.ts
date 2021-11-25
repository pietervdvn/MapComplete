import {FixedUiElement} from "./Base/FixedUiElement";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import Title from "./Base/Title";
import Toggleable, {Accordeon} from "./Base/Toggleable";
import List from "./Base/List";

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

        new Combine([
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


        ])
            .SetClass("flex flex-col pb-12 m-5 lg:w-3/4 lg:ml-40")
            .AttachTo("main")

    }


}

new FixedUiElement("").AttachTo("decoration-desktop")
new ProfessionalGui()