import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LicenseInfo} from "../../Logic/ImageProviders/Wikimedia";

export default class Attribution extends VariableUiElement {

    constructor(license: UIEventSource<LicenseInfo>, icon: BaseUIElement) {
        if (license === undefined) {
            throw "No license source given in the attribution element"
        }
        super(
            license.map((license : LicenseInfo) => {

                if (license?.artist === undefined) {
                    return undefined;
                }
                
                return new Combine([
                    icon?.SetClass("block left").SetStyle("height: 2em; width: 2em; padding-right: 0.5em;"),

                    new Combine([
                        Translations.W(license.artist).SetClass("block font-bold"),
                        Translations.W((license.license ?? "") === "" ? "CC0" : (license.license ?? ""))
                    ]).SetClass("flex flex-col")
                ]).SetClass("flex flex-row bg-black text-white text-sm absolute bottom-0 left-0 p-0.5 pl-5 pr-3 rounded-lg")

            }));
    }

}