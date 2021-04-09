import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import Attribution from "./Attribution";
import State from "../../State";
import {UIEventSource} from "../../Logic/UIEventSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import {FixedUiElement} from "../Base/FixedUiElement";
import * as licenses from "../../assets/generated/license_info.json"
import SmallLicense from "../../Models/smallLicense";
import {Icon} from "leaflet";
import Img from "../Base/Img";

/**
 * The attribution panel shown on mobile
 */
export default class AttributionPanel extends Combine {

    private static LicenseObject = AttributionPanel.GenerateLicenses();

    constructor(layoutToUse: UIEventSource<LayoutConfig>) {
        super([
            Translations.t.general.attribution.attributionContent,

            ((layoutToUse.data.maintainer ?? "") == "") ? "" : Translations.t.general.attribution.themeBy.Subs({author: layoutToUse.data.maintainer}),
            layoutToUse.data.credits ,
            "<br/>",
            new Attribution(undefined, undefined, State.state.layoutToUse, undefined),
            "<br/>",
            Translations.t.general.attribution.iconAttribution.title.Clone().SetClass("font-bold pt-12 pb-3"),
            ...Array.from(layoutToUse.data.ExtractImages()).map(AttributionPanel.IconAttribution)
        ]);
        this.SetClass("flex flex-col")
    }

    private static IconAttribution(iconPath: string) {
        console.log("Attribution panel for ", iconPath)
        if (iconPath.startsWith("http")) {
            iconPath = "." + new URL(iconPath).pathname;
        }

        const license: SmallLicense = AttributionPanel.LicenseObject[iconPath]
        if (license == undefined) {
            return undefined;
        }
        if(license.license.indexOf("trivial")>=0){
            return undefined;
        }

        return new Combine([
            `<img src='${iconPath}' style="width: 50px; height: 50px; margin-right: 0.5em;">`,
            new Combine([
                new FixedUiElement(license.authors.join("; ")).SetClass("font-bold"),
                new Combine([license.license,  license.sources.length > 0 ? " - " : "", 
                    ...license.sources.map(link => `<a href='${link}' target="_blank">${new URL(link).hostname}</a> `)]).SetClass("block")
            ]).SetClass("flex flex-col")
        ]).SetClass("flex")
    }

    private static GenerateLicenses() {
        const allLicenses = {}
        for (const key in licenses) {
            const license: SmallLicense = licenses[key];
            allLicenses[license.path] = license
        }
        return allLicenses;
    }
}