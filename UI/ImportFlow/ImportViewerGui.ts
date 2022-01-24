import Combine from "../Base/Combine";
import UserRelatedState from "../../Logic/State/UserRelatedState";
import {VariableUiElement} from "../Base/VariableUIElement";
import {Utils} from "../../Utils";
import UserDetails from "../../Logic/Osm/OsmConnection";
import {UIEventSource} from "../../Logic/UIEventSource";
import Title from "../Base/Title";
import Translations from "../i18n/Translations";
import Loading from "../Base/Loading";
import {FixedUiElement} from "../Base/FixedUiElement";
import Link from "../Base/Link";
import {DropDown} from "../Input/DropDown";
import BaseUIElement from "../BaseUIElement";
import ValidatedTextField from "../Input/ValidatedTextField";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Toggle from "../Input/Toggle";
import Table from "../Base/Table";
import LeftIndex from "../Base/LeftIndex";
import Toggleable, {Accordeon} from "../Base/Toggleable";
import TableOfContents from "../Base/TableOfContents";
import LoginButton from "../Popup/LoginButton";
import BackToIndex from "../BigComponents/BackToIndex";

interface NoteProperties {
    "id": number,
    "url": string,
    "date_created": string,
    closed_at?: string,
    "status": "open" | "closed",
    "comments": {
        date: string,
        uid: number,
        user: string,
        text: string
    }[]
}

interface NoteState {
    props: NoteProperties,
    theme: string,
    intro: string,
    dateStr: string,
    status: "imported" | "already_mapped" | "invalid" | "closed" | "not_found" | "open"
}

class MassAction extends Combine {
    constructor(state: UserRelatedState, props: NoteProperties[]) {
        const textField = ValidatedTextField.InputForType("text")

        const actions = new DropDown<{
            predicate: (p: NoteProperties) => boolean,
            action: (p: NoteProperties) => Promise<void>
        }>("On which notes should an action be performed?", [
            {
                value: undefined,
                shown: <string | BaseUIElement>"Pick an option..."
            },
            {
                value: {
                    predicate: p => p.status === "open",
                    action: async p => {
                        const txt = textField.GetValue().data
                        state.osmConnection.closeNote(p.id, txt)
                    }
                },
                shown: "Add comment to every open note and close all notes"
            },
            {
                value: {
                    predicate: p => p.status === "open",
                    action: async p => {
                        const txt = textField.GetValue().data
                        state.osmConnection.addCommentToNode(p.id, txt)
                    }
                },
                shown: "Add comment to every open note"
            }
        ])

        const handledNotesCounter = new UIEventSource<number>(undefined)
        const apply = new SubtleButton(Svg.checkmark_svg(), "Apply action")
            .onClick(async () => {
                const {predicate, action} = actions.GetValue().data
                for (let i = 0; i < props.length; i++) {
                    handledNotesCounter.setData(i)
                    const prop = props[i]
                    if (!predicate(prop)) {
                        continue
                    }
                    await action(prop)
                }
                handledNotesCounter.setData(props.length)
            })
        super([

            actions,
            textField.SetClass("w-full border border-black"),
            new Toggle(
                new Toggle(
                    apply,

                    new Toggle(
                        new Loading(new VariableUiElement(handledNotesCounter.map(state => {
                            if (state === props.length) {
                                return "All done!"
                            }
                            return "Handling note " + (state + 1) + " out of " + props.length;
                        }))),
                        new Combine([Svg.checkmark_svg().SetClass("h-8"), "All done!"]).SetClass("thanks flex p-4"),
                        handledNotesCounter.map(s => s < props.length)
                    ),
                    handledNotesCounter.map(s => s === undefined)
                )

                , undefined,
                actions.GetValue().map(v => v !== undefined && textField.GetValue()?.data?.length > 15, [textField.GetValue()])
            ),
            new Toggle(
                new FixedUiElement("Testmode enable").SetClass("alert"), undefined,
                state.featureSwitchIsTesting
            )
        ]);
    }

}


class BatchView extends Toggleable {
    constructor(state: UserRelatedState, noteStates: NoteState[]) {
        const {theme, intro, dateStr} = noteStates[0]
        console.log("Creating a batchview for ", noteStates)
        super(
            new Title(theme + ": " + intro, 2),
            new Combine([
                new FixedUiElement(dateStr),
                new FixedUiElement("Click to expand/collapse table"),


                new Table(
                    ["id", "status", "last comment"],
                    noteStates.map(ns => {
                        const link = new Link(
                            "" + ns.props.id,
                            "https://openstreetmap.org/note/" + ns.props.id, true
                        )
                        const last_comment = ns.props.comments[ns.props.comments.length - 1].text
                        return [link, ns.status, last_comment]
                    })
                ).SetClass("zebra-table link-underline"),


                new Title("Mass apply an action"),
                new MassAction(state, noteStates.map(ns => ns.props)).SetClass("block")]).SetClass("flex flex-col"))
    }
}

class ImportInspector extends VariableUiElement {

    constructor(userDetails: UserDetails, state: UserRelatedState) {
        const t = Translations.t.importInspector;


        const url = "https://api.openstreetmap.org/api/0.6/notes/search.json?user=" + userDetails.uid + "&limit=10000&sort=created_at&q=%23import"
        const notes: UIEventSource<{ error: string } | { success: { features: { properties: NoteProperties }[] } }> = UIEventSource.FromPromiseWithErr(Utils.downloadJson(url))
        notes.addCallbackAndRun(n => console.log("Notes are:", n))
        super(notes.map(notes => {

            if (notes === undefined) {
                return new Loading("Loading your notes which mention '#import'")
            }
            if (notes["error"] !== undefined) {
                return new FixedUiElement("Something went wrong: " + notes["error"]).SetClass("alert")
            }
            // We only care about the properties here
            const props: NoteProperties[] = notes["success"].features.map(f => f.properties)
            const perBatch: NoteState[][] = Array.from(ImportInspector.SplitNotesIntoBatches(props).values());
            const els: Toggleable[] = perBatch.map(noteStates => new BatchView(state, noteStates))

            const accordeon = new Accordeon(els)
            const content = new Combine([
                new Title(Translations.t.importInspector.title, 1),
                new SubtleButton(undefined, "Create a new batch of imports",{url:'import_helper.html'}),
                accordeon])
            return new LeftIndex(
                [new TableOfContents(content, {noTopLevel: true, maxDepth: 1}).SetClass("subtle")],
                content
            )

        }));
    }

    /**
     * Creates distinct batches of note, where 'date', 'intro' and 'theme' are identical
     */
    private static SplitNotesIntoBatches(props: NoteProperties[]): Map<string, NoteState[]> {
        const perBatch = new Map<string, NoteState[]>()
        const prefix = "https://mapcomplete.osm.be/"
        for (const prop of props) {
            const lines = prop.comments[0].text.split("\n")
            const trigger = lines.findIndex(l => l.startsWith(prefix) && l.endsWith("#import"))
            if (trigger < 0) {
                continue
            }
            let theme = lines[trigger].substr(prefix.length)
            theme = theme.substr(0, theme.indexOf("."))
            const date = Utils.ParseDate(prop.date_created)
            const dateStr = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate()
            const key = theme + lines[0] + dateStr
            if (!perBatch.has(key)) {
                perBatch.set(key, [])
            }
            let status: "open" | "closed" | "imported" | "invalid" | "already_mapped" | "not_found" = "open"
            if (prop.closed_at !== undefined) {
                const lastComment = prop.comments[prop.comments.length - 1].text.toLowerCase()
                if (lastComment.indexOf("does not exist") >= 0) {
                    status = "not_found"
                } else if (lastComment.indexOf("already mapped") >= 0) {
                    status = "already_mapped"
                } else if (lastComment.indexOf("invalid") >= 0 || lastComment.indexOf("incorrecto") >= 0) {
                    status = "invalid"
                } else if (lastComment.indexOf("imported") >= 0) {
                    status = "imported"
                } else {
                    status = "closed"
                }
            }

            perBatch.get(key).push({
                props: prop,
                intro: lines[0],
                theme,
                dateStr,
                status
            })
        }
        return perBatch;
    }
}

class ImportViewerGui extends Combine {

    constructor() {
        const state = new UserRelatedState(undefined)
        super([
            new VariableUiElement(state.osmConnection.userDetails.map(ud => {
                if (ud === undefined || ud.loggedIn === false) {
                    return new Combine([new LoginButton("Login to inspect your import flows", state),
                    new BackToIndex()
                    ])
                }
                return new ImportInspector(ud, state);
            }))
        ]);
    }
}

new ImportViewerGui().AttachTo("main")