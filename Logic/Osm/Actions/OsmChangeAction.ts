/**
 * An action is a change to the OSM-database
 * It will generate some new/modified/deleted objects, which are all bundled by the 'changes'-object
 */
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";

export default abstract class OsmChangeAction {

    private isUsed = false

    public Perform(changes: Changes) {
        if (this.isUsed) {
            throw "This ChangeAction is already used: " + this.constructor.name
        }
        this.isUsed = true;
        return this.CreateChangeDescriptions(changes)
    }

    protected abstract CreateChangeDescriptions(changes: Changes): ChangeDescription[]


}