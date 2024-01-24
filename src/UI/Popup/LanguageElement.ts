import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import BaseUIElement from "../BaseUIElement"
import { UIEventSource } from "../../Logic/UIEventSource"
import { VariableUiElement } from "../Base/VariableUIElement"
import all_languages from "../../assets/language_translations.json"
import { Translation } from "../i18n/Translation"
import Combine from "../Base/Combine"
import Title from "../Base/Title"
import Lazy from "../Base/Lazy"
import { SubstitutedTranslation } from "../SubstitutedTranslation"
import List from "../Base/List"
import { AllLanguagesSelector } from "./AllLanguagesSelector"
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
import { And } from "../../Logic/Tags/And"
import { Tag } from "../../Logic/Tags/Tag"
import { EditButton, SaveButton } from "./SaveButton"
import Translations from "../i18n/Translations"
import Toggle from "../Input/Toggle"
import { Feature } from "geojson"
class xyz {}
export class LanguageElement implements SpecialVisualization {
    funcName: string = "language_chooser"
    needsUrls = []

    docs: string | BaseUIElement =
        "The language element allows to show and pick all known (modern) languages. The key can be set"

    args: { name: string; defaultValue?: string; doc: string; required?: boolean }[] = [
        {
            name: "key",
            required: true,
            doc: "What key to use, e.g. `language`, `tactile_writing:braille:language`, ... If a language is supported, the language code will be appended to this key, resulting in `language:nl=yes` if nl is picked ",
        },
        {
            name: "question",
            required: true,
            doc: "What to ask if no questions are known",
        },
        {
            name: "render_list_item",
            doc: "How a single language will be shown in the list of languages. Use `{language}` to indicate the language (which it must contain).",
            defaultValue: "{language()}",
        },
        {
            name: "render_single_language",
            doc: "What will be shown if the feature only supports a single language",
            required: true,
        },
        {
            name: "render_all",
            doc: "The full rendering. Use `{list}` to show where the list of languages must come. Optional if mode=single",
            defaultValue: "{list()}",
        },
        {
            name: "no_known_languages",
            doc: "The text that is shown if no languages are known for this key. If this text is omitted, the languages will be prompted instead",
        },
        {
            name: "mode",
            doc: "If one or many languages can be selected. Should be 'multi' or 'single'",
            defaultValue: "multi",
        },
    ]

    example: `
    \`\`\`json
     {"special":
       "type": "language_chooser",
       "key": "school:language",
       "question": {"en": "What are the main (and administrative) languages spoken in this school?"},
       "render_single_language": {"en": "{language()} is spoken on this school"},
       "render_list_item": {"en": "{language()}"},
       "render_all": {"en": "The following languages are spoken here:{list()}"}
       "mode":"multi"
     }
     \`\`\`
    `

    constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        argument: string[],
        feature: Feature
    ): BaseUIElement {
        let [key, question, item_render, single_render, all_render, on_no_known_languages, mode] =
            argument
        if (mode === undefined || mode.length == 0) {
            mode = "multi"
        }
        if (item_render === undefined || item_render.trim() === "") {
            item_render = "{language()}"
        }
        if (all_render === undefined || all_render.length == 0) {
            all_render = "{list()}"
        }
        if (mode !== "single" && mode !== "multi") {
            throw (
                "Error while calling language_chooser: mode must be either 'single' or 'multi' but it is " +
                mode
            )
        }
        if (single_render.indexOf("{language()") < 0) {
            throw (
                "Error while calling language_chooser: render_single_language must contain '{language()}' but it is " +
                single_render
            )
        }
        if (item_render.indexOf("{language()") < 0) {
            throw (
                "Error while calling language_chooser: render_list_item must contain '{language()}' but it is " +
                item_render
            )
        }
        if (all_render.indexOf("{list()") < 0) {
            throw "Error while calling language_chooser: render_all must contain '{list()}'"
        }

        const prefix = key + ":"
        const foundLanguages = tagSource.map((tags) => {
            const foundLanguages: string[] = []
            for (const k in tags) {
                const v = tags[k]
                if (v !== "yes") {
                    continue
                }
                if (k.startsWith(prefix)) {
                    foundLanguages.push(k.substring(prefix.length))
                }
            }
            return foundLanguages
        })
        const forceInputMode = new UIEventSource(false)
        const inputEl = new Lazy(() => {
            const selector = new AllLanguagesSelector({
                mode: mode === "single" ? "select-one" : "select-many",
                currentCountry: tagSource.map((tgs) => tgs["_country"]),
            })
            const cancelButton = Toggle.If(forceInputMode, () =>
                Translations.t.general.cancel
                    .Clone()
                    .SetClass("btn btn-secondary")
                    .onClick(() => forceInputMode.setData(false))
            )

            const saveButton = new SaveButton(
                selector.GetValue().map((lngs) => (lngs.length > 0 ? "true" : undefined)),
                state
            ).onClick(() => {
                const selectedLanguages = selector.GetValue().data
                const currentLanguages = foundLanguages.data
                const selection: Tag[] = selectedLanguages.map((ln) => new Tag(prefix + ln, "yes"))

                for (const currentLanguage of currentLanguages) {
                    if (selectedLanguages.indexOf(currentLanguage) >= 0) {
                        continue
                    }
                    // Erase language that is not spoken anymore
                    selection.push(new Tag(prefix + currentLanguage, ""))
                }

                if (state.featureSwitchIsTesting.data) {
                    for (const tag of selection) {
                        tagSource.data[tag.key] = tag.value
                    }
                    tagSource.ping()
                } else {
                    ;(state?.changes)
                        .applyAction(
                            new ChangeTagAction(
                                tagSource.data.id,
                                new And(selection),
                                tagSource.data,
                                {
                                    theme: state?.layout?.id ?? "unkown",
                                    changeType: "answer",
                                }
                            )
                        )
                        .then((_) => {
                            console.log("Tagchanges applied")
                        })
                }
                forceInputMode.setData(false)
            })

            return new Combine([
                new Title(question),
                selector,
                new Combine([cancelButton, saveButton]).SetClass("flex justify-end"),
            ]).SetClass("flex flex-col question disable-links")
        })

        const editButton = new EditButton(state.osmConnection, () => forceInputMode.setData(true))

        return new VariableUiElement(
            foundLanguages.map(
                (foundLanguages) => {
                    if (forceInputMode.data) {
                        return inputEl
                    }

                    if (foundLanguages.length === 0) {
                        // No languages found - we show the question and the input element
                        if (
                            on_no_known_languages !== undefined &&
                            on_no_known_languages.length > 0
                        ) {
                            return new Combine([on_no_known_languages, editButton]).SetClass(
                                "flex justify-end"
                            )
                        }
                        return inputEl
                    }

                    let rendered: BaseUIElement
                    if (foundLanguages.length === 1) {
                        const ln = foundLanguages[0]
                        let mapping = new Map<string, BaseUIElement>()
                        mapping.set("language", new Translation(all_languages[ln]))
                        rendered = new SubstitutedTranslation(
                            new Translation({ "*": single_render }, undefined),
                            tagSource,
                            state,
                            mapping
                        )
                    } else {
                        let mapping = new Map<string, BaseUIElement>()
                        const languagesList = new List(
                            foundLanguages.map((ln) => {
                                let mappingLn = new Map<string, BaseUIElement>()
                                mappingLn.set("language", new Translation(all_languages[ln]))
                                return new SubstitutedTranslation(
                                    new Translation({ "*": item_render }, undefined),
                                    tagSource,
                                    state,
                                    mappingLn
                                )
                            })
                        )
                        mapping.set("list", languagesList)
                        rendered = new SubstitutedTranslation(
                            new Translation({ "*": all_render }, undefined),
                            tagSource,
                            state,
                            mapping
                        )
                    }
                    return new Combine([rendered, editButton]).SetClass("flex justify-between")
                },
                [forceInputMode]
            )
        )
    }
}
