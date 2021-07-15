/**
 * An action is a change to the OSM-database
 * It will generate some new/modified/deleted objects, which are all bundled by the 'changes'-object
 */
import {Changes} from "../Changes";
import {ChangeDescription} from "./ChangeDescription";

export default abstract class OsmChangeAction {



    public abstract Perform(changes: Changes): ChangeDescription[]
    
    
    
}