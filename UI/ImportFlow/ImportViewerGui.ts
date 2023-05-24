import Combine from "../Base/Combine"
import UserRelatedState from "../../Logic/State/UserRelatedState"
import { VariableUiElement } from "../Base/VariableUIElement"
import { Utils } from "../../Utils"
import { UIEventSource } from "../../Logic/UIEventSource"
import Title from "../Base/Title"
import Translations from "../i18n/Translations"
import Loading from "../Base/Loading"
import { FixedUiElement } from "../Base/FixedUiElement"
import Link from "../Base/Link"
import { DropDown } from "../Input/DropDown"
import BaseUIElement from "../BaseUIElement"
import ValidatedTextField from "../Input/ValidatedTextField"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import Toggle, { ClickableToggle } from "../Input/Toggle"
import Table from "../Base/Table"
import LeftIndex from "../Base/LeftIndex"
import Toggleable, { Accordeon } from "../Base/Toggleable"
import TableOfContents from "../Base/TableOfContents"
import { LoginToggle } from "../Popup/LoginButton"
import { QueryParameters } from "../../Logic/Web/QueryParameters"
import Lazy from "../Base/Lazy"
import { Button } from "../Base/Button"
import ChartJs from "../Base/ChartJs"

interface NoteProperties {
    id: number
    url: string
    date_created: string
    closed_at?: string
    status: "open" | "closed"
    comments: {
        date: string
        uid: number
        user: string
        text: string
        html: string
    }[]
}

interface NoteState {
    props: NoteProperties
    theme: string
    intro: string
    dateStr: string
    status:
        | "imported"
        | "already_mapped"
        | "invalid"
        | "closed"
        | "not_found"
        | "open"
        | "has_comments"
}

class DownloadStatisticsButton extends SubtleButton {
    constructor(states: NoteState[][]) {
        super(Svg.statistics_svg(), "Download statistics")
        this.onClick(() => {
            const st: NoteState[] = [].concat(...states)

            const fields = [
                "id",
                "status",
                "theme",
                "date_created",
                "date_closed",
                "days_open",
                "intro",
                "...comments",
            ]
            const values: string[][] = st.map((note) => {
                return [
                    note.props.id + "",
                    note.status,
                    note.theme,
                    note.props.date_created?.substr(0, note.props.date_created.length - 3),
                    note.props.closed_at?.substr(0, note.props.closed_at.length - 3) ?? "",
                    JSON.stringify(note.intro),
                    ...note.props.comments.map(
                        (c) => JSON.stringify(c.user) + ": " + JSON.stringify(c.text)
                    ),
                ]
            })

            Utils.offerContentsAsDownloadableFile(
                [fields, ...values].map((c) => c.join(", ")).join("\n"),
                "mapcomplete_import_notes_overview.csv",
                {
                    mimetype: "text/csv",
                }
            )
        })
    }
}

class MassAction extends Combine {
    constructor(state: UserRelatedState, props: NoteProperties[]) {
        const textField = ValidatedTextField.ForType("text").ConstructInputElement()

        const actions = new DropDown<{
            predicate: (p: NoteProperties) => boolean
            action: (p: NoteProperties) => Promise<void>
        }>("On which notes should an action be performed?", [
            {
                value: undefined,
                shown: <string | BaseUIElement>"Pick an option...",
            },
            {
                value: {
                    predicate: (p) => p.status === "open",
                    action: async (p) => {
                        const txt = textField.GetValue().data
                        state.osmConnection.closeNote(p.id, txt)
                    },
                },
                shown: "Add comment to every open note and close all notes",
            },
            {
                value: {
                    predicate: (p) => p.status === "open",
                    action: async (p) => {
                        const txt = textField.GetValue().data
                        state.osmConnection.addCommentToNote(p.id, txt)
                    },
                },
                shown: "Add comment to every open note",
            },
            /*
            {
               // This was a one-off for one of the first imports
                value:{
                    predicate: p => p.status === "open" && p.comments[0].text.split("\n").find(l => l.startsWith("note=")) !== undefined,
                    action: async p => {
                        const note = p.comments[0].text.split("\n").find(l => l.startsWith("note=")).substr("note=".length)
                        state.osmConnection.addCommentToNode(p.id, note)
                    }
                },
                shown:"On every open note, read the 'note='-tag and and this note as comment. (This action ignores the textfield)"
            },//*/
        ])

        const handledNotesCounter = new UIEventSource<number>(undefined)
        const apply = new SubtleButton(Svg.checkmark_svg(), "Apply action").onClick(async () => {
            const { predicate, action } = actions.GetValue().data
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
                        new Loading(
                            new VariableUiElement(
                                handledNotesCounter.map((state) => {
                                    if (state === props.length) {
                                        return "All done!"
                                    }
                                    return (
                                        "Handling note " + (state + 1) + " out of " + props.length
                                    )
                                })
                            )
                        ),
                        new Combine([Svg.checkmark_svg().SetClass("h-8"), "All done!"]).SetClass(
                            "thanks flex p-4"
                        ),
                        handledNotesCounter.map((s) => s < props.length)
                    ),
                    handledNotesCounter.map((s) => s === undefined)
                ),

                new VariableUiElement(
                    textField
                        .GetValue()
                        .map(
                            (txt) =>
                                "Type a text of at least 15 characters to apply the action. Currently, there are " +
                                (txt?.length ?? 0) +
                                " characters"
                        )
                ).SetClass("alert"),
                actions
                    .GetValue()
                    .map(
                        (v) => v !== undefined && textField.GetValue()?.data?.length > 15,
                        [textField.GetValue()]
                    )
            ),
            new Toggle(
                new FixedUiElement("Testmode enable").SetClass("alert"),
                undefined,
                state.featureSwitchIsTesting
            ),
        ])
    }
}

class Statistics extends Combine {
    private static r() {
        return Math.floor(Math.random() * 256)
    }

    private static randomColour(): string {
        return "rgba(" + Statistics.r() + "," + Statistics.r() + "," + Statistics.r() + ")"
    }
    private static CreatePieByAuthor(closed_by: Record<string, number[]>): ChartJs {
        const importers = Object.keys(closed_by)
        importers.sort((a, b) => closed_by[b].at(-1) - closed_by[a].at(-1))
        return new ChartJs(<any>{
            type: "doughnut",
            data: {
                labels: importers,
                datasets: [
                    {
                        label: "Closed by",
                        data: importers.map((k) => closed_by[k].at(-1)),
                        backgroundColor: importers.map((_) => Statistics.randomColour()),
                    },
                ],
            },
        })
    }

    private static CreateStatePie(noteStates: NoteState[]) {
        const colors = {
            imported: "#0aa323",
            already_mapped: "#00bbff",
            invalid: "#ff0000",
            closed: "#000000",
            not_found: "#ff6d00",
            open: "#626262",
            has_comments: "#a8a8a8",
        }
        const knownStates = Object.keys(colors)
        const byState = knownStates.map(
            (targetState) => noteStates.filter((ns) => ns.status === targetState).length
        )

        return new ChartJs(<any>{
            type: "doughnut",
            data: {
                labels: knownStates.map(
                    (state, i) =>
                        state + " " + Math.floor((100 * byState[i]) / noteStates.length) + "%"
                ),
                datasets: [
                    {
                        label: "Status by",
                        data: byState,
                        backgroundColor: knownStates.map((state) => colors[state]),
                    },
                ],
            },
        })
    }

    constructor(noteStates: NoteState[]) {
        if (noteStates.length === 0) {
            super([])
            return
        }
        // We assume all notes are created at the same time
        let dateOpened = new Date(noteStates[0].dateStr)
        for (const noteState of noteStates) {
            const openDate = new Date(noteState.dateStr)
            if (openDate < dateOpened) {
                dateOpened = openDate
            }
        }
        const today = new Date()
        const daysBetween = (today.getTime() - dateOpened.getTime()) / (1000 * 60 * 60 * 24)
        const ranges = {
            dates: [],
            is_open: [],
        }
        const closed_by: Record<string, number[]> = {}

        for (const noteState of noteStates) {
            const closing_user = noteState.props.comments.at(-1).user
            if (closed_by[closing_user] === undefined) {
                closed_by[closing_user] = []
            }
        }

        for (let i = -1; i < daysBetween; i++) {
            const dt = new Date(dateOpened.getTime() + 24 * 60 * 60 * 1000 * i)
            let open_count = 0

            for (const closing_user in closed_by) {
                closed_by[closing_user].push(0)
            }

            for (const noteState of noteStates) {
                const openDate = new Date(noteState.dateStr)
                if (openDate > dt) {
                    // Not created at this point
                    continue
                }
                if (noteState.props.closed_at === undefined) {
                    open_count++
                } else if (
                    new Date(noteState.props.closed_at.substring(0, 10)).getTime() > dt.getTime()
                ) {
                    open_count++
                } else {
                    const closing_user = noteState.props.comments.at(-1).user
                    const user_count = closed_by[closing_user]
                    user_count[user_count.length - 1] += 1
                }
            }

            ranges.dates.push(
                new Date(dateOpened.getTime() + i * 1000 * 60 * 60 * 24)
                    .toISOString()
                    .substring(0, 10)
            )
            ranges.is_open.push(open_count)
        }

        const labels = ranges.dates.map((i) => "" + i)
        const data = {
            labels: labels,
            datasets: [
                {
                    label: "Total open",
                    data: ranges.is_open,
                    fill: false,
                    borderColor: "rgb(75, 192, 192)",
                    tension: 0.1,
                },
            ],
        }
        for (const closing_user in closed_by) {
            if (closed_by[closing_user].at(-1) <= 10) {
                continue
            }
            data.datasets.push({
                label: "Closed by " + closing_user,
                data: closed_by[closing_user],
                fill: false,
                borderColor: Statistics.randomColour(),
                tension: 0.1,
            })
        }

        super([
            new ChartJs({
                type: "line",
                data,
                options: {
                    scales: <any>{
                        yAxes: [
                            {
                                ticks: {
                                    beginAtZero: true,
                                },
                            },
                        ],
                    },
                },
            }),
            new Combine([
                Statistics.CreatePieByAuthor(closed_by),
                Statistics.CreateStatePie(noteStates),
            ])
                .SetClass("flex w-full h-32")
                .SetStyle("width: 40rem"),
        ])
        this.SetClass("block w-full h-64 border border-red")
    }
}

class NoteTable extends Combine {
    private static individualActions: [() => BaseUIElement, string][] = [
        [Svg.not_found_svg, "This feature does not exist"],
        [Svg.addSmall_svg, "imported"],
        [Svg.duplicate_svg, "Already mapped"],
    ]

    constructor(noteStates: NoteState[], state?: UserRelatedState) {
        const typicalComment = noteStates[0].props.comments[0].html

        const table = new Table(
            ["id", "status", "last comment", "last modified by", "actions"],
            noteStates.map((ns) => NoteTable.noteField(ns, state)),
            { sortable: true }
        ).SetClass("zebra-table link-underline")

        super([
            new Title("Mass apply an action on " + noteStates.length + " notes below"),
            state !== undefined
                ? new MassAction(
                      state,
                      noteStates.map((ns) => ns.props)
                  ).SetClass("block")
                : undefined,
            table,
            new Title("Example note", 4),
            new FixedUiElement(typicalComment).SetClass("literal-code link-underline"),
        ])
        this.SetClass("flex flex-col")
    }

    private static noteField(ns: NoteState, state: UserRelatedState) {
        const link = new Link(
            "" + ns.props.id,
            "https://openstreetmap.org/note/" + ns.props.id,
            true
        )
        let last_comment = ""
        const last_comment_props = ns.props.comments[ns.props.comments.length - 1]
        const before_last_comment = ns.props.comments[ns.props.comments.length - 2]
        if (ns.props.comments.length > 1) {
            last_comment = last_comment_props.text
            if (last_comment === undefined && before_last_comment?.uid === last_comment_props.uid) {
                last_comment = before_last_comment.text
            }
        }
        const statusIcon = BatchView.icons[ns.status]().SetClass("h-4 w-4 shrink-0")
        const togglestate = new UIEventSource(false)
        const changed = new UIEventSource<string>(undefined)

        const lazyButtons = new Lazy(() =>
            new Combine(
                this.individualActions.map(([img, text]) =>
                    img()
                        .onClick(async () => {
                            if (ns.props.status === "closed") {
                                await state.osmConnection.reopenNote(ns.props.id)
                            }
                            await state.osmConnection.closeNote(ns.props.id, text)
                            changed.setData(text)
                        })
                        .SetClass("h-8 w-8")
                )
            ).SetClass("flex")
        )

        const appliedButtons = new VariableUiElement(
            changed.map((currentState) => (currentState === undefined ? lazyButtons : currentState))
        )

        const buttons = Toggle.If(
            state?.osmConnection?.isLoggedIn,
            () =>
                new ClickableToggle(
                    appliedButtons,
                    new Button("edit...", () => {
                        console.log("Enabling...")
                        togglestate.setData(true)
                    }),
                    togglestate
                )
        )
        return [
            link,
            new Combine([statusIcon, ns.status]).SetClass("flex"),
            last_comment,
            new Link(
                last_comment_props.user,
                "https://www.openstreetmap.org/user/" + last_comment_props.user,
                true
            ),
            buttons,
        ]
    }
}

class BatchView extends Toggleable {
    public static icons = {
        open: Svg.compass_svg,
        has_comments: Svg.speech_bubble_svg,
        imported: Svg.addSmall_svg,
        already_mapped: Svg.checkmark_svg,
        not_found: Svg.not_found_svg,
        closed: Svg.close_svg,
        invalid: Svg.invalid_svg,
    }

    constructor(noteStates: NoteState[], state?: UserRelatedState) {
        noteStates.sort((a, b) => a.props.id - b.props.id)

        const { theme, intro, dateStr } = noteStates[0]

        const statusHist = new Map<string, number>()
        for (const noteState of noteStates) {
            const st = noteState.status
            const c = statusHist.get(st) ?? 0
            statusHist.set(st, c + 1)
        }

        const unresolvedTotal =
            (statusHist.get("open") ?? 0) + (statusHist.get("has_comments") ?? 0)
        const badges: BaseUIElement[] = [
            new FixedUiElement(dateStr).SetClass("literal-code rounded-full"),
            new FixedUiElement(noteStates.length + " total")
                .SetClass("literal-code rounded-full ml-1 border-4 border-gray")
                .onClick(() => filterOn.setData(undefined)),
            unresolvedTotal === 0
                ? new Combine([Svg.party_svg().SetClass("h-6 m-1"), "All done!"]).SetClass(
                      "flex ml-1 mb-1 pl-1 pr-3 items-center rounded-full border border-black"
                  )
                : new FixedUiElement(
                      Math.round(100 - (100 * unresolvedTotal) / noteStates.length) + "%"
                  ).SetClass("literal-code rounded-full ml-1"),
        ]

        const filterOn = new UIEventSource<string>(undefined)
        Object.keys(BatchView.icons).forEach((status) => {
            const count = statusHist.get(status)
            if (count === undefined) {
                return undefined
            }

            const normal = new Combine([
                BatchView.icons[status]().SetClass("h-6 m-1"),
                count + " " + status,
            ]).SetClass("flex ml-1 mb-1 pl-1 pr-3 items-center rounded-full border border-black")
            const selected = new Combine([
                BatchView.icons[status]().SetClass("h-6 m-1"),
                count + " " + status,
            ]).SetClass(
                "flex ml-1 mb-1 pl-1 pr-3 items-center rounded-full border-4 border-black animate-pulse"
            )

            const toggle = new ClickableToggle(
                selected,
                normal,
                filterOn.sync(
                    (f) => f === status,
                    [],
                    (selected, previous) => {
                        if (selected) {
                            return status
                        }
                        if (previous === status) {
                            return undefined
                        }
                        return previous
                    }
                )
            ).ToggleOnClick()

            badges.push(toggle)
        })

        const fullTable = new Combine([
            new NoteTable(noteStates, state),
            new Statistics(noteStates),
        ])

        super(
            new Combine([
                new Title(theme + ": " + intro, 2),
                new Combine(badges).SetClass("flex flex-wrap"),
            ]),

            new VariableUiElement(
                filterOn.map((filter) => {
                    if (filter === undefined) {
                        return fullTable
                    }
                    const notes = noteStates.filter((ns) => ns.status === filter)
                    return new Combine([new NoteTable(notes, state), new Statistics(notes)])
                })
            ),
            {
                closeOnClick: false,
            }
        )
    }
}

class ImportInspector extends VariableUiElement {
    constructor(
        userDetails: { uid: number } | { display_name: string; search?: string },
        state: UserRelatedState
    ) {
        let url

        if (userDetails["uid"] !== undefined) {
            url =
                "https://api.openstreetmap.org/api/0.6/notes/search.json?user=" +
                userDetails["uid"] +
                "&closed=730&limit=10000&sort=created_at&q=%23import"
        } else {
            url =
                "https://api.openstreetmap.org/api/0.6/notes/search.json?display_name=" +
                encodeURIComponent(userDetails["display_name"]) +
                "&limit=10000&closed=730&sort=created_at&q="
            if (userDetails["search"] !== "") {
                url += userDetails["search"]
            } else {
                url += "#import"
            }
        }
        const notes: UIEventSource<
            { error: string } | { success: { features: { properties: NoteProperties }[] } }
        > = UIEventSource.FromPromiseWithErr(Utils.downloadJson(url))
        super(
            notes.map((notes) => {
                if (notes === undefined) {
                    return new Loading("Loading notes which mention '#import'")
                }
                if (notes["error"] !== undefined) {
                    return new FixedUiElement("Something went wrong: " + notes["error"]).SetClass(
                        "alert"
                    )
                }
                // We only care about the properties here
                let props: NoteProperties[] = notes["success"].features.map((f) => f.properties)
                if (userDetails["uid"]) {
                    props = props.filter((n) => n.comments[0].uid === userDetails["uid"])
                }
                if (userDetails["display_name"] !== undefined) {
                    const display_name = <string>userDetails["display_name"]
                    props = props.filter((n) => n.comments[0].user === display_name)
                }

                const perBatch: NoteState[][] = Array.from(
                    ImportInspector.SplitNotesIntoBatches(props).values()
                )
                const els: Toggleable[] = perBatch.map(
                    (noteStates) => new BatchView(noteStates, state)
                )

                const accordeon = new Accordeon(els)
                let contents = []
                if (state?.osmConnection?.isLoggedIn?.data) {
                    contents = [
                        new Title(Translations.t.importInspector.title, 1),
                        new SubtleButton(undefined, "Create a new batch of imports", {
                            url: "import_helper.html",
                        }),
                    ]
                }
                contents.push(accordeon)
                contents.push(
                    new Combine([
                        new Title("Statistics for all notes"),
                        new Statistics([].concat(...perBatch)),
                    ])
                )
                const content = new Combine(contents)
                return new LeftIndex(
                    [
                        new TableOfContents(content, { noTopLevel: true, maxDepth: 1 }).SetClass(
                            "subtle"
                        ),
                        new DownloadStatisticsButton(perBatch),
                    ],
                    content
                )
            })
        )
    }

    /**
     * Creates distinct batches of note, where 'date', 'intro' and 'theme' are identical
     */
    private static SplitNotesIntoBatches(props: NoteProperties[]): Map<string, NoteState[]> {
        const perBatch = new Map<string, NoteState[]>()
        const prefix = "https://mapcomplete.osm.be/"
        for (const prop of props) {
            const lines = prop.comments[0].text.split("\n")
            const trigger = lines.findIndex((l) => l.startsWith(prefix) && l.endsWith("#import"))
            if (trigger < 0) {
                continue
            }
            let theme = lines[trigger].substr(prefix.length)
            theme = theme.substr(0, theme.indexOf("."))
            const date = Utils.ParseDate(prop.date_created)
            const dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
            const key = theme + lines[0] + dateStr
            if (!perBatch.has(key)) {
                perBatch.set(key, [])
            }
            let status:
                | "open"
                | "closed"
                | "imported"
                | "invalid"
                | "already_mapped"
                | "not_found"
                | "has_comments" = "open"

            function has(keywords: string[], comment: string): boolean {
                return keywords.some((keyword) => comment.toLowerCase().indexOf(keyword) >= 0)
            }

            if (prop.closed_at !== undefined) {
                const lastComment = prop.comments[prop.comments.length - 1].text.toLowerCase()
                if (has(["does not exist", "bestaat niet", "geen"], lastComment)) {
                    status = "not_found"
                } else if (
                    has(
                        [
                            "already mapped",
                            "reeds",
                            "dubbele note",
                            "stond er al",
                            "stonden er al",
                            "staat er al",
                            "staan er al",
                            "stond al",
                            "stonden al",
                            "staat al",
                            "staan al",
                        ],
                        lastComment
                    )
                ) {
                    status = "already_mapped"
                } else if (
                    lastComment.indexOf("invalid") >= 0 ||
                    lastComment.indexOf("incorrect") >= 0
                ) {
                    status = "invalid"
                } else if (
                    has(
                        [
                            "imported",
                            "erbij",
                            "toegevoegd",
                            "added",
                            "gemapped",
                            "gemapt",
                            "mapped",
                            "done",
                            "openstreetmap.org/changeset",
                        ],
                        lastComment
                    )
                ) {
                    status = "imported"
                } else {
                    status = "closed"
                }
            } else if (prop.comments.length > 1) {
                status = "has_comments"
            }

            perBatch.get(key).push({
                props: prop,
                intro: lines[0],
                theme,
                dateStr,
                status,
            })
        }
        return perBatch
    }
}

class ImportViewerGui extends LoginToggle {
    constructor() {
        const state = new UserRelatedState(undefined)
        const displayNameParam = QueryParameters.GetQueryParameter(
            "user",
            "",
            "The username of the person whom you want to see the notes for"
        )
        const searchParam = QueryParameters.GetQueryParameter(
            "search",
            "",
            "A text that should be included in the first comment of the note to be shown"
        )
        super(
            new VariableUiElement(
                state.osmConnection.userDetails.map(
                    (ud) => {
                        const display_name = displayNameParam.data
                        const search = searchParam.data
                        if (display_name !== "" || search !== "") {
                            return new ImportInspector({ display_name, search }, undefined)
                        }
                        return new ImportInspector(ud, state)
                    },
                    [displayNameParam, searchParam]
                )
            ),
            "Login to inspect your import flows",
            state
        )
    }
}

new ImportViewerGui().AttachTo("main")
