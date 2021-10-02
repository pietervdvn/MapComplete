import {UIEventSource} from "../Logic/UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";
import Wikipedia from "../Logic/Web/Wikipedia";
import Loading from "./Base/Loading";
import {FixedUiElement} from "./Base/FixedUiElement";
import Combine from "./Base/Combine";
import BaseUIElement from "./BaseUIElement";
import Title from "./Base/Title";
import Translations from "./i18n/Translations";
import Svg from "../Svg";

export default class WikipediaBox extends Combine{
    
    constructor(options: {
        pagename: string,
        language: string
    }) {
        
        const htmlContent = UIEventSource.FromPromiseWithErr(Wikipedia.GetArticle({
            pageName: options.pagename,
            language: options.language,
            removeInfoBoxes: true
        }))
        
        const contents : UIEventSource<string | BaseUIElement> = htmlContent.map(htmlContent => {
            if(htmlContent === undefined){
                // Still loading
                return new Loading("Loading wikipedia page").SetClass("p-4")
            }
            if(htmlContent["success"] !== undefined){
                return new FixedUiElement(htmlContent["success"]).SetClass("wikipedia-article")
            }
            if(htmlContent["error"]){
                return new FixedUiElement(htmlContent["error"]).SetClass("alert p-4")
            }
            
            return undefined
            
        })
        
        const scrollable = new Combine([new VariableUiElement(contents).SetClass("block pl-6 pt-2")])
            .SetClass("block overflow-auto normal-background rounded-lg")
        super([
            new Combine([Svg.wikipedia_svg().SetStyle("width: 1.5rem").SetClass("mr-3"), 
                new Title(Translations.t.general.wikipedia.wikipediaboxTitle, 2)]).SetClass("flex"),
            scrollable])
        
        this
            .SetClass("block rounded-xl subtle-background m-1 p-2 flex flex-col")
    }
    
    
}