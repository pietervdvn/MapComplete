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
        allElements: FeaturePropertiesStore,
        state: SpecialVisualizationState
    ) {
        const currentTitle: Store<string> = selectedElement.map(
            (selected) => {
                const defaultTitle = state.layout?.title?.txt ?? "MapComplete"
                if (selected === undefined) {
                    return defaultTitle
                }
                const layer = state.layout.getMatchingLayer(selected.properties)
                if (layer === undefined) {
                    return defaultTitle
                }

                const tags = selected.properties
                if (layer.title === undefined) {
                    return defaultTitle
                }
                const tagsSource =
                    allElements.getStore(tags.id) ?? new UIEventSource<Record<string, string>>(tags)
                const title = new SvelteUIElement(TagRenderingAnswer, {
                    tags: tagsSource,
                    state,
                    config: layer.title,
                    selectedElement: selectedElement.data,
                    layer,
                })
                return (
                    new Combine([defaultTitle, " | ", title]).ConstructElement()?.textContent ??
                    defaultTitle
                )
            },
            [Locale.language]
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
