import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { Feature } from "geojson"
import BaseUIElement from "../BaseUIElement"
import { UIEventSource } from "../../Logic/UIEventSource"
import SvelteUIElement from "../Base/SvelteUIElement"
import Questionbox from "./TagRendering/Questionbox.svelte"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"

/**
 * Thin wrapper around QuestionBox.svelte to include it into the special Visualisations
 */
export default class QuestionViz implements SpecialVisualization {
    funcName = "questions"
    docs =
        "The special element which shows the questions which are unkown. Added by default if not yet there"
    args = [
        {
            name: "labels",
            doc: "One or more ';'-separated labels. If these are given, only questions with these labels will be given. Use `unlabeled` for all questions that don't have an explicit label. If none given, all questions will be shown",
        },
        {
            name: "blacklisted-labels",
            doc: "One or more ';'-separated labels of questions which should _not_ be included",
        },
    ]

    constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>,
        args: string[],
        feature: Feature,
        layer: LayerConfig
    ): BaseUIElement {
        const labels = args[0]
            ?.split(";")
            ?.map((s) => s.trim())
            ?.filter((s) => s !== "")
        const blacklist = args[1]
            ?.split(";")
            ?.map((s) => s.trim())
            ?.filter((s) => s !== "")
        return new SvelteUIElement(Questionbox, {
            layer,
            tags,
            selectedElement: feature,
            state,
            onlyForLabels: labels,
            notForLabels: blacklist,
        })
    }
}
