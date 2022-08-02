import {Store, UIEventSource} from "../UIEventSource";
import Locale from "../../UI/i18n/Locale";
import TagRenderingAnswer from "../../UI/Popup/TagRenderingAnswer";
import Combine from "../../UI/Base/Combine";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {ElementStorage} from "../ElementStorage";
import {Utils} from "../../Utils";

export default class TitleHandler {
    constructor(state: {
        selectedElement: Store<any>,
        layoutToUse: LayoutConfig,
        allElements: ElementStorage
    }) {
        const currentTitle: Store<string> = state.selectedElement.map(
            selected => {
                const layout = state.layoutToUse
                const defaultTitle = layout?.title?.txt ?? "MapComplete"

                if (selected === undefined) {
                    return defaultTitle
                }

                const tags = selected.properties;
                for (const layer of layout.layers) {
                    if (layer.title === undefined) {
                        continue;
                    }
                    if (layer.source.osmTags.matchesProperties(tags)) {
                        const tagsSource = state.allElements.getEventSourceById(tags.id) ?? new UIEventSource<any>(tags)
                        const title = new TagRenderingAnswer(tagsSource, layer.title, {})
                        return new Combine([defaultTitle, " | ", title]).ConstructElement()?.textContent ?? defaultTitle;
                    }
                }
                return defaultTitle
            }, [Locale.language]
        )


        currentTitle.addCallbackAndRunD(title => {
            if (Utils.runningFromConsole) {
                return
            }
            document.title = title
        })
    }
}