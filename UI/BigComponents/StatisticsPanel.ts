import {VariableUiElement} from "../Base/VariableUIElement";
import Loading from "../Base/Loading";
import Title from "../Base/Title";
import TagRenderingChart from "./TagRenderingChart";
import Combine from "../Base/Combine";
import Locale from "../i18n/Locale";
import {UIEventSource} from "../../Logic/UIEventSource";
import {OsmFeature} from "../../Models/OsmFeature";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";

export default class StatisticsPanel extends VariableUiElement {
    constructor(elementsInview: UIEventSource<{ element: OsmFeature, layer: LayerConfig }[]>, state: {
        layoutToUse: LayoutConfig
    }) {
        super(elementsInview.stabilized(1000).map(features => {
            if (features === undefined) {
                return new Loading("Loading data")
            }
            if (features.length === 0) {
                return "No elements in view"
            }
            const els = []
            for (const layer of state.layoutToUse.layers) {
                if(layer.name === undefined){
                    continue
                }
                const featuresForLayer = features.filter(f => f.layer === layer).map(f => f.element)
                if(featuresForLayer.length === 0){
                    continue
                }
                els.push(new Title(layer.name.Clone(), 1).SetClass("mt-8"))

                const layerStats = []
                for (const tagRendering of (layer?.tagRenderings ?? [])) {
                    const chart = new TagRenderingChart(featuresForLayer, tagRendering, {
                        chartclasses: "w-full",
                        chartstyle: "height: 60rem",
                        includeTitle: false
                    })
                    const title = new Title(tagRendering.question?.Clone() ?? tagRendering.id, 4).SetClass("mt-8")
                    if(!chart.HasClass("hidden")){
                        layerStats.push(new Combine([title, chart]).SetClass("flex flex-col w-full lg:w-1/3"))
                    }
                }
                els.push(new Combine(layerStats).SetClass("flex flex-wrap"))
            }
            return new Combine(els)
        }, [Locale.language]));
    }
}