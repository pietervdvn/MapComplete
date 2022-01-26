/**
 * An action is a change to the OSM-database
 * It will generate some new/modified/deleted objects, which are all bundled by the 'changes'-object
 */
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";

export default abstract class OsmChangeAction {

    public readonly trackStatistics: boolean;
    /**
     * The ID of the object that is the center of this change.
     * Null if the action creates a new object (at initialization)
     * Undefined if such an id does not make sense
     */
    public readonly mainObjectId: string;
    private isUsed = false

    constructor(mainObjectId: string, trackStatistics: boolean = true) {
        this.trackStatistics = trackStatistics;
        this.mainObjectId = mainObjectId
    }

    public Perform(changes: Changes) {
        if (this.isUsed) {
            throw "This ChangeAction is already used: " + this.constructor.name
        }
        this.isUsed = true;
        return this.CreateChangeDescriptions(changes)
    }

    protected abstract CreateChangeDescriptions(changes: Changes): Promise<ChangeDescription[]>
}

export abstract class OsmCreateAction extends OsmChangeAction {

    public newElementId: string
    public newElementIdNumber: number

}
