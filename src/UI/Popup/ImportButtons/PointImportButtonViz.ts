import { Feature, Point } from "geojson"
import { UIEventSource } from "../../../Logic/UIEventSource"
import { SpecialVisualization, SpecialVisualizationState } from "../../SpecialVisualization"
import BaseUIElement from "../../BaseUIElement"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import SvelteUIElement from "../../Base/SvelteUIElement"
import PointImportFlow from "./PointImportFlow.svelte"
import { PointImportFlowArguments, PointImportFlowState } from "./PointImportFlowState"
import { Utils } from "../../../Utils"
import { ImportFlowUtils } from "./ImportFlow"
import Translations from "../../i18n/Translations"

/**
 * The wrapper to make the special visualisation for the PointImportFlow
 */
export class PointImportButtonViz implements SpecialVisualization {
    public readonly funcName: string
    public readonly docs: string | BaseUIElement
    public readonly example?: string
    public readonly args: { name: string; defaultValue?: string; doc: string; split?: boolean }[]
    public needsUrls = []

    constructor() {
        this.funcName = "import_button"
        this.docs =
            "This button will copy the point from an external dataset into OpenStreetMap" +
            ImportFlowUtils.documentationGeneral
        this.args = [
            ...ImportFlowUtils.generalArguments,
            {
                name: "snap_onto_layers",
                doc: "If a way of the given layer(s) is closeby, will snap the new point onto this way (similar as preset might snap). To show multiple layers to snap onto, use a `;`-seperated list",
            },
            {
                name: "max_snap_distance",
                doc: "The maximum distance that the imported point will be moved to snap onto a way in an already existing layer (in meters). This is previewed to the contributor, similar to the 'add new point'-action of MapComplete",
                defaultValue: "5",
            },
            {
                name: "note_id",
                doc: "If given, this key will be read. The corresponding note on OSM will be closed, stating 'imported'",
            },
            {
                name: "maproulette_id",
                doc: "The property name of the maproulette_id - this is probably `mr_taskId`. If given, the maproulette challenge will be marked as fixed. Only use this if part of a maproulette-layer.",
            },
        ]
    }

    constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        argument: string[],
        feature: Feature
    ): BaseUIElement {
        if (feature.geometry.type !== "Point") {
            return Translations.t.general.add.import.wrongType.SetClass("alert")
        }
        const baseArgs: PointImportFlowArguments = <any>Utils.ParseVisArgs(this.args, argument)
        const tagsToApply = ImportFlowUtils.getTagsToApply(tagSource, baseArgs)
        const importFlow = new PointImportFlowState(
            state,
            <Feature<Point>>feature,
            baseArgs,
            tagsToApply,
            tagSource
        )

        return new SvelteUIElement(PointImportFlow, {
            importFlow,
        })
    }
}
