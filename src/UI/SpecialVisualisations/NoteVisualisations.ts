import {
    SpecialVisualization,
    SpecialVisualizationState,
    SpecialVisualizationSvelte,
} from "../SpecialVisualization"
import Constants from "../../Models/Constants"
import { UIEventSource } from "../../Logic/UIEventSource"
import { Feature } from "geojson"
import { GeoOperations } from "../../Logic/GeoOperations"
import SvelteUIElement from "../Base/SvelteUIElement"
import CreateNewNote from "../Popup/Notes/CreateNewNote.svelte"
import { Utils } from "../../Utils"
import CloseNoteButton from "../Popup/Notes/CloseNoteButton.svelte"
import Translations from "../i18n/Translations"
import AddNoteComment from "../Popup/Notes/AddNoteComment.svelte"
import { Imgur } from "../../Logic/ImageProviders/Imgur"
import UploadImage from "../Image/UploadImage.svelte"
import { VariableUiElement } from "../Base/VariableUIElement"
import Combine from "../Base/Combine"
import NoteCommentElement from "../Popup/Notes/NoteCommentElement.svelte"

class CloseNoteViz implements SpecialVisualizationSvelte {
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
    public readonly group: "notes"

    public constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>,
        args: string[]
    ): SvelteUIElement {
        const { text, icon, idkey, comment, minZoom, zoomButton } = Utils.ParseVisArgs(
            this.args,
            args
        )

        return new SvelteUIElement(CloseNoteButton, {
            state,
            tags,
            icon,
            idkey,
            message: comment,
            text: Translations.T(text),
            minzoom: minZoom,
            zoomMoreMessage: zoomButton,
        })
    }
}

class AddNoteCommentViz implements SpecialVisualizationSvelte {
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
    public readonly group: "notes"

    public constr(
        state: SpecialVisualizationState,
        tags: UIEventSource<Record<string, string>>
    ): SvelteUIElement {
        return new SvelteUIElement(AddNoteComment, { state, tags })
    }
}

export class NoteVisualisations {
    public static initList(): (SpecialVisualization & { group })[] {
        return [
            new AddNoteCommentViz(),
            new CloseNoteViz(),
            {
                funcName: "open_note",
                args: [],
                group: "notes",
                needsUrls: [Constants.osmAuthConfig.url],
                docs: "Creates a new map note on the given location. This options is placed in the 'last_click'-popup automatically if the 'notes'-layer is enabled",
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    argument: string[],
                    feature: Feature
                ): SvelteUIElement {
                    const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
                    return new SvelteUIElement(CreateNewNote, {
                        state,
                        coordinate: new UIEventSource({ lon, lat }),
                    })
                },
            },
            {
                funcName: "add_image_to_note",
                docs: "Adds an image to a node",
                args: [
                    {
                        name: "Id-key",
                        doc: "The property name where the ID of the note to close can be found",
                        defaultValue: "id",
                    },
                ],
                group: "notes",
                needsUrls: [Imgur.apiUrl, ...Imgur.supportingUrls],

                constr: (state, tags, args, feature, layer) => {
                    const id = tags.data[args[0] ?? "id"]
                    tags = state.featureProperties.getStore(id)
                    return new SvelteUIElement(UploadImage, { state, tags, layer, feature })
                },
            },
            {
                funcName: "visualize_note_comments",
                group: "notes",
                docs: "Visualises the comments for notes",
                args: [
                    {
                        name: "commentsKey",
                        doc: "The property name of the comments, which should be stringified json",
                        defaultValue: "comments",
                    },
                    {
                        name: "start",
                        doc: "Drop the first 'start' comments",
                        defaultValue: "0",
                    },
                ],
                needsUrls: [Constants.osmAuthConfig.url],
                constr: (state, tags, args) =>
                    new VariableUiElement(
                        tags
                            .map((tags) => tags[args[0]])
                            .map((commentsStr) => {
                                const comments: { text: string }[] = JSON.parse(commentsStr)
                                const startLoc = Number(args[1] ?? 0)
                                if (!isNaN(startLoc) && startLoc > 0) {
                                    comments.splice(0, startLoc)
                                }
                                return new Combine(
                                    comments
                                        .filter((c) => c.text !== "")
                                        .map(
                                            (comment) =>
                                                new SvelteUIElement(NoteCommentElement, {
                                                    comment,
                                                    state,
                                                })
                                        )
                                ).SetClass("flex flex-col")
                            })
                    ),
            },
        ]
    }
}
