import Combine from "../Base/Combine"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { BBox } from "../../Logic/BBox"
import Loc from "../../Models/Loc"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import Translations from "../i18n/Translations"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import { Utils } from "../../Utils"
import { MapillaryLink } from "./MapillaryLink"
import TranslatorsPanel from "./TranslatorsPanel"
import { OpenIdEditor, OpenJosm } from "./CopyrightPanel"

export class ActionButtons extends Combine {
    constructor(state: {
        readonly layoutToUse: LayoutConfig
        readonly currentBounds: Store<BBox>
        readonly locationControl: Store<Loc>
        readonly osmConnection: OsmConnection
        readonly isTranslator: Store<boolean>
    }) {
        const imgSize = "h-6 w-6"
        const iconStyle = "height: 1.5rem; width: 1.5rem"
        const t = Translations.t.general.attribution

        super([
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
            new OpenJosm(state, iconStyle).SetClass("hidden-on-mobile"),
            new TranslatorsPanel(state, iconStyle),
        ])
        this.SetClass("block w-full link-no-underline")
    }
}
