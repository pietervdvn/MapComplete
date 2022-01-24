import {FixedUiElement} from "./Base/FixedUiElement";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import Title from "./Base/Title";
import Toggleable, {Accordeon} from "./Base/Toggleable";
import List from "./Base/List";
import BaseUIElement from "./BaseUIElement";
import LanguagePicker from "./LanguagePicker";
import TableOfContents from "./Base/TableOfContents";
import BackToIndex from "./BigComponents/BackToIndex";
import LeftIndex from "./Base/LeftIndex";

class Snippet extends Toggleable {
    constructor(translations, ...extraContent: BaseUIElement[]) {
        super(
            new Title(translations.title, 3),
            new SnippetContent(translations, ...extraContent)
        )
    }
}


class SnippetContent extends Combine {
    constructor(translations:any, ...extras: BaseUIElement[]) {
           super([
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
                translations.outro,
                ...extras
            ])
            this.SetClass("flex flex-col")
    }
}

class ProfessionalGui extends LeftIndex{


    constructor() {
        const t = Translations.t.professional


        const header = new Combine([
            new FixedUiElement(`<img class="w-12 h-12 sm:h-24 sm:w-24" src="./assets/svg/logo.svg" alt="MapComplete Logo">`)
                .SetClass("flex-none m-3"),
            new Combine([
                new Title(t.title, 1),
                t.intro
            ]).SetClass("flex flex-col")
        ]).SetClass("flex")

        const content = new Combine([
            header,
            new Title(t.osmTitle, 2),
            t.text0,
            t.text1,
            new Accordeon([
                new Snippet(t.aboutOsm.aboutOsm),
                new Snippet(t.aboutOsm.benefits),
                new Snippet(t.aboutOsm.license),
                new Snippet(t.aboutOsm.vandalism),
            ]).SetClass("flex flex-col"),

            new Title(t.aboutMc.title, 2),
            t.aboutMc.text0,
            t.aboutMc.text1,
            t.aboutMc.text2,
            new Accordeon([
                new Snippet(t.aboutMc.layers),
                new Snippet(t.aboutMc.survey),
                new Snippet(t.aboutMc.internalUse),
                new Snippet(t.services)
            ]),
            new Title(t.drawbacks.title, 2).SetClass("text-2xl"),
            t.drawbacks.intro,
            new Accordeon([
                new Snippet(t.drawbacks.unsuitedData),
                new Snippet(t.drawbacks.licenseNuances,
                   new Title( t.drawbacks.licenseNuances.usecaseMapDifferentSources.title, 4),
                    new SnippetContent(t.drawbacks.licenseNuances.usecaseMapDifferentSources),
                    new Title( t.drawbacks.licenseNuances.usecaseGatheringOpenData.title, 4),
                    new SnippetContent(t.drawbacks.licenseNuances.usecaseGatheringOpenData)
                    )
            ]),

        ]).SetClass("flex flex-col pb-12 m-3 lg:w-3/4 lg:ml-10 link-underline")


        const leftContents: BaseUIElement[] = [
            new TableOfContents(content, {
                noTopLevel: true,
                maxDepth: 2
            }).SetClass("subtle"),
            
            LanguagePicker.CreateLanguagePicker(Translations.t.professional.title.SupportedLanguages())?.SetClass("mt-4 self-end flex-col"),
        ].map(el => el?.SetClass("pl-4"))
        
        super(leftContents, content)

    }


}

new FixedUiElement("").AttachTo("decoration-desktop")
new ProfessionalGui().AttachTo("main")