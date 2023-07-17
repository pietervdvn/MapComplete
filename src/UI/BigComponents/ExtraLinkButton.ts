import { UIElement } from "../UIElement"
import BaseUIElement from "../BaseUIElement"
import { Store } from "../../Logic/UIEventSource"
import ExtraLinkConfig from "../../Models/ThemeConfig/ExtraLinkConfig"
import Img from "../Base/Img"
import { SubtleButton } from "../Base/SubtleButton"
import Toggle from "../Input/Toggle"
import Locale from "../i18n/Locale"
import { Utils } from "../../Utils"
import Svg from "../../Svg"
import Translations from "../i18n/Translations"
import { Translation } from "../i18n/Translation"

interface ExtraLinkButtonState {
    layout: { id: string; title: Translation }
    featureSwitches: { featureSwitchWelcomeMessage: Store<boolean> }
    mapProperties: {
        location: Store<{ lon: number; lat: number }>
        zoom: Store<number>
    }
}
export default class ExtraLinkButton extends UIElement {
    private readonly _config: ExtraLinkConfig
    private readonly state: ExtraLinkButtonState

    constructor(state: ExtraLinkButtonState, config: ExtraLinkConfig) {
        super()
        this.state = state
        this._config = config
    }

    protected InnerRender(): BaseUIElement {
        if (this._config === undefined) {
            return undefined
        }

        const c = this._config

        const isIframe = window !== window.top
        if (c.requirements?.has("iframe") && !isIframe) {
            return undefined
        }

        if (c.requirements?.has("no-iframe") && isIframe) {
            return undefined
        }

        let link: BaseUIElement
        const theme = this.state.layout?.id ?? ""
        const basepath = window.location.host
        const href = this.state.mapProperties.location.map(
            (loc) => {
                const subs = {
                    ...loc,
                    theme: theme,
                    basepath,
                    language: Locale.language.data,
                }
                return Utils.SubstituteKeys(c.href, subs)
            },
            [this.state.mapProperties.zoom]
        )

        let img: BaseUIElement = Svg.pop_out_svg()
        if (c.icon !== undefined) {
            img = new Img(c.icon).SetClass("h-6")
        }

        let text: Translation
        if (c.text === undefined) {
            text = Translations.t.general.screenToSmall.Subs({
                theme: this.state.layout.title,
            })
        } else {
            text = c.text.Clone()
        }

        link = new SubtleButton(img, text, {
            url: href,
            newTab: c.newTab,
        })

        if (c.requirements?.has("no-welcome-message")) {
            link = new Toggle(
                undefined,
                link,
                this.state.featureSwitches.featureSwitchWelcomeMessage
            )
        }

        if (c.requirements?.has("welcome-message")) {
            link = new Toggle(
                link,
                undefined,
                this.state.featureSwitches.featureSwitchWelcomeMessage
            )
        }

        return link
    }
}
