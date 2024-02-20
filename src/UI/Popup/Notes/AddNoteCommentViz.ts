import { SpecialVisualization, SpecialVisualizationState } from "../../SpecialVisualization"
import { UIEventSource } from "../../../Logic/UIEventSource"
import Constants from "../../../Models/Constants"
import SvelteUIElement from "../../Base/SvelteUIElement"
import AddNoteComment from "./AddNoteComment.svelte"

export class AddNoteCommentViz implements SpecialVisualization {
    funcName = "add_note_comment"
    needsUrls = [Constants.osmAuthConfig.url]
    docs = "A textfield to add a comment to a node (with the option to close the note)."
    args = [
        {
            name: "Id-key",
            doc: "The property name where the ID of the note to close can be found",
            defaultValue: "id",
        },
    ]

    public constr(state: SpecialVisualizationState, tags: UIEventSource<Record<string, string>>) {
        return new SvelteUIElement(AddNoteComment, { state, tags })
    }
}
