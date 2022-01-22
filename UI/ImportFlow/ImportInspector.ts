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
import Toggleable from "../Base/Toggleable";
import List from "../Base/List";
import Link from "../Base/Link";
import {DropDown} from "../Input/DropDown";
import BaseUIElement from "../BaseUIElement";
import ValidatedTextField from "../Input/ValidatedTextField";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Toggle from "../Input/Toggle";

interface NoteProperties {
    "id": number,
    "url": string,
    "date_created": string
    "status": "open" | "closed",
    "comments": {
        date: string,
        uid: number,
        user: string,
        text: string
    }[]
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
            new FixedUiElement   ( "Testmode enable").SetClass("alert"), undefined,
                state.featureSwitchIsTesting
            )
        ]);
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
            const props = notes["success"].features.map(f => f.properties)

            const perBatch = new Map<string, { props: NoteProperties[], theme: string }>()
            const prefix = "https://mapcomplete.osm.be/"
            for (const prop of props) {
                const lines = prop.comments[0].text.split("\n")
                const trigger = lines.findIndex(l => l.startsWith(prefix) && l.endsWith("#import"))
                if (trigger < 0) {
                    continue
                }
                let theme = lines[trigger].substr(prefix.length)
                theme = theme.substr(0, theme.indexOf("."))
                const key = lines[0]
                if (!perBatch.has(key)) {
                    perBatch.set(key, {props: [], theme})
                }
                perBatch.get(key).props.push(prop)
            }
            const els = []
            perBatch.forEach(({props, theme}, intro) => {
                els.push(new Combine([
                    new Title(theme + ": " + intro + " (" + props.length + " features)", 2),
                    new Toggleable(new FixedUiElement("Notes"),
                        new List(props.map(prop => new Link(
                            "" + prop.id,
                            "https://openstreetmap.org/note/" + prop.id, true
                        )))),
                    new Title("Mass apply an action"),
                    new MassAction(state, props).SetClass("block")


                ]))
            })
            return new Combine(els)

        }));
    }

}

export default class ImportInspectorGui extends Combine {

    constructor() {
        const state = new UserRelatedState(undefined)
        const t = Translations.t.importInspector;
        super([
            new Title(t.title, 1),
            new VariableUiElement(state.osmConnection.userDetails.map(ud => {
                if (ud === undefined || ud.loggedIn === false) {
                    return undefined
                }
                return new ImportInspector(ud, state);
            }))
        ]);
    }


}