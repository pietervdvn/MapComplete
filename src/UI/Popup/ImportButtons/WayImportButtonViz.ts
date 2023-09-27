import { SpecialVisualization, SpecialVisualizationState } from "../../SpecialVisualization"
import { AutoAction } from "../AutoApplyButton"
import { Feature, LineString, Polygon } from "geojson"
import { UIEventSource } from "../../../Logic/UIEventSource"
import BaseUIElement from "../../BaseUIElement"
import { ImportFlowUtils } from "./ImportFlow"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import SvelteUIElement from "../../Base/SvelteUIElement"
import { FixedUiElement } from "../../Base/FixedUiElement"
import WayImportFlow from "./WayImportFlow.svelte"
import WayImportFlowState, { WayImportFlowArguments } from "./WayImportFlowState"
import { Utils } from "../../../Utils"
import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig"
import { Changes } from "../../../Logic/Osm/Changes"
import { IndexedFeatureSource } from "../../../Logic/FeatureSource/FeatureSource"
import FullNodeDatabaseSource from "../../../Logic/FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"

/**
 * Wrapper around 'WayImportFlow' to make it a special visualisation
 */
export default class WayImportButtonViz implements AutoAction, SpecialVisualization {
    public readonly funcName: string = "import_way_button"
    needsUrls = []
    public readonly docs: string =
        "This button will copy the data from an external dataset into OpenStreetMap, copying the geometry and adding it as a 'line'" +
        ImportFlowUtils.documentationGeneral
    public readonly args: { name: string; defaultValue?: string; doc: string }[] = [
        ...ImportFlowUtils.generalArguments,
        {
            name: "snap_to_point_if",
            doc: "Points with the given tags will be snapped to or moved",
        },
        {
            name: "max_snap_distance",
            doc: "If the imported object is a LineString or (Multi)Polygon, already existing OSM-points will be reused to construct the geometry of the newly imported way",
            defaultValue: "0.05",
        },
        {
            name: "move_osm_point_if",
            doc: "Moves the OSM-point to the newly imported point if these conditions are met",
        },
        {
            name: "max_move_distance",
            doc: "If an OSM-point is moved, the maximum amount of meters it is moved. Capped on 20m",
            defaultValue: "0.05",
        },
        {
            name: "snap_onto_layers",
            doc: "If no existing nearby point exists, but a line of a specified layer is closeby, snap to this layer instead",
        },
        {
            name: "snap_to_layer_max_distance",
            doc: "Distance to distort the geometry to snap to this layer",
            defaultValue: "0.1",
        },
    ]

    public readonly supportsAutoAction = true
    public readonly needsNodeDatabase = true

    constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        argument: string[],
        feature: Feature,
        _: LayerConfig
    ): BaseUIElement {
        const geometry = feature.geometry
        if (!(geometry.type == "LineString" || geometry.type === "Polygon")) {
            console.error("Invalid type to import", geometry.type)
            return new FixedUiElement("Invalid geometry type:" + geometry.type).SetClass("alert")
        }
        const args: WayImportFlowArguments = <any>Utils.ParseVisArgs(this.args, argument)
        const tagsToApply = ImportFlowUtils.getTagsToApply(tagSource, args)
        const importFlow = new WayImportFlowState(
            state,
            <Feature<LineString | Polygon>>feature,
            args,
            tagsToApply,
            tagSource
        )
        return new SvelteUIElement(WayImportFlow, {
            importFlow,
        })
    }

    public async applyActionOn(
        feature: Feature,
        state: {
            layout: LayoutConfig
            changes: Changes
            indexedFeatures: IndexedFeatureSource
            fullNodeDatabase: FullNodeDatabaseSource
        },
        tagSource: UIEventSource<any>,
        argument: string[]
    ): Promise<void> {
        {
            // Small safety check to prevent duplicate imports
            const id = tagSource.data.id
            if (ImportFlowUtils.importedIds.has(id)) {
                return
            }
            ImportFlowUtils.importedIds.add(id)
        }

        if (feature.geometry.type !== "LineString" && feature.geometry.type !== "Polygon") {
            return
        }

        const args: WayImportFlowArguments = <any>Utils.ParseVisArgs(this.args, argument)
        const tagsToApply = ImportFlowUtils.getTagsToApply(tagSource, args)
        const mergeConfigs = WayImportFlowState.GetMergeConfig(args)
        const action = WayImportFlowState.CreateAction(
            <Feature<LineString | Polygon>>feature,
            args,
            state,
            tagsToApply,
            mergeConfigs
        )
        tagSource.data["_imported"] = "yes"
        tagSource.ping()
        await state.changes.applyAction(action)
    }

    getLayerDependencies(args: string[]) {
        return ImportFlowUtils.getLayerDependenciesWithSnapOnto(this.args, args)
    }
}
