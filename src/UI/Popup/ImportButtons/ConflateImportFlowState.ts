import ImportFlow from "./ImportFlow"
import { ConflateFlowArguments } from "./ConflateImportButtonViz"
import { SpecialVisualizationState } from "../../SpecialVisualization"
import { Feature, LineString, Polygon } from "geojson"
import { Store, UIEventSource } from "../../../Logic/UIEventSource"
import { Tag } from "../../../Logic/Tags/Tag"
import OsmChangeAction from "../../../Logic/Osm/Actions/OsmChangeAction"
import ReplaceGeometryAction from "../../../Logic/Osm/Actions/ReplaceGeometryAction"
import { GeoOperations } from "../../../Logic/GeoOperations"
import { TagUtils } from "../../../Logic/Tags/TagUtils"
import { MergePointConfig } from "../../../Logic/Osm/Actions/CreateWayWithPointReuseAction"
import { And } from "../../../Logic/Tags/And"
import LayoutConfig from "../../../Models/ThemeConfig/LayoutConfig"
import { Changes } from "../../../Logic/Osm/Changes"
import { FeatureSource, IndexedFeatureSource } from "../../../Logic/FeatureSource/FeatureSource"
import FullNodeDatabaseSource from "../../../Logic/FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"
import { OsmConnection } from "../../../Logic/Osm/OsmConnection"

export default class ConflateImportFlowState extends ImportFlow<ConflateFlowArguments> {
    public readonly originalFeature: Feature
    private readonly action: OsmChangeAction & {
        getPreview?(): Promise<FeatureSource>
        newElementId?: string
    }
    constructor(
        state: SpecialVisualizationState,
        originalFeature: Feature<LineString | Polygon>,
        args: ConflateFlowArguments,
        tagsToApply: Store<Tag[]>,
        originalFeatureTags: UIEventSource<Record<string, string>>,
        idOfFeatureToReplaceGeometry: string
    ) {
        super(state, args, tagsToApply, originalFeatureTags)
        this.originalFeature = originalFeature
        this.action = ConflateImportFlowState.createAction(
            originalFeature,
            args,
            state,
            idOfFeatureToReplaceGeometry,
            tagsToApply
        )
    }

    // noinspection JSUnusedGlobalSymbols
    public GetPreview(): Promise<FeatureSource> {
        return this.action.getPreview()
    }

    public async onConfirm() {
        const originalFeatureTags = this._originalFeatureTags
        originalFeatureTags.data["_imported"] = "yes"
        originalFeatureTags.ping() // will set isImported as per its definition
        const action = this.action
        await this.state.changes.applyAction(action)
        const newId = action.newElementId ?? action.mainObjectId
        this.state.selectedElement.setData(this.state.indexedFeatures.featuresById.data.get(newId))
    }

    public static createAction(
        feature: Feature<LineString | Polygon>,
        args: ConflateFlowArguments,
        state: {
            osmConnection: OsmConnection
            layout: LayoutConfig
            changes: Changes
            indexedFeatures: IndexedFeatureSource
            fullNodeDatabase?: FullNodeDatabaseSource
        },
        idOfFeatureToReplaceGeometry,
        tagsToApply: Store<Tag[]>
    ): OsmChangeAction & { getPreview?(): Promise<FeatureSource>; newElementId?: string } {
        const nodesMustMatch = args.snap_onto_layers
            ?.split(";")
            ?.map((tag, i) => TagUtils.Tag(tag, "TagsSpec for import button " + i))

        const mergeConfigs = []
        if (nodesMustMatch !== undefined && nodesMustMatch.length > 0) {
            const mergeConfig: MergePointConfig = {
                mode: args.point_move_mode == "move_osm" ? "move_osm_point" : "reuse_osm_point",
                ifMatches: new And(nodesMustMatch),
                withinRangeOfM: Number(args.max_snap_distance ?? 0),
            }
            mergeConfigs.push(mergeConfig)
        }

        return new ReplaceGeometryAction(
            state,
            GeoOperations.removeOvernoding(feature),
            idOfFeatureToReplaceGeometry,
            {
                theme: state.layout.id,
                newTags: tagsToApply.data,
            }
        )
    }
}
