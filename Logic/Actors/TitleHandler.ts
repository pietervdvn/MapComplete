import {UIEventSource} from "../UIEventSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Translations from "../../UI/i18n/Translations";
import Locale from "../../UI/i18n/Locale";
import TagRenderingAnswer from "../../UI/Popup/TagRenderingAnswer";
import {ElementStorage} from "../ElementStorage";
import Combine from "../../UI/Base/Combine";

class TitleElement extends UIEventSource<string> {
    
    private readonly _layoutToUse: UIEventSource<LayoutConfig>;
    private readonly _selectedFeature: UIEventSource<any>;
    private readonly _allElementsStorage: ElementStorage;

    constructor(layoutToUse: UIEventSource<LayoutConfig>,
                selectedFeature: UIEventSource<any>,
                allElementsStorage: ElementStorage) {
        super("MapComplete");
        
        this._layoutToUse = layoutToUse;
        this._selectedFeature = selectedFeature;
        this._allElementsStorage = allElementsStorage;
        
        this.syncWith(
            this._selectedFeature.map(
                selected => {
                    const defaultTitle = Translations.WT(this._layoutToUse.data?.title)?.txt ??"MapComplete"

                    if(selected === undefined){
                        return defaultTitle
                    }

                    const layout = layoutToUse.data;
                    const tags = selected.properties;


                    for (const layer of layout.layers) {
                        if (layer.title === undefined) {
                            continue;
                        }
                        if (layer.source.osmTags.matchesProperties(tags)) {
                            const tagsSource = allElementsStorage.getEventSourceById(tags.id)
                            const title = new TagRenderingAnswer(tagsSource, layer.title)
                            return new Combine([defaultTitle, " | ", title]).ConstructElement().innerText;
                        }
                    }

                    return defaultTitle
                }
                , [Locale.language, layoutToUse]
            )
            
        )
        
        
    }

}

export default class TitleHandler {
    constructor(layoutToUse: UIEventSource<LayoutConfig>,
                selectedFeature: UIEventSource<any>,
                allElementsStorage: ElementStorage) {
        new TitleElement(layoutToUse, selectedFeature, allElementsStorage).addCallbackAndRunD(title => {
            document.title = title
        })
    }
}