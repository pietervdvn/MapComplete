import { SpecialVisualization, SpecialVisualizationState } from "../../SpecialVisualization"
import BaseUIElement from "../../BaseUIElement"
import { UIEventSource } from "../../../Logic/UIEventSource"
import SvelteUIElement from "../../Base/SvelteUIElement"
import { Feature } from "geojson"
import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
import { default as LanguageElementSvelte } from "./LanguageElement.svelte"

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
     }
     \`\`\`
    `

    constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        argument: string[],
        feature: Feature,
        layer: LayerConfig
    ): BaseUIElement {
        let [key, question, item_render, single_render, all_render, on_no_known_languages] =
            argument
        if (item_render === undefined || item_render.trim() === "") {
            item_render = "{language()}"
        }
        if (all_render === undefined || all_render.length == 0) {
            all_render = "{list()}"
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
        if (on_no_known_languages === "") {
            on_no_known_languages = undefined
        }

        return new SvelteUIElement(LanguageElementSvelte, {
            key,
            tags: tagSource,
            state,
            feature,
            layer,
            question,
            on_no_known_languages,
            single_render,
            item_render,
        })
    }
}
