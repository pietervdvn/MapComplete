import {VariableUiElement} from "./VariableUIElement";
import Locale from "../i18n/Locale";
import Link from "./Link";
import Svg from "../../Svg";

export default class LinkToWeblate extends VariableUiElement {
    constructor(context: string, availableTranslations: object) {
        super( Locale.language.map(ln => {
            if (Locale.showLinkToWeblate.data === false) {
                return undefined;
            }
            if(availableTranslations["*"] !== undefined){
                return undefined
            }
            if(context === undefined || context.indexOf(":") < 0){
                return undefined
            }
            const icon = Svg.translate_svg()
                .SetClass("rounded-full border border-gray-400 inline-block w-4 h-4 m-1 weblate-link self-center")
            if(availableTranslations[ln] === undefined){
                icon.SetClass("bg-red-400")
            }
            return new Link(icon,
                LinkToWeblate.hrefToWeblate(ln, context), true)
        } ,[Locale.showLinkToWeblate]));
        this.SetClass("enable-links hidden-on-mobile")
    }
    
    public static hrefToWeblate(language: string, contextKey: string): string{
        if(contextKey === undefined || contextKey.indexOf(":") < 0){
            return undefined
        }
        const [category, ...rest] = contextKey.split(":")
        const key = rest.join(":")
        
        const baseUrl = "https://hosted.weblate.org/translate/mapcomplete/"
        return baseUrl + category + "/" + language + "/?offset=1&q=context%3A%3D%22" + key + "%22"
    }
}