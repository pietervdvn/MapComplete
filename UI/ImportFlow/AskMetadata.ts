import Combine from "../Base/Combine";
import {FlowStep} from "./FlowStep";
import {Store} from "../../Logic/UIEventSource";
import ValidatedTextField from "../Input/ValidatedTextField";
import {LocalStorageSource} from "../../Logic/Web/LocalStorageSource";
import Title from "../Base/Title";
import {VariableUiElement} from "../Base/VariableUIElement";
import Translations from "../i18n/Translations";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import {Utils} from "../../Utils";

export class AskMetadata extends Combine implements FlowStep<{
    features: any[],
    wikilink: string,
    intro: string,
    source: string,
    theme: string
}> {

    public readonly Value: Store<{
        features: any[],
        wikilink: string,
        intro: string,
        source: string,
        theme: string
    }>;
    public readonly IsValid: Store<boolean>;

    constructor(params: ({ features: any[], theme: string })) {
        const t = Translations.t.importHelper.askMetadata
        const introduction = ValidatedTextField.ForType("text").ConstructInputElement({
            value: LocalStorageSource.Get("import-helper-introduction-text"),
            inputStyle: "width: 100%"
        })

        const wikilink = ValidatedTextField.ForType("url").ConstructInputElement({
            value: LocalStorageSource.Get("import-helper-wikilink-text"),
            inputStyle: "width: 100%"
        })

        const source = ValidatedTextField.ForType("string").ConstructInputElement({
            value: LocalStorageSource.Get("import-helper-source-text"),
            inputStyle: "width: 100%"
        })

        super([
            new Title(t.title),
            t.intro.Subs({count: params.features.length}),
           t.giveDescription,
            introduction.SetClass("w-full border border-black"),
             t.giveSource,
             source.SetClass("w-full border border-black"),
            t.giveWikilink            ,
            wikilink.SetClass("w-full border border-black"),
            new VariableUiElement(wikilink.GetValue().map(wikilink => {
                try{
                    const url = new URL(wikilink)
                    if(url.hostname.toLowerCase() !== "wiki.openstreetmap.org"){
                        return t.shouldBeOsmWikilink.SetClass("alert");
                    }

                    if(url.pathname.toLowerCase() === "/wiki/main_page"){
                        return t.shouldNotBeHomepage.SetClass("alert");
                    }
                }catch(e){
                    return t.shouldBeUrl.SetClass("alert")
                }
            })),
            t.orDownload,
            new SubtleButton(Svg.download_svg(), t.downloadGeojson).OnClickWithLoading("Preparing your download",
                async ( ) => {
                    const geojson = {
                        type:"FeatureCollection",
                        features: params.features
                    }
                    Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson), "prepared_import_"+params.theme+".geojson",{
                        mimetype: "application/vnd.geo+json"
                    })
                })
        ]);
        this.SetClass("flex flex-col")

        this.Value = introduction.GetValue().map(intro => {
            return {
                features: params.features,
                wikilink: wikilink.GetValue().data,
                intro,
                source: source.GetValue().data,
                theme: params.theme
            }
        }, [wikilink.GetValue(), source.GetValue()])

        this.IsValid = this.Value.map(obj => {
            if (obj === undefined) {
                return false;
            }
            if ([ obj.features, obj.intro, obj.wikilink, obj.source].some(v => v === undefined)){
                return false;
            }
            
            try{
                const url = new URL(obj.wikilink)
                if(url.hostname.toLowerCase() !== "wiki.openstreetmap.org"){
                    return false;
                }
            }catch(e){
                return false
            }
            
            return true;
                
        })
    }


}