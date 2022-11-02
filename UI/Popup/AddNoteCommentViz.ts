import Translations from "../i18n/Translations"
import { TextField } from "../Input/TextField"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import NoteCommentElement from "./NoteCommentElement"
import { VariableUiElement } from "../Base/VariableUIElement"
import Toggle from "../Input/Toggle"
import { LoginToggle } from "./LoginButton"
import Combine from "../Base/Combine"
import Title from "../Base/Title"
import { SpecialVisualization } from "../SpecialVisualization"

export class AddNoteCommentViz implements SpecialVisualization {
    funcName = "add_note_comment"
    docs = "A textfield to add a comment to a node (with the option to close the note)."
    args = [
        {
            name: "Id-key",
            doc: "The property name where the ID of the note to close can be found",
            defaultValue: "id",
        },
    ]

    public constr(state, tags, args) {
        const t = Translations.t.notes
        const textField = new TextField({
            placeholder: t.addCommentPlaceholder,
            inputStyle: "width: 100%; height: 6rem;",
            textAreaRows: 3,
            htmlType: "area",
        })
        textField.SetClass("rounded-l border border-grey")
        const txt = textField.GetValue()

        const addCommentButton = new SubtleButton(
            Svg.speech_bubble_svg().SetClass("max-h-7"),
            t.addCommentPlaceholder
        ).onClick(async () => {
            const id = tags.data[args[1] ?? "id"]

            if ((txt.data ?? "") == "") {
                return
            }

            if (isClosed.data) {
                await state.osmConnection.reopenNote(id, txt.data)
                await state.osmConnection.closeNote(id)
            } else {
                await state.osmConnection.addCommentToNote(id, txt.data)
            }
            NoteCommentElement.addCommentTo(txt.data, tags, state)
            txt.setData("")
        })

        const close = new SubtleButton(
            Svg.resolved_svg().SetClass("max-h-7"),
            new VariableUiElement(
                txt.map((txt) => {
                    if (txt === undefined || txt === "") {
                        return t.closeNote
                    }
                    return t.addCommentAndClose
                })
            )
        ).onClick(() => {
            const id = tags.data[args[1] ?? "id"]
            state.osmConnection.closeNote(id, txt.data).then((_) => {
                tags.data["closed_at"] = new Date().toISOString()
                tags.ping()
            })
        })

        const reopen = new SubtleButton(
            Svg.note_svg().SetClass("max-h-7"),
            new VariableUiElement(
                txt.map((txt) => {
                    if (txt === undefined || txt === "") {
                        return t.reopenNote
                    }
                    return t.reopenNoteAndComment
                })
            )
        ).onClick(() => {
            const id = tags.data[args[1] ?? "id"]
            state.osmConnection.reopenNote(id, txt.data).then((_) => {
                tags.data["closed_at"] = undefined
                tags.ping()
            })
        })

        const isClosed = tags.map((tags) => (tags["closed_at"] ?? "") !== "")
        const stateButtons = new Toggle(
            new Toggle(reopen, close, isClosed),
            undefined,
            state.osmConnection.isLoggedIn
        )

        return new LoginToggle(
            new Combine([
                new Title(t.addAComment),
                textField,
                new Combine([
                    stateButtons.SetClass("sm:mr-2"),
                    new Toggle(
                        addCommentButton,
                        new Combine([t.typeText]).SetClass("flex items-center h-full subtle"),
                        textField.GetValue().map((t) => t !== undefined && t.length >= 1)
                    ).SetClass("sm:mr-2"),
                ]).SetClass("sm:flex sm:justify-between sm:items-stretch"),
            ]).SetClass("border-2 border-black rounded-xl p-4 block"),
            t.loginToAddComment,
            state
        )
    }
}
