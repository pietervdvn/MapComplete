import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";
import {Tag} from "../../Tags/Tag";
import FeatureSource from "../../FeatureSource/FeatureSource";
import {OsmNode, OsmObject, OsmWay} from "../OsmObject";
import {GeoOperations} from "../../GeoOperations";
import StaticFeatureSource from "../../FeatureSource/Sources/StaticFeatureSource";
import CreateNewNodeAction from "./CreateNewNodeAction";
import ChangeTagAction from "./ChangeTagAction";
import {And} from "../../Tags/And";
import {Utils} from "../../../Utils";
import {OsmConnection} from "../OsmConnection";

export default class ReplaceGeometryAction extends OsmChangeAction {
    private readonly feature: any;
    private readonly state: {
        osmConnection: OsmConnection
    };
    private readonly wayToReplaceId: string;
    private readonly theme: string;
    private readonly targetCoordinates: [number, number][];
    private readonly newTags: Tag[] | undefined;

    constructor(
        state: {
            osmConnection: OsmConnection
        },
        feature: any,
        wayToReplaceId: string,
        options: {
            theme: string,
            newTags?: Tag[]
        }
    ) {
        super();
        this.state = state;
        this.feature = feature;
        this.wayToReplaceId = wayToReplaceId;
        this.theme = options.theme;

        const geom = this.feature.geometry
        let coordinates: [number, number][]
        if (geom.type === "LineString") {
            coordinates = geom.coordinates
        } else if (geom.type === "Polygon") {
            coordinates = geom.coordinates[0]
        }
        this.targetCoordinates = coordinates
        this.newTags = options.newTags
    }

    public async GetPreview(): Promise<FeatureSource> {
        const {closestIds, allNodesById} = await this.GetClosestIds();
        const preview = closestIds.map((newId, i) => {
            if (newId === undefined) {
                return {
                    type: "Feature",
                    properties: {
                        "newpoint": "yes",
                        "id": "replace-geometry-move-" + i
                    },
                    geometry: {
                        type: "Point",
                        coordinates: this.targetCoordinates[i]
                    }
                };
            }
            const origPoint = allNodesById.get(newId).centerpoint()
            return {
                type: "Feature",
                properties: {
                    "move": "yes",
                    "osm-id": newId,
                    "id": "replace-geometry-move-" + i
                },
                geometry: {
                    type: "LineString",
                    coordinates: [[origPoint[1], origPoint[0]], this.targetCoordinates[i]]
                }
            };
        })
        return new StaticFeatureSource(preview, false)

    }

    protected async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {

        const allChanges: ChangeDescription[] = []
        const actualIdsToUse: number[] = []

        const {closestIds, osmWay} = await this.GetClosestIds()

        for (let i = 0; i < closestIds.length; i++) {
            const closestId = closestIds[i];
            const [lon, lat] = this.targetCoordinates[i]
            if (closestId === undefined) {

                const newNodeAction = new CreateNewNodeAction(
                    [],
                    lat, lon,
                    {
                        allowReuseOfPreviouslyCreatedPoints: true,
                        theme: this.theme, changeType: null
                    })
                const changeDescr = await newNodeAction.CreateChangeDescriptions(changes)
                allChanges.push(...changeDescr)
                actualIdsToUse.push(newNodeAction.newElementIdNumber)

            } else {
                const change = <ChangeDescription>{
                    id: closestId,
                    type: "node",
                    meta: {
                        theme: this.theme,
                        changeType: "move"
                    },
                    changes: {lon, lat}
                }
                actualIdsToUse.push(closestId)
                allChanges.push(change)
            }
        }


        if (this.newTags !== undefined && this.newTags.length > 0) {
            const addExtraTags = new ChangeTagAction(
                this.wayToReplaceId,
                new And(this.newTags),
                osmWay.tags, {
                    theme: this.theme,
                    changeType: "conflation"
                }
            )
            allChanges.push(...await addExtraTags.CreateChangeDescriptions(changes))
        }

        // AT the very last: actually change the nodes of the way!
        allChanges.push({
            type: "way",
            id: osmWay.id,
            changes: {
                nodes: actualIdsToUse,
                coordinates: this.targetCoordinates
            },
            meta: {
                theme: this.theme,
                changeType: "conflation"
            }
        })


        return allChanges
    }

    /**
     * For 'this.feature`, gets a corresponding closest node that alreay exsists
     * @constructor
     * @private
     */
    private async GetClosestIds(): Promise<{ closestIds: number[], allNodesById: Map<number, OsmNode>, osmWay: OsmWay }> {
        // TODO FIXME: cap move length on points which are embedded into other ways (ev. disconnect them)
        // TODO FIXME: if a new point has to be created, snap to already existing ways
        // TODO FIXME: reuse points if they are the same in the target coordinates
        const splitted = this.wayToReplaceId.split("/");
        const type = splitted[0];
        const idN = Number(splitted[1]);
        if (idN < 0 || type !== "way") {
            throw "Invalid ID to conflate: " + this.wayToReplaceId
        }
        const url = `${this.state.osmConnection._oauth_config.url}/api/0.6/${this.wayToReplaceId}/full`;
        const rawData = await Utils.downloadJsonCached(url, 1000)
        const parsed = OsmObject.ParseObjects(rawData.elements);
        const allNodesById = new Map<number, OsmNode>()
        const allNodes = parsed.filter(o => o.type === "node")
        for (const node of allNodes) {
            allNodesById.set(node.id, <OsmNode>node)
        }


        /**
         * Allright! We know all the nodes of the original way and all the nodes of the target coordinates.
         * For each of the target coordinates, we search the closest, already existing point and reuse this point
         */

        const closestIds = []
        const distances = []
        for (const target of this.targetCoordinates) {
            let closestDistance = undefined
            let closestId = undefined;
            for (const osmNode of allNodes) {

                const cp = osmNode.centerpoint()
                const d = GeoOperations.distanceBetween(target, [cp[1], cp[0]])
                if (closestId === undefined || closestDistance > d) {
                    closestId = osmNode.id
                    closestDistance = d
                }
            }
            closestIds.push(closestId)
            distances.push(closestDistance)
        }

        // Next step: every closestId can only occur once in the list
        for (let i = 0; i < closestIds.length; i++) {
            const closestId = closestIds[i]
            for (let j = i + 1; j < closestIds.length; j++) {
                const otherClosestId = closestIds[j]
                if (closestId !== otherClosestId) {
                    continue
                }
                // We have two occurences of 'closestId' - we only keep the closest instance!
                const di = distances[i]
                const dj = distances[j]
                if (di < dj) {
                    closestIds[j] = undefined
                } else {
                    closestIds[i] = undefined
                }
            }
        }


        const osmWay = <OsmWay>parsed[parsed.length - 1]
        if (osmWay.type !== "way") {
            throw "WEIRD: expected an OSM-way as last element here!"
        }
        return {closestIds, allNodesById, osmWay};
    }


}