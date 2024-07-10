import BaseUIElement from "../../BaseUIElement"
import Translations from "../../i18n/Translations"
import { Utils } from "../../../Utils"
import Img from "../../Base/Img"
import { SubtleButton } from "../../Base/SubtleButton"
import Toggle from "../../Input/Toggle"
import { LoginToggle } from ".././LoginButton"
import { SpecialVisualization, SpecialVisualizationState } from "../../SpecialVisualization"
import { UIEventSource } from "../../../Logic/UIEventSource"
import Constants from "../../../Models/Constants"
import SvelteUIElement from "../../Base/SvelteUIElement"
import Checkmark from "../../../assets/svg/Checkmark.svelte"
import NoteCommentElement from "./NoteCommentElement"
import Icon from "../../Map/Icon.svelte"

export class CloseNoteButton implements SpecialVisualization {
    public readonly funcName = "close_note"
    public readonly needsUrls = [Constants.osmAuthConfig.url]
    public readonly docs =
        "Button to close a note. A predefined text can be defined to close the note with. If the note is already closed, will show a small text."
    public readonly args = [
        {
            name: "text",
            doc: "Text to show on this button",
            required: true,
        },
        {
            name: "icon",
            doc: "Icon to show",
            defaultValue: "checkmark.svg",
        },
        {
            name: "idkey",
            doc: "The property name where the ID of the note to close can be found",
            defaultValue: "id",
        },
        {
            name: "comment",
            doc: "Text to add onto the note when closing",
        },
        {
            name: "minZoom",
            doc: "If set, only show the closenote button if zoomed in enough",
        },
        {
            name: "zoomButton",
            doc: "Text to show if not zoomed in enough",
        },
    ]

    public constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>,
        args: string[]
    ): BaseUIElement {
        const t = Translations.t.notes

        const params: {
            text: string
            icon: string
            idkey: string
            comment: string
            minZoom: string
            zoomButton: string
        } = <any>Utils.ParseVisArgs(this.args, args)

        let icon: BaseUIElement = new SvelteUIElement(Icon, {
            icon: params.icon ?? "checkmark.svg",
        })
        let textToShow = t.closeNote
        if ((params.text ?? "") !== "") {
            textToShow = Translations.T(args[0])
        }

        let closeButton: BaseUIElement = new SubtleButton(icon, textToShow)
        const isClosed = tags.map((tags) => (tags["closed_at"] ?? "") !== "")
        closeButton.onClick(() => {
            const id = tags.data[args[2] ?? "id"]
            const text = args[3]
            state.osmConnection.closeNote(id, text)?.then((_) => {
                NoteCommentElement.addCommentTo(text, tags, state)
                tags.data["closed_at"] = new Date().toISOString()
                tags.ping()
            })
        })

        if ((params.minZoom ?? "") !== "" && !isNaN(Number(params.minZoom))) {
            closeButton = new Toggle(
                closeButton,
                params.zoomButton ?? "",
                state.mapProperties.zoom.map((zoom) => zoom >= Number(params.minZoom))
            )
        }

        return new LoginToggle(
            new Toggle(
                t.isClosed.SetClass("thanks"),
                closeButton,

                isClosed
            ),
            t.loginToClose,
            state
        )
    }
}
