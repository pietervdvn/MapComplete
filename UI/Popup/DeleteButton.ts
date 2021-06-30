import {VariableUiElement} from "../Base/VariableUIElement";
import State from "../../State";
import Toggle from "../Input/Toggle";
import Translations from "../i18n/Translations";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import DeleteAction from "../../Logic/Osm/DeleteAction";
import {Tag} from "../../Logic/Tags/Tag";
import CheckBoxes from "../Input/Checkboxes";
import {RadioButton} from "../Input/RadioButton";
import {FixedInputElement} from "../Input/FixedInputElement";
import {TextField} from "../Input/TextField";


export default class DeleteWizard extends Toggle {
    /**
     * The UI-element which triggers 'deletion' (either soft or hard).
     * 
     * - A 'hard deletion' is if the point is actually deleted from the OSM database
     * - A 'soft deletion' is if the point is not deleted, but the tagging is modified which will result in the point not being picked up by the filters anymore.
     *    Apart having needing theme-specific tags added (which must be supplied by the theme creator), fixme='marked for deletion' will be added too 
     * 
     * A deletion is only possible if the user is logged in.
     * A soft deletion is only possible if tags are provided
     * A hard deletion is only possible if the user has sufficient rigts
     * 
     * If no deletion is possible at all, the delete button will not be shown - but a reason will be shown instead.
     * 
     * @param id: The id of the element to remove
     * @param softDeletionTags: the tags to apply if the user doesn't have permission to delete, e.g. 'disused:amenity=public_bookcase', 'amenity='. After applying, the element should not be picked up on the map anymore. If undefined, the wizard will only show up if the point can be (hard) deleted 
     */
    constructor(id: string, softDeletionTags? : Tag[]) {
        const t = Translations.t.delete

        const deleteAction = new DeleteAction(id);
        
        const deleteReasons = new RadioButton<string>(
            [new FixedInputElement(
                t.reasons.test, "test"
            ),
            new FixedInputElement(t.reasons.disused, "disused"),
            new FixedInputElement(t.reasons.notFound, "not found"),
            new TextField()]
            
        )

        const deleteButton = new SubtleButton(
            Svg.delete_icon_svg(),
            t.delete.Clone()
        ).onClick(() => deleteAction.DoDelete(deleteReasons.GetValue().data))

        
        
        
        super(
            
            
            
            new Toggle(
                deleteButton,
                new VariableUiElement(deleteAction.canBeDeleted.map(cbd => cbd.reason.Clone())),
                deleteAction.canBeDeleted.map(cbd => cbd.canBeDeleted)
            ),
            
            
            
            t.loginToDelete.Clone().onClick(State.state.osmConnection.AttemptLogin),
            State.state.osmConnection.isLoggedIn
        )

    }
}