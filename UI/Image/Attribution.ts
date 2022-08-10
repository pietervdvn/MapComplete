import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import {Store, UIEventSource} from "../../Logic/UIEventSource";
import {LicenseInfo} from "../../Logic/ImageProviders/LicenseInfo";
import {FixedUiElement} from "../Base/FixedUiElement";

export default class Attribution extends VariableUiElement {

    constructor(license: Store<LicenseInfo>, icon: BaseUIElement, date?: Date) {
        if (license === undefined) {
            throw "No license source given in the attribution element"
        }
        super(
            license.map((license: LicenseInfo) => {
                if (license === undefined) {
                    return undefined
                }

                return new Combine([
                    icon?.SetClass("block left").SetStyle("height: 2em; width: 2em; padding-right: 0.5em;"),

                    new Combine([
                        Translations.W(license?.title).SetClass("block"),
                        Translations.W(license?.artist ?? "").SetClass("block font-bold"),
                        Translations.W(license?.license ?? license?.licenseShortName),
                        date === undefined ? undefined : new FixedUiElement(date.toLocaleDateString())
                    ]).SetClass("flex flex-col")
                ]).SetClass("flex flex-row bg-black text-white text-sm absolute bottom-0 left-0 p-0.5 pl-5 pr-3 rounded-lg no-images")

            }));
    }

}