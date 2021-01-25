import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import {FixedUiElement} from "../Base/FixedUiElement";

export default class IndexText extends Combine {
    constructor() {
        super([
            new FixedUiElement(`<img class="w-12 h-12 sm:h-24 sm:w-24" src="./assets/svg/logo.svg" alt="MapComplete Logo">`)
                .SetClass("flex-none m-3"),

            new Combine([
                Translations.t.index.title
                    .SetClass("text-2xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl block text-gray-800 xl:inline"),

                Translations.t.index.intro.SetClass(
                    "mt-3 text-base font-semibold text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"),

                Translations.t.index.pickTheme.SetClass("mt-3 text-base text-green-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0")

            ]).SetClass("flex flex-col sm:text-center lg:text-left m-1 mt-2 md:m-2 md:mt-4")
        ]);


        this.SetClass("flex flex-row");
    }

}