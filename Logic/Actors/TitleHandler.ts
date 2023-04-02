import { Store, UIEventSource } from "../UIEventSource"
import Locale from "../../UI/i18n/Locale"
import Combine from "../../UI/Base/Combine"
import { Utils } from "../../Utils"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { Feature } from "geojson"
import FeaturePropertiesStore from "../FeatureSource/Actors/FeaturePropertiesStore"
import SvelteUIElement from "../../UI/Base/SvelteUIElement"
import TagRenderingAnswer from "../../UI/Popup/TagRendering/TagRenderingAnswer.svelte"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"

export default class TitleHandler {
    constructor(
        selectedElement: Store<Feature>,
        selectedLayer: Store<LayerConfig>,
        allElements: FeaturePropertiesStore,
        state: SpecialVisualizationState
    ) {
        const currentTitle: Store<string> = selectedElement.map(
            (selected) => {
                const defaultTitle = state.layout?.title?.txt ?? "MapComplete"

                if (selected === undefined || selectedLayer.data === undefined) {
                    return defaultTitle
                }

                const tags = selected.properties
                const layer = selectedLayer.data
                const tagsSource =
                    allElements.getStore(tags.id) ?? new UIEventSource<Record<string, string>>(tags)
                const title = new SvelteUIElement(TagRenderingAnswer, {
                    tags: tagsSource,
                    state,
                    selectedElement: selectedElement.data,
                    layer,
                })
                return (
                    new Combine([defaultTitle, " | ", title]).ConstructElement()?.textContent ??
                    defaultTitle
                )
            },
            [Locale.language, selectedLayer]
        )

        currentTitle.addCallbackAndRunD((title) => {
            if (Utils.runningFromConsole) {
                return
            }
            try {
                document.title = title
            } catch (e) {
                console.error(e)
            }
        })
    }
}
