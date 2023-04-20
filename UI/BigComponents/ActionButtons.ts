import Combine from "../Base/Combine"
import { Store } from "../../Logic/UIEventSource"
import Translations from "../i18n/Translations"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import { Utils } from "../../Utils"
import { MapillaryLink } from "./MapillaryLink"
import { OpenIdEditor, OpenJosm } from "./CopyrightPanel"
import Toggle from "../Input/Toggle"
import { SpecialVisualizationState } from "../SpecialVisualization"

export class BackToThemeOverview extends Toggle {
    constructor(
        state: {
            readonly featureSwitchMoreQuests: Store<boolean>
        },
        options: {
            imgSize: string
        }
    ) {
        const t = Translations.t.general
        const button = new SubtleButton(Svg.add_ui(), t.backToIndex, options).onClick(() => {
            const path = window.location.href.split("/")
            path.pop()
            path.push("index.html")
            window.location.href = path.join("/")
        })

        super(button, undefined, state.featureSwitchMoreQuests)
    }
}

export class ActionButtons extends Combine {
    constructor(state:SpecialVisualizationState) {
        const imgSize = "h-6 w-6"
        const iconStyle = "height: 1.5rem; width: 1.5rem"
        const t = Translations.t.general.attribution

        super([
            new BackToThemeOverview(state, { imgSize }),

            new SubtleButton(Svg.liberapay_ui(), t.donate, {
                url: "https://liberapay.com/pietervdvn/",
                newTab: true,
                imgSize,
            }),
            new SubtleButton(Svg.bug_ui(), t.openIssueTracker, {
                url: "https://github.com/pietervdvn/MapComplete/issues",
                newTab: true,
                imgSize,
            }),
            new SubtleButton(
                Svg.statistics_ui(),
                t.openOsmcha.Subs({ theme: state.layoutToUse.title }),
                {
                    url: Utils.OsmChaLinkFor(31, state.layoutToUse.id),
                    newTab: true,
                    imgSize,
                }
            ),
            new SubtleButton(Svg.mastodon_ui(), t.followOnMastodon, {
                url: "https://en.osm.town/@MapComplete",
                newTab: true,
                imgSize,
            }),
            new OpenIdEditor(state, iconStyle),
            new MapillaryLink(state, iconStyle),
            new OpenJosm(state.osmConnection,state.mapProperties.bounds, iconStyle).SetClass("hidden-on-mobile"),
        ])
        this.SetClass("block w-full link-no-underline")
    }
}
