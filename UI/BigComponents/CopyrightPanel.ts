import Combine from "../Base/Combine"
import Translations from "../i18n/Translations"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { FixedUiElement } from "../Base/FixedUiElement"
import licenses from "../../assets/generated/license_info.json"
import SmallLicense from "../../Models/smallLicense"
import { Utils } from "../../Utils"
import Link from "../Base/Link"
import { VariableUiElement } from "../Base/VariableUIElement"
import contributors from "../../assets/contributors.json"
import translators from "../../assets/translators.json"
import BaseUIElement from "../BaseUIElement"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import Title from "../Base/Title"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import { BBox } from "../../Logic/BBox"
import Toggle from "../Input/Toggle"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import Constants from "../../Models/Constants"
import ContributorCount from "../../Logic/ContributorCount"
import Img from "../Base/Img"
import { TypedTranslation } from "../i18n/Translation"
import GeoIndexedStore from "../../Logic/FeatureSource/Actors/GeoIndexedStore"

export class OpenIdEditor extends VariableUiElement {
    constructor(
        mapProperties: { location: Store<{ lon: number; lat: number }>; zoom: Store<number> },
        iconStyle?: string,
        objectId?: string
    ) {
        const t = Translations.t.general.attribution
        super(
            mapProperties.location.map(
                (location) => {
                    let elementSelect = ""
                    if (objectId !== undefined) {
                        const parts = objectId.split("/")
                        const tp = parts[0]
                        if (
                            parts.length === 2 &&
                            !isNaN(Number(parts[1])) &&
                            (tp === "node" || tp === "way" || tp === "relation")
                        ) {
                            elementSelect = "&" + tp + "=" + parts[1]
                        }
                    }
                    const idLink = `https://www.openstreetmap.org/edit?editor=id${elementSelect}#map=${
                        mapProperties.zoom?.data ?? 0
                    }/${location?.lat ?? 0}/${location?.lon ?? 0}`
                    return new SubtleButton(Svg.pencil_svg().SetStyle(iconStyle), t.editId, {
                        url: idLink,
                        newTab: true,
                    })
                },
                [mapProperties.zoom]
            )
        )
    }
}

export class OpenJosm extends Combine {
    constructor(osmConnection: OsmConnection, bounds: Store<BBox>, iconStyle?: string) {
        const t = Translations.t.general.attribution

        const josmState = new UIEventSource<string>(undefined)
        // Reset after 15s
        josmState.stabilized(15000).addCallbackD((_) => josmState.setData(undefined))

        const stateIndication = new VariableUiElement(
            josmState.map((state) => {
                if (state === undefined) {
                    return undefined
                }
                state = state.toUpperCase()
                if (state === "OK") {
                    return t.josmOpened.SetClass("thanks")
                }
                return t.josmNotOpened.SetClass("alert")
            })
        )

        const toggle = new Toggle(
            new SubtleButton(Svg.josm_logo_svg().SetStyle(iconStyle), t.editJosm).onClick(() => {
                const bbox = bounds.data
                if (bbox === undefined) {
                    return
                }
                const top = bbox.getNorth()
                const bottom = bbox.getSouth()
                const right = bbox.getEast()
                const left = bbox.getWest()
                const josmLink = `http://127.0.0.1:8111/load_and_zoom?left=${left}&right=${right}&top=${top}&bottom=${bottom}`
                Utils.download(josmLink)
                    .then((answer) => josmState.setData(answer.replace(/\n/g, "").trim()))
                    .catch((_) => josmState.setData("ERROR"))
            }),
            undefined,
            osmConnection.userDetails.map(
                (ud) => ud.loggedIn && ud.csCount >= Constants.userJourney.historyLinkVisible
            )
        )

        super([stateIndication, toggle])
    }
}

/**
 * The attribution panel shown on mobile
 */
export default class CopyrightPanel extends Combine {
    private static LicenseObject = CopyrightPanel.GenerateLicenses()

    constructor(state: {
        layout: LayoutConfig
        mapProperties: { bounds: Store<BBox> }
        osmConnection: OsmConnection
        dataIsLoading: Store<boolean>
        perLayer: ReadonlyMap<string, GeoIndexedStore>
    }) {
        const t = Translations.t.general.attribution
        const layoutToUse = state.layout

        const iconAttributions: BaseUIElement[] = Utils.Dedup(layoutToUse.usedImages).map(
            CopyrightPanel.IconAttribution
        )

        let maintainer: BaseUIElement = undefined
        if (layoutToUse.credits !== undefined && layoutToUse.credits !== "") {
            maintainer = t.themeBy.Subs({ author: layoutToUse.credits })
        }

        const contributions = new ContributorCount(state).Contributors

        const dataContributors = new VariableUiElement(
            contributions.map((contributions) => {
                if (contributions === undefined) {
                    return ""
                }
                const sorted = Array.from(contributions, ([name, value]) => ({
                    name,
                    value,
                })).filter((x) => x.name !== undefined && x.name !== "undefined")
                if (sorted.length === 0) {
                    return ""
                }
                sorted.sort((a, b) => b.value - a.value)
                let hiddenCount = 0
                if (sorted.length > 10) {
                    hiddenCount = sorted.length - 10
                    sorted.splice(10, sorted.length - 10)
                }
                const links = sorted.map(
                    (kv) =>
                        `<a href="https://openstreetmap.org/user/${kv.name}" target="_blank">${kv.name}</a>`
                )
                const contribs = links.join(", ")

                if (hiddenCount <= 0) {
                    return t.mapContributionsBy.Subs({
                        contributors: contribs,
                    })
                } else {
                    return t.mapContributionsByAndHidden.Subs({
                        contributors: contribs,
                        hiddenCount: hiddenCount,
                    })
                }
            })
        )

        super(
            [
                new Title(t.attributionTitle),
                t.attributionContent,
                maintainer,
                dataContributors,
                CopyrightPanel.CodeContributors(contributors, t.codeContributionsBy),
                CopyrightPanel.CodeContributors(translators, t.translatedBy),
                new FixedUiElement("MapComplete " + Constants.vNumber).SetClass("font-bold"),
                new Title(t.iconAttribution.title, 3),
                ...iconAttributions,
            ].map((e) => e?.SetClass("mt-4"))
        )
        this.SetClass("flex flex-col link-underline overflow-hidden")
        this.SetStyle("max-width:100%; width: 40rem; margin-left: 0.75rem; margin-right: 0.5rem")
    }

    private static CodeContributors(
        contributors,
        translation: TypedTranslation<{ contributors; hiddenCount }>
    ): BaseUIElement {
        const total = contributors.contributors.length
        let filtered = [...contributors.contributors]

        filtered.splice(10, total - 10)

        let contribsStr = filtered.map((c) => c.contributor).join(", ")

        if (contribsStr === "") {
            // Hmm, something went wrong loading the contributors list. Lets show nothing
            return undefined
        }

        return translation.Subs({
            contributors: contribsStr,
            hiddenCount: total - 10,
        })
    }

    private static IconAttribution(iconPath: string): BaseUIElement {
        if (iconPath.startsWith("http")) {
            try {
                iconPath = "." + new URL(iconPath).pathname
            } catch (e) {
                console.warn(e)
            }
        }

        const license: SmallLicense = CopyrightPanel.LicenseObject[iconPath]
        if (license == undefined) {
            return undefined
        }
        if (license.license.indexOf("trivial") >= 0) {
            return undefined
        }

        const sources = Utils.NoNull(Utils.NoEmpty(license.sources))

        return new Combine([
            new Img(iconPath).SetClass("w-12 min-h-12 mr-2 mb-2"),
            new Combine([
                new FixedUiElement(license.authors.join("; ")).SetClass("font-bold"),
                license.license,
                new Combine([
                    ...sources.map((lnk) => {
                        let sourceLinkContent = lnk
                        try {
                            sourceLinkContent = new URL(lnk).hostname
                        } catch {
                            console.error("Not a valid URL:", lnk)
                        }
                        return new Link(sourceLinkContent, lnk, true).SetClass("mr-2 mb-2")
                    }),
                ]).SetClass("flex flex-wrap"),
            ])
                .SetClass("flex flex-col")
                .SetStyle("width: calc(100% - 50px - 0.5em); min-width: 12rem;"),
        ]).SetClass("flex flex-wrap border-b border-gray-300 m-2 border-box")
    }

    private static GenerateLicenses() {
        const allLicenses = {}
        for (const key in licenses) {
            const license: SmallLicense = licenses[key]
            allLicenses[license.path] = license
        }
        return allLicenses
    }
}
