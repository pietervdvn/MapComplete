import ImportFlow, { ImportFlowArguments } from "./ImportFlow"
import { SpecialVisualizationState } from "../../SpecialVisualization"
import { Feature, LineString, Polygon } from "geojson"
import { Store, UIEventSource } from "../../../Logic/UIEventSource"
import { Tag } from "../../../Logic/Tags/Tag"
import { And } from "../../../Logic/Tags/And"
import CreateWayWithPointReuseAction, {
    MergePointConfig,
} from "../../../Logic/Osm/Actions/CreateWayWithPointReuseAction"
import { TagUtils } from "../../../Logic/Tags/TagUtils"
import { OsmCreateAction, PreviewableAction } from "../../../Logic/Osm/Actions/OsmChangeAction"
import { FeatureSource, IndexedFeatureSource } from "../../../Logic/FeatureSource/FeatureSource"
import CreateMultiPolygonWithPointReuseAction from "../../../Logic/Osm/Actions/CreateMultiPolygonWithPointReuseAction"
import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig"
import { Changes } from "../../../Logic/Osm/Changes"
import FullNodeDatabaseSource from "../../../Logic/FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"

export interface WayImportFlowArguments extends ImportFlowArguments {
    max_snap_distance: string
    snap_onto_layers: string
    snap_to_layer_max_distance: string
    max_move_distance: string
    move_osm_point_if
    snap_to_point_if
}

export default class WayImportFlowState extends ImportFlow<WayImportFlowArguments> {
    public readonly originalFeature: Feature<LineString | Polygon>

    private readonly action: OsmCreateAction & { getPreview?(): Promise<FeatureSource> }

    constructor(
        state: SpecialVisualizationState,
        originalFeature: Feature<LineString | Polygon>,
        args: WayImportFlowArguments,
        tagsToApply: Store<Tag[]>,
        originalFeatureTags: UIEventSource<Record<string, string>>
    ) {
        super(state, args, tagsToApply, originalFeatureTags)
        this.originalFeature = originalFeature
        const mergeConfigs = WayImportFlowState.GetMergeConfig(args)
        this.action = WayImportFlowState.CreateAction(
            originalFeature,
            args,
            state,
            tagsToApply,
            mergeConfigs
        )
    }

    public static CreateAction(
        feature: Feature<LineString | Polygon>,
        args: WayImportFlowArguments,
        state: {
            layout: LayoutConfig
            changes: Changes
            indexedFeatures: IndexedFeatureSource
            fullNodeDatabase?: FullNodeDatabaseSource
        },
        tagsToApply: Store<Tag[]>,
        mergeConfigs: MergePointConfig[]
    ): OsmCreateAction & PreviewableAction & { newElementId?: string } {
        if (feature.geometry.type === "Polygon" && feature.geometry.coordinates.length > 1) {
            const coors = (<Polygon>feature.geometry).coordinates
            const outer = coors[0]
            const inner = [...coors]
            inner.splice(0, 1)
            return new CreateMultiPolygonWithPointReuseAction(
                tagsToApply.data,
                outer,
                inner,
                state,
                mergeConfigs,
                "import"
            )
        } else if (feature.geometry.type === "Polygon") {
            const coors = feature.geometry.coordinates

            const outer = coors[0]
            return new CreateWayWithPointReuseAction(tagsToApply.data, outer, state, mergeConfigs)
        } else if (feature.geometry.type === "LineString") {
            const coors = feature.geometry.coordinates
            return new CreateWayWithPointReuseAction(tagsToApply.data, coors, state, mergeConfigs)
        } else {
            throw "Unsupported type"
        }
    }

    public static GetMergeConfig(args: WayImportFlowArguments): MergePointConfig[] {
        const nodesMustMatch = args.snap_to_point_if
            ?.split(";")
            ?.map((tag, i) => TagUtils.Tag(tag, "TagsSpec for import button " + i))

        const mergeConfigs = []
        if (nodesMustMatch !== undefined && nodesMustMatch.length > 0) {
            const mergeConfig: MergePointConfig = {
                mode: "reuse_osm_point",
                ifMatches: new And(nodesMustMatch),
                withinRangeOfM: Number(args.max_snap_distance),
            }
            mergeConfigs.push(mergeConfig)
        }

        const moveOsmPointIfTags = args["move_osm_point_if"]
            ?.split(";")
            ?.map((tag, i) => TagUtils.Tag(tag, "TagsSpec for import button " + i))

        if (nodesMustMatch !== undefined && moveOsmPointIfTags.length > 0) {
            const moveDistance = Math.min(20, Number(args["max_move_distance"]))
            const mergeConfig: MergePointConfig = {
                mode: "move_osm_point",
                ifMatches: new And(moveOsmPointIfTags),
                withinRangeOfM: moveDistance,
            }
            mergeConfigs.push(mergeConfig)
        }

        return mergeConfigs
    }

    // noinspection JSUnusedGlobalSymbols
    public async onConfirm() {
        const originalFeatureTags = this._originalFeatureTags
        originalFeatureTags.data["_imported"] = "yes"
        originalFeatureTags.ping() // will set isImported as per its definition
        const action = this.action
        await this.state.changes.applyAction(action)
        const newId = action.newElementId ?? action.mainObjectId
        this.state.selectedElement.setData(this.state.indexedFeatures.featuresById.data.get(newId))
    }

    public GetPreview(): undefined | Promise<FeatureSource> {
        if (!this.action?.getPreview) {
            return undefined
        }
        return this.action.getPreview()
    }
}
