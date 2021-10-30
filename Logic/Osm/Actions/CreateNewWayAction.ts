import {ChangeDescription} from "./ChangeDescription";
import OsmChangeAction from "./OsmChangeAction";
import {Changes} from "../Changes";
import {Tag} from "../../Tags/Tag";
import CreateNewNodeAction from "./CreateNewNodeAction";
import {And} from "../../Tags/And";

export default class CreateNewWayAction extends OsmChangeAction {
    public newElementId: string = undefined
    private readonly coordinates: ({ nodeId?: number, lat: number, lon: number })[];
    private readonly tags: Tag[];
    private readonly _options: { theme: string };


    /***
     * Creates a new way to upload to OSM
     * @param tags: the tags to apply to the wya
     * @param coordinates: the coordinates. Might have a nodeId, in this case, this node will be used
     * @param options 
     */
    constructor(tags: Tag[], coordinates: ({ nodeId?: number, lat: number, lon: number })[], options: {
        theme: string
    }) {
        super()
        this.coordinates = coordinates;
        this.tags = tags;
        this._options = options;
    }

    protected async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {

        const newElements: ChangeDescription[] = []

        const pointIds: number[] = []
        for (const coordinate of this.coordinates) {
            if (coordinate.nodeId !== undefined) {
                pointIds.push(coordinate.nodeId)
                continue
            }

            const newPoint = new CreateNewNodeAction([], coordinate.lat, coordinate.lon, {
                allowReuseOfPreviouslyCreatedPoints: true,
                changeType: null,
                theme: this._options.theme
            })
            await changes.applyAction(newPoint)
            pointIds.push(newPoint.newElementIdNumber)
        }

        // We have all created (or reused) all the points!
        // Time to create the actual way
        
        
        const id = changes.getNewID()
        
        const newWay = <ChangeDescription> {
            id,
            type: "way",
            meta:{
                theme: this._options.theme,
                changeType: "import"
            },
            tags: new And(this.tags).asChange({}),
            changes: {
                nodes: pointIds,
                coordinates: this.coordinates.map(c => [c.lon, c.lat])
            }
        }
        newElements.push(newWay)
        this.newElementId = "way/"+id
        return newElements
    }


}