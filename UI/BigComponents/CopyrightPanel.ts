import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import {UIEventSource} from "../../Logic/UIEventSource";
import {FixedUiElement} from "../Base/FixedUiElement";
import * as licenses from "../../assets/generated/license_info.json"
import SmallLicense from "../../Models/smallLicense";
import {Utils} from "../../Utils";
import Link from "../Base/Link";
import {VariableUiElement} from "../Base/VariableUIElement";
import * as contributors from "../../assets/contributors.json"
import BaseUIElement from "../BaseUIElement";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import Title from "../Base/Title";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";
import {BBox} from "../../Logic/BBox";
import Loc from "../../Models/Loc";
import Toggle from "../Input/Toggle";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import Constants from "../../Models/Constants";
import ContributorCount from "../../Logic/ContributorCount";

export class OpenIdEditor extends VariableUiElement {
    constructor(state: { locationControl: UIEventSource<Loc> }, iconStyle?: string, objectId?: string) {
        const t = Translations.t.general.attribution
        super(state.locationControl.map(location => {
            let elementSelect = "";
            if (objectId !== undefined) {
                const parts = objectId.split("/")
                const tp = parts[0]
                if (parts.length === 2 && !isNaN(Number(parts[1])) && (tp === "node" || tp === "way" || tp === "relation")) {
                    elementSelect = "&" + tp + "=" + parts[1]
                }
            }
            const idLink = `https://www.openstreetmap.org/edit?editor=id${elementSelect}#map=${location?.zoom ?? 0}/${location?.lat ?? 0}/${location?.lon ?? 0}`
            return new SubtleButton(Svg.pencil_ui().SetStyle(iconStyle), t.editId, {url: idLink, newTab: true})
        }));
    }

}

export class OpenMapillary extends VariableUiElement {
    constructor(state: { locationControl: UIEventSource<Loc> }, iconStyle?: string) {
        const t = Translations.t.general.attribution
        super(state.locationControl.map(location => {
            const mapillaryLink = `https://www.mapillary.com/app/?focus=map&lat=${location?.lat ?? 0}&lng=${location?.lon ?? 0}&z=${Math.max((location?.zoom ?? 2) - 1, 1)}`
            return new SubtleButton(Svg.mapillary_black_ui().SetStyle(iconStyle), t.openMapillary, {
                url: mapillaryLink,
                newTab: true
            })
        }))
    }
}

export class OpenJosm extends Combine {

    constructor(state: { osmConnection: OsmConnection, currentBounds: UIEventSource<BBox>, }, iconStyle?: string) {
        const t = Translations.t.general.attribution

        const josmState = new UIEventSource<string>(undefined)
        // Reset after 15s
        josmState.stabilized(15000).addCallbackD(_ => josmState.setData(undefined))

        const stateIndication = new VariableUiElement(josmState.map(state => {
            if (state === undefined) {
                return undefined
            }
            state = state.toUpperCase()
            if (state === "OK") {
                return t.josmOpened.SetClass("thanks")
            }
            return t.josmNotOpened.SetClass("alert")
        }));

        const toggle = new Toggle(
            new SubtleButton(Svg.josm_logo_ui().SetStyle(iconStyle), t.editJosm).onClick(() => {
                const bounds: any = state.currentBounds.data;
                if (bounds === undefined) {
                    return undefined
                }
                const top = bounds.getNorth();
                const bottom = bounds.getSouth();
                const right = bounds.getEast();
                const left = bounds.getWest();
                const josmLink = `http://127.0.0.1:8111/load_and_zoom?left=${left}&right=${right}&top=${top}&bottom=${bottom}`
                Utils.download(josmLink).then(answer => josmState.setData(answer.replace(/\n/g, '').trim())).catch(_ => josmState.setData("ERROR"))
            }), undefined, state.osmConnection.userDetails.map(ud => ud.loggedIn && ud.csCount >= Constants.userJourney.historyLinkVisible))

        super([stateIndication, toggle]);

    }


}


/**
 * The attribution panel shown on mobile
 */
export default class CopyrightPanel extends Combine {

    private static LicenseObject = CopyrightPanel.GenerateLicenses();

    constructor(state: {
        layoutToUse: LayoutConfig,
        featurePipeline: FeaturePipeline,
        currentBounds: UIEventSource<BBox>,
        locationControl: UIEventSource<Loc>,
        osmConnection: OsmConnection
    }) {

        const t = Translations.t.general.attribution
        const layoutToUse = state.layoutToUse
        const iconStyle = "height: 1.5rem; width: auto"
        const actionButtons = [
            new SubtleButton(Svg.liberapay_ui().SetStyle(iconStyle), t.donate, {
                url: "https://liberapay.com/pietervdvn/",
                newTab: true
            }),
            new SubtleButton(Svg.bug_ui().SetStyle(iconStyle), t.openIssueTracker, {
                url: "https://github.com/pietervdvn/MapComplete/issues",
                newTab: true
            }),
            new SubtleButton(Svg.statistics_ui().SetStyle(iconStyle), t.openOsmcha.Subs({theme: state.layoutToUse.title}), {
                url: Utils.OsmChaLinkFor(31, state.layoutToUse.id),
                newTab: true
            }),
            new OpenIdEditor(state, iconStyle),
            new OpenMapillary(state, iconStyle),
            new OpenJosm(state, iconStyle)
        ]

        const iconAttributions = Utils.NoNull(Array.from(layoutToUse.ExtractImages()))
            .map(CopyrightPanel.IconAttribution)

        let maintainer: BaseUIElement = undefined
        if (layoutToUse.maintainer !== undefined && layoutToUse.maintainer !== "" && layoutToUse.maintainer.toLowerCase() !== "mapcomplete") {
            maintainer = Translations.t.general.attribution.themeBy.Subs({author: layoutToUse.maintainer})
        }

        const contributions = new ContributorCount(state).Contributors

        super([
            Translations.t.general.attribution.attributionContent,
            new FixedUiElement("MapComplete " + Constants.vNumber).SetClass("font-bold"),
            maintainer,
            new Combine(actionButtons).SetClass("block w-full"),
            new FixedUiElement(layoutToUse.credits),
            new VariableUiElement(contributions.map(contributions => {
                if (contributions === undefined) {
                    return ""
                }
                const sorted = Array.from(contributions, ([name, value]) => ({
                    name,
                    value
                })).filter(x => x.name !== undefined && x.name !== "undefined");
                if (sorted.length === 0) {
                    return "";
                }
                sorted.sort((a, b) => b.value - a.value);
                let hiddenCount = 0;
                if (sorted.length > 10) {
                    hiddenCount = sorted.length - 10
                    sorted.splice(10, sorted.length - 10)
                }
                const links = sorted.map(kv => `<a href="https://openstreetmap.org/user/${kv.name}" target="_blank">${kv.name}</a>`)
                const contribs = links.join(", ")

                if (hiddenCount <= 0) {
                    return Translations.t.general.attribution.mapContributionsBy.Subs({
                        contributors: contribs
                    })
                } else {
                    return Translations.t.general.attribution.mapContributionsByAndHidden.Subs({
                        contributors: contribs,
                        hiddenCount: hiddenCount
                    });
                }


            })),
            CopyrightPanel.CodeContributors(),
            new Title(t.iconAttribution.title, 3),
            ...iconAttributions
        ].map(e => e?.SetClass("mt-4")));
        this.SetClass("flex flex-col link-underline overflow-hidden")
        this.SetStyle("max-width:100%; width: 40rem; margin-left: 0.75rem; margin-right: 0.5rem")
    }

    private static CodeContributors(): BaseUIElement {

        const total = contributors.contributors.length;
        let filtered = [...contributors.contributors]

        filtered.splice(10, total - 10);

        let contribsStr = filtered.map(c => c.contributor).join(", ")

        if (contribsStr === "") {
            // Hmm, something went wrong loading the contributors list. Lets show nothing
            return undefined;
        }

        return Translations.t.general.attribution.codeContributionsBy.Subs({
            contributors: contribsStr,
            hiddenCount: total - 10
        });
    }

    private static IconAttribution(iconPath: string): BaseUIElement {
        if (iconPath.startsWith("http")) {
            iconPath = "." + new URL(iconPath).pathname;
        }

        const license: SmallLicense = CopyrightPanel.LicenseObject[iconPath]
        if (license == undefined) {
            return undefined;
        }
        if (license.license.indexOf("trivial") >= 0) {
            return undefined;
        }

        const sources = Utils.NoNull(Utils.NoEmpty(license.sources))

        return new Combine([
            `<img src='${iconPath}' style="width: 50px; height: 50px; min-width: 50px; min-height: 50px;  margin-right: 0.5em;">`,
            new Combine([
                new FixedUiElement(license.authors.join("; ")).SetClass("font-bold"),
                new Combine([license.license,
                        sources.length > 0 ? " - " : "",
                        ...sources.map(lnk => {
                            let sourceLinkContent = lnk;
                            try {
                                sourceLinkContent = new URL(lnk).hostname
                            } catch {
                                console.error("Not a valid URL:", lnk)
                            }
                            return new Link(sourceLinkContent, lnk, true);
                        })
                    ]
                ).SetClass("block m-2")

            ]).SetClass("flex flex-col").SetStyle("width: calc(100% - 50px - 0.5em); min-width: 12rem;")
        ]).SetClass("flex flex-wrap border-b border-gray-300 m-2 border-box")
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