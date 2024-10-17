import { OsmCreateAction, PreviewableAction } from "./OsmChangeAction"
import { Tag } from "../../Tags/Tag"
import { Changes } from "../Changes"
import { ChangeDescription } from "./ChangeDescription"
import CreateNewWayAction from "./CreateNewWayAction"
import CreateWayWithPointReuseAction, { MergePointConfig } from "./CreateWayWithPointReuseAction"
import { And } from "../../Tags/And"
import { TagUtils } from "../../Tags/TagUtils"
import { FeatureSource, IndexedFeatureSource } from "../../FeatureSource/FeatureSource"
import ThemeConfig from "../../../Models/ThemeConfig/ThemeConfig"
import { Position } from "geojson"
import FullNodeDatabaseSource from "../../FeatureSource/TiledFeatureSource/FullNodeDatabaseSource"

/**
 * More or less the same as 'CreateNewWay', except that it'll try to reuse already existing points
 */
export default class CreateMultiPolygonWithPointReuseAction
    extends OsmCreateAction
    implements PreviewableAction
{
    public newElementId: string = undefined
    public newElementIdNumber: number = undefined
    private readonly _tags: Tag[]
    private readonly createOuterWay: CreateWayWithPointReuseAction
    private readonly createInnerWays: CreateNewWayAction[]
    private readonly geojsonPreview: any
    private readonly theme: string
    private readonly changeType: "import" | "create" | string

    constructor(
        tags: Tag[],
        outerRingCoordinates: Position[],
        innerRingsCoordinates: Position[][],
        state: {
            theme: ThemeConfig
            changes: Changes
            indexedFeatures: IndexedFeatureSource
            fullNodeDatabase?: FullNodeDatabaseSource
        },
        config: MergePointConfig[],
        changeType: "import" | "create" | string
    ) {
        super(null, true)
        this._tags = [...tags, new Tag("type", "multipolygon")]
        this.changeType = changeType
        this.theme = state?.theme?.id ?? ""
        this.createOuterWay = new CreateWayWithPointReuseAction(
            [],
            <[number, number][]>outerRingCoordinates,
            state,
            config
        )
        this.createInnerWays = innerRingsCoordinates.map(
            (ringCoordinates) =>
                new CreateNewWayAction(
                    [],
                    ringCoordinates.map(([lon, lat]) => ({ lat, lon })),
                    { theme: state?.theme?.id }
                )
        )

        this.geojsonPreview = {
            type: "Feature",
            properties: TagUtils.changeAsProperties(new And(this._tags).asChange({})),
            geometry: {
                type: "Polygon",
                coordinates: [outerRingCoordinates, ...innerRingsCoordinates],
            },
        }
    }

    protected async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {
        const descriptions: ChangeDescription[] = []
        descriptions.push(...(await this.createOuterWay.CreateChangeDescriptions(changes)))
        for (const innerWay of this.createInnerWays) {
            descriptions.push(...(await innerWay.CreateChangeDescriptions(changes)))
        }

        this.newElementIdNumber = changes.getNewID()
        this.newElementId = "relation/" + this.newElementIdNumber
        descriptions.push({
            type: "relation",
            id: this.newElementIdNumber,
            tags: new And(this._tags).asChange({}),
            meta: {
                theme: this.theme,
                changeType: this.changeType,
            },
            changes: {
                members: [
                    {
                        type: "way",
                        ref: this.createOuterWay.newElementIdNumber,
                        role: "outer",
                    },
                    // @ts-ignore
                    ...this.createInnerWays.map((a) => ({
                        type: "way",
                        ref: a.newElementIdNumber,
                        role: "inner",
                    })),
                ],
            },
        })

        return descriptions
    }

    getPreview(): Promise<FeatureSource> {
        return undefined
    }
}
