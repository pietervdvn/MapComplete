import * as fs from "fs"
import { DesugaringStep } from "../src/Models/ThemeConfig/Conversion/Conversion"
import { LayerConfigJson } from "../src/Models/ThemeConfig/Json/LayerConfigJson"
import { QuestionableTagRenderingConfigJson } from "../src/Models/ThemeConfig/Json/QuestionableTagRenderingConfigJson"
import * as fakedom from "fake-dom"
import Script from "./Script"
import { FixedUiElement } from "../src/UI/Base/FixedUiElement"

class ExtractQuestionHint extends DesugaringStep<QuestionableTagRenderingConfigJson> {
    constructor() {
        super(
            "Tries to extract a 'questionHint' from the question",
            ["question", "questionhint"],
            "ExtractQuestionHint"
        )
    }

    convert(
        json: QuestionableTagRenderingConfigJson,
        context: string
    ): {
        result: QuestionableTagRenderingConfigJson
        errors?: string[]
        warnings?: string[]
        information?: string[]
    } {
        json = { ...json }
        if (json.question === undefined || json.questionHint !== undefined) {
            return { result: json }
        }

        if (typeof json.question === "string") {
            return { result: json }
        }

        const hint: Record<string, string> = {}

        for (const language in json.question) {
            const q = json.question[language]
            const parts = q.split(/<br ?\/>/i)
            if (parts.length == 2) {
                json.question[language] = parts[0]
                const txt = new FixedUiElement(parts[1]).ConstructElement().textContent
                if (txt.length > 0) {
                    hint[language] = txt
                }
                continue
            }

            const divStart = [q.indexOf("<div "), q.indexOf("<span "), q.indexOf("<p ")].find(
                (i) => i > 0
            ) // note: > 0, not >= : we are not interested in a span starting right away!
            if (divStart > 0) {
                json.question[language] = q.substring(0, divStart)
                const txt = new FixedUiElement(q.substring(divStart)).ConstructElement().textContent
                if (txt !== "") {
                    hint[language] = txt
                }
            }
        }
        if (Object.keys(hint).length > 0) {
            json.questionHint = hint
        }

        console.log("Inspecting ", json.question)

        return { result: json }
    }
}

class FixQuestionHint extends Script {
    private fs: any
    constructor() {
        super("Extracts a 'questionHint' from a question for a given 'layer.json' or 'theme.json'")
        if (fakedom === undefined) {
            throw "Fakedom not active"
        }
    }

    async main(args: string[]): Promise<void> {
        const filepath = args[0]
        const contents = JSON.parse(fs.readFileSync(filepath, { encoding: "utf8" }))
        const convertor = new ExtractQuestionHint()
        if (filepath.endsWith("/questions.json")) {
            for (const key in contents) {
                const tr = contents[key]
                if (typeof tr !== "object") {
                    continue
                }
                contents[key] = convertor.convertStrict(
                    tr,
                    "While automatically extracting questiondHints of " + filepath
                )
            }
            fs.writeFileSync(filepath, JSON.stringify(contents, null, "  "), { encoding: "utf-8" })

            return
        }
        const layers: LayerConfigJson[] = contents["layers"] ?? [contents]
        for (const layer of layers) {
            for (let i = 0; i < layer.tagRenderings?.length; i++) {
                const tagRendering = layer.tagRenderings[i]
                if (typeof tagRendering !== "object" || tagRendering["question"] === undefined) {
                    continue
                }
                layer.tagRenderings[i] = convertor.convertStrict(
                    <QuestionableTagRenderingConfigJson>tagRendering,
                    "While automatically extracting questionHints of " + filepath
                )
            }
        }
        // The layer(s) are modified inPlace, so we can simply write to disk
        fs.writeFileSync(filepath, JSON.stringify(contents, null, "  "), { encoding: "utf8" })
    }
}

new FixQuestionHint().run()
