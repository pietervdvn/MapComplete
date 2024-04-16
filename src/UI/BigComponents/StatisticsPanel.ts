import { VariableUiElement } from "../Base/VariableUIElement"
import Loading from "../Base/Loading"
import Title from "../Base/Title"
import TagRenderingChart from "./TagRenderingChart"
import Combine from "../Base/Combine"
import Locale from "../i18n/Locale"
import { FeatureSourceForLayer } from "../../Logic/FeatureSource/FeatureSource"
import BaseUIElement from "../BaseUIElement"

export default class StatisticsForLayerPanel extends VariableUiElement {
    constructor(elementsInview: FeatureSourceForLayer) {
        const layer = elementsInview.layer.layerDef
        super(
            elementsInview.features.stabilized(1000).map(
                (features) => {
                    if (features === undefined) {
                        return new Loading("Loading data")
                    }
                    if (features.length === 0) {
                        return new Combine(["No elements in view for layer ", layer.id]).SetClass(
                            "block"
                        )
                    }
                    const els: BaseUIElement[] = []
                    const featuresForLayer = features
                    if (featuresForLayer.length === 0) {
                        return
                    }
                    els.push(new Title(layer.name, 1).SetClass("mt-8"))

                    const layerStats = []
                    for (const tagRendering of layer?.tagRenderings ?? []) {
                        const chart = new TagRenderingChart(featuresForLayer, tagRendering, {
                            chartclasses: "w-full",
                            chartstyle: "height: 60rem",
                            includeTitle: false,
                        })
                        const title = new Title(
                            tagRendering.question?.Clone() ?? tagRendering.id,
                            4
                        ).SetClass("mt-8")
                        if (!chart.HasClass("hidden")) {
                            layerStats.push(
                                new Combine([title, chart]).SetClass(
                                    "flex flex-col w-full lg:w-1/3"
                                )
                            )
                        }
                    }
                    els.push(new Combine(layerStats).SetClass("flex flex-wrap"))
                    return new Combine(els)
                },
                [Locale.language]
            )
        )
    }
}
