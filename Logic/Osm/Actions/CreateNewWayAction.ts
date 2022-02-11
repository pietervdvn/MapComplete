import {ChangeDescription} from "./ChangeDescription";
import {OsmCreateAction} from "./OsmChangeAction";
import {Changes} from "../Changes";
import {Tag} from "../../Tags/Tag";
import CreateNewNodeAction from "./CreateNewNodeAction";
import {And} from "../../Tags/And";

export default class CreateNewWayAction extends OsmCreateAction {
    public newElementId: string = undefined
    public newElementIdNumber: number = undefined;
    private readonly coordinates: ({ nodeId?: number, lat: number, lon: number })[];
    private readonly tags: Tag[];
    private readonly _options: {
        theme: string
    };


    /***
     * Creates a new way to upload to OSM
     * @param tags: the tags to apply to the way
     * @param coordinates: the coordinates. Might have a nodeId, in this case, this node will be used
     * @param options
     */
    constructor(tags: Tag[], coordinates: ({ nodeId?: number, lat: number, lon: number })[],
                options: {
                    theme: string
                }) {
        super(null, true)
        this.coordinates = [];

        for (const coordinate of coordinates) {
            /* The 'PointReuseAction' is a bit buggy and might generate duplicate ids.
                We filter those here, as the CreateWayWithPointReuseAction delegates the actual creation to here.
                Filtering here also prevents similar bugs in other actions
             */
            if(this.coordinates.length > 0 && this.coordinates[this.coordinates.length - 1].nodeId === coordinate.nodeId){
                // This is a duplicate id
                console.warn("Skipping a node in createWay to avoid a duplicate node:", coordinate,"\nThe previous coordinates are: ", this.coordinates)
                continue
            }
            
            this.coordinates.push(coordinate)
        }
        
        this.tags = tags;
        this._options = options;
    }

    public async CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]> {

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
            newElements.push(...await newPoint.CreateChangeDescriptions(changes))
            pointIds.push(newPoint.newElementIdNumber)
        }

        // We have all created (or reused) all the points!
        // Time to create the actual way


        const id = changes.getNewID()
        this.newElementIdNumber = id
        const newWay = <ChangeDescription>{
            id,
            type: "way",
            meta: {
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
        this.newElementId = "way/" + id
        return newElements
    }


}