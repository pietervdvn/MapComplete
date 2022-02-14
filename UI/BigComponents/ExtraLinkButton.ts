import {UIElement} from "../UIElement";
import BaseUIElement from "../BaseUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import ExtraLinkConfig from "../../Models/ThemeConfig/ExtraLinkConfig";
import MapControlButton from "../MapControlButton";
import Link from "../Base/Link";
import Img from "../Base/Img";
import {SubtleButton} from "../Base/SubtleButton";
import Toggle from "../Input/Toggle";
import Loc from "../../Models/Loc";
import Locale from "../i18n/Locale";
import {Utils} from "../../Utils";

export default class ExtraLinkButton extends UIElement{
    private readonly _config: ExtraLinkConfig;
    private readonly state: {
        layoutToUse: {id: string};
        featureSwitchWelcomeMessage: UIEventSource<boolean>, locationControl: UIEventSource<Loc>};

    constructor(state:  {featureSwitchWelcomeMessage: UIEventSource<boolean>, locationControl: UIEventSource<Loc>, layoutToUse: {id: string}}, 
                config: ExtraLinkConfig) {
        super();
        this.state = state;
        this._config = config;
    }

    protected InnerRender():  BaseUIElement {
        if(this._config === undefined){
            return undefined;
        }
        
        const c = this._config;

        const isIframe = window !== window.top

        if(c.requirements.has("iframe") && !isIframe){
            return undefined
        }

        if(c.requirements.has("no-iframe") && isIframe){
            return undefined
        }

        let link : BaseUIElement
        const theme = this.state.layoutToUse?.id ?? ""
        const href = this.state.locationControl.map(loc => {
            const subs = {
                ...loc,
                theme: theme,
                language: Locale.language.data
            }
            return Utils.SubstituteKeys(c.href, subs)
        })
        
        if(c.text === undefined){
            link = new MapControlButton(
                new Link(new Img(c.icon), href, c.newTab).SetClass("block w-full h-full p-1.5")
            )
        }else {
            let img : BaseUIElement = undefined
            if(c.icon !== undefined){
                img = new Img(c.icon).SetClass("h-6")
            }
            
            link = new SubtleButton(img,c.text, {url:
                href,
                newTab: c.newTab}).SetClass("w-64 block")
        }
        
        if(c.requirements.has("no-welcome-message")){
            link = new Toggle(undefined, link, this.state.featureSwitchWelcomeMessage)
        }

        if(c.requirements.has("welcome-message")){
            link = new Toggle(link, undefined,  this.state.featureSwitchWelcomeMessage)
        }
        
        return link;
    }
    
}