import { Store } from "../UIEventSource"
import Locale from "../../UI/i18n/Locale"
import { Utils } from "../../Utils"
import { Feature } from "geojson"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"

export default class TitleHandler {
    constructor(selectedElement: Store<Feature>, state: SpecialVisualizationState) {
        const currentTitle: Store<string> = selectedElement.map(
            (selected) => {
                const lng = Locale.language.data
                const defaultTitle = state.theme?.title?.textFor(lng) ?? "MapComplete"
                if (selected === undefined) {
                    return defaultTitle
                }
                const layer = state.theme.getMatchingLayer(selected.properties)
                if (layer === undefined) {
                    return defaultTitle
                }

                const tags = selected.properties
                if (layer.title === undefined) {
                    return defaultTitle
                }
                const toRender = Utils.NoNull(layer?.title?.GetRenderValues(tags))
                const titleUnsubbed = toRender[0]?.then?.textFor(lng)
                if (titleUnsubbed === undefined) {
                    return defaultTitle
                }
                const title = Utils.SubstituteKeys(titleUnsubbed, tags)
                const el = document.createElement("span")
                el.innerHTML = title
                return el.textContent + " | " + defaultTitle
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
