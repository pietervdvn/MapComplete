import { SpecialVisualization, SpecialVisualizationState } from "../../SpecialVisualization"
import { UIEventSource } from "../../../Logic/UIEventSource"
import { Feature, Geometry, LineString, Polygon } from "geojson"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import BaseUIElement from "../../BaseUIElement"
import { ImportFlowArguments, ImportFlowUtils } from "./ImportFlow"
import Translations from "../../i18n/Translations"
import { Utils } from "../../../Utils"
import SvelteUIElement from "../../Base/SvelteUIElement"
import WayImportFlow from "./WayImportFlow.svelte"
import ConflateImportFlowState from "./ConflateImportFlowState"
import { AutoAction } from "../AutoApplyButton"
import { IndexedFeatureSource } from "../../../Logic/FeatureSource/FeatureSource"
import { Changes } from "../../../Logic/Osm/Changes"
import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig"
import { OsmConnection } from "../../../Logic/Osm/OsmConnection"

export interface ConflateFlowArguments extends ImportFlowArguments {
    way_to_conflate: string
    point_move_mode?: "move_osm" | undefined
    max_snap_distance?: string
    snap_onto_layers?: string
}

export default class ConflateImportButtonViz implements SpecialVisualization, AutoAction {
    supportsAutoAction: boolean = true
    needsUrls = []
    public readonly funcName: string = "conflate_button"
    public readonly args: {
        name: string
        defaultValue?: string
        doc: string
        required?: boolean
    }[] = [
        ...ImportFlowUtils.generalArguments,
        {
            name: "way_to_conflate",
            doc: "The key, of which the corresponding value is the id of the OSM-way that must be conflated; typically a calculatedTag",
        },
    ]
    readonly docs: string =
        "This button will modify the geometry of an existing OSM way to match the specified geometry. This can conflate OSM-ways with LineStrings and Polygons (only simple polygons with one single ring). An attempt is made to move points with special values to a decent new location (e.g. entrances)" +
        ImportFlowUtils.documentationGeneral
    public readonly needsNodeDatabase = true

    async applyActionOn(
        feature: Feature<Geometry, { [name: string]: any }>,
        state: {
            osmConnection: OsmConnection
            layout: LayoutConfig
            changes: Changes
            indexedFeatures: IndexedFeatureSource
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

        const args: ConflateFlowArguments = <any>Utils.ParseVisArgs(this.args, argument)
        const tagsToApply = ImportFlowUtils.getTagsToApply(tagSource, args)
        const idOfWayToReplaceGeometry = tagSource.data[args.way_to_conflate]
        const action = ConflateImportFlowState.createAction(
            <Feature<LineString | Polygon>>feature,
            args,
            state,
            idOfWayToReplaceGeometry,
            tagsToApply
        )
        tagSource.data["_imported"] = "yes"
        tagSource.ping()
        await state.changes.applyAction(action)
    }

    constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        argument: string[],
        feature: Feature
    ): BaseUIElement {
        const canBeImported =
            feature.geometry.type === "LineString" ||
            (feature.geometry.type === "Polygon" && feature.geometry.coordinates.length === 1)
        if (!canBeImported) {
            return Translations.t.general.add.import.wrongTypeToConflate.SetClass("alert")
        }
        const args: ConflateFlowArguments = <any>Utils.ParseVisArgs(this.args, argument)
        const tagsToApply = ImportFlowUtils.getTagsToApply(tagSource, args)
        const idOfWayToReplaceGeometry = tagSource.data[args.way_to_conflate]
        const importFlow = new ConflateImportFlowState(
            state,
            <Feature<LineString | Polygon>>feature,
            args,
            tagsToApply,
            tagSource,
            idOfWayToReplaceGeometry
        )
        return new SvelteUIElement(WayImportFlow, {
            importFlow,
        })
    }

    getLayerDependencies(args: string[]) {
        return ImportFlowUtils.getLayerDependenciesWithSnapOnto(this.args, args)
    }
}
