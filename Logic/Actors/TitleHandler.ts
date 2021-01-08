import {UIEventSource} from "../UIEventSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Translations from "../../UI/i18n/Translations";
import Locale from "../../UI/i18n/Locale";
import {UIElement} from "../../UI/UIElement";

export default class TitleHandler{
    constructor(layoutToUse: UIEventSource<LayoutConfig>, fullScreenMessage: UIEventSource<{ content: UIElement, hashText: string, titleText?: UIElement }>) {


        layoutToUse.map((layoutToUse) => {
                return Translations.WT(layoutToUse?.title)?.txt ?? "MapComplete"
            }, [Locale.language]
        ).addCallbackAndRun((title) => {
            document.title = title
        });

        fullScreenMessage.addCallbackAndRun(selected => {
            const title = Translations.WT(layoutToUse.data?.title)?.txt ?? "MapComplete"
            if(selected?.titleText?.data === undefined){
                document.title = title
            }else{
                selected.titleText.Update();
                var d = document.createElement('div');
                d.innerHTML = selected.titleText.InnerRender();
                const poi = (d.textContent || d.innerText)
                document.title = title + " | " + poi;
            }
        })


    }
}