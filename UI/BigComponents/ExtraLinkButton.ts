import {UIElement} from "../UIElement";
import BaseUIElement from "../BaseUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import ExtraLinkConfig from "../../Models/ThemeConfig/ExtraLinkConfig";
import Img from "../Base/Img";
import {SubtleButton} from "../Base/SubtleButton";
import Toggle from "../Input/Toggle";
import Loc from "../../Models/Loc";
import Locale from "../i18n/Locale";
import {Utils} from "../../Utils";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import {Translation} from "../i18n/Translation";

export default class ExtraLinkButton extends UIElement {
    private readonly _config: ExtraLinkConfig;
    private readonly state: {
        layoutToUse: { id: string, title: Translation };
        featureSwitchWelcomeMessage: UIEventSource<boolean>, locationControl: UIEventSource<Loc>
    };

    constructor(state: { featureSwitchWelcomeMessage: UIEventSource<boolean>, locationControl: UIEventSource<Loc>, layoutToUse: { id: string, title: Translation } },
                config: ExtraLinkConfig) {
        super();
        this.state = state;
        this._config = config;
    }

    protected InnerRender(): BaseUIElement {
        if (this._config === undefined) {
            return undefined;
        }

        const c = this._config;

        const isIframe = window !== window.top

        if (c.requirements.has("iframe") && !isIframe) {
            return undefined
        }

        if (c.requirements.has("no-iframe") && isIframe) {
            return undefined
        }

        let link: BaseUIElement
        const theme = this.state.layoutToUse?.id ?? ""
        const href = this.state.locationControl.map(loc => {
            const subs = {
                ...loc,
                theme: theme,
                language: Locale.language.data
            }
            return Utils.SubstituteKeys(c.href, subs)
        })


        let img: BaseUIElement = Svg.pop_out_ui()
        if (c.icon !== undefined) {
            img = new Img(c.icon).SetClass("h-6")
        }

        let text: Translation
        if (c.text === undefined) {
            text = Translations.t.general.screenToSmall.Fuse(this.state.layoutToUse.title, "{theme}")
        } else {
            text = c.text.Clone()
        }

        link = new SubtleButton(img, text, {
            url:
            href,
            newTab: c.newTab
        })

        if (c.requirements.has("no-welcome-message")) {
            link = new Toggle(undefined, link, this.state.featureSwitchWelcomeMessage)
        }

        if (c.requirements.has("welcome-message")) {
            link = new Toggle(link, undefined, this.state.featureSwitchWelcomeMessage)
        }

        return link;
    }

}