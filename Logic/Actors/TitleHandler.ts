import {UIEventSource} from "../UIEventSource";
import Translations from "../../UI/i18n/Translations";
import Locale from "../../UI/i18n/Locale";
import TagRenderingAnswer from "../../UI/Popup/TagRenderingAnswer";
import Combine from "../../UI/Base/Combine";

export default class TitleHandler {
    constructor(state) {
        const currentTitle: UIEventSource<string> = state.selectedElement.map(
            selected => {
                console.log("UPdating title")

                const layout = state.layoutToUse.data
                const defaultTitle = Translations.WT(layout?.title)?.txt ?? "MapComplete"

                if (selected === undefined) {
                    return defaultTitle
                }

                const tags = selected.properties;
                for (const layer of layout.layers) {
                    if (layer.title === undefined) {
                        continue;
                    }
                    if (layer.source.osmTags.matchesProperties(tags)) {
                        const tagsSource = state.allElements.getEventSourceById(tags.id)
                        const title = new TagRenderingAnswer(tagsSource, layer.title)
                        return new Combine([defaultTitle, " | ", title]).ConstructElement().innerText;
                    }
                }
                return defaultTitle
            }, [Locale.language, state.layoutToUse]
        )


        currentTitle.addCallbackAndRunD(title => {
            document.title = title
        })
    }
}