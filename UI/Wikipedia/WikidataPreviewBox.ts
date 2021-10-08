import {VariableUiElement} from "../Base/VariableUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Wikidata, {WikidataResponse} from "../../Logic/Web/Wikidata";
import {Translation} from "../i18n/Translation";
import {FixedUiElement} from "../Base/FixedUiElement";
import Loading from "../Base/Loading";
import {Transform} from "stream";
import Translations from "../i18n/Translations";
import Combine from "../Base/Combine";
import Img from "../Base/Img";
import {WikimediaImageProvider} from "../../Logic/ImageProviders/WikimediaImageProvider";
import Link from "../Base/Link";
import Svg from "../../Svg";
import BaseUIElement from "../BaseUIElement";

export default class WikidataPreviewBox extends VariableUiElement {
    
    constructor(wikidataId : UIEventSource<string>) {
        let inited = false;
        const wikidata = wikidataId
            .stabilized(250)
            .bind(id => {
            if (id === undefined || id === "" || id === "Q") {
                return null;
            }
            inited = true;
            return Wikidata.LoadWikidataEntry(id)
        })
        
        super(wikidata.map(maybeWikidata => {
            if(maybeWikidata === null || !inited){
                return undefined;
            }
            
            if(maybeWikidata === undefined){
                return new Loading(Translations.t.general.loading)
            }
            
            if (maybeWikidata["error"] !== undefined) {
                return new FixedUiElement(maybeWikidata["error"]).SetClass("alert")
            }
            const wikidata = <WikidataResponse> maybeWikidata["success"]
            return WikidataPreviewBox.WikidataResponsePreview(wikidata)
        }))
            
    }
    
    public static WikidataResponsePreview(wikidata: WikidataResponse): BaseUIElement{
        let link = new Link(
            new Combine([
                wikidata.id,
                Svg.wikidata_ui().SetStyle("width: 2.5rem").SetClass("block")
            ]).SetClass("flex"), 
            "https://wikidata.org/wiki/"+wikidata.id ,true)
    
        let info = new Combine( [
            new Combine([Translation.fromMap(wikidata.labels).SetClass("font-bold"), 
                link]).SetClass("flex justify-between"),
            Translation.fromMap(wikidata.descriptions)
        ]).SetClass("flex flex-col link-underline")


        let imageUrl = undefined
        if(wikidata.claims.get("P18")?.size > 0){
            imageUrl = Array.from(wikidata.claims.get("P18"))[0]
        }


        if(imageUrl){
            imageUrl =  WikimediaImageProvider.singleton.PrepUrl(imageUrl).url
            info = new Combine([ new Img(imageUrl).SetStyle("max-width: 5rem; width: unset; height: 4rem").SetClass("rounded-xl mr-2"), 
                info.SetClass("w-full")]).SetClass("flex")
        }

        info.SetClass("p-2 w-full")

        return info
    }
    
}