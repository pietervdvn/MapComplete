import {UIEventSource} from "../UIEventSource";
import LayoutConfig from "../../Customizations/JSON/LayoutConfig";
import Translations from "../../UI/i18n/Translations";
import Locale from "../../UI/i18n/Locale";
import {UIElement} from "../../UI/UIElement";
import TagRenderingAnswer from "../../UI/Popup/TagRenderingAnswer";
import {ElementStorage} from "../ElementStorage";
import Combine from "../../UI/Base/Combine";

class TitleElement extends UIElement {
    private readonly _layoutToUse: UIEventSource<LayoutConfig>;
    private readonly _selectedFeature: UIEventSource<any>;
    private readonly _allElementsStorage: ElementStorage;

    constructor(layoutToUse: UIEventSource<LayoutConfig>,
                selectedFeature: UIEventSource<any>,
                allElementsStorage: ElementStorage) {
        super(layoutToUse);
        this._layoutToUse = layoutToUse;
        this._selectedFeature = selectedFeature;
        this._allElementsStorage = allElementsStorage;
        this.ListenTo(Locale.language);
        this.ListenTo(this._selectedFeature)
        this.dumbMode = false;
    }

    InnerRender(): string {

        const defaultTitle = Translations.WT(this._layoutToUse.data?.title)?.txt ?? "MapComplete"
        const feature = this._selectedFeature.data;

        if (feature === undefined) {
            return defaultTitle;
        }


        const layout = this._layoutToUse.data;
        const properties = this._selectedFeature.data.properties;

        for (const layer of layout.layers) {
            if (layer.title === undefined) {
                continue;
            }
            if (layer.source.osmTags.matchesProperties(properties)) {
                const tags = this._allElementsStorage.getEventSourceById(feature.properties.id);
                if (tags == undefined) {
                    return defaultTitle;
                }
                const title = new TagRenderingAnswer(tags, layer.title)
                return new Combine([defaultTitle, " | ", title]).Render();
            }
        }
        return defaultTitle;
    }

}

export default class TitleHandler {
    constructor(layoutToUse: UIEventSource<LayoutConfig>,
                selectedFeature: UIEventSource<any>,
                allElementsStorage: ElementStorage) {

        selectedFeature.addCallbackAndRun(_ => {
            const title = new TitleElement(layoutToUse, selectedFeature, allElementsStorage)
            const d = document.createElement('div');
            d.innerHTML = title.InnerRender();
            // We pass everything into a div to strip out images etc...
            document.title = (d.textContent || d.innerText);
        })

    }
}